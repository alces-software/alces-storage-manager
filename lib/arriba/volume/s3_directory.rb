require 'arriba/s3_object_file'
require 'fog'
require 'tempfile'

module Arriba
  class Volume::S3Directory < Volume
    include Arriba::Operations::Base
    attr_accessor :target, :name

    def initialize(target, name, id = nil)
      self.name = name
      id ||= Arriba::Routing::encode(name)
      super(id)
      self.target = target
      @me = target.current_user
      @files_index = FilesIndex.new(target)
    end

    def options
      # Overrides Arriba default volume options
      {
        'disabled' => ['archive'],
        'archivers' => {}
      }
    end

    # Fulfilling Arriba::Operations::Base contract
    def tree(path)
      # path is a directory
      # find directory children
      objects(path).select {| key |
        key.end_with?("/") 
      }.map { |node|
        file(path, node)
      }
    end

    # Fulfilling Arriba::Operations::Base contract
    def entries(path)
      #p "Entries called with path " + path
      objects(path)
    end
    
    def directory?(path)
      path.end_with?("/") || path.count("/") == 1
    end
    

    # Deduces a bucket and object key prefix, and returns an array of objects.
    def objects(path)
      if path == "/"
        target.storage.directories.map {|bucket| bucket.key + "/" } + target.extra_buckets.map {|bucket| bucket + "/" }
      else
        #p "Listing objects for path " + path
        s3p = S3Path.new(path)
        #p "Looking in #{s3p}"
        if s3p.bucket != nil
          bucket = target.get_bucket(s3p.bucket, prefix=s3p.key)
          @files_index.storeAll(bucket)
          return infer_folder_keys(bucket.files, s3p.key)
        end
      end
    end

    def infer_folder_keys(files, keyPrefix)
      actualObjects = files.map { |file|
        file.key[(keyPrefix ? keyPrefix.length : 0)..-1]
      }
      inferredKeys = []
      actualObjects.each { |key|
        firstSlash = key.index("/")
        if firstSlash != nil && firstSlash < (key.length - 1)
          firstFolder = key[0..firstSlash]  # Include trailing slash
          if !actualObjects.include?(firstFolder) && !inferredKeys.include?(firstFolder)
            #p "Inferred presence of #{firstFolder}"
            inferredKeys.push(firstFolder)
          end
        end 
      }
      #p "Folder contains #{actualObjects} plus inferred #{inferredKeys}"
      return inferredKeys + actualObjects
    end

    def mtime(path)
      s3p = S3Path.new(path)
      if s3p.key
        file = @files_index.retrieve(s3p.bucket, s3p.key)
        return file ? file.last_modified : 0
      end
      0
    end

    # Access and creation time not supported by S3
    def atime(path)
      0
    end

    def ctime(path)
      0
    end

    def mimetype(path)
      if directory?(path)
        'directory'
      else
        # gsub to prune leading '.' character
        ext = ::File.extname(path).gsub(/^\./,'').downcase
        Arriba::MimeType::for(ext) || 'unknown' # TODO read content type from S3 (possibly costly operation though)
      end
    end

    def size(path)
      s3p = S3Path.new(path)
      if s3p.key
        file = @files_index.retrieve(s3p.bucket, s3p.key)
        return file ? file.content_length : 0
      end
      0
    end

    def name_for(path)
      ::File.basename(path)
    end

    def dirname(path)
      path[0..path.rindex("/", -2)]
    end

    def io(path)
      objPath = S3Path.new(path)
      obj = target.get_bucket(objPath.bucket).files.get(objPath.key)
      StringIO.new(obj.body)
    end

    def read(path)
      objPath = S3Path.new(path)
      obj = target.get_bucket(objPath.bucket).files.get(objPath.key)
      return obj.body
    end

    def write(path, content)
      objPath = S3Path.new(path)
      obj = target.get_bucket(objPath.bucket).files.get(objPath.key)
      obj.body = content
      obj.save
    end

    # Filesystem operations
    def move(src_path, dest_path,shortcut=false)
      if dest_path == "/"
        raise "It is not possible to move files to outside of a bucket. Create a new bucket and move files into it instead."
      end
      src = S3Path.new(src_path)
      if src.key == nil
        raise "It is not possible to move buckets. Create a new bucket and move files into it instead."
      end
      src_filename = src_path[src_path.rindex("/", -2) + 1..-1]
      path_end_index = src.key.rindex("/", -2)
      path_to_sub = path_end_index != nil ? src.key[0..src.key.rindex("/", -2)] : src.key
      #p "Filename is #{src_filename}, path to sub is #{path_to_sub}, destination path is #{dest_path}"
      target.get_bucket(src.bucket, src.key).files.each { |thing|
        # Note that having a single each loop to copy and destroy is more efficient
        # (since it doesn't have to index the bucket twice), so we don't just call
        # copy then rm - though that is functionally identical.
        dest = S3Path.new(thing.key.gsub(path_to_sub, dest_path))
        #p "mv #{thing.key} -> #{dest}"
        thing.copy(dest.bucket, dest.key)
        thing.destroy
      }
    end

    # Note: dest_path is the container to which the object at src_path is being copied,
    # NOT the full path of the object at its final destination
    def copy(src_path, dest_path, shortcut=false)
      if dest_path == "/"
        raise "It is not possible to copy files to outside of a bucket. Create a new bucket and copy into it instead."
      end
      src = S3Path.new(src_path)
      if target.region_for_bucket(src.bucket) != target.region_for_bucket(S3Path.new(dest_path).bucket)
        inter_region_copy(src_path, dest_path)
      end
      src_filename = src_path[src_path.rindex("/", -2) + 1..-1]
      if src.key == nil
        # We're trying to copy an entire bucket - add the source bucket's name to the end of the destination path
        dest_path += src.bucket + "/"
      end
      path_end_index = src.key != nil ? src.key.rindex("/", -2) : nil
      path_to_sub = path_end_index != nil ? src.key[0..path_end_index] : /^/
      #p "Filename is #{src_filename}, path to sub is #{path_to_sub}, destination path is #{dest_path}"
      target.get_bucket(src.bucket, src.key).files.each { |thing|
        dest = S3Path.new(thing.key.gsub(path_to_sub, dest_path))
        #p "copy #{thing.key} -> #{dest}"
        thing.copy(dest.bucket, dest.key)
      }
    end

    def inter_region_copy(src_path, dest_path)
      src = S3Path.new(src_path)
      dest_bucket = target.get_bucket(S3Path.new(dest_path).bucket)
      src_filename = src_path[src_path.rindex("/", -2) + 1..-1]
      if src.key == nil
        # We're trying to copy an entire bucket - add the source bucket's name to the end of the destination path
        dest_path += src.bucket + "/"
      end
      path_end_index = src.key != nil ? src.key.rindex("/", -2) : nil
      path_to_sub = path_end_index != nil ? src.key[0..path_end_index] : /^/
      target.get_bucket(src.bucket, src.key).files.each { |thing|
        dest = S3Path.new(thing.key.gsub(path_to_sub, dest_path))
        
        newfile = S3ObjectFile.new(self, dest.as_path).open
        newfile.write(thing.body)
        newfile.close
      }
    end

    def rename(path, newname)
      #p "Rename to #{newname}"
      if (directory?(path) && newname[-1] != "/")
        newname += "/"
      end
      src = S3Path.new(path)
      if src.key != nil
        path_end_index = src.key.rindex("/", -2)
        path_to_sub = path_end_index != nil ? src.key[path_end_index + 1 .. -1] : src.key
        #p "src is #{src}, path to sub is #{path_to_sub}, newname is #{newname}"
        target.get_bucket(src.bucket, src.key).files.each { |thing|
          dest = S3Path.new("/" + src.bucket + "/" + thing.key.gsub(path_to_sub, newname))
          #p "#{thing.key} -> #{dest}"
          thing.copy(dest.bucket, dest.key)
          thing.destroy
        }
      end
      raise "It is not possible to rename S3 buckets."
    end

    def rm(path)
      src = S3Path.new(path)
      target.get_bucket(src.bucket, src.key).files.each { |object|
        # This list of objects will include the item we're trying to delete and all children
        object.destroy
      }
      if src.key == nil
        # delete the bucket now it's empty
        target.get_bucket(src.bucket).destroy
      end
    end
    
    def mkdir(path, newdir)
      if path == "/"
        # Create a new bucket
        target.storage.directories.create(key: newdir)
      else
        s3p = S3Path.new(path)
        d = target.get_bucket(s3p.bucket, s3p.key)
        d.files.create(key: "#{s3p.key}#{newdir}/", body: "")
      end
    end

    def duplicate_name_for(path)
      "Copy of #{::File.basename(path)}" + (directory?(path) ? "/" : "")
    end

    def duplicate(path)
      newname = duplicate_name_for(path)
      src = S3Path.new(path)
      if src.key != nil
        path_end_index = src.key.rindex("/", -2)
        path_to_sub = path_end_index != nil ? src.key[path_end_index + 1 .. -1] : src.key
        #p "src is #{src}, path to sub is #{path_to_sub}, newname is #{newname}"
        target.get_bucket(src.bucket, src.key).files.each { |thing|
          dest = S3Path.new("/" + src.bucket + "/" + thing.key.gsub(path_to_sub, newname))
          #p "#{thing.key} -> #{dest}"
          thing.copy(dest.bucket, dest.key)
        }
      else
        raise "It is not possible to duplicate S3 buckets. Create a new bucket and copy files into it instead."
      end
      
    end

    def represent(path)
      Arriba::S3ObjectFile.new(volume, path)
    end

    def touch(path)
      p "Touch #{path}"
      s3p = S3Path.new(path)
      d = target.get_bucket(s3p.bucket)
      d.files.new(key: s3p.key)
    end

    def user(path)
      file = get_from_cache(path)
      return file ? file.owner[:display_name] : nil
    end

    def writable?(path)
      if path == "/"
        return true # We can create buckets (in most scenarios)
      end
      s3p = S3Path.new(path)
      if s3p.key == nil # Buckets
        # We can only get a bucket owner from its acl
        # but we can assume that extra buckets are read-only
        !target.extra_buckets.include?(s3p.bucket)
      else # Objects
        file = get_from_cache(path)
        if file == nil
          # this is inferred - so just return permission of parent bucket
          return !target.extra_buckets.include?(s3p.bucket)
        end
        file.owner[:display_name] == @me
      end
    end

    # Stub implementations follow...

    def symlink?(path)
      false
    end

    def mode(path)
      100444
    end

    # TODO Should return true if path points to a directory which contains subdirectories
    def children?(path)
      true
    end

    def locked?(path)
      false
    end

    def readable?(path)
      true
    end

    def group(path)
      nil
    end

    def rel_path_to(path)
      nil
    end

    private

    def volume
      self
    end

    def base
      Arriba::Root.new(volume, name)
    end

    def get_from_cache(path)
      s3p = S3Path.new(path)
      if s3p.key
        file = @files_index.retrieve(s3p.bucket, s3p.key)
        return file
      end
      nil
    end

    class S3Path
      attr_accessor :bucket, :key
      def initialize(path)
        parts = path.match(/^\/([^\/]+)(?:(?:\/)(.+))?/)
        if parts
          @bucket = parts[1]
          @key = parts[2]
        end
      end
      def to_s
        "<S3Path bucket=#{@bucket} key=#{@key}>"
      end
      def as_path
        S3Path.to_path(@bucket, @key)
      end
      def self.to_path(bucket, key)
        "/#{bucket}/#{key}"
      end
    end

    class FilesIndex
      def initialize(storage)
        @index = {}
        @storage = storage
      end
      def index
        @index
      end
      def storeAll(bucket)
        bucket.files.each { |file|
          store(bucket.key, file)
        }
      end

      def store(bucket, file)
        if !@index.has_key?(bucket)
          @index[bucket] = {}
        end
        @index[bucket][file.key] = file
      end

      def retrieve(bucketKey, fileKey)
        if !@index.has_key?(bucketKey)
          #p "Not got bucket #{bucketKey}, fetching..."
          bb = @storage.get_bucket(bucketKey)
          storeAll(bb)
        end
        if @index[bucketKey].has_key?(fileKey)
          return @index[bucketKey][fileKey]
        #else
          #p "#{fileKey} not found in bucket #{bucketKey} which had #{@index[bucketKey].keys}"
        end
        nil
      end
    end
  end
end
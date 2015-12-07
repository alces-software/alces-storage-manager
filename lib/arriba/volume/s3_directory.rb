require 'fog'
require 'arriba/s3_object_file'

module Arriba
  class Volume::S3Directory < Volume
    include Arriba::Operations::Base
    attr_accessor :target, :name

    def initialize(target, name, id = nil)
      self.name = name
      id ||= Arriba::Routing::encode(name)
      super(id)
      self.target = target
      @files_index = FilesIndex.new(target)
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
        target.storage.directories.map {|bucket| bucket.key + "/" }
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
        ext = ::File.extname(path).gsub(/^\./,'')
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
      S3Path.new(path).key
    end

    def dirname(path)
      path[0..path.rindex("/", -2)]
    end

    # Filesystem operations
    def move(src_path, dest_path,shortcut=false)
      src = S3Path.new(src_path)
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
    def copy(src_path, dest_path, shortcut=false, newname=nil)
      src = S3Path.new(src_path)
      src_filename = src_path[src_path.rindex("/", -2) + 1..-1]
      path_end_index = src.key.rindex("/", -2)
      path_to_sub = path_end_index != nil ? src.key[0..src.key.rindex("/", -2)] : /^/
      #p "Filename is #{src_filename}, path to sub is #{path_to_sub}, destination path is #{dest_path}"
      target.get_bucket(src.bucket, src.key).files.each { |thing|
        dest = S3Path.new(thing.key.gsub(path_to_sub, dest_path))
        #p "copy #{thing.key} -> #{dest}"
        thing.copy(dest.bucket, dest.key)
      }
    end

    def rename(path, newname)
      #p "Rename to #{newname}"
      if (directory?(path) && newname[-1] != "/")
        newname += "/"
      end
      src = S3Path.new(path)
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

    def rm(path)
      src = S3Path.new(path)
        target.get_bucket(src.bucket, src.key).files.each { |object|
          # This list of objects will include the item we're trying to delete and all children
          object.destroy
        }

    end
    
    def mkdir(path, newdir) 
      s3p = S3Path.new(path)
      d = target.get_bucket(s3p.bucket, s3p.key)
      d.files.create(key: s3p.key + newdir + "/", body: "")
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

    def writable?(path)
      true
    end

    def user(path)
      nil
    end

    def group(path)
      nil
    end

    private

    def volume
      self
    end

    def base
      Arriba::Root.new(volume, name)
    end

    def represent(path)
      Arriba::S3ObjectFile.new(volume, path)
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
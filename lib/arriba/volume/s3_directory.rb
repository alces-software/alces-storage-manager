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
      copy(src_path, dest_path, shortcut)
      rm(src_path)
    end

    # Note: dest_path is the container to which the object at src_path is being copied,
    # NOT the full path of the object at its final destination; hence the need to add
    # src_filename to the end of dest_path.
    def copy(src_path, dest_path, shortcut=false)
      src = S3Path.new(src_path)
      dest = S3Path.new(dest_path)
      src_filename = src_path[src_path.rindex("/", -2) + 1..-1]
      #p "Copying #{src} to #{dest}"
      if directory?(src_path)
        #p "...which is a directory"
        target.get_bucket(src.bucket(), src.key).files.tap{ |t| p t }.each { |object|
          #p "... which had #{object.key} in it"
          if object.key != src.key
            copy(S3Path::to_path(src.bucket, object.key), S3Path::to_path(dest.bucket, object.key[0..object.key.rindex("/", -2)]).gsub(src.key, dest.key) + src_filename)
          end
        }
        #p "...with everything in it now copied"
      end
      src_object = @files_index.retrieve(src.bucket, src.key)
      if src_object # If not, it might have been an inferred folder
        src_object.copy(dest.bucket, dest.key + src_filename)
      end
    end

    def rename(path, newname)
      src = S3Path.new(path)
      src_object = @files_index.retrieve(src.bucket, src.key)
      src_object.copy(src.bucket, dirname(src.key) + newname)
      src_object.destroy
    end

    def rm(path)
      src = S3Path.new(path)
      if directory?(path)
        target.get_bucket(src.bucket, src.key).files.each { |object|
          # This list of objects will also include the folder we're trying to delete
          if object.key != src.key
            rm(S3Path::to_path(src.bucket, object.key)) # Recursively delete
          end
        }
      end
      src_object = @files_index.retrieve(src.bucket, src.key)
      if src_object
        src_object.destroy
      end
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
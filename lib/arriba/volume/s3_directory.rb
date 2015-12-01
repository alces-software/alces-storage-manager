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
      @files_index = FilesIndex.new(target.storage)
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
          bucket = target.storage.directories.get(s3p.bucket)
          @files_index.storeAll(bucket)
          keyPrefix = s3p.key
          bucket.files.select { |file|
            #p "Considering " + file.key + " and looking for prefix " + keyPrefix.to_s
            file_in_path?(file, keyPrefix)
          }.map { |file|
            file.key[(keyPrefix ? keyPrefix.length : 0)..-1]
          }#.tap {|l| p l.to_s }
        end
      end
    end

    def file_in_path?(file, pathPrefix)
      ( # Things in bucket root: no slash, or the only slash is at the end e.g. top-level dir
        pathPrefix == nil &&
        (file.key.count("/") == 0 or file.key.index("/") == file.key.length - 1)
      ) or (
        # Things in subdirectories (but not sub-subdirectories)
        pathPrefix != nil &&
        file.key.start_with?(pathPrefix) &&
        file.key != pathPrefix &&
        (
          file.key.index("/", pathPrefix.length) == file.key.length - 1 or
          file.key.index("/", pathPrefix.length) == nil
        )
      )
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
      path[0..path.rindex("/")]
    end

    # Filesystem operations
    def move(src_path, dest_path,shortcut=false)
      if !directory?(src_path)
        copy(src_path, dest_path, shortcut)
        rm(src_path)
        true
      else
        raise "Unable to move directories (yet)"
      end
    end

    def copy(src_path, dest_path, shortcut=false)
      src = S3Path.new(src_path)
      dest = S3Path.new(dest_path)
      if directory?(src_path)
        target.storage.directories.get(src.bucket(), prefix: src.key).files.each { |object|
          if object.key != src.key
            copy(S3Path::to_path(src.bucket, object.key), S3Path::to_path(dest.bucket, dest.key + src.key[src.key.index("/") + 1..src.key.rindex("/")]))
          end
        }
      end
        src_object = @files_index.retrieve(src.bucket, src.key)
        src_filename = src_path[src_path.rindex("/", -2) + 1..-1]
        src_object.copy(dest.bucket, dest.key + src_filename)
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
        target.storage.directories.get(src.bucket, prefix: src.key).files.each { |object|
          # This list of objects will also include the folder we're trying to delete
          if object.key != src.key
            rm(S3Path::to_path(src.bucket, object.key)) # Recursively delete
          end
        }
      end
      src_object = @files_index.retrieve(src.bucket, src.key)
      src_object.destroy
    end
    
    def mkdir(path, newdir) 
      s3p = S3Path.new(path)
      d = target.storage.directories.get(s3p.bucket, prefix: s3p.key)
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
          bb = @storage.directories.get(bucketKey)
          storeAll(bb)
        end
        if @index[bucketKey].has_key?(fileKey)
          return @index[bucketKey][fileKey]
        end
        nil
      end
    end
  end
end
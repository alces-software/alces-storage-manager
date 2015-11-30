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
      #p "Tree called with path: " + path
      [cwd(path)] + objects(path).select { | key | key.end_with?("/") }
    end

    # Fulfilling Arriba::Operations::Base contract
    def entries(path)
      #p "Entries called with path " + path
      if path == "/"
        target.storage.directories.map {|bucket| bucket.key + "/" }
      else
        objects(path)
      end
    end
    
    def directory?(path)
      path.end_with?("/") || path.count("/") == 1
    end
    

    # Deduces a bucket and object key prefix, and returns an array of objects.
    def objects(path)
      #p "Listing objects for path " + path
      s3p = S3Path.new(path)
      #p "Looking in bucket " + bucketKey
      bucket = target.storage.directories.get(s3p.bucket)
      keyPrefix = s3p.key
      bucket.files.tap{ |files|
        files.each { |file| @files_index.store(s3p.bucket, file) }
      }.select { |file|
        #p "Considering " + file.key + " and looking for prefix " + keyPrefix.to_s
        file_in_path?(file, keyPrefix).tap { |answer| p "Is file #{file.key} in path #{keyPrefix}? #{answer}" }
      }.map { |file|
        file.key[(keyPrefix ? keyPrefix.length : 0)..-1]
      }#.tap {|l| p l.to_s }
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

# Stub implementations follow...

    def symlink?(path)
      false
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

    def mode(path)
      100444
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
      false
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
        parts = path.match(/^\/([^\/]+)\/(.+)?/)
        if parts
          @bucket = parts[1]
          @key = parts[2]
        end
      end
    end

    class FilesIndex
      def initialize(storage)
        @index = {}
        @storage = storage
      end
      def store(bucket, file)
        if !@index.has_key?(bucket)
          @index[bucket] = {}
        end
        @index[bucket][file.key] = file
      end
      def retrieve(bucketKey, fileKey)
        if @index.has_key?(bucketKey)
          if @index[bucketKey].has_key?(fileKey)
            return @index[bucketKey][fileKey]
          end
        end
        nil
      end
    end
  end
end
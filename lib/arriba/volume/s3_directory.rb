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
    end

    # Fulfilling Arriba::Operations::Base contract
    def tree(path)
      # path is a directory
      # find directory children
      p "Tree called with path: " + path
      [cwd(path)] + objects(path).select { | key | key.end_with?("/") }
    end

    # Fulfilling Arriba::Operations::Base contract
    def entries(path)
      p "Entries called with path " + path
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
      p "Listing objects for path " + path
      parts = path.match(/^\/([^\/]+)\/((.+))?/)
      bucketKey = parts[1]
      keyPrefix = parts[3]
      p "Looking in bucket " + bucketKey
      bucket = target.storage.directories.get(bucketKey)
      bucket.files.select { |file|
        p "Considering " + file.key + " and looking for prefix " + keyPrefix.to_s
        (keyPrefix == nil && (file.key.count("/") == 0 or file.key.end_with?("/"))) or 
        (keyPrefix != nil &&
          file.key.start_with?(keyPrefix) &&
          file.key != keyPrefix && 
          file.key.count("/") == keyPrefix.count("/"))
      }.map { |file| file.key[(keyPrefix ? keyPrefix.length : 0)..-1] }.tap {|l| p l.to_s }
    end
# Stub implementations follow...

    def symlink?(path)
      false
    end

    def mtime(path)
      0
    end

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

  end

end
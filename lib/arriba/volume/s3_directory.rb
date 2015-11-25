module Arriba
  class Volume::S3Directory < Volume

    attr_accessor :target, :name

    def initialize(target, name, id = nil)
      self.name = name
      id ||= Arriba::Routing::encode(name)
      super(id)
      self.target = target
    end


# Stub implementations follow...

    def cwd(path)
      base
    end

    def files(*args)
      [base]
    end

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
      'directory'
    end

    def size(path)
      0
    end

    def children?(path)
      false
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

  end

end
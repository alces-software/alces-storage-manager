require 'tempfile'

module Arriba
  class S3ObjectFile < File
    def initialize(directory, path)
      super(directory, path)
    end
    def open
      @body ||= S3ObjectBody.new(@volume, @path)
    end
    def dirname
      maybeDirname = super#.tap {|d| p "path was " + path + " dirname was " + d }
      ((maybeDirname.end_with?("/")) ? maybeDirname : maybeDirname + "/")#.tap {|t| p "returned " + t }
    end

    class S3ObjectBody
      def initialize(dir, path)
        @dir = dir
        @path = path
        @temp = Tempfile.new('s3_upload', :encoding => 'ascii-8bit') # Why ascii-8bit? That seems to be what we're called with...
      end
      def write(arg)
        @temp.write(arg)
      end
      def close
        p "Close got called, hooray!"
        @temp.rewind
        @temp.close
        
        s3p = Arriba::Volume::S3Directory::S3Path.new(@path)
        dir = @dir.target.get_bucket(s3p.bucket)
        byebug
        obj = dir.files.create({
          key: s3p.key,
        })
        obj.body = ::File.open(@temp.path)
        obj.save
        p "Saved..."
        @temp.unlink
      end
    end
  end
end
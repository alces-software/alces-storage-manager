module Arriba
  class S3ObjectFile < File
    def dirname
      maybeDirname = super.tap {|d| p "path was " + path + " dirname was " + d }
      ((maybeDirname.end_with?("/")) ? maybeDirname : maybeDirname + "/").tap {|t| p "returned " + t }
    end
  end
end
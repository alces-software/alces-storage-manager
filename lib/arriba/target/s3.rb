require 'arriba/volume/s3_directory'

module Arriba
  module Target
    class S3 < Arriba::Target::Base
      def to_volume
        Arriba::Volume::S3Directory.new(self, name)
      end
    end
  end
end
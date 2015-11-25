require 'arriba/volume/s3_directory'
require 'fog'

module Arriba
  module Target

    class S3 < Arriba::Target::Base

      attr_accessor :storage
      
      def initialize(args_hash)
        super
        unless args_hash.key?(:auth) && args_hash.key?(:secret)
          raise ArgumentError, "auth and secret must be provided"
        end
        @storage = Fog::Storage.new({
          provider: "AWS",
          aws_access_key_id: args_hash[:auth],
          aws_secret_access_key: args_hash[:secret]
        })
      end

      def to_volume
        Arriba::Volume::S3Directory.new(self, name)
      end

    end

  end
end
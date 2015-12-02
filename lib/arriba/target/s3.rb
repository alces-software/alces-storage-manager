require 'arriba/volume/s3_directory'
require 'fog'

module Arriba
  module Target

    class S3 < Arriba::Target::Base

      DEFAULT_REGION = "us-east-1" # = Fog::Storage::AWS.DEFAULT_REGION

      def initialize(args_hash)
        super
        unless args_hash.key?(:auth) && args_hash.key?(:secret)
          raise ArgumentError, "auth and secret must be provided"
        end
        @storages = {}
        @auth = args_hash[:auth]
        @secret = args_hash[:secret]
      end

      def storage(region=DEFAULT_REGION)
        @storages[region] ||= Fog::Storage.new({
          provider: "AWS",
          aws_access_key_id: @auth,
          aws_secret_access_key: @secret,
          region: region
        })
      end

      def to_volume
        Arriba::Volume::S3Directory.new(self, name)
      end

    end

  end
end
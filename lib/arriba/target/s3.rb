require 'arriba/volume/s3_directory'
require 'fog'

module Arriba
  module Target

    class S3 < Arriba::Target::Base

      DEFAULT_REGION = "eu-west-1" # != Fog::Storage::AWS.DEFAULT_REGION

      def initialize(args_hash)
        super
        unless args_hash.key?(:auth) && args_hash.key?(:secret)
          raise ArgumentError, "auth and secret must be provided"
        end
        @storages = {}
        @auth = args_hash[:auth]
        @secret = args_hash[:secret]
        @bucket_region_map = {}
        @host = args_hash[:address]
        storage.directories.all # Test connection at init time
      end

      def storage(region=DEFAULT_REGION)
        @storages[region] ||= Fog::Storage.new({
          provider: "AWS",
          aws_access_key_id: @auth,
          aws_secret_access_key: @secret,
          host: @host,
          region: region
        })
      end

      def get_bucket(bucketKey, prefix="")
        region = region_for_bucket(bucketKey)
        storage(region).directories.get(bucketKey, prefix: prefix)
      end

      def to_volume
        Arriba::Volume::S3Directory.new(self, name)
      end

      def file_for(path)
        to_volume.represent(path)
      end

      def region_for_bucket(bucket)
        if !@bucket_region_map.has_key?(bucket)
          locConstraint = storage.get_bucket_location(bucket).data[:body]["LocationConstraint"]
          @bucket_region_map[bucket] = locConstraint ? locConstraint : "us-east-1"
        end
        @bucket_region_map[bucket]
      end
    end

  end
end
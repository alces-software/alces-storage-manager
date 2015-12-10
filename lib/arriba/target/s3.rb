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
        storage.get_service.body["Buckets"].map { |b| b["Name"] }.each { |bucket|
          @bucket_region_map[bucket] = region_for_bucket(bucket)
        }
      end

      def storage(region=DEFAULT_REGION)
        @storages[region] ||= Fog::Storage.new({
          provider: "AWS",
          aws_access_key_id: @auth,
          aws_secret_access_key: @secret,
          region: region
        })
      end

      def get_bucket(bucketKey, prefix="")
        region = @bucket_region_map[bucketKey]
        storage(region).directories.get(bucketKey, prefix: prefix)
      end

      def to_volume
        Arriba::Volume::S3Directory.new(self, name)
      end

      def file_for(path)
        to_volume.represent(path)
      end

      private

      def region_for_bucket(bucket)
        locConstraint = storage.get_bucket_location(bucket).data[:body]["LocationConstraint"]
        locConstraint ? locConstraint : "us-east-1"
      end
    end

  end
end
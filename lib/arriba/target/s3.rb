require 'arriba/volume/s3_directory'
require 'fog'
require 'fog/aws/models/storage/files'

module Arriba
  module Target

    class S3 < Arriba::Target::Base

      DEFAULT_REGION = "eu-west-1" # != Fog::Storage::AWS.DEFAULT_REGION

      def initialize(args_hash)
        super
        unless args_hash.key?(:access_key) && args_hash.key?(:secret_key)
          raise ArgumentError, "access_key and secret_key must be provided"
        end
        @storages = {}
        @auth = args_hash[:access_key]
        @secret = args_hash[:secret_key]
        @bucket_region_map = {}
        @host = args_hash[:address]
        @extra_buckets = args_hash[:buckets]
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

      def extra_buckets
        @extra_buckets.map { |b| b.start_with?("s3://") ? b[5..-1] : b}
      end

      def get_bucket(bucketKey, prefix="")
        if extra_buckets.include?(bucketKey)
          body = storage.get_bucket(bucketKey)
          return FakeBucket.new({service: storage}, bucketKey, body.data[:body]["Contents"], prefix)
        else
          region = region_for_bucket(bucketKey)
          storage(region).directories.get(bucketKey, prefix: prefix)
        end
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

    class FakeBucket < ::Fog::Collection
      attr_accessor :key
      def initialize(attrs, key, contents, prefix="")
        super(attrs)
        @key = key
        @prefix = prefix ? prefix : "" # Eliminate nil
        @contents = load(contents)
      end
      def model
        ::Fog::Storage::AWS::File
      end
      def files
        @contents.select { |f| f.key.start_with?(@prefix) }
      end
    end
    
  end
end
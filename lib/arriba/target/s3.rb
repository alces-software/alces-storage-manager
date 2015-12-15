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
        @public_storages = {}
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

      def get_public_bucket(bucketKey) # Horrible hack around Fog's lack of support for regions and public buckets
        if @public_storages.has_key?(bucketKey)
          return @public_storages[bucketKey]
        end
        begin
          Fog::Storage.new({
            provider: "AWS",
            aws_access_key_id: @auth,
            aws_secret_access_key: @secret,
            region: "us-east-1",
            host: "s3.amazonaws.com",
          }).tap {|c| @public_storages[bucketKey] = c}.get_bucket(bucketKey)
        rescue Excon::Errors::BadRequest => e
          neededRegion = e.response.data[:body].match(/(?:Region>)(.*)(?:<\/Region)/)[1]
          storage(neededRegion).tap {|c| @public_storages[bucketKey] = c}.get_bucket(bucketKey)
        end
      end

      def extra_buckets
        s3_prefix = "s3://"
        @extra_buckets.map { |b| b.start_with?(s3_prefix) ? b[s3_prefix.length..-1] : b}
      end

      def get_bucket(bucketKey, prefix="")
        if extra_buckets.include?(bucketKey)
          body = get_public_bucket(bucketKey)
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
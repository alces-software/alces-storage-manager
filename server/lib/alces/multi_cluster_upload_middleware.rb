module Alces
  class MultiClusterUploadMiddleware < UploadMiddleware
    def targets(env)

      storage_regex = /(\/storage\/)([0-9A-Za-z]+)(\/upload)/
      match = storage_regex.match(env['REQUEST_PATH'])

      storageId = match ? match[2] : nil
      if storageId
        username = env['rack.session'][:authentications][storageId]

        @targets_class.new(
            username,
            AlcesStorageManager.daemon_for(storageId)
        ).tap do |targets|
          raise "Invalid user identification provided" unless targets.valid?
        end
      else
        nil
      end
    end
  end
end

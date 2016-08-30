module Alces
  class MultiClusterUploadMiddleware < UploadMiddleware
    def targets(env)
      @targets_class.new(
          env['HTTP_X_FINDER_KEY'],
          AlcesStorageManager.daemon_for(env['STORAGE_ID'])
      ).tap do |targets|
        raise "Invalid user identification provided" unless targets.valid?
      end
    end
  end
end

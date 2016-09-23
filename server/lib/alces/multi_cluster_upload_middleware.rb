module Alces
  class NoDaemonFound < Exception; end
  class MultiClusterUploadMiddleware < UploadMiddleware

    def initialize(app, opts = {})
      super(app, opts)
      @app = app
    end

    def targets(env)

      storage_regex = /(\/storage\/)([0-9A-Za-z]+)(\/upload)/
      match = storage_regex.match(env['REQUEST_PATH'])

      storageId = match ? match[2] : nil
      if storageId

        raise NoDaemonFound unless AlcesStorageManager.config['collections'].has_key?(storageId)
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

    def call(env)
      super
    rescue DaemonClient::ConnError, NoDaemonFound => e
      env[:upload_middleware_error] = e
      @app.call(env)
    end
  end
end

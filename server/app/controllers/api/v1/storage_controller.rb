
require 'targets'
require 'base64'

class Api::V1::StorageController < ApplicationController
  def index

    all_collections = AlcesStorageManager::config['collections']
    authentications = session[:authentications]
    our_collections = {}

    all_collections.each do |id, collection|
      our_collection = collection.dup
      if authentications.key?(id)
        our_collection['username'] = authentications[id]

        daemon = AlcesStorageManager::daemon_for(id)
        targets = Alces::Targets.new(authentications[id], daemon)
        allTargets = targets.all
        warnings = targets.errors.map { |name, file, error|
          "Invalid target definition for '#{name}' defined in #{file}: #{error}"
        }

        our_collection['warnings'] = warnings
        our_collection['hasTargets'] = !allTargets.empty?
      end
      our_collections[id] = our_collection
    end

    render json: our_collections
  end

  # params[:cluster] should contain:
  # name (string)
  # ip (string)
  # auth_port (integer)
  # ssl (boolean, optional, defaults to true)
  #
  # We keep the 'cluster' moniker for consistency with AAM.
  def register
    config = AlcesStorageManager::config

    if params.key?(:cluster)

      new_storage_collection = {}.tap {|hash|
        params[:cluster].each do |key, val|
          hash[key] = val
        end
      }

      if new_storage_collection.key?('ip') && new_storage_collection.key?('auth_port') && new_storage_collection.key?('name')
        collection_hash = Base64.strict_encode64("#{new_storage_collection['ip']}:#{new_storage_collection['auth_port']}")

        config['collections'][collection_hash] = new_storage_collection.to_h

        AlcesStorageManager::write_config(config)
        render json: {success: true} and return
      end
    end
    handle_error 'invalid_configuration', :bad_request
  end

  def authenticate
    params.require(:username)
    params.require(:password)
    daemon = AlcesStorageManager::daemon_for(params[:id])

    if daemon
      auth_response = daemon.authenticate?(params[:username], params[:password])
      if auth_response
        if !session.key?(:authentications)
          session[:authentications] = {}
        end
        session[:authentications][params[:id]] = params[:username]

        targets = Alces::Targets.new(params[:username], daemon)
        allTargets = targets.all
        warnings = targets.errors.map { |name, file, error|
          "Invalid target definition for '#{name}' defined in #{file}: #{error}"
        }

        render json: {success: true, warnings: warnings, hasTargets: !allTargets.empty?}
      else
        handle_error 'invalid_credentials', :unauthorized
      end
    else
      handle_error 'not_found', :not_found
    end
  rescue DaemonClient::ConnError
    config = AlcesStorageManager.config
    config['collections'].delete(params[:id])
    handle_error 'unavailable', :service_unavailable
  end

  def logout
    session[:authentications].delete(params[:id])
    render json: {success: true}
  end

  private

  def handle_error(message, status)
    render json: {success: false, error: message}, status: status
  end

end

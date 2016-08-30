
require 'targets'
require 'base64'

class Api::V1::StorageController < ApplicationController
  def index
    render json: AlcesStorageManager::config['collections']
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

      new_storage_collection = params[:cluster]

      if new_storage_collection.key?('ip') && new_storage_collection.key?('auth_port') && new_storage_collection.key?('name')
        collection_hash = Base64.strict_encode64("#{new_storage_collection['ip']}:#{new_storage_collection['auth_port']}")

        config['collections'][collection_hash] = new_storage_collection

        AlcesStorageManager::write_config(config)
        render json: {success: true} and return
      end
    end
    handle_error 'invalid_configuration', :bad_request
  end

  def authenticate
    p params
    params.require(:username)
    params.require(:password)

    auth_response = AlcesStorageManager::authentication_daemon.authenticate?(params[:username], params[:password])
    if auth_response
      reset_session
      session[:authenticated_username] = params[:username]

      targets = Alces::Targets.new(params[:username])
      allTargets = targets.all
      warnings = targets.errors.map { |name, file, error|
        "Invalid target definition for '#{name}' defined in #{file}: #{error}"
      }

      render json: {success: true, warnings: warnings, hasTargets: !allTargets.empty?}
    else
      handle_error 'invalid_credentials', :unauthorized
    end
  end

  def logout
    session[:authenticated_username] = nil
    render json: {success: true}
  end

  private

  def handle_error(message, status)
    render json: {success: false, error: message}, status: status
  end

end

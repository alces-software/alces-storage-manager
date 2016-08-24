
require 'targets'

class Api::V1::StorageController < ApplicationController
  def index
    render json: [AlcesStorageManager::config[:auth]]
  end

  def register
    # TODO multi-storage support
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

  private

  def handle_error(message, status)
    render json: {success: false, error: message}, status: status
  end

end

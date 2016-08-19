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
      render json: {success: true}
    else
      handle_error 'invalid_credentials', :unauthorized
    end
  end

  private

  def handle_error(message, status)
    render json: {success: false, error: message}, status: status
  end

end

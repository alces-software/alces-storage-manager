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

    handle_error 'invalid_credentials', :unauthorized
  end

  private

  def handle_error(message, status)
    render json: {success: false, error: message}, status: status
  end

end

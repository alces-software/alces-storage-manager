class Api::V1::StorageController < ApplicationController

  def index
    render json: [AlcesStorageManager::config[:auth]]
  end

  def register
    # TODO multi-storage support
  end

end

require 'polymorph_client'

class LoginController < ApplicationController
  def index
  end
  
  def authenticate
    emohawk = PolymorphClient::Connection.new({})
    auth_response = emohawk.authenticate?(params[:username], params[:password])
    if auth_response
      reset_session
      session[:authenticated_username] = params[:username]
      render plain: "You have authenticated successfully as %s." % [session[:authenticated_username]]
    else
      @errors = true
      @user = params[:username]
      render :index
    end
  end
end

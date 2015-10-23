require 'polymorph_client'

class LoginController < ApplicationController
  def index
  end
  
  def authenticate
    emohawk = PolymorphClient::Connection.new({})
    auth_response = emohawk.authenticate?(params[:username], params[:password])
    render html: "Auth response was <em>%s</em>".html_safe % [auth_response]
  end
end

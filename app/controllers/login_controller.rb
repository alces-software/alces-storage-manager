class LoginController < ApplicationController
  def index
  end
  
  def authenticate
    render html: "You submitted username <em>%s</em> and password <em>%s</em>.".html_safe % [params[:username], params[:password]]
  end
end

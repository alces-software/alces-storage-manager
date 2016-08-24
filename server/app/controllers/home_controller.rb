
require 'ostruct'

class HomeController < ActionController::Base
  def index
    @assets = if Rails.env.production?
      assets_hash = ENV["ASM_ASSETS_HASH"]
      unless assets_hash
        puts 'ERROR: Please export ASM_ASSETS_HASH to the hash of the current assets.'
      end
      OpenStruct.new(
        js_bundle_url: "/alces-storage-manager.#{assets_hash}.min.js",
        css_bundle_url: "/alces-storage-manager.#{assets_hash}.css",
        revision: "production-#{assets_hash}"
      )
    else
      OpenStruct.new(
        js_bundle_url: 'http://localhost:3001/alces-storage-manager.js',
        css_bundle_url: 'http://localhost:3001/alces-storage-manager.css',
        revision: 'dev_build'
      )
    end
  end

  helper_method :body_element_attrs
  def body_element_attrs
    # Intentionally nil for the moment.
  end
end

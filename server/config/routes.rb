#==============================================================================
# Copyright (C) 2015 Stephen F. Norledge and Alces Software Ltd.
#
# This file/package is part of Alces Storage Manager.
#
# Alces Storage Manager is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License
# as published by the Free Software Foundation, either version 3 of
# the License, or (at your option) any later version.
#
# Alces Storage Manager is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this package.  If not, see <http://www.gnu.org/licenses/>.
#
# For more information on the Alces Storage Manager, please visit:
# https://github.com/alces-software/alces-storage-manager
#==============================================================================

Rails.application.routes.draw do

  root to: 'home#index'

  post 'file-upload', to: 'upload#handle'

  # Make these static assets available (else they get caught in the final catch-all redirect)
  get 'plupload/Moxie.swf', to: redirect('plupload/Moxie.swf')
  get 'plupload/Moxie.xap', to: redirect('plupload/Moxie.xxap')

  namespace :api, defaults: { format: 'json' } do
    namespace :v1 do

      resources :storage, only: [:index] do
        collection do
          post :register
        end
      end

      storage_route_params = {
          constraints: {address: /[^\/]+/} # Allow address to have any chars except '/'.
      }

      post 'storage/:id/authenticate',
           to: 'storage#authenticate',
           **storage_route_params

      get 'storage/:id/logout',
           to: 'storage#logout',
           **storage_route_params

      get 'storage/:id/files',
          to: 'finder#api',
          **storage_route_params

      post 'storage/:id/files',
          to: 'finder#api',
          **storage_route_params
    end
  end

  # For all other GET requests render the index page to load the Storage Manager
  # app; this will then show the requested page.
  get '*path' => 'home#index'

end

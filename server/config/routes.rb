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

  # Legacy URLs
  get 'login/index'
  post 'login/authenticate'
  get 'logout', to: 'login#logout'

  get 'files', to: 'files#index'
  get 'finder/api'
  post 'finder/api'
  post 'file-upload', to: 'upload#handle'

  namespace :api, defaults: { format: 'json' } do
    namespace :v1 do

      resources :storage, only: [:index] do
        collection do
          post :register
        end
      end
    end
  end

  # For all other GET requests render the index page to load the Storage Manager
  # app; this will then show the requested page.
  get '*path' => 'home#index'

end

#==============================================================================
# Copyright (C) 2016 Stephen F. Norledge and Alces Software Ltd.
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
class Api::V1::FinderController < ElfinderController
  def api
    # Munge the request parameters since ElfinderRailsConnector expects a username there
    params[:username] = session[:authentications][params[:id]]

    collections = AlcesStorageManager::config['collections']

    if !collections.has_key?(params[:id])
      # This can arise if a collection goes away and is removed from our config
      # while a user is interacting with the file manager, having already authenticated.
      render :json => {:error => 'This storage collection is not currently available.'}
    else
      super.tap { |resp|
        if /Could not communicate with/.match(resp[0])
          # This is matching the text of the exception caught and JSONified in
          # ElfinderController, thrown by daemon_client/connection.rb:61. Yuck
          collections.delete(params[:id])
          AlcesStorageManager.write_config
        end
      }
    end
  end

end

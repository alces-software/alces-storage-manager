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
workers 1
# default timeout is 60s
worker_timeout 60
# Minimum and maximum number of threads set to be the same.
threads 16, 16

preload_app!

port ENV['PORT'] || '3000'
environment ENV['RACK_ENV'] || 'development'

# This block is called within the 'slave' process when it is fired up.
on_worker_boot do
  ActiveRecord::Base.establish_connection
end

# Additional text to display in process listing
tag 'alces-storage-manager'

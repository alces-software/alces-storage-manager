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

require 'daemon_client'

module AlcesStorageManager
  class << self
    def config
      @config ||= YAML.load_file(Rails.root.join("config", "storagemanager.yml"))
    end

    def authentication_daemon
      DaemonClient::Connection.new(connection_opts)
    end
    
    private
    
    def connection_opts
      auth_config = AlcesStorageManager::config[:auth].dup
      {
        timeout: 5,
        ssl_config: auth_config.delete(:ssl) ? ssl_config : nil
      }.merge(auth_config)
    end
  
    def ssl_config
      @my_ssl ||= Class.new do
        include Alces::Tools::SSLConfigurator
        def ssl
          ssl_opts = AlcesStorageManager::config[:ssl].dup
          Alces::Tools::SSLConfigurator::Configuration.new(
            root: ssl_opts[:root],
            certificate: ssl_opts[:certificate],
            key: ssl_opts[:key],
            ca: ssl_opts[:ca]
          )
        end
      end.new().ssl_config
    end
    
  end
end

# Assert at startup that the config file exists, and bug out with a large stack
# trace if not.
AlcesStorageManager.config

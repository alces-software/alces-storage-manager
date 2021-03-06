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

require 'digest/md5'
require 'alces/tools/ssl_configurator'
require 'arriba'
require 'arriba/target/posix'
require 'arriba/target/s3'

module Alces
  class Targets < Struct.new(:username, :daemon)
    delegate :targets, :secret, :to => self

    def each(&block)
      all.each(&block)
    end

    def all
      @errors = []
      targets(username, daemon).keys.map { |name| get(name) }.compact
    end

    def errors
      @errors
    end

    def get(name)
      begin
        data = targets(username, daemon)[name].merge(
          :name => name,
          :username => username
        ).tap { |d|
          if d[:type] == 'posix'  # Daemon address is needed in the target data for posix but would break s3
            d[:address] = daemon.address
          end
        }
        Arriba::Target.new(data)
      rescue => e
        STDERR.puts("WARNING: error in target #{name} for user #{username}, ignoring definition (#{e})")
        @errors.push([name, data[:file] || "unknown", e])
        nil
      end
    end

    def valid?
      # ASM has already checked the authorization of this request. So as long
      # as we have a username, we are good to go.
      !!username
    end

    private

    class << self
      def targets(username, daemon)
        @targets =
          begin
            d = data(username, daemon).stringify_keys
            d.merge(d) do |k,meta|
              if (ssl_key = meta.delete(:ssl)) != false
                meta[:ssl] = ssl_for(ssl_key) 
              end
              meta
            end
          end
      end

      def ssl_for(ssl_key)
        if ssl_key != false
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
            end.new
        else
          nil
        end
      end

      def data(username, daemon)
        opts = {
          :handler => 'Alces::StorageManagerDaemon::TargetsHandler',
          :username => username
        }
        wrapper = DaemonClient::Wrapper.new(daemon, opts)
        wrapper.targets_for(username)
      end
    end
  end
end

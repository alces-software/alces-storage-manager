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
require 'arriba/target/remote'

module Alces
  class Targets < Struct.new(:username)
    delegate :targets, :secret, :to => self

    def each(&block)
      all.each(&block)
    end
      
    def all
      targets.keys.map { |name| get(name) }
    end
      
    def get(name)
      data = targets[name].merge(
        :name => name,
        :username => username,
        :directory_finder => DirectoryFinder
      )
      Arriba::Target.new(data)
    end

    def directory_for(name)
      DirectoryFinder.new(targets[name].merge(username: username)).directory
    end

    def valid?
      # ASM has already checked the authorization of this request. So as long
      # as we have a username, we are good to go.
      !!username
    end

    private

    class DirectoryFinder < Struct.new(:opts)
      def directory
        if d = opts[:dir_spec]
          # Delegate the handling of special directories, such as home and
          # tmp dir, to ASMD.
          d.to_sym
        elsif d = opts[:dir]
          d
        else
          raise "Unable to determine directory from: #{opts.inspect}"
        end
      end
    end
      
    class << self
      def targets
        @targets ||=
          begin
            d = data.stringify_keys
            d.merge(d) do |k,meta|
              if ssl_key = meta.delete(:ssl)
                meta[:ssl] = ssl_for(ssl_key) 
              end
              meta
            end
          end
      end

      def ssl_for(ssl_key)
        if ssl_key == true
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

      def data
        AlcesStorageManager::config[:targets]
      end
    end
  end
end
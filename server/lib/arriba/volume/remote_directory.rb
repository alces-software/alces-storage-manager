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
module Arriba
  class Volume::RemoteDirectory < Volume
    attr_accessor :target, :name
    def initialize(target, name, id = nil)
      self.name = name
      id ||= Arriba::Routing::encode(name)
      super(id)

      server_opts = target.user_identifier.merge(
        :timeout => target.daemon_opts[:timeout] + 1,
        :handler => 'Alces::StorageManagerDaemon::ArribaHandler',
        :handler_args => [target.dir, name]
      )
      @daemon = DaemonClient::Wrapper.new(target.daemon, server_opts)
      self.target = target
    end
    

    def options
      {
        'download_limit' => -1
      }
    end

    # we can shortcut if we're dealing with another remote directory on the
    # same target host
    def shortcut?(dest_vol)
      dest_vol.is_a?(Arriba::Volume::RemoteDirectory) &&
        target.address == dest_vol.target.address
    end

    delegate *Arriba::Operations::File.instance_methods, :to => :daemon

    def daemon
      @daemon
    end

    def files(*args)
      daemon.files(*args)
    rescue DaemonClient::ConnError
      [UnresponsiveRoot.new(self)]
    rescue SystemCallError
      [UnresponsiveRoot.new(self, $!.message)]
    end

    def cwd(*args)
      daemon.cwd(*args)
    rescue DaemonClient::ConnError
      UnresponsiveRoot.new(self)
    rescue SystemCallError
      UnresponsiveRoot.new(self, $!.message)
    end

    # override File IO method as we are unable to deliver a File over
    # marshalling
    def io(path)
      target.file_for(path).read_open
    end

    class UnresponsiveRoot < Arriba::Root
      def initialize(volume, error_message="Unresponsive")
        @error_message = error_message
        super(volume, volume.name)
      end
      
      def to_hash
        {
          'name' => "#{name} (#{@error_message})",
          'phash' => '',
          'volumeid' => "#{volume.id}_",
          'hash' => "#{volume.id}_#{encode(path)}",
          'date' => 0,
          'mime' => 'directory',
          'size' => 0,
          'dirs' => 0,
          'locked' => 1,
          'read' => 1,
          'write' => 0,
        }
      end
    end
  end
end

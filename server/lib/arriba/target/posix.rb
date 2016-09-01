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
require 'arriba/volume/remote_directory'
require 'daemon_client'
require 'socket'

module Arriba
  module Target
    class Posix < Arriba::Target::Base

      # convenience s.t. we can still refer to File resolving to
      # ::File rather than Arriba::File.
      File = ::File

      attr_accessor :address, :user_identifier, :daemon_opts
      def initialize(args_hash)
        super
        unless args_hash.key?(:static_uid) || args_hash.key?(:uid) || args_hash.key?(:username)
          raise ArgumentError, "static_uid, uid or username must be provided"
        end

        self.address = DaemonClient::Connection.normalize_address(args_hash[:address])[0]
        @uid = args_hash[:static_uid] || args_hash[:uid]
        @username = args_hash[:username]
        self.daemon_opts = {
          :address => self.address,
          :timeout => args_hash[:timeout] || 5
        }
        if args_hash.key?(:ssl)
          @ssl = args_hash[:ssl]
          self.daemon_opts[:ssl_config] = @ssl.ssl_config
        else
          @ssl = nil
        end
      end

      def directory_for(args_hash)
        DirectoryFinder.new(args_hash).directory
      end

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

      def file_for(path)
        dir = to_volume.cwd('/').volume.root
        RemoteFile.new(host, daemon, File.join(dir,path), user_identifier, @ssl)
      end

      def to_volume
        Arriba::Volume::RemoteDirectory.new(self, name)
      end

      def daemon
        @daemon ||= DaemonClient::Connection.new(daemon_opts)
      end

      def host
        @host ||= address.split(':').first
      end

      def user_identifier
        if @uid
          {:uid => @uid}
        else
          {:username => @username}
        end
      end

      class RemoteFile < Struct.new(:host, :daemon, :path, :user_identifier, :ssl)
        def read_open
          socket_io(ChunkedSocket.new(host, port_for(:download))) do |io|
            io.close_write
          end
        end

        def open
          socket_io(TCPSocket.new(host, port_for(:upload))) do |io|
            io.close_read
          end
        end

        private
        def port_for(direction)
          daemon.forked_io(user_identifier, path, direction)
        end

        def socket_io(sock, &block)
          (ssl.nil? ? sock : ssl_socket(sock)).tap do |sock|
            block.call(ssl.nil? ? sock : sock.io)
          end
        end

        def ssl_socket(sock)
          ssl.ssl_socket(sock).tap do |ssl_sock|
            ssl_sock.extend(BinaryLineBuffering)
          end
        end
      end

      module BinaryLineBuffering
        def each(eol=nil)
          if eol.nil?
            while line = self.read(1_048_576)
              yield line
            end
          else
            super
          end
        end
      end

      # 1MiB chunks by default from #each
      class ChunkedSocket < TCPSocket
        def initialize(host, port, chunk_size = 1_048_576)
          super(host, port)
          @chunk_size = chunk_size
        end
        
        def each(*a,&b)
          if a.empty?
            GC.start
            super('',@chunk_size,&b)
          else
            super
          end
        end
      end
    end
  end
end

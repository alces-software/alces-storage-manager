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
require 'net/ping/tcp'
require 'daemon_client/errors'

module DaemonClient
  class Connection < BlankSlate
    class << self
      def normalize_address(address)
        return ['127.0.0.1:25268'] if address.nil?
        address.split(',').map do |a|
          if a.split(':').length == 1
            if a.to_i.to_s == a
              # we have a port only, default to localhost
              a = "127.0.0.1:#{a}"
            else
              # we have an IP only, default to 25268
              a << ':25268'
            end
          else
            a
          end
        end
      end
    end

    # options: {
    #  :address: "ip_of_daemon:port", -- defaults to 127.0.0.1:25268
    #  :ssl_config: -- these things can be easily populated via Alces::Tools::SSLConfigurator
    #    -- the presence of the ssl_config parameter invokes an SSL connection
    #    SSLCertificate: ssl_cert,
    #    SSLPrivateKey: ssl_key,
    #    SSLCACertificateFile: ssl_ca_file
    #  :timeout: 2 (default)
    def initialize(options)
      options = options.dup
      addresses = ::DaemonClient::Connection.normalize_address(options.delete(:address))
      address = addresses.find do |a|
        ::Net::Ping::TCP.new(*a.split(':'), options[:timeout]||2).ping
      end
      ::Kernel.raise ::DaemonClient::ConnError, "Could not communicate with any ASM daemons: #{addresses.inspect}" if address.nil?
      @executor = ::DaemonClient::Executor.new(address, options)
    end

    # Prevent inspect from being passed over the wire
    def inspect
      "<DaemonClient::Connection address=#{@executor.address.inspect}>"
    end

    # Allow some limited form of introspection without going via DRb and
    # risking `ArgumentError: wrong number of arguments exceptions`.
    def __class__
      ::DaemonClient::Connection
    end

    def method_missing(s, *a, &b)
      if s == :forked_io
        @executor.forked_io(*a, &b)
      else
        @executor.exec(s, *a, &b)
      end
    end
  end
end

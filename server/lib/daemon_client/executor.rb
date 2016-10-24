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
require 'drb'
require 'timeout'
require 'active_support/core_ext/array/extract_options'
require 'daemon_client/errors'
require 'thread'

module DRb
  class << self
    def config
      current_server.config
    rescue
      @default_config ||= DRbServer.make_config
    end
  end
end

# This is defined here to allow the server-side to throw an exception
# that is to be caught and reraised for handling by the caller.
#
# Ideally we would collaboratively define the exception class to be
# used here somewhere that both daemon_client and
# ASMD can both use -- perhaps alces-tools as
# Alces::Tools::RemoteServiceError?
module Alces
  module StorageManagerDaemon
    class HandlerError < RuntimeError; end
  end
end

module DaemonClient
  class Executor
    attr_accessor :address
    def initialize(address, options)
      self.address = address
      @ssl_config = options.key?(:ssl_config) && options.delete(:ssl_config)
      @remote = establish_connection
      @timeout = options.delete(:timeout) || 2
      @lock = Mutex.new
    end

    def establish_connection
      scheme = @ssl_config ? 'drbssl' : 'druby'
      DRb.config.merge!(@ssl_config) if @ssl_config
      DRbObject.new_with_uri("#{scheme}://#{address}")
    end

    def forked_io(*a,&b)
      remotely do |r|
        r.forked_io(*a,&b)
      end
    end

    def exec(s, *a, &b)
      options = a.extract_options!
      remotely do |r|
        @lock.synchronize {
          r.send(s, options, *a, &b)
        }
      end
    end

    private
    def remotely(&block)
      Timeout.timeout(@timeout) do
        block.call(@remote)
      end
    rescue TimeoutError
      raise DaemonClient::ConnError, "Could not communicate with ASM daemon: #{$!.message}"
    rescue DRb::DRbConnError, Errno::ECONNREFUSED
      raise DaemonClient::ConnError, "Could not communicate with ASM daemon: #{$!.message}"
    rescue Alces::StorageManagerDaemon::HandlerError
      raise DaemonClient::RemoteError, "An error occurred during ASM handler execution: #{$!.message}"
    rescue
      STDERR.puts '===== UNCAUGHT DAEMON EXCEPTION DETECTED ====='
      STDERR.puts "(Logged @#{__FILE__}:#{__LINE__})"
      STDERR.puts "#{$!.class}: #{$!.message}"
      STDERR.puts $!.backtrace.join("\n")
      STDERR.puts '================================================='
      raise
    end
  end
end

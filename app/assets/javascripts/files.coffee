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
//= require elfinder.min
//= require jquery-ui
//= require plupload/plupload.full.min
//= require plupload/jquery.ui.plupload/jquery.ui.plupload
//= require base64

jQuery.fn.elfinderPortalUploadButton = (cmd) ->
      @.each ->
        jQuery(@).elfinderbutton(cmd).unbind('click').bind 'click', ->
          jQuery("#uploader").dialog("open")
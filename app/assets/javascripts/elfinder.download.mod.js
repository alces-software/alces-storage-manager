"use strict";
/* ==============================================================================
 * Copyright (C) 2015 Stephen F. Norledge and Alces Software Ltd.
 *
 * This file/package is part of Alces Storage Manager.
 *
 * Alces Storage Manager is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * Alces Storage Manager is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this package.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For more information on the Alces Storage Manager, please visit:
 * https://github.com/alces-software/alces-storage-manager
 * 
 * This file based on elfinder's download command, Dmitry Levashov, dio@std42.ru
 * 
 *==============================================================================
 */
elFinder.prototype.commands.download = function() {
  var self   = this,
    fm     = this.fm,
    filter = function(hashes) {
      return $.map(self.files(hashes), function(f) { return f.mime == 'directory' ? null : f });
    };
  
  this.shortcuts = [{
    pattern     : 'shift+enter'
  }];
  
  this.getstate = function() {
    var sel = this.fm.selected(),
      cnt = sel.length;
    
    return  !this._disabled && cnt && (!fm.UA.IE || cnt == 1) && cnt == filter(sel).length ? 0 : -1;
  }
  
  this.exec = function(hashes) {
    var fm      = this.fm,
      base    = fm.options.url,
      files   = filter(hashes),
      dfrd    = $.Deferred(),
      iframes = '',
      cdata   = '',
      i, url;
      
    if (this.disabled()) {
      return dfrd.reject();
    }
      
    if (fm.oldAPI) {
      fm.error('errCmdNoSupport');
      return dfrd.reject();
    }
    
    cdata = $.param(fm.options.customData || {});
    if (cdata) {
      cdata = '&' + cdata;
    }
    
    base += base.indexOf('?') === -1 ? '?' : '&';

    for (i = 0; i < files.length; i++) {
      var limit = fm.option("download_limit");
      if (limit > 0 &&files[i].size > limit ) {
        fm.error("File " + files[i].name + " exceeds the configured download size limit and cannot be downloaded.");
      } else {
        iframes += '<iframe class="downloader" id="downloader-' + files[i].hash+'" style="display:none" src="'+base + 'cmd=file&target=' + files[i].hash+'&download=1'+cdata+'"/>';
      }
    }
    $(iframes)
      .appendTo('body')
      .ready(function() {
        setTimeout(function() {
          $(iframes).each(function() {
            $('#' + $(this).attr('id')).remove();
          });
        }, (20000 + (10000 * i)));
      });
    fm.trigger('download', {files : files});
    return dfrd.resolve(hashes);
  }

};

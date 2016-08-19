import React from 'react';

import $ from 'elfinder/elfinder';
const Base64 = require('js-base64').Base64;

require('elfinder/style/elfinder.min.css');

export default class FileManager extends React.Component {

  componentWillMount() {
    const resizeFinder = function() {
      if (elfinder) {
        // For some reason elfinder.resize() triggers $(window).resize() so we need to jump through
        // some hoops here to avoid unfortunate recursion
        $(window).off("resize", null, resizeFinder);
        var shouldBeHeight = $(window).height() - $('#elfinder').offset().top - 30;
        elfinder.resize('auto', shouldBeHeight);
        $(window).on("resize", null, resizeFinder);
      }
    };

    const finderApiUrl = `/api/v1/storage/${this.props.collection}/files`;

    $(window).on("resize", resizeFinder);

    var cwd = "";
    var elfinder = null;
    $(document).ready(function() {
      elfinder = $('#elfinder').elfinder({
        contextmenu: {
          navbar: ['open', '|', 'duplicate', 'copy', 'cut', 'paste', '|', 'rm', '|', 'info'],
          cwd: ['reload', 'back', '|', 'mkdir', 'mkfile', 'paste', '|', 'sort', '|', 'info'],
          files: ['getfile', 'submit', '|', 'download', 'open', 'quicklook', '|', 'duplicate', 'copy', 'cut', 'paste', '|', 'rename', 'rm', 'edit', '|', 'archive', 'extract', '|', 'info'],
        },
        height: $(window).height() - $('#elfinder').offset().top - 30,
        resizable: false,
        ui: ['toolbar', 'tree', 'path', 'stat'],
        uiOptions: {
          toolbar: [
            ['back', 'forward'],
            ['reload'],
            ['home', 'up'],
            ['mkdir', 'mkfile'],
            ['upload', 'download', 'open'],
            ['info', 'quicklook', 'submit'],
            ['duplicate', 'copy', 'cut', 'paste'],
            ['rename', 'rm', 'edit'],
            ['extract', 'archive'],
            ['view','sort'],
            ['help'],
          ],
        },
        commandsOptions: {
          upload: {
            ui: 'PortalUploadButton',
          },
        },
        handlers: {
          open: function(evt) {
            var directory, hash, volume, _ref;
            hash = evt.data.cwd.hash;
            _ref = hash.split('_').map(function(h) {
              return Base64.decode(h);
            }), volume = _ref[0], directory = _ref[1];
            while (volume.charCodeAt(volume.length - 1) === 0) {
              volume = volume.slice(0, volume.length - 1);
            }
            while (directory.charCodeAt(directory.length - 1) === 0) {
              directory = directory.slice(0, directory.length - 1);
            }
            cwd = [volume, directory].join(':');

            $( "#uploader" ).dialog( "option", "title", "Upload files to " + cwd );
          },
        },
        url : finderApiUrl,
      })[0].elfinder;
    });
  }

  render() {
    return (
      <div>
        <div id="elfinder"></div>
      </div>
    );
  }

}

import React from 'react';
import $ from 'jquery';

require('./plupload.dev');
require('./jquery.ui.plupload/jquery.ui.plupload');
require('./jquery.ui.plupload/css/jquery.ui.plupload.css');


export default class Uploader extends React.Component {
  componentDidMount() {
    const uploader = $(this.refs.uploader);
    const elfinderNode = $(this.props.elfinderNode());
    const uploadSettings = this.uploadSettings.bind(this);
    const refreshElfinder = this.refreshElfinder.bind(this);

    $(function() {
      uploader.dialog({
        autoOpen: false,
        draggable: false,
        height: ($(window).height() - elfinderNode.offset().top - 30) * 0.75,
        width: elfinderNode.width() * 0.5,
      }).plupload({
          // General settings
          runtimes : 'html5,flash,silverlight,html4',
          url : "/file-upload",
          multipart: false, // Alces::UploadMiddleware doesn't support multipart

          headers : {
            "X-File-Upload": true,
            "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
          },
          // Rename files by clicking on their titles
          rename: true,

          // Sort files
          sortable: true,

          // Enable ability to drag'n'drop files onto the widget (currently only HTML5 supports that)
          dragdrop: true,

          // Views to activate
          views: {
            list: true,
            thumbs: false,
            active: 'list',
          },

          // Flash settings
          flash_swf_url : '', // eslint-disable-line camelcase

          // Silverlight settings
          silverlight_xap_url : '', // eslint-disable-line camelcase

          init: {
          BeforeUpload: uploadSettings,
          UploadComplete: refreshElfinder,
        },
      })
    });
  }

  refreshElfinder() {
    if (this.props.elfinder) {
      this.props.elfinder.exec('reload');
    }
  }

  uploadSettings(up, file) {
    up.settings.headers['X-File-Name'] = file.name;
    up.settings.headers['X-Destination'] = this.props.cwd;
  }

  render() {
    return (
      <div id="uploader" ref="uploader">
        <p>Your browser doesn't have Flash, Silverlight or HTML5 support.</p>
      </div>
    );
  }
}

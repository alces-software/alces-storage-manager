import React from 'react';
import $ from 'jquery';

export default class Uploader extends React.Component {
  componentDidMount() {
    const uploader = $(this.refs.uploader);
    const elfinder = $(this.props.elfinder());

    $(function() {
      const plupload = require('./plupload.dev');

      uploader.dialog({
        autoOpen: false,
        draggable: false,
        height: ($(window).height() - elfinder.offset().top - 30) * 0.75,
        width: elfinder.width() * 0.5
      })
    });
  }

  render() {
    return (
      <div id="uploader" ref="uploader">
        <p>Your browser doesn't have Flash, Silverlight or HTML5 support.</p>
      </div>
    );
  }
}

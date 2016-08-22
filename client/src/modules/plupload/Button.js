import jQuery from 'jquery';

(function() {
  jQuery.fn.elfinderPortalUploadButton = function(cmd) {
    return this.each(function() {
      return jQuery(this).elfinderbutton(cmd).unbind('click').bind('click', function() {
        return jQuery("#uploader").dialog("open");
      });
    });
  };

}).call(this);

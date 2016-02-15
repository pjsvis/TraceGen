// Ref: http://stackoverflow.com/questions/19562207/jquery-detect-browser-ie9-and-below-and-throw-up-a-modal-to-upgrade
var browser = {
   isIe: function() {
      return navigator.appVersion.indexOf('MSIE') != -1;
   },
   navigator: navigator.appVersion,
   getVersion: function() {
      var version = 999; // we assume a sane browser
      if (navigator.appVersion.indexOf('MSIE') != -1)
      // bah, IE again, lets downgrade version number
         version = parseFloat(navigator.appVersion.split('MSIE')[1]);
      return version;
   },
   // Ref: http://responsivenews.co.uk/post/18948466399/cutting-the-mustard
   cutsTheMustard: function() {
      return 'querySelector' in document
         && 'localStorage' in window
         && 'addEventListener' in window;
   }
};

/// <reference path="../typings/tsd.d.ts" />
angular.module('app', [
    'ngSanitize', 'ngRoute', 'ngCookies', 'ngAnimate',
    'toastr', 'ngIdle', 'ui.bootstrap', 'SignalR',
    'ya.treeview', 'ya.treeview.tpls',
    'pascalprecht.translate', 
    'angularMoment',
    'ngFileUpload', 
    'ngStorage', 
    'ui.select',
    'ui.codemirror',  
    'agGrid',
    'app.demo', 
    'app.templates'  // the app templates module is the html compiled to javascript
]);

angular.module('app').controller('test', function() {
   console.log('Hello');
});
// your app setup here
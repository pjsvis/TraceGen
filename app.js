/// <reference path="../typings/tsd.d.ts" />
angular.module('app', [
    'ngSanitize', 'ngRoute', 'ngCookies', 'ngAnimate',
    'toastr', 'ngIdle', 'ui.bootstrap', 'SignalR',
    'ya.treeview', 'ya.treeview.tpls',
    'angularMoment', 'pascalprecht.translate',
    'ngFileUpload', 'ngStorage', 'ui.select',
    'ui.codemirror',
    'app.demo',
    'app.templates'
]);
angular.module('app').controller('test', function () {
    console.log('Hello');
});
// your app setup here 

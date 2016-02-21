/// <reference path="../../../../typings/tsd.d.ts" />
// NOTE: Not currently in use
angular.module('app').config(function ($routeProvider) {

   var folder = $('#baseHref').attr('href') + 'scripts/app/partials/UsersAdmin/';
   $routeProvider
      .when('/UsersAdmin', {
         templateUrl: folder + 'UsersAdmin.tpl.html'
      })
      .otherwise({
         redirectTo: '/'
      });
});
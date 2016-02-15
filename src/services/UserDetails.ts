/// <reference path="../../typings/tsd.d.ts" />
angular.module('app').factory('UserDetails', function($http: ng.IHttpService) {
   var fac = {	
   
   get: function() {
       return $http({
           method: 'jsonp',
           url: 'api/user/details'+ '?callback=JSON_CALLBACK',
           cache: true
       }).then(response => response.data);
   }
    };
   return fac;
})
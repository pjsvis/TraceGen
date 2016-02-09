/// <reference path="../../../typings/tsd.d.ts" />
angular.module('app').factory('UserDetails', function($http: ng.IHttpService) {
   var fac = {	
   
   get: function() {
       return $http({
           method: 'GET',
           url: 'api/user/details',
           cache: true
       }).then(response => response.data);
   }
    };
   return fac;
})
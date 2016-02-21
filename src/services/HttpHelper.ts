/// <reference path="../../typings/tsd.d.ts" />
angular.module("app")
   .factory("HttpHelper", function($http: ng.IHttpService, $q: ng.IPromise<any>, toastr: IToastrService) {

      let showError = function(response: ng.IHttpPromiseCallbackArg<any>) {
         let title = "Unexpected Error";
         let msg = "An unexpected error has occured.";
         if (angular.isUndefined(response)) {
            msg = "A response received from the web server";
            toastr.error(msg);
            return;
         }

         if (response.status === 404) {
            msg = ["Could not find ", response.config.url].join("");
            toastr.error(msg);
            return;
         }

         if (response.status === 500) {
            msg = [response.data.ExceptionMessage, " when calling ", response.config.url].join("");
            toastr.error(msg);
            return;
         }

         if (response.data) {
            title = response.data.ExceptionMessage;
            let stackTrace = response.data.StackTrace;
            msg = stackTrace.substring(stackTrace.length - 100, 100);
            toastr.error(msg, title);
            return;
         }

         toastr.error(msg, title);
      };

      let config = {
          timeout: 5000
      };
      let fac = {
         get: function(url: string): ng.IPromise<any> {

            return $http.get(url, config).then(function(response: ng.IPromise<any>) {
               if (angular.isUndefined(response)) {
                  showError(response);
               }
               return response;
            }, function(response) { showError(response); });
         },

         post: function(url: string, data: any): ng.IPromise<any> {
            return $http.post(url, data, config).then(function(response: ng.IHttpPromise<any>) {
               return response;
            }, function(response) {
               showError(response);
            });
         },
         jsonp: function(url: string): ng.IPromise<any> {
            return $http.jsonp(url + "?callback=JSON_CALLBACK", config).then(function(response: ng.IHttpPromise<any>) {
               return response;
            }, function(response) {
               showError(response);
            });
         }
      };
      return fac;
   });
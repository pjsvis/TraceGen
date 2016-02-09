/// <reference path="../../typings/tsd.d.ts" />
//class Service {

//} 

//class HttpHandlerService extends Service {
//   httpService: ng.IHttpService;
//   handlerUrl: string;

//   constructor($http: ng.IHttpService) {
//      super();
//      this.httpService = $http;
//   }

//   useGetHandler(params: any): ng.IPromise<any> {
//      var result: ng.IPromise<any> = this.httpService.get(this.handlerUrl, params)
//         .then((response: any): ng.IPromise<any> => this.handlerResponded(response, params));
//      return result;
//   }

//   usePostHandler(params: any): ng.IPromise<any> {
//      var result: ng.IPromise<any> = this.httpService.post(this.handlerUrl, params)
//         .then((response: any): ng.IPromise<any> => this.handlerResponded(response, params));
//      return result;
//   }

//   handlerResponded(response: any, params: any): any {
//      response.data.requestParams = params;
//      return response.data;
//   }

//}



//interface IHttpHelper {
//   get: () => ng.IPromise<ng.IHttpPromiseCallback<any>>;
//   post: () => ng.IPromise<ng.IHttpPromiseCallback<any>>;
//}

angular.module('app')
   .factory('HttpHelper', function($http: ng.IHttpService, $q : ng.IPromise<any>, toastr) {

      var showError = function(response) {
         var title = 'Unexpected Error';
         var msg = 'An unexpected error has occured.';
         if (angular.isUndefined(response)) {
            msg = 'A response received from the web server';
            toastr.error(msg);
            return;
         }

         if (response.status === 404) {
            msg = ['Could not find ', response.config.url].join('');
            toastr.error(msg);
            return;
         }

         if (response.status === 500) {
            msg = [response.data.ExceptionMessage, ' when calling ', response.config.url].join('');
            toastr.error(msg);
            return;
         }

         if (response.data) {
            title = response.data.ExceptionMessage;
            var stackTrace = response.data.StackTrace;
            msg = stackTrace.substring(stackTrace.length - 100, 100);
            toastr.error(msg, title);
            return;
         }

         toastr.error(msg, title);
      };

// TODO: Determine if a timeout would be a good idea!!
      var config = {
         // timeout: 10000
                 
      };
      var fac = {
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
            return $http.jsonp(url + '?callback=JSON_CALLBACK', config).then(function(response: ng.IHttpPromise<any>) {
               return response;
            }, function(response) {
               showError(response);
            });
         }
      };
      return fac;
   });
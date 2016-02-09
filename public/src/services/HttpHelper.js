/// <reference path="../../../typings/tsd.d.ts" />
angular.module('app')
    .factory('HttpHelper', function ($http, $q, toastr) {
    var showError = function (response) {
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
    var config = {};
    var fac = {
        get: function (url) {
            return $http.get(url, config).then(function (response) {
                if (angular.isUndefined(response)) {
                    showError(response);
                }
                return response;
            }, function (response) { showError(response); });
        },
        post: function (url, data) {
            return $http.post(url, data, config).then(function (response) {
                return response;
            }, function (response) {
                showError(response);
            });
        }
    };
    return fac;
});
//# sourceMappingURL=HttpHelper.js.map
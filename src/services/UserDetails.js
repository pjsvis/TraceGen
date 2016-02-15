/// <reference path="../../typings/tsd.d.ts" />
angular.module('app').factory('UserDetails', function ($http) {
    var fac = {
        get: function () {
            return $http({
                method: 'jsonp',
                url: 'api/user/details' + '?callback=JSON_CALLBACK',
                cache: true
            }).then(function (response) { return response.data; });
        }
    };
    return fac;
});
//# sourceMappingURL=UserDetails.js.map
/// <reference path="../../../typings/tsd.d.ts" />
angular.module('app').factory('UserDetails', function ($http) {
    var fac = {
        get: function () {
            return $http({
                method: 'GET',
                url: 'api/user/details',
                cache: true
            }).then(function (response) { return response.data; });
        }
    };
    return fac;
});
//# sourceMappingURL=UserDetails.js.map
/// <reference path="../../../typings/tsd.d.ts" />
angular.module('app').factory('UserDetailsService', function (HttpHelper) {
    var baseHref = 'http://localhost:55693/OTS.UTP/';
    var fac = {
        getUserDetails: function () {
            return HttpHelper.get(baseHref + 'api/User/Details');
        }
    };
    return fac;
});

angular.module('app').controller('WebApiController', function (UserDetailsService) {
    var vm = this;
    //TODO: Add  login and etc
    // UserDetailsService.getUserDetails().then(function (response) {
    //     vm.userDetails = response.data;
    // })

});

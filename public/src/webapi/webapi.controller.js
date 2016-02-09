var _this = this;
/// <reference path="../../../typings/tsd.d.ts" />
angular.module('app').factory('UserDetailsService', function (HttpHelper) {
    var baseHref = 'http://localhost:55693/OTS.UTP/';
    return {
        getUserDetails: function () { return HttpHelper.get(baseHref + 'api/User/Details'); }
    };
});
angular.module('app').controller('WebApiController', function (UserDetailsService) {
    UserDetailsService.getUserDetails().then(function (response) {
        var userDetails = response.data;
        _this.userDetails = userDetails;
    });
});
//# sourceMappingURL=webapi.controller.js.map
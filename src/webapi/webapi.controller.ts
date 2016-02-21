/// <reference path="../../typings/tsd.d.ts" />
interface IUserDetails {
    UserName: string;
    Description: string;
    IsAdmin: boolean;
    IsSupport: boolean;
    IsTester: boolean;
}

interface IUserDetailsService {
    getUserDetails: () => ng.IPromise<IUserDetails>;
};

angular.module("app").factory("UserDetailsService", function($http: ng.IHttpService) {
    let baseHref = "http://localhost:55693/OTS.UTP/";
    return {getUserDetails: () => $http.jsonp(baseHref + "api/User/Details")};
});

angular.module("app").controller("WebApiController", function($window: ng.IWindowService) {
    let vm = this;
    vm.state = {};
    vm.data = {};
    let userDetails: IUserDetails = {
        UserName: "Peter",
        Description: "Good guy",
        IsAdmin: false,
        IsSupport: true,
        IsTester: false
    };
    vm.state.userDetails = userDetails;
});

angular.module("app").controller("WebApiController", function($window: ng.IWindowService, UserDetailsService: IUserDetailsService) {
    let vm = this;
    vm.state = {};
    vm.data = {};
    let userDetails = {
        UserName: "Not yet queried",
    }
    vm.state.userDetails = userDetails;
});
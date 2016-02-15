/// <reference path="../../typings/tsd.d.ts" />
// interface IUserDetails {
//    Id: number;
//    UserName: string;
//    Description: string;
//    Role: string;
//    IsAdmin: boolean;
//    IsSupport: boolean;
//    IsTester: boolean;
// 
// }
// 
// interface IUserDetailsService {
//    getUserDetails: ng.IHttpPromise<IUserDetails>;
// }
// 
angular.module('app').factory('UserDetailsService', function($http, HttpHelper) {
   return {      
      getUserDetails: ()=> HttpHelper.jsonp('api/User/Details')
   };
});

angular.module('app').controller('WebApiController', function($window, UserDetailsService){
    var vm = this;
    vm.state= {};
    vm.data={}
    $window.vm = vm;
    var userDetails = {
        UserName: "Not yet queried",
    }
    vm.state.userDetails = userDetails;
    console.log('Hello UTP');
    vm.data.todo = 'Fix up the jsonp response';
    // UserDetailsService.getUserDetails().then(response => {
    //     console.log('Back from userDetails with...');
    //     console.log(response);
    //   var userDetails = response.data;
    //   this.userDetails = userDetails;
    // });
    
});
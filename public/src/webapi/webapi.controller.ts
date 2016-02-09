/// <reference path="../../../typings/tsd.d.ts" />
interface IUserDetails {
   Id: number;
   UserName: string;
   Description: string;
   Role: string;
   IsAdmin: boolean;
   IsSupport: boolean;
   IsTester: boolean;

}

interface IUserDetailsService {
   getUserDetails: ng.IHttpPromise<IUserDetails>;
}

angular.module('app').factory('UserDetailsService', (HttpHelper): { getUserDetails: () => angular.IHttpPromise<IUserDetails> } => {
   var baseHref = 'http://localhost:55693/OTS.UTP/';
   return {
      getUserDetails: (): ng.IHttpPromise<IUserDetails> => HttpHelper.get(baseHref + 'api/User/Details')
   };

});

angular.module('app').controller('WebApiController', UserDetailsService => {
   UserDetailsService.getUserDetails().then(response => {
      var userDetails: IUserDetails = response.data;
      this.userDetails = userDetails;
   });


});
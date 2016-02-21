angular.module('app').controller('ReportController', function ($browser, $window, UserDetails, ReportService, toastr) {
   var vm = this;
   $window.vm = vm;
   vm.state = {};
   vm.data = {};


   var init = function () {
      UserDetails.get().then(function (data) {
         // Get our user details
         vm.state.userDetails = data; // setup our user details
      }, function () {
         toastr.error('Please make sure that you are logged in to OTS UTP!');
         $window.location.href = $browser.baseHref() + 'account/login';
         return;
      });
   };
   // TODO: Don't do this right now
   //init();

});
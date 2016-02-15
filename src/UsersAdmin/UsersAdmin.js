/// <reference path="../../../../typings/tsd.d.ts" />
//NOTE: The angular app is initialised in ~/scripts/app/app.js
angular.module('app')
   .factory('AdminService', function($http, HttpHelper) {
      var fac = {};
      fac.passwordRules = function() { return HttpHelper.get(['api/UsersAdmin/PasswordRules'].join('')); };
      fac.allUsers = function() { return HttpHelper.get(['api/UsersAdmin/Users'].join('')); };
      fac.saveUser = function(user) { return HttpHelper.post(['api/UsersAdmin/SaveUser'].join(''), user); };
      //TODO: Figure out why the ResetPassword post with data gets 404 with WebApi
      fac.resetPassword = function(userId, password) {
         return HttpHelper.post(['api/UsersAdmin/ResetPassword'].join(''), { UserId: userId, Password: password });
      };
      fac.deleteUser = function(id, isDeleted) { return HttpHelper.post(['api/UsersAdmin/DeleteUser'].join(''), { id: id, isDeleted: isDeleted }) };
      fac.lockoutUser = function(id, isLocked) { return HttpHelper.post(['api/UsersAdmin/LockUser'].join(''), { id: id, isLocked: isLocked }) };
      return fac;
   })
   .controller('AdminController', function($scope, $http, $document, $timeout, $window, $browser, $uibModal, AdminService, UserDetails, toastr) {
         var vm = this;
         vm.state = {};
         vm.debug = false;
         vm.passwordUser = false;
         $window.vm = vm;


         // TODO: Get the ag-grid functionality working for the button clicks
         // Configure ag-grid
         var columnDefs = [
            { headerName: 'Id', field: 'Id', width: 40, hide: false }, // NOTE: We can set this equal to vm.debug
            { headerName: 'Login', field: 'UserName', width: 150 },
            { headerName: 'Description', field: 'Description', width: 90 },
            { headerName: 'Role', field: 'Role', width: 120 },
            { headerName: 'Status', width: 90, cellRenderer: ageCellRendererFunc }
         ];

         function ageClicked(age) {
            window.alert('Age clicked: ' + age);
         }


         function ageCellRendererFunc(params) {
            params.$scope.ageClicked = ageClicked;
            return '<button class="btn btn-xs btn-info" ng-click="vm.assignSim(data)" >Simulators</button>';
         }


         vm.gridOptions = {
            columnDefs: columnDefs,
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            angularCompileRows: true
         };

         var getUsers = function() {
            // Get users
            // Promise to show a spinner if this takes a while
            var promise = $timeout(function () { vm.state.showSpinner = true; }, 50);           
            AdminService.allUsers().then(function(response) {
               // TODO: Use ag-grid to render the users
               //vm.gridOptions.api.setRowData(response.data);
               //vm.gridOptions.api.sizeColumnsToFit();                        
               vm.users = response.data;
               // Cancel promise to show spinner
               $timeout.cancel(promise);
               vm.state.showSpinner = false;
            });
         };

         vm.selectRow = function(user) {
            vm.state.selectedTester = user;
         };

         // Assign Sim modal
         vm.assignSim = function(user) {
            vm.selectedTester = user;
            var modalInstance = $uibModal.open({
               animation: true,
               templateUrl: $browser.baseHref() + 'scripts/app/partials/usersAdmin/assignSim.tpl.html',
               controller: 'AssignSimController',
               size: 'lg',
               resolve: {
                  user: function() {
                     return user;
                  }
               }
            });

            modalInstance.result.then(function() {
               getUsers();
               // TODO: Select selectedTester
               var msg = ['Simulators have been assigned to ', $scope.vm.selectedTester.UserName].join('');
               toastr.info(msg);
            }, function() {
               //toastr.info('Rest password cancelled');
            });
         };

         // Add/Edit User section
         //TODO: Replace $scope with vm
         vm.addUser = function() {
            // Create a default user
            $scope.vm.passwordUser = null;
            $scope.vm.user = { Id: 0, LockoutEnabled: false, IsDeleted: false, PasswordChanged: false, Role: 'Tester' };
         };

         // Edit user
         vm.editUser = function(user) {
            $scope.vm.passwordUser = null;
            $scope.vm.user = user;
         };

         // On button click
         $scope.okUser = function(user) {
            AdminService.saveUser(user).then(function(response) {
               var succeeded = response.data.Succeeded;
               if (succeeded) {
                  $scope.vm.user = null;
                  var action = user.Id === 0 ? ' created' : ' updated';
                  var msg = ['User ', user.UserName, action].join('');
                  toastr.info(msg);
                  getUsers();
               } else {
                  var reason = response.data.Errors[0] || 'An error occurred.';
                  toastr.error(reason, 'User Error');
               }
            });
         };

         $scope.cancelUser = function() {
            $scope.vm.user = null;
         };
         // END Add/Edit User section

         // Reset Password Section
         $scope.resetPassword = function(user) {
            $scope.vm.user = null;
            var passwordUser = { Id: user.Id, UserName: user.UserName, Password: '' };
            $scope.vm.passwordUser = passwordUser;
            $timeout(function() {
               document.getElementById('passwordInput').focus();
            }, 300);
         };

         $scope.okResetPassword = function(user) {
            AdminService.resetPassword(user.Id, user.Password).then(function(response) {
               var succeeded = response.data.Succeeded;
               if (succeeded) {
                  getUsers();
                  $scope.cancelResetPassword();
                  toastr.info(['Password reset for ', user.UserName].join(''), 'Reset Password');
               } else {
                  var reason = response.data.Errors[0] || 'An error occurred.';
                  toastr.error(reason, 'Password Error');
               }
            });
         };
         $scope.cancelResetPassword = function() {
            $scope.vm.passwordUser = null;
         };
         // END Reset Password Section

         var getPasswordRules = function() {
            AdminService.passwordRules().then(function(response) {
               $scope.vm.passwordRules = response.data.PasswordRules;
               $scope.vm.autoLogoutSettings = response.data.AutoLogoutSettings;
               $scope.vm.userLockoutSettings = response.data.UserLockoutSettings;
            });
         };

         UserDetails.get().then(function(data) {
            $scope.vm.userDetails = data;
            if (data.IsAdmin) {
               $window.document.title = 'Manage Users';
            }
            if (data.IsSupport) {
               $window.document.title = 'Manage Testers';
            }


         });
         // Initialise
         getUsers();
         getPasswordRules();
      }
   );
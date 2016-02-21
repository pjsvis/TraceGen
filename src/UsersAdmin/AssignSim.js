/// <reference path="../../../../typings/tsd.d.ts" />
angular.module('app').factory('AssignSimService', function (HttpHelper) {
      var fac = {};
      fac.simUserModel = function (userId) { return HttpHelper.get('api/UtpProvisionSim/SimUserModel?UserId=' + userId) };
      fac.updateSimUser = function (data) {
            return HttpHelper.post('api/UtpProvisionSim/UpdateSimUser', data);
      };
      return fac;
});


angular.module('app').controller('AssignSimController',
      function ($scope, $uibModalInstance, AssignSimService, user, toastr) {

            $scope.vm = {
                  user: user,
                  state: {
                        showEdit: false,
                        selectedSim: null
                  },
                  data: {}
            };

            $scope.vm.selectSim = function (sim) {
                  $scope.vm.state.selectedSim = sim;
            };

            $scope.vm.add = function (sim) {
                  // NOTE: We can only have one template sim per user
                  if (sim.SimTypeName === 'Template') {
                        var existingTemplateSim = _.findWhere($scope.vm.data.ActiveSims, { 'SimTypeName': 'Template' });
                        if (existingTemplateSim) {
                              toastr.warning('You can only assign one template sim per user. Please remove ' + existingTemplateSim.SimulatorName + ' first');
                              return;
                        }
                  }
                  $scope.vm.data.ActiveSims.push(sim);
                  $scope.vm.data.ExcludedSims.splice($scope.vm.data.ExcludedSims.indexOf(sim), 1);
            };

            $scope.vm.remove = function (sim) {
                  $scope.vm.data.ExcludedSims.push(sim);
                  $scope.vm.data.ActiveSims.splice($scope.vm.data.ActiveSims.indexOf(sim), 1);
            };
            $scope.vm.ok = function () {
                  var data = { UserId: $scope.vm.user.Id, ActiveSims: $scope.vm.data.ActiveSims };
                  AssignSimService.updateSimUser(data).then(function () {
                        //toastr.info('Applying updates');
                        $uibModalInstance.close();
                  });
            };

            var populateData = function (data) {
                  $scope.vm.data = data;
                  console.log($scope.vm.data);
                  var isSims = $scope.vm.data.ActiveSims.length > 0;
                  if (isSims) {
                        $scope.vm.state.selectedSim = $scope.vm.data.ActiveSims[0];
                  }
            };
            $scope.vm.apply = function () {
                  // TODO: Loop through the active sims and update the simUsers table
                  var data = { UserId: $scope.vm.user.Id, ActiveSims: $scope.vm.data.ActiveSims };
                  AssignSimService.updateSimUser(data).then(function (response) {
                        populateData(response.data);
                     $scope.vm.selectSim($scope.vm.state.selectedSim);
                        toastr.info('Updates applied');
                  });
            };

            $scope.vm.cancel = function () {
                  $uibModalInstance.dismiss('cancel');
            };


            AssignSimService.simUserModel(user.Id).then(function (response) {
                  //alert("simusermodel " + user.UserId.toString());
                  populateData(response.data);
            });
      });
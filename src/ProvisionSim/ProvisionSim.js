// NOTE: This code is currently not in use. Instead we go straight to ProvisionSim/#/SimTestSuites 
angular.module('app').factory('ProvisionSimService', function (HttpHelper) {
    var fac = {};

    var apiUrl = 'api/UtpProvisionSim/';

    fac.provisionSimDto = function() {
        var url = apiUrl + 'ProvisionSimDto';
        return HttpHelper.get(url);
    };
    fac.sims = function() {
        var url = apiUrl + 'Simulators';
        return HttpHelper.get(url);
    };
    fac.simsWithoutTestSuites = function() {
        var url = apiUrl + 'SimulatorsWithoutTestSuites';
        return HttpHelper.get(url);
    };
    fac.simsWithoutUsers = function() {
        var url = apiUrl + 'SimulatorsWithoutTesters';
        return HttpHelper.get(url);
    };
    fac.testSuitesWithoutTestCases = function() {
        var url = apiUrl + 'TestSuitesWithoutTestCases';
        return HttpHelper.get(url);
    };
    return fac;
});

angular.module('app').controller('ProvisionSimController', function(ProvisionSimService, toastr, UserDetails) {
    var vm = this;
    vm.data = {};
    vm.state = { debug: false };
    var init = function() {
        UserDetails.get().then(function(data) {

            ProvisionSimService.provisionSimDto().then(function(response) {
                vm.data = response.data;
                console.log(vm.data);
            });
        });
    };
    init();
});
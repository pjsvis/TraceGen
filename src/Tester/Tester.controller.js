angular.module('app').factory('TesterModelService', function (HttpHelper, $browser) {
    var fac = {};
    var baseHref = $browser.baseHref();

    fac.getUserModel = function (userId, simId, suiteId) {
        var data = { UserId: userId, SimId: simId, SuiteId: suiteId, WithResults: true };
        var url = baseHref + 'api/UtpUserTestSuites/GetUserModel';
        return HttpHelper.post(url, data);
    }

    fac.apiSelectSuite = function (data) {
        var url = baseHref + 'api/UtpTestRunner/SelectSuite';
        return HttpHelper.post(url, data);
    }

    fac.runTest = function (data) {
        var url = baseHref + 'api/UtpTestRunner/RunTest';
        return HttpHelper.post(url, data);
    }

    fac.getTester = function (id) {
        var url = baseHref + 'api/UtpUserTestSuites/GetTester?Id=' + id;
        return HttpHelper.get(url);
    }
    return fac;
});

angular.module('app').controller('TesterController', function (
    $scope, $route, $routeParams, $location,
    $browser, $window,
    UserDetails, TesterModelService, $localStorage,
    $timeout, toastr, $uibModal
    ) {
    var vm = this;
    $window.$scope = $scope;
    vm.state = {
        debug: false, // Use this to inspect the state
        selectedTester: null,
        selectedSim: null,
        selectedSuite: null,
        selectedTest: null
    };

    vm.data = {};
    $window.vm = vm;

    vm.back = function () {
        $window.history.back();
    }

    var getItemById = function (id, collection) {
        return _.find(collection, function (item) {
            return item.Id === id;
        });
    }

    var getUserModel = function (userId, simId, suiteId, showMessage) {
        TesterModelService.getUserModel(userId, simId, suiteId).then(function (response) {

            // TODO: Refactor and put the whole named object on vm.data so that we can extend later
            vm.data.UserModelRequest = response.data.UserModelRequest;
            vm.data.Sims = response.data.Sims == null ? vm.data.Sims : response.data.Sims;
            vm.data.TestSuites = response.data.TestSuites == null ? vm.data.TestSuites : response.data.TestSuites;
            vm.data.ActiveTestCases = response.data.ActiveTestCases;

            vm.data.TestCaseResults = response.data.TestSuiteResults.TestCaseResults;

            vm.state.selectedSim = simId == null
                ? response.data.Sims.length === 0 ? null : response.data.Sims[0]
                : getItemById(vm.state.selectedSim.Id, vm.data.Sims);

            vm.state.selectedSuite = suiteId == null
                ? response.data.TestSuites.length === 0 ? null : response.data.TestSuites[0]
                : getItemById(vm.state.selectedSuite.Id, vm.data.TestSuites);

            // TODO: Make sure we have a test suite
            var selectedSim = vm.state.selectedSim;
            var selectedSuite = vm.state.selectedSuite;

            if (vm.state.selectedSuite == null) {
                return;
            }

            // NOTE: If we are a tester then we instruct the UtpTestRunner api to spin up the selected sim
            var data = { SimId: selectedSim.Id, SuiteId: selectedSuite.Id, UserId: userId };
            if (vm.state.userDetails.IsTester) {
                TesterModelService.apiSelectSuite(data).then(function (response) {
                    // NOTE: We need to be properly configured on the server side or we get an error
                    if (angular.isUndefined(response)) {
                        var msg = 'api/UtpTestRunner/SelectSuite' + ' is not properly configured';
                        toastr.warning(msg);
                    }
                });
            }
            if (showMessage) {
                toastr.info('Test results updated');
            }
            console.log(vm);
        });
    }


    var saveState = function (test) {
        //NOTE: save out test details and view the test
        vm.state.selectedTest = { Id: test.TestCaseId, Name: test.TestCaseName };
        $localStorage.UtpAppState = vm.state;
    }

    vm.selectSim = function (sim) {
        if (vm.state.selectedSim.Id === sim.Id) {
            return;
        }
        vm.state.selectedSim = sim;
        var userId = vm.state.selectedTester.Id;
        var simId = sim.Id;
        getUserModel(userId, simId, null);
    }

    vm.selectSuite = function (suite, showMessage) {
        //if(vm.state.selectedSuite.Id == suite.Id){return;}
        vm.state.selectedSuite = suite;
        var userId = vm.state.selectedTester.Id;
        var simId = vm.state.selectedSim.Id;
        var suiteId = suite.Id;
        getUserModel(userId, simId, suiteId, showMessage);
    }

    vm.updateTestResults = function () {
        vm.selectSuite(vm.state.selectedSuite, true);
    }

    vm.gotoTraceSummary = function () {

        delete $localStorage.UtpAppState;

        $timeout(function () {
            var userId;
            if (vm.state.userDetails.IsSupport) {
                userId = vm.state.selectedTester.Id;
            } else {
                userId = vm.state.userDetails.Id;
            }
            var url = [$browser.baseHref(), 'UtpTraceSummary#/tester/', userId].join('');
            $window.location.href = url;
        });
    }

    vm.runTest = function (test) {
        var data = { UserId: vm.state.userDetails.Id, SimId: vm.state.selectedSim.Id, SuiteId: vm.state.selectedSuite.Id, TestId: test.Id };
        // TODO: Determine if we need to save state here
        //NOTE: We save state here in case the runTest method fails
        saveState(test);
        TesterModelService.runTest(data).then(function (response) {
            // The api just returns true
            if (response.data) {
                // TODO: Deprecate this and use vm.openTest method below
                vm.openDetails(test);
            }
        });
    }

    // Initialise
    var init = function () {
        UserDetails.get().then(function (data) {

            // TODO: Pick one or the other as a default IE in vm or in vm.state
            vm.userDetails = data;
            // Get our user details
            vm.state.userDetails = data; // setup our user details

            if ($routeParams.testerId) {
                console.log('We are here as Support for tester: ' + $routeParams.testerId);
                document.getElementById("divUsrPwd").style.display = 'none';
                TesterModelService.getTester($routeParams.testerId).then(function (response) {
                    vm.state.selectedTester = response.data;
                })

                vm.state.selectedTester = { Id: $routeParams.testerId };
                // TODO: Get selectedTester vm.state.selectedTester Name
                
            } else {
                console.log('We are here as tester: ' + vm.state.userDetails.UserName);
                vm.state.selectedTester = { Id: vm.state.userDetails.Id, Name: vm.state.userDetails.UserName };
                // Show the change password div tag
                document.getElementById("divUsrPwd").style.visibility = 'visible';
            }

            getUserModel(vm.state.selectedTester.Id, null, null);

        }, function () {
            toastr.error('Please make sure that you are logged in to OTS UTP!');
            $window.location.href = $browser.baseHref() + 'account/login';
            return;
        });
    };
    init();

    /////////////////////VIEW DETAILS MODAL/////////////////////////                 
    vm.openDetails = function (test) {
        var modalInstance = $uibModal.open({
            animation: true,
            backdrop: 'static',
            keyboard: false,
            templateUrl: $browser.baseHref() + 'scripts/app/partials/TraceDetails/TraceDetails.tpl.html',
            controller: 'TraceDetailsController',
            controllerAs: 'vm',
            size: 'lg',
            resolve: {
                user: function () {
                    // If we are support then we want the selected tester otherwise we want the userDetails
                    return vm.userDetails;
                },
                selectedItems: function () {
                    return {
                        selectedTester: vm.state.selectedTester,
                        selectedSim: vm.state.selectedSim,
                        selectedSuite: vm.state.selectedSuite,
                        selectedTest: { Id: test.Id, Name: test.Name },
                        unknownUser: { Id: 0, Name: "Unknown" }
                        // TODO: Account for unknownUser                            
                    }
                }
            }
        });

        modalInstance.result.then(function () {
            return;
        });
    };
    /////////////////////END VIEW DETAILS MODAL/////////////////////////

}); ///////// END OF CONTROLLER BLOCK

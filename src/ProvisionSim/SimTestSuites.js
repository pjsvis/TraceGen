/// <reference path="../../../../typings/tsd.d.ts" />

angular.module('app')
    .factory('SimTestSuiteService', function ($http, $browser) {
    var fac = {};
    var simApi = $browser.baseHref() + 'api/UtpSimTestSuites/';
    fac.addSimTestSuite = function (simId, testSuiteId) {
        return $http.post(simApi + 'AddTestSuite', { SimId: simId, TestSuiteId: testSuiteId });
    };
    fac.removeSimTestSuite = function (simId, testSuiteId) {
        return $http.post(simApi + 'RemoveTestSuite', { SimId: simId, TestSuiteId: testSuiteId });
    };
    fac.addSimTestCase = function (simId, testSuiteId, testCaseId) {
        return $http.post(simApi + 'AddTestCase', { SimId: simId, testSuiteId: testSuiteId, TestCaseId: testCaseId });
    };
    fac.removeSimTestCase = function (simId, testSuiteId, testCaseId) {
        return $http.post(simApi + 'RemoveTestCase', { SimId: simId, testSuiteId: testSuiteId, TestCaseId: testCaseId });
    };
    return fac;
});

angular.module('app')
    .factory('UserTestSuiteService', function ($http, $browser) {
    var fac = {};
    var userApi = $browser.baseHref() + 'api/UtpUserTestSuites/';
    fac.addUserTestSuite = function (userId, simId, testSuiteId) {
        return $http.post(userApi + 'AddTestSuite', { UserId: userId, SimId: simId, TestSuiteId: testSuiteId });
    };
    fac.removeUserTestSuite = function (userId, simId, testSuiteId) {
        return $http.post(userApi + 'RemoveTestSuite', { UserId: userId, SimId: simId, TestSuiteId: testSuiteId });
    };
    fac.addUserTestCase = function (userId, simId, testSuiteId, testCaseId) {
        return $http.post(userApi + 'AddTestCase', { UserId: userId, SimId: simId, testSuiteId: testSuiteId, TestCaseId: testCaseId });
    };
    fac.removeUserTestCase = function (userId, simId, testSuiteId, testCaseId) {
        return $http.post(userApi + 'RemoveTestCase', { UserId: userId, SimId: simId, testSuiteId: testSuiteId, TestCaseId: testCaseId });
    };
    return fac;
});

angular.module('app').factory('ModelService', function (HttpHelper, $browser) {
    var fac = {};
    var userApi = $browser.baseHref() + 'api/UtpUserTestSuites/';
    var simApi = $browser.baseHref() + 'api/UtpSimTestSuites/';
    fac.getUserModel = function (userId, simId, suiteId) {
        var data = { UserId: userId, SimId: simId, SuiteId: suiteId };
        var url = userApi + 'GetUserModel';
        return HttpHelper.post(url, data);
    };
    fac.getSimModel = function (simId, suiteId) {
        var data = { SimId: simId, SuiteId: suiteId };
        var url = simApi + 'GetSimModel';
        return HttpHelper.post(url, data);
    };
    return fac;
});

// TODO: Remove $scope from controller
angular.module('app')
    .controller('SimTestSuiteController', function ($scope, $window, $localStorage, $timeout, $browser, ModelService, SimTestSuiteService, UserTestSuiteService, toastr, UserDetails) {
    var vm = this;
    // Expose the controller scope to the window for easy debugging
    $window.vm = vm;

    vm.state = {
        debug: false,
        selectedTester: null,
        selectedSim: null,
        selectedSuite: null,
        editSuite: false,
        editTest: false,
        // Note: vm.toggleTesters(true/false) is used to change this and get the data
        showTesters: true
    };

    vm.data = {
        testers: null,
        testersWithoutSims: null,
        activeSims: null,
        availableSims: null,
        activeTestSuites: null,
        availableTestSuites: null,
        activeTestCases: null,
        excludedTestCases: null
    };
    var addSimTestSuite = function (sim, testSuite) {
        SimTestSuiteService.addSimTestSuite(sim.Id, testSuite.Id).then(function (response) {
            // Refresh the sim test suites lists
            vm.data.TestSuites = response.data.TestSuites;
            vm.data.AvailableTestSuites = response.data.AvailableTestSuites;
            var suite = _.findWhere(vm.data.TestSuites, { Id: testSuite.Id });
            vm.selectSuite(suite);
        });
    };
    var addUserTestSuite = function (user, sim, testSuite) {
        UserTestSuiteService.addUserTestSuite(user.Id, sim.Id, testSuite.Id).then(function (response) {
            // Refresh the user test suites lists
            vm.data.TestSuites = response.data.TestSuites;
            vm.data.AvailableTestSuites = response.data.AvailableTestSuites;
            var suite = _.findWhere(vm.data.TestSuites, { Id: testSuite.Id });
            vm.selectSuite(suite);
        });
    };
    // Add Sim Test Suite
    vm.addTestSuite = function (sim, testSuite) {
        if (vm.state.showTesters) {
            addUserTestSuite(vm.state.selectedTester, sim, testSuite);
        }
        else {
            addSimTestSuite(sim, testSuite);
        }
    };
    var removeSimTestSuite = function (sim, testSuite) {
        SimTestSuiteService.removeSimTestSuite(sim.Id, testSuite.Id).then(function (response) {
            // Refresh the test suites list
            vm.data.TestSuites = response.data.TestSuites;
            vm.data.AvailableTestSuites = response.data.AvailableTestSuites;
            // Select the first in the list
            if (vm.data.TestSuites.length > 0) {
                vm.selectSuite(vm.data.TestSuites[0]);
            }
            else {
                vm.data.ActiveTestCases = [];
            }
        });
    };
    var removeUserTestSuite = function (user, sim, testSuite) {
        UserTestSuiteService.removeUserTestSuite(user.Id, sim.Id, testSuite.Id).then(function (response) {
            // Refresh the test suites list
            vm.data.TestSuites = response.data.TestSuites;
            vm.data.AvailableTestSuites = response.data.AvailableTestSuites;
            // Select the first in the list
            if (vm.data.TestSuites.length > 0) {
                vm.selectSuite(vm.data.TestSuites[0]);
            }
            else {
                vm.data.ActiveTestCases = [];
            }
        });
    };
    // NOTE: We call 
    vm.removeTestSuite = function (sim, testSuite) {
        if (vm.state.showTesters) {
            removeUserTestSuite(vm.state.selectedTester, sim, testSuite);
        }
        else {
            removeSimTestSuite(sim, testSuite);
        }
    };
    vm.addTestCase = function (testCase) {
        var sim = vm.state.selectedSim;
        var testSuite = vm.state.selectedSuite;
        if (vm.state.showTesters) {
            UserTestSuiteService.addUserTestCase(vm.state.selectedTester.Id, sim.Id, testSuite.Id, testCase.Id).then(function (response) {
                vm.data.ActiveTestCases = response.data.ActiveTestCases;
                vm.data.ExcludedTestCases = response.data.ExcludedTestCases;
            });
        }
        else {
            SimTestSuiteService.addSimTestCase(sim.Id, testSuite.Id, testCase.Id).then(function (response) {
                vm.data.ActiveTestCases = response.data.ActiveTestCases;
                vm.data.ExcludedTestCases = response.data.ExcludedTestCases;
            });
        }
    };
    vm.removeTestCase = function (testCase) {
        var sim = vm.state.selectedSim;
        var testSuite = vm.state.selectedSuite;
        if (vm.state.showTesters) {
            UserTestSuiteService.removeUserTestCase(vm.state.selectedTester.Id, sim.Id, testSuite.Id, testCase.Id).then(function (response) {
                vm.data.ActiveTestCases = response.data.ActiveTestCases;
                vm.data.ExcludedTestCases = response.data.ExcludedTestCases;
            });
        }
        else {
            SimTestSuiteService.removeSimTestCase(sim.Id, testSuite.Id, testCase.Id).then(function (response) {
                vm.data.ActiveTestCases = response.data.ActiveTestCases;
                vm.data.ExcludedTestCases = response.data.ExcludedTestCases;
            });
        }
    };
    // Toggle between tester and sim views
    vm.toggleTesters = function (isShowTesters) {
        // Reset the state
        vm.state.showTesters = isShowTesters;
        vm.editSuite = false;
        vm.editTest = false;
        if (isShowTesters) {
            // Initialise the view model for the testers
            ModelService.getUserModel(null, null, null).then(function (response) {
                vm.data = response.data;
                console.log('vm', vm);
                // TODO: Do we need to handle cases where there are no items
                vm.state.selectedTester = vm.data.Testers[0];
                vm.state.selectedSim = vm.data.Sims[0];
                vm.state.selectedSuite = vm.data.TestSuites[0];
            });
        }
        else {
            // Initialise the view model for the sims
            ModelService.getSimModel(null, null).then(function (response) {
                vm.data = response.data;
                console.log('vm', vm);
                vm.state.selectedTester = null;
                // TODO: Do we need to handle cases where there are no items
                vm.state.selectedSim = vm.data.Sims[0];
                vm.state.selectedSuite = vm.data.TestSuites[0];
            });
        }
    };
    vm.supportSelectedTester = function () {
        // Make sure we have a valid tester
        if (vm.state.selectedTester == null || vm.state.selectedTester.Id === 0) {
            var msg = "Invalid Tester: " + vm.state.selectedTester;
            toastr.warning(msg);
            return;
        }
        // Save state           
        $localStorage.UtpAppState = vm.state;
        // NOTE: Wrap redirect in timeout to allow state time to be saved
        $timeout(function () {
            // Navigate to tester landing page
            var baseHref = $browser.baseHref();
            console.log(baseHref);
            $window.location.href = $browser.baseHref() + 'Tester#/Home/' + vm.state.selectedTester.Id;
        });
    };
    // Populate view model with new data
    var populateModel = function (tester, sim, suite, newData) {
        // Populate the model in order of Tests, Suites, then Sims
        // If we select a suite then just populate the tests
        if (suite != null) {
            // Test Cases                
            vm.data.ActiveTestCases = newData.ActiveTestCases;
            vm.data.ExcludedTestCases = newData.ExcludedTestCases;
            /// State
            vm.state.selectedSuite = suite;
            return;
        }
        // If we select a sim then populate the suites and tests
        if (sim != null) {
            // Test Suites                
            vm.data.TestSuites = newData.TestSuites;
            vm.data.AvailableTestSuites = newData.AvailableTestSuites;
            // Test Cases
            vm.data.ActiveTestCases = newData.ActiveTestCases;
            vm.data.ExcludedTestCases = newData.ExcludedTestCases;
            // State
            vm.state.selectedSim = sim;
            // TODO: Check that we have at least one test suite
            if (newData.TestSuites.length > 0) {
                vm.state.selectedSuite = newData.TestSuites[0];
            }
            else {
                vm.data.ActiveTestCases = null;
            }
            return;
        }
        // If we select a tester then populate the sims, suites, and tests
        if (tester != null) {
            // Sims
            vm.data.Sims = newData.Sims;
            // Test Suites
            vm.data.TestSuites = newData.TestSuites;
            vm.data.AvailableTestSuites = newData.AvailableTestSuites;
            // Test Cases
            vm.data.ActiveTestCases = newData.ActiveTestCases;
            vm.data.ExcludedTestCases = newData.ExcludedTestCases;
            // State
            vm.state.selectedTester = tester;
            if (newData.Sims.length > 0) {
                vm.state.selectedSim = newData.Sims[0];
            }
            if (newData.TestSuites.length > 0) {
                vm.state.selectedSuite = newData.TestSuites[0];
            }
            return;
        }
    };
    // Select Tester/Sim/Suite
    vm.selectTester = function (tester) {
        ModelService.getUserModel(tester.Id, null, null).then(function (response) {
            populateModel(tester, null, null, response.data);
        });
    };
    vm.selectSim = function (sim) {
        vm.state.selectedSim = sim;
        if (vm.state.showTesters) {
            var tester = vm.state.selectedTester;
            ModelService.getUserModel(tester.Id, sim.Id, null).then(function (response) {
                populateModel(tester, sim, null, response.data);
            });
        }
        else {
            ModelService.getSimModel(sim.Id, null).then(function (response) {
                populateModel(null, sim, null, response.data);
            });
        }
    };
    vm.selectSuite = function (suite) {
        var tester = vm.state.selectedTester;
        var sim = vm.state.selectedSim;
        if (vm.state.showTesters) {
            ModelService.getUserModel(tester.Id, sim.Id, suite.Id).then(function (response) {
                populateModel(tester, sim, suite, response.data);
            });
        }
        else {
            ModelService.getSimModel(sim.Id, suite.Id).then(function (response) {
                populateModel(null, sim, suite, response.data);
            });
        }
    };
    // Initialise
    var init = function () {
       UserDetails.get().then(function (data) {
          vm.userDetails = data; // setup our user details 
          if (vm.userDetails.IsAdmin)
          {
             vm.toggleTesters(false);
             return;
          }
          if (vm.userDetails.IsSupport)
          {
             vm.toggleTesters(true);
             return;
          }
        }, function () {
            toastr.error('Please make sure that you are logged in to OTS UTP!');
            $window.location.href = $browser.baseHref() + 'account/login';
            return;
        });
    };
    init();
}); //////////////END OF CONTROLLER SCOPE////////////////////////////////////   

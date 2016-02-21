/// <reference path="../../../../typings/tsd.d.ts" />
angular.module('app').factory('UtpSummarySearchService', function (HttpHelper, $browser) {
    var fac = {};
    var baseUrl = $browser.baseHref();
    // TODO: Make the logic for Tester/Support more better
    fac.getSearchModel = function (userId) {
        if (userId > 0) {
            return HttpHelper.post(baseUrl + 'api/UtpSummarySearch/GetSearchModelById?userId=' + userId.toString(), {});
        } else {
            return HttpHelper.post(baseUrl + 'api/UtpSummarySearch/GetSearchModel', {});
        }
    };
    fac.getSearchModelTester = function (userId) {
        return HttpHelper.post(baseUrl + 'api/UtpSummarySearch/GetSearchModelById?userId=' + userId.toString(), {});
    };


    fac.totalRecsForRequest = function (traceSummaryRequest) { return HttpHelper.post(baseUrl + 'api/UtpSummarySearch/TotalRecsForRequest', traceSummaryRequest) };
    return fac;
});

angular.module('app').controller('UtpTraceSummarySearchController', function (
    $uibModalInstance, UserDetails, UtpSummarySearchService, toastr, user, traceSummaryRequest, isTesterView) {
    var vm = this;
    vm.data = {};
    vm.state = {
        selectedTester: null,
        selectedSim: null,
        selectedSuite: null,
        unknownUser: false
    };

    var getSearchModel = function () {
        if (isTesterView || user.IsTester) {
            UtpSummarySearchService.getSearchModelTester(traceSummaryRequest.UserId).then(function (response) {
                vm.data = response.data;
                if (isTesterView || user.IsTester) {
                    vm.state.selectedTester = vm.data.Testers[0];
                }
            });
        } else {
            UtpSummarySearchService.getSearchModel(0).then(function (response) {
                vm.data = response.data;
            });
        }
    };
    // NOTE: We calc the num recs for searches using the following
    // NOTE: When we return we set the searchDto accordingly
    var resetSearch = function () {
        if (isTesterView || user.IsTester) {
            //
        } else {
            vm.state.selectedTester = { Id: -1, Name: "All testers" };
        }

        vm.state.selectedSim = { Id: -1, Name: "All simulators" };
        vm.state.selectedSuite = { Id: -1, Name: "All test suites" };
        // TODO: Determine if we need the Unknown User parameter
        vm.state.unknownUser = false;
        vm.data.totalItems = -1;
    };

    var getSearchText = function () {
        var txt = 'Trace Summary ';
        txt += vm.state.selectedTester.Id == -1 ? ' for all testers' : ' for tester: ' + vm.state.selectedTester.Name;
        txt += vm.state.selectedSim.Id == -1 ? ', all simulators' : ', simulator: ' + vm.state.selectedSim.Name;
        txt += vm.state.selectedSuite.Id == -1 ? ', all test suites' : ', test suite: ' + vm.state.selectedSuite.Name;
        return txt;
    }

    vm.getUnknownUserTraces = function () {
        resetSearch();
        vm.traceSummaryRequest.UnknownUser = true;
        var searchDto = {
            traceSummaryRequest: vm.traceSummaryRequest,
            searchText: "Trace Summary for user with Id = 0"
        }
        $uibModalInstance.close(searchDto);
    };

    vm.okSearch = function () {
      
        // If we just want the count then do it and return
        if (vm.state.showTraceCountOnly) {
            vm.state.showSpinner = true;
            vm.data.totalItems = -1;
            var req = {
                UserId: vm.state.selectedTester.Id,
                SimId: vm.state.selectedSim.Id,
                TestSuiteId: vm.state.selectedSuite.Id
            }
            UtpSummarySearchService.totalRecsForRequest(req).then(function (response) {
                vm.data.totalItems = response.data;
                vm.state.showSpinner = false;
            });
            return;
        }

        // TODO: Change this to use the selected tester
        // If we want the traceSummaryRequest then return it and close the modal
        traceSummaryRequest.UserId = vm.state.selectedTester.Id;
        traceSummaryRequest.SimId = vm.state.selectedSim.Id;
        traceSummaryRequest.TestSuiteId = vm.state.selectedSuite.Id;

        var searchDto = {
            traceSummaryRequest: traceSummaryRequest,
            searchText: getSearchText()
        }
        $uibModalInstance.close(searchDto);
    };

    vm.clearSearch = function () {
        resetSearch();
    };

    vm.cancel = function () {
        toastr.info('Search cancelled');
        $uibModalInstance.dismiss('cancel');
    };

    // Init
    vm.data.totalItems = -1;
    vm.state.traceSummaryRequest = traceSummaryRequest;
    resetSearch();
    getSearchModel();
});
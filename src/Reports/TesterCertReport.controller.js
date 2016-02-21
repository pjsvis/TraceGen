angular.module('app').controller('TesterCertReportController', function (
    $browser, $window, UserDetails, toastr, ReportService) {
    $window.document.title = 'Tester Cert Report';
    var vm = this;
    vm.state = {
        userDetails: null,
        showToolPanel: false,
        narrower: true,
        reportRequest: {
            UserId: 0,
            SimId: 0,
            TestSuiteId: 0
        }
    };
    vm.data = {};
    $window.vm = vm;

    vm.getTesterCertReport = function (tester) {               
        var req = {
            UserId: tester.Id,
            SimId: 0,
            TestSuiteId: 0
        }
        vm.state.reportRequest = req;
        ReportService.getTesterCertReport(req).then(function (response) {
            vm.data = response.data;
            vm.gridOptions.api.setRowData(vm.data.TestResults);
        });
    };

    vm.toggleToolPanel = function () {
        var isShowing = vm.gridOptions.api.isToolPanelShowing();
        vm.gridOptions.api.showToolPanel(!isShowing);
    }

    vm.toggleWidth = function () {
        vm.state.narrower = !vm.state.narrower;
    }

    vm.exportCsv = function () {
        var params = {
            fileName: "ManagementReport.csv",
            customHeader: "Management Report generated on 31 Jan 2016\n"
        };
        vm.gridOptions.api.exportDataAsCsv(params);
    }

    var colWidth = 120;
    var columnDefs = [
        { headerName: "SimName", field: "SimName", width: 120 },
        { headerName: "TestSuiteName", field: "TestSuiteName", width: 120 },
        { headerName: "TestCaseName", field: "TestCaseName", width: 120 },
        { headerName: "Passed", field: "Pass", width: colWidth },
        { headerName: "Failed", field: "Fail", width: colWidth },
        { headerName: "Message", field: "Message", width: colWidth },
        { headerName: "Timestamp", field: "Timestamp", width: colWidth },
        { headerName: "AuditNum", field: "AuditNum", width: colWidth },
        { headerName: "Fail Reasons", field: "Reasons", width: 440 }
    ];

    vm.gridOptions = {
        showToolPanel: false,
        columnDefs: columnDefs,
        rowData: {},
        enableColResize: true,
        enableSorting: true,
        groupSuppressAutoColumn: false,
        groupColumnDef: null,
        onModelUpdated: onModelUpdated,
        suppressRowClickSelection: true,
        // Filtering
        enableFilter: true,
        onBeforeFilterChanged: function () { console.log('onBeforeFilterChanged'); },
        onAfterFilterChanged: function () { console.log('onAfterFilterChanged'); },
        onFilterModified: function () { console.log('onFilterModified'); }

    };

    function onModelUpdated() {
        var model = vm.gridOptions.api.getModel();
        var totalRows = vm.gridOptions.rowData.length;
        var processedRows = model.getVirtualRowCount();
        vm.rowCount = processedRows.toLocaleString() + ' / ' + totalRows;
    }

    var init = function () {
        UserDetails.get().then(function (data) {
            // Get our user details
            vm.state.userDetails = data; // setup our user details
            
            ReportService.getActiveTesters().then(function (response) {
                vm.state.activeTesters = response.data;
            });
            // For now lets load up a user
            vm.getTesterCertReport({Id:1013, Name: 'Tester2'});
        }, function () {
            toastr.error('Please make sure that you are logged in to OTS UTP!');
            $window.location.href = $browser.baseHref() + 'account/login';
            return;
        });
    };
    //init();

});
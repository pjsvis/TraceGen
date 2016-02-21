/// <reference path="../../../../typings/tsd.d.ts" />
angular.module('app').controller('ManagementReportController', function (
    $browser, $window, $timeout, UserDetails, toastr, ReportService) {

    $window.document.title = 'Management Report';
    var vm = this;
    vm.state = {
        userDetails: null,
        showToolPanel: false,
        narrower: false,
        reportRequest: {
            UserId: 0,
            SimId: 0,
            TestSuiteId: 0
        }
    };
    vm.data = {};
    vm.gridOptions = {};
    $window.vm = vm;

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
    
    // TODO: Add a filter
    // vm.filter = function(){
        
    // } 

    //TODO: OnClick row show flot Pie chart
    // TODO: Host flot chart in draggable panel like http://codepen.io/m-e-conroy/pen/HjpCF

    var colWidth = 70;
    var columnDefs = [
        { headerName: "UserName", field: "UserName", width: 150 },
        { headerName: "SimName", field: "SimName", width: 280 },
        { headerName: "TestSuiteName", field: "TestSuiteName", width: 460 },
        { headerName: "Tests", field: "NumTests", width: colWidth },
        { headerName: "Pass", field: "Pass", width: colWidth },
        { headerName: "Fail", field: "Fail", width: colWidth },
        { headerName: "Untested", field: "Untested", width: colWidth },
        { headerName: "Pass%", field: "PassPercent", width: colWidth },
        { headerName: "Fail%", field: "FailPercent", width: colWidth },
        { headerName: "Untested%", field: "UntestedPercent", width: colWidth + 30 }
        //   { headerName: "UserId", field: "UserId", width: colWidth },
        //   { headerName: "SimId", field: "SimId", width: colWidth },
        //   { headerName: "TestSuiteId", field: "TestSuiteId", width: colWidth }
    ];

    function onModelUpdated() {
        var model = vm.gridOptions.api.getModel();
        var totalRows = vm.gridOptions.rowData.length;
        var processedRows = model.getVirtualRowCount();
        vm.rowCount = processedRows.toLocaleString() + ' / ' + totalRows;
    }

    function onFilterChanged(value) {
        vm.gridOptions.api.setQuickFilter(value);
    }

    vm.gridOptions = {
        showToolPanel: false,
        columnDefs: columnDefs,
        rowData: [],
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

    vm.getManagementReport = function () {
        ReportService.getManagementReport().then(function (response) {
            vm.data = response.data;
            vm.gridOptions.api.setRowData(vm.data);
        });
    };

    var init = function () {
        UserDetails.get().then(function (data) {
            // Get our user details
            vm.state.userDetails = data; // setup our user detail
            // TODO: Figure out why we get a TypeError: Cannot read property 'setRowData' of undefined
            // When we run getManagementReport() here           
            vm.getManagementReport();
        }, function () {
            toastr.error('Please make sure that you are logged in to OTS UTP!');
            $window.location.href = $browser.baseHref() + 'account/login';
            return;
        });
    };
    //init();

});
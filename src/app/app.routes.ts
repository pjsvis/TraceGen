///<reference path="../../typings/tsd.d.ts"/>
angular.module('app').config(function($routeProvider: ng.route.IRouteProvider) {

    // TODO: add a base href tag to the index.html or _shared.cshtml
    //var baseHref = $('#baseHref').attr('href');
    var rootUrl = '';
    //NOTE: All templates are packaged into the app-templates module by the gulp task inject
    $routeProvider
        .when('/', {
            // Support view
            templateUrl: 'app-templates/webapi/webapi.tpl.html',
            controllerAs: 'vm',
            controller: 'WebApiController'
        })
        .when('/Reports', {  // Report home         
            templateUrl: rootUrl + 'app-templates/Reports/Report.tpl.html',
            controllerAs: 'vm',
            controller: 'ReportController'
        })
        .when('Reports/TesterCertReport', {
            // Tester view
            templateUrl: rootUrl + 'app-templates/TesterCertReport.tpl.html',
            controllerAs: 'vm',
            controller: 'TesterCertReportController'
        })
        .when('Reports/ManagementReport', {
            // Tester view
            templateUrl: rootUrl + 'app-templates/ManagementReport.tpl.html',
            controllerAs: 'vm',
            controller: 'ManagementReportController'
        })
        .otherwise({
            // Tester view
            templateUrl: 'app-templates/webapi/webapi.tpl.html',
            controllerAs: 'vm',
            controller: 'UtpTraceSummaryController'
        }
        );
});
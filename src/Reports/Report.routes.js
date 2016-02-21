// angular.module('app').config(function ($routeProvider) {
//     var baseHref = $('#baseHref').attr('href');
//     var rootUrl = baseHref + 'scripts/app/partials/Reports/';
//     $routeProvider
//         .when('/Reports', {  // Report home         
//            templateUrl: rootUrl + 'app-templates/Report.tpl.html',
//            controllerAs: 'vm',
//            controller: 'ReportController'
//         })
//         .when('/TesterCertReport', {
//            // Tester view
//            templateUrl: rootUrl + 'app-templates/TesterCertReport.tpl.html',
//            controllerAs: 'vm',
//            controller: 'TesterCertReportController'
//         })
//         .when('/ManagementReport', {
//            // Tester view
//            templateUrl: rootUrl + 'app-templates/ManagementReport.tpl.html',
//            controllerAs: 'vm',
//            controller: 'ManagementReportController'
//         })
// })
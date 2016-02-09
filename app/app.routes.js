///<reference path="../../typings/tsd.d.ts"/>
angular.module('app').config(function ($routeProvider) {
    // TODO: Change something to see if the build task runs
    var baseHref = $('#baseHref').attr('href');
    var templateUrl = './src/webapi/webapi.tpl.html';
    $routeProvider
        .when('/', {
        // Support view
        templateUrl: 'app-templates/webapi/webapi.tpl.html',
        controllerAs: 'vm',
        controller: 'WebApiController'
    })
        .otherwise({
        // Tester view
        templateUrl: 'app-templates/webapi/webapi.tpl.html',
        controllerAs: 'vm',
        controller: 'UtpTraceSummaryController'
    });
});

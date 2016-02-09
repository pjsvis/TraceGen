///<reference path="../../../typings/tsd.d.ts"/>
angular.module('app').config(function($routeProvider: ng.route.IRouteProvider) {

    // TODO: Change something to see if the build task runs
    var baseHref = $('#baseHref').attr('href');

    var templateUrl = './src/webapi/webapi.tpl.html';
    $routeProvider
        .when('/', {
            // Support view
            templateUrl: templateUrl,
            controllerAs: 'vm',
            controller: 'WebApiController'
        })
        .when('/other', {
            // Tester view
            templateUrl: templateUrl,
            controllerAs: 'vm',
            controller: 'UtpTraceSummaryController'
        }
        );
});
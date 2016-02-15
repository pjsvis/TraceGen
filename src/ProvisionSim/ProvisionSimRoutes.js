angular.module('app').config(function( $routeProvider) {
    
    var folder = $("#baseHref").attr("href") + 'scripts/app/partials/ProvisionSim/';
    $routeProvider
        // TODO Rename to account for Sims and Users
        // ManageTestSuites
        .when('/SimTestSuites', {
            templateUrl: folder + 'SimTestSuites.tpl.html'
        })
        .otherwise({
            redirectTo: '/'
        });
})
angular.module('app').config(function($routeProvider) {

   var baseHref = $('#baseHref').attr('href');
   var templateUrl = baseHref + 'scripts/app/partials/UtpTraceSummary/UtpTraceSummary.tpl.html';
   $routeProvider
      .when('/', {
         // Support view
         templateUrl: templateUrl,
         controllerAs: 'vm',
         controller: 'UtpTraceSummaryController'
      })
      .when('/tester/:testerId', {
            // Tester view
            templateUrl: templateUrl,
            controllerAs: 'vm',
            controller: 'UtpTraceSummaryController'
         }
      );
})
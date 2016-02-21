angular.module('app').config(function ($routeProvider) {

   var baseHref = $('#baseHref').attr('href');
   var templateUrl = baseHref + 'scripts/app/partials/Tester/Tester.tpl.html';
   $routeProvider
      .when('/Home/:testerId', {
         // Support view
         templateUrl: templateUrl,
         controllerAs: 'vm',
         controller: 'TesterController'
      })      
      .when('/', {
         // Support view
         templateUrl: templateUrl,
         controllerAs: 'vm',
         controller: 'TesterController'
      });
})
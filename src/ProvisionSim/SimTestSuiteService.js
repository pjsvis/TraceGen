/// <reference path="../../../../typings/tsd.d.ts" />
angular.module('app')
    .factory('SimTestSuiteService', function ($http, $window) {
        var fac = {};

        var simApi = BASE_URL + 'api/UtpSimTestSuites/';

        fac.addSimTestSuite = function (simId, testSuiteId) {
            return $http.post(simApi + 'AddTestSuite', { SimId: simId, TestSuiteId: testSuiteId });
        };
        fac.removeSimTestSuite = function (simId, testSuiteId) {
            return $http.post(simApi + 'RemoveTestSuite', { SimId: simId, TestSuiteId: testSuiteId });
        };

        fac.addSimTestCase = function (simId, testSuiteId, testCaseId) {
            return $http.post(simApi + 'AddTestCase', { SimId: simId, testSuiteId: testSuiteId, TestCaseId: testCaseId });
        };
        fac.removeSimTestCase = function (simId, testSuiteId, testCaseId) {
            return $http.post(simApi + 'RemoveTestCase', { SimId: simId, testSuiteId: testSuiteId, TestCaseId: testCaseId });
        };
        return fac;
    });

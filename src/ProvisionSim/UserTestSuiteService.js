/// <reference path="../../../../typings/tsd.d.ts" />
angular.module('app')
    .factory('UserTestSuiteService', function ($http, $window) {
        var fac = {};
        
        var userApi = BASE_URL + 'api/UtpUserTestSuites/';

        fac.addUserTestSuite = function (simId, testSuiteId) {
            return $http.post(userApi + 'AddTestSuite', { SimId: simId, TestSuiteId: testSuiteId });
        };
        fac.removeUserTestSuite = function (simId, testSuiteId) {
            return $http.post(userApi + 'RemoveTestSuite', { SimId: simId, TestSuiteId: testSuiteId });
        };
                
        fac.addUserTestCase = function (simId, testSuiteId, testCaseId) {
            return $http.post(userApi + 'AddTestCase', { SimId: simId, testSuiteId: testSuiteId, TestCaseId: testCaseId });
        };
        fac.removeUserTestCase = function (simId, testSuiteId, testCaseId) {
            return $http.post(userApi + 'RemoveTestCase', { SimId: simId, testSuiteId: testSuiteId, TestCaseId: testCaseId });
        };
        return fac;
    });

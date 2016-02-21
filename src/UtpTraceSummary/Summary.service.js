/// <reference path="../../../../typings/tsd.d.ts" />
angular.module('app')
    .factory('SummaryService', function (HttpHelper, $browser) {
        var fac = {};
        var baseHref = $browser.baseHref();
        fac.lastPage = function (traceSummaryRequest) {
            return HttpHelper.post([baseHref, 'api/UtpSummary/LastPage'].join(''), traceSummaryRequest);
        }
        fac.firstPage = function (traceSummaryRequest) {
            return HttpHelper.post([baseHref, 'api/UtpSummary/FirstPage'].join(''), traceSummaryRequest);
        }
        fac.prevPage = function (traceSummaryRequest) {
            return HttpHelper.post([baseHref, 'api/UtpSummary/PrevPage'].join(''), traceSummaryRequest);
        }
        fac.nextPage = function (traceSummaryRequest) {
            return HttpHelper.post([baseHref, 'api/UtpSummary/NextPage'].join(''), traceSummaryRequest);
        }
        fac.getTraceChildren = function (traceId) {
            return HttpHelper.get([baseHref, 'api/UtpSummary/GetTraceChildren?TraceId=', traceId].join(''));
        };
        fac.getTestIdNameResponse = function (testId) {
            return HttpHelper.get([baseHref, 'api/UtpTest/GetTestIdNameResponse?testId=', testId].join(''));
        };
        return fac;
    }) 
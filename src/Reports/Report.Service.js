angular.module('app').factory('ReportService', function ($browser, HttpHelper) {
   var fac = {};
   var baseHref = $browser.baseHref();
   fac.getTesterCertReport = function (req) {
      return HttpHelper.post([baseHref, 'api/Report/GetTesterCertReport'].join(''), req);
   };
   fac.getManagementReport = function () {
      return HttpHelper.post([baseHref, 'api/Report/GetManagementReport'].join(''), {});
   };
   fac.getActiveTesters = function () {
      return HttpHelper.get([baseHref, 'api/Report/GetActiveTesters'].join(''), {});
   };   
   return fac;
});
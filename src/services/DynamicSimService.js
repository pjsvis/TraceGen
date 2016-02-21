/// <reference path="../../../typings/tsd.d.ts" />
angular.module('app').factory('DynamicSimService', function (HttpHelper, $browser) {
   var fac = {};
   var api = $browser.baseHref() + 'api/DynamicSim/';
   fac.getXml = function (userId) {
      return HttpHelper.get([api, 'getXml?UserId=', userId].join(''));
   }
   fac.saveXml = function (userId, xml) {
      return HttpHelper.post([api, 'saveXml'].join(''), { UserId: userId, Xml: xml });
   }
   return fac;
});
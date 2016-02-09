// TODO: This is not currently in the project but maybe should be expanded upon??
// Use local storage to store app state between pages
angular.module('app').factory('AppState', function ($localStorage) {
    var fac = {};
    fac.get = function () {
        console.log('Hello');
    };
    fac.set = function (state) {
        console.log('Not implemented')
    };
    return fac;
});

/// <reference path="../../../typings/tsd.d.ts" />
Ref: http://jsforallof.us/2014/10/28/pagination-with-lodash/
angular.module('app').factory('PaginatorService', function () {
    var fac = {};
    fac.pagedItems = function (items, page) {
        var per_page = 10;
        var totalPages = Math.ceil(items.length / per_page);
        page = page || totalPages;
        var offset = (page - 1) * per_page;
        var paginatedItems = _.drop(items, offset).slice(0, per_page);
        console.table(paginatedItems);
        return {
            page: page,
            per_page: per_page,
            total: items.length,
            total_pages: Math.ceil(items.length / per_page),
            data: paginatedItems
        };
    }
    return fac;
});


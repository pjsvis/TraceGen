angular.module('app').factory('DownloadXmlService', function (HttpHelper, $browser, $window, $httpParamSerializer, toastr) {

    var fac = {};
    var baseHref = $browser.baseHref();

    var numTracesForRequest = function (traceSummaryRequest) {
        return HttpHelper.post(baseHref + 'api/Download/NumTracesForRequest', traceSummaryRequest).then(function (response) {
            return response;
        });
    };

    fac.downloadXml = function (traceSummaryRequest) {
        
        // Copy traceSummaryRequest and set the skip and take to zero so as to avoid paging
        var tsr = angular.copy(traceSummaryRequest);
        tsr.Skip = 0;
        tsr.Take = 0;
        
        // Find out if we have any traces        
        numTracesForRequest(tsr).then(function (response) {
            if (response.data === 0) {
                toastr.warning('There are no traces for this request.');
                return;
            }
            // If we do then download them
            var params = $httpParamSerializer(tsr);
            var url = baseHref + 'api/Download/SessionXml?' + params;
            $window.location.href = url;
            // TODO: Create file name using request data
            toastr.info('File downloaded');
        });
    }

    fac.downloadZip = function (traceSummaryRequest) {
        // Copy traceSummaryRequest and set the skip and take to zero so as to avoid paging
        var tsr = angular.copy(traceSummaryRequest);
        tsr.Skip = 0;
        tsr.Take = 0;
        
        // Find out if we have any traces
        numTracesForRequest(tsr).then(function (response) {
            if (response.data === 0) {
                toastr.warning('There are no traces for this request.');
                return;
            }
        
            // If we do then download them
            var params = $httpParamSerializer(tsr);
            var url = baseHref + 'api/Download/SessionZip?' + params;
            $window.location.href = url;
            // TODO: Create file name using request data
            toastr.info('File downloaded');
        });
    }
    return fac;
});
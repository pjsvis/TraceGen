/// <reference path="../../../../typings/tsd.d.ts" />
// TODO: Investigate where DownloadXmlService is used
angular.module('app')
    .factory('AttachmentService', function ($http, $browser, $window, HttpHelper) {
        var fac = {};
        var baseHref = $browser.baseHref();

        fac.getAttachmentsDto = function (req) {
            return HttpHelper.post([baseHref, 'api/UtpAttachment/getAttachmentsDto'].join(''), req);
        };
        fac.getAttachment = function (id) {
            return HttpHelper.get([baseHref, 'api/UtpAttachment/getAttachment?id=', id].join(''));
        };
        fac.saveNote = function (saveNoteRequest) {
            var url = [baseHref, 'api/UtpAttachment/SaveNote'].join('');
            return HttpHelper.post(url, saveNoteRequest);
        };
        fac.getTestIdNameResponse = function (testId) {
            return HttpHelper.get([baseHref, 'api/UtpTest/GetTestIdNameResponse?testId=', testId].join(''));
        };
        fac.getTraceChildren = function (traceId) {
            return HttpHelper.get([baseHref, 'api/UtpSummary/GetTraceChildren?TraceId=', traceId].join(''));
        };
        return fac;
    })
    .controller('TraceDetailsController', function (
        $scope, $browser, $window, AttachmentService, SummaryService, toastr, $uibModal, $uibModalInstance, $log,
        $timeout, Upload, $localStorage, DownloadXmlService, user, selectedItems, PaginatorService) {
    
        // Expose the controller scope to the window for easy debugging
        var vm = this;
        $window.vm = vm;
        vm.data = {};
        vm.state = {
            selectedTester: selectedItems.selectedTester,
            selectedSim: selectedItems.selectedSim,
            selectedSuite: selectedItems.selectedSuite,
            selectedTest: selectedItems.selectedTest
        };

        vm.debug = false;

        vm.pageChanged = function () {
            vm.data.Rows = [];
            var pagedItems = PaginatorService.pagedItems(vm.state.data.Rows, vm.state.currentPage);
            vm.data.Rows = pagedItems.data;
        }

        var userLastPage = function () {
            var promise;
            vm.data.Rows = [];
            promise = $timeout(function () { vm.state.showSpinner = true; }, 100);
            SummaryService.lastPage(vm.state.traceSummaryRequest).then(function (response) {
                var pagedItems = PaginatorService.pagedItems(response.data.Rows);                
                vm.state.currentPage = pagedItems.page;
                vm.state.itemsPerPage = pagedItems.per_page;
                vm.state.totalItems = pagedItems.total;
                vm.state.data = response.data;                
                vm.data.Rows = pagedItems.data;                
                $timeout.cancel(promise);
                vm.state.showSpinner = false;
            });
        };
        
        // TreeView options
        vm.context = {
            selectedNodes: []
        };

        // NOTE: See UtpTraceSummary
        // Treeview utility to populate treeview children of children
        var nodifyChildren = function (node, context) {
            // TODO: Why are we using timeout with out a delay arg?
            $timeout(function () {
                angular.forEach(node.$children, function (node) {
                    if (node.$hasChildren) {
                        var options = {};
                        var children = node.$model.children;
                        node.$children = context.nodifyArray(children, node, options);
                    }
                });
            });
        };

        // TODO: Implement lazy loading as per the UtpTraceSummary view
        vm.options = {
            // TODO: Add lazy loading here
            onExpand: function ($event, node, context) { // onExpand => lazyLoad Message.Fields
                var traceId = node.$model.traceId;
                var loaded = node.$model.loaded;
                context.selectedNodes = [node];
                if (traceId > 0 && !loaded) {
                    AttachmentService.getTraceChildren(traceId).then(function (response) {
                        node.$model.children = response.data;
                        node.$children = context.nodifyArray(response.data);
                        nodifyChildren(node, context); // Do this to populate grandchildren
                        node.$model.loaded = true;
                    });
                }
            },
            onSelect: function ($event, node, context) {
                context.selectedNodes = [node];
                var testId = node.$model.TestId;

                if (!testId) { return; }
                if (testId !== vm.state.selectedTest.Id) {
                    //Get the new test name
                    AttachmentService.getTestIdNameResponse(testId).then(function (response) {
                        vm.state.selectedtest = response.data;
                    });
                }
            },
            onCollapse: function ($event, node, context) {
                vm.context.selectedNodes = [node];
            }
        };

        var getAttachmentsDto = function (req) {
            AttachmentService.getAttachmentsDto(req).then(function (response) {
                vm.attachments = response.data;
            });
        };

        vm.downloadXml = function (previous24Hours) {
            // NOTE: vm.summaryDto.TraceSummaryRequest contains the query for the current traces
            var traceSummaryRequest = angular.copy(vm.state.traceSummaryRequest);
            traceSummaryRequest.Previous24Hours = previous24Hours;
            DownloadXmlService.downloadXml(traceSummaryRequest);
        };

        vm.downloadZip = function (previous24Hours) {
            // NOTE: vm.summaryDto.TraceSummaryRequest contains the query for the current traces
            var traceSummaryRequest = angular.copy(vm.state.traceSummaryRequest);
            traceSummaryRequest.Previous24Hours = previous24Hours;
            DownloadXmlService.downloadZip(traceSummaryRequest);
        };

        vm.refreshTraces = function () {
            userLastPage();
        };

        vm.isToday = function (dt) {
            // TODO: Fix the reference to moment
            var today = moment();
            var diff = today.diff(dt, 'days');
            return diff === 0;
        };

        vm.showNoteTextArea = function () {
            vm.showNote = true;
            // Now set focus
            $timeout(function () {
                document.getElementById('noteTextArea').focus();
            });
        };

        vm.saveNote = function (noteText) {
            if (!noteText) {
                toastr.warning('Please enter some text for the note.');
                return;
            }
            var saveNoteRequest = {
                NoteText: noteText,
                SimId: vm.state.selectedSim.Id,
                SuiteId: vm.state.selectedSuite.Id,
                TestId: vm.state.selectedTest.Id,
                UserId: vm.state.selectedTester.Id,
                CreatedBy: vm.userDetails.Id,
                TraceUid: vm.state.selectedTraceUid                
            };
            AttachmentService.saveNote(saveNoteRequest).then(function (response) {
                vm.attachments.Notes.unshift(response.data);
                vm.newNote = '';
                vm.showNote = false;
                vm.showNotes = true;
            });
        };
        vm.receiptProgress = -1;
        vm.logProgress = -1;
        vm.errorMsg = null;

        var uploadFiles = function (uploadType, files) {
            files = files;
            if (angular.isUndefined(files)) {
                return;
            }
            if (files.length > 0) {
                var requestDto = {
                    SimId: vm.state.selectedSim.Id,
                    UserId: vm.state.selectedTester.Id,
                    CreatedBy:  vm.userDetails.Id,
                    SuiteId: vm.state.selectedSuite.Id,
                    TestId: vm.state.selectedTest.Id,
                    TraceUid: vm.state.selectedTraceUid,
                    UploadType: uploadType,
                    Files: files
                };

                Upload.upload({
                    url: 'api/UtpAttachment/FileUpload',
                    data: requestDto
                }).then(function (response) {
                    var newItems = response.data;
                    $timeout(function () {
                        angular.forEach(newItems, function (receipt) {
                            if (uploadType === 'Receipt') {
                                vm.attachments.Receipts.unshift(receipt);
                                vm.showReceipts = true;
                            }
                            if (uploadType === 'Log') {
                                vm.attachments.Logs.unshift(receipt);
                                vm.showLogs = true;
                            }
                        });
                        vm.receiptProgress = -1;
                        vm.logProgress = -1;
                    });
                }, function (response) {
                    if (response.status > 0) {
                        vm.errorMsg = response.data;
                    }
                }, function (evt) {
                    var progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    if (uploadType === 'Receipt') {
                        vm.receiptProgress = progress;
                    }
                    if (uploadType === 'Log') {
                        vm.logProgress = progress;
                    }
                });
            }
        };

        var checkFileSizes = function (files) {
            var fac = {
                tooLarge: [],
                validFiles: []
            };
            angular.forEach(files, function (file) {
                // Only files < 10 Mb
                if (file.size <= 10485760) {
                    fac.validFiles.push(file);
                } else {
                    fac.tooLarge.push(file);
                }
            });
            return fac;
        };

        vm.uploadReceipts = function (files) {
            var fac = checkFileSizes(files);
            vm.tooLargeReceipts = fac.tooLarge;
            vm.validReceipts = fac.validFiles;
            uploadFiles('Receipt', fac.validFiles);
        };

        vm.uploadLogs = function (files) {
            var fac = checkFileSizes(files);
            vm.tooLargeLogs = fac.tooLarge;
            vm.validLogs = fac.validFiles;
            uploadFiles('Log', fac.validFiles);
        };

        vm.downloadMedia = function (media) {
            var url = ['api/download/attachment?Id=', media.Id].join('');
            $window.location.href = url;
            return;
        };

        vm.showMedia = function (media) {
            // Redirect to download link
            if (media.ContentSubType === 'application') {
                var url = ['api/download/attachment?Id=', media.Id].join('');
                $window.location.href = url;
                return;
            }
            // We already have the content so show it
            if (media.Content) {
                open(media);
                return;
            }
            // We don't have the content so go and get it
            AttachmentService.getAttachment(media.Id).then(function (response) {
                media.Content = response.data.Content;
                open(media);
            });
        };
        
        // Close the TraceDetails Modal 
        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
      
        ///////////////////////// START OF ViewMedia Modal /////////////////////
        var open = function (media) {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: $browser.baseHref() + 'scripts/app/partials/TraceDetails/ViewMedia.tpl.html',
                controller: 'ViewMediaController',
                controllerAs: 'vm',
                //size: 'lg',
                windowClass: 'app-modal-window', // see site.css for settings
                resolve: {
                    media: function () {
                        return media;
                    }
                }
            });

            // TODO: We don't really need this
            modalInstance.result.then(function () {

            });
        };
        ///////////////////////// END OF Modal CODE /////////////////////

        // Initialise the page
        vm.userDetails = user;
        vm.state.traceSummaryRequest = {
            UserId: selectedItems.selectedTester.Id,
            SimId: selectedItems.selectedSim.Id,
            TestSuiteId: selectedItems.selectedSuite.Id,
            TestId: selectedItems.selectedTest.Id,
            Skip: 0,
            // TODO: Implement pagination
            Take: 200,
            Previous24Hours: false,
            UnknownUser: selectedItems.unknownUser,
            AddChildren: false,
            ToLocalTime: false
        }
        userLastPage();
        vm.state.attachmentsRequest = {
            UserId: selectedItems.selectedTester.Id,
            SimId: selectedItems.selectedSim.Id,
            SuiteId: selectedItems.selectedSuite.Id,
            TestId: selectedItems.selectedTest.Id,
            WithFileContents: false
        };

        getAttachmentsDto(vm.state.attachmentsRequest, false);
    }); //////////////END OF CONTROLLER SCOPE////////////////////////////////////
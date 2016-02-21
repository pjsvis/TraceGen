/// <reference path="../../../../typings/tsd.d.ts" />
angular.module('app')
    .controller('UtpTraceSummaryController', function (
        $scope, $route, $routeParams, $location,
        $timeout, $browser, $window,
        SummaryService, DownloadXmlService, toastr,
        $translate, UserDetails, $localStorage, $uibModal
        ) {

        //console.log('Language: ', $translate.use()); // Returns the currently used language key

        // Expose the controller scope to the window for easy debugging
        var vm = this;
        $window.vm = vm;
        vm.data = {};
        // Create a default TraceSummaryRequest to use for our first search       
        vm.state = {};
        vm.state.isSelected = false;

        // TODO: Move to a service
        // Find the new rows
        var difference = function (rows, items) {
            var itemIds = _.pluck(items, 'Id');
            var diff = rows.filter(function (row) {
                return !(row.Id in itemIds) && !angular.isUndefined(row.Id);
            });
            return diff;
        };

        // Render the treeview nodes
        var renderRows = function (data) {
            
            // If no rows to show then clear up and return
            if (data.Rows.length === 0) {
                vm.data.Rows = [];
                return;
            }

            // If we are not autorefreshing then replace all
            if (!vm.state.autoRefresh || vm.data.Rows.length === 0) {
                vm.data.Rows = data.Rows;
                return;
            }

            // If we are autorefreshing then just append the new rows
            var diff = difference(data.Rows, vm.data.Rows);
            var itemIds = _.pluck(vm.data.Rows, 'Id');
            angular.forEach(diff, function (item) {
                if (!_.contains(itemIds, item.Id) && item.Id !== 0) {
                    vm.data.Rows.push(item);
                    // Keep the correct itemsPerPage
                    var drop = (vm.data.Rows.length - vm.state.itemsPerPage) || 0;
                    vm.data.Rows = _.drop(vm.data.Rows, drop);
                }
            });
        };

        var resetTraceDetails = function () {
            vm.state.selectedTester = { Id: -1, Name: 'Not selected' };
            vm.state.selectedSim = { Id: -1, Name: 'Not selected' };
            vm.state.selectedSuite = { Id: -1, Name: 'Not selected' };
            vm.state.selectedTest = { Id: -1, Name: 'Not selected' };
            vm.state.selectedTraceUid = '';
        };

        // Use the traceSummaryRequest to get new records
        var userPage = function () {                                                         
            // Empty rows first
            vm.data.Rows = [];
            var promise = $timeout(function () { vm.state.showSpinner = true; }, 100);
            // TODO: We also need either the min or the max ClientId
            SummaryService.getUserPage(vm.state.traceSummaryRequest).then(function (response) {
                vm.data = response.data;
                vm.state.fromPage = vm.state.currentPage;
                $timeout.cancel(promise);
                vm.state.showSpinner = false;
                renderRows(response.data);
                resetTraceDetails();
            });
        };


        var setTimestampText = function () {
            // Set the text for the timezone
            var yourLocalTime = ['Trace timestamps have been adjusted to your local time (', vm.data.Timezone, ')'].join('');
            var testersLocalTime = ['Trace timestamps have been adjusted to the testers local time (', vm.data.Timezone, ')'].join('');
            var isTester = vm.userDetails.IsTester;
            var overTheShoulder = vm.userDetails.IsSupport && vm.state.traceSummaryRequest.UserId > 0;
            var isSupport = vm.userDetails.IsSupport;
            if (isTester || (isSupport && !overTheShoulder)) {
                vm.timestampText = yourLocalTime;
            } else {
                vm.timestampText = testersLocalTime;
            }
            // Now store the over the should in vm.state
            vm.state.overTheShoulder = overTheShoulder;
        }

        var userLastPage = function () {
            var promise;
            // Empty rows unless we are in autorefresh
            var showSpinner = !vm.state.autoRefresh || !vm.data.Rows;
            if (showSpinner) {
                vm.data.Rows = [];
                promise = $timeout(function () { vm.state.showSpinner = true; }, 100);
            }

            SummaryService.lastPage(vm.state.traceSummaryRequest).then(function (response) {
                vm.data = response.data;
                vm.state.traceSummaryRequest = response.data.TraceSummaryRequest;
                vm.state.allowSearch = true;
                if (showSpinner) {
                    $timeout.cancel(promise);
                    vm.state.showSpinner = false;
                    setTimestampText();
                }
                //NOTE: We use the fromPage to determine the paging direction
                vm.state.currentPage = response.data.LastPage;
                vm.state.fromPage = response.data.LastPage;
                renderRows(response.data);
                resetTraceDetails();
            });
        };

        var userFirstPage = function () {
           // Empty rows unless we are in autorefresh
            vm.state.autoRefresh = false;
            vm.data.Rows = [];
            var promise = $timeout(function () { vm.state.showSpinner = true; }, 100);
            SummaryService.firstPage(vm.state.traceSummaryRequest).then(function (response) {
                vm.data = response.data;
                vm.state.traceSummaryRequest = response.data.TraceSummaryRequest;
                if (!vm.state.autoRefresh) {
                    $timeout.cancel(promise);
                    vm.state.showSpinner = false;
                }               
                //NOTE: We use the fromPage to determine the paging direction
                vm.state.currentPage = 1;
                vm.state.fromPage = vm.state.currentPage;
                renderRows(response.data);
                resetTraceDetails();
            });
        }

        var userPrevPage = function () {
           // Empty rows unless we are in autorefresh
            vm.state.autoRefresh = false;
            vm.data.Rows = [];
            var promise = $timeout(function () { vm.state.showSpinner = true; }, 100);
            SummaryService.prevPage(vm.state.traceSummaryRequest).then(function (response) {
                vm.data = response.data;
                vm.state.traceSummaryRequest = response.data.TraceSummaryRequest;
                if (!vm.state.autoRefresh) {
                    $timeout.cancel(promise);
                    vm.state.showSpinner = false;
                }               
                //NOTE: We use the fromPage to determine the paging direction
                vm.state.fromPage = vm.state.currentPage;
                renderRows(response.data);
                resetTraceDetails();
            });
        }

        var userNextPage = function () {
           // Empty rows unless we are in autorefresh
            vm.state.autoRefresh = false;
            vm.data.Rows = [];
            var promise = $timeout(function () { vm.state.showSpinner = true; }, 100);
            SummaryService.nextPage(vm.state.traceSummaryRequest).then(function (response) {
                vm.data = response.data;
                vm.state.traceSummaryRequest = response.data.TraceSummaryRequest;
                if (!vm.state.autoRefresh) {
                    $timeout.cancel(promise);
                    vm.state.showSpinner = false;
                }
                //NOTE: We use the fromPage to determine the paging direction
                vm.state.fromPage = vm.state.currentPage;
                renderRows(response.data);
                resetTraceDetails();
            });
        }

        vm.pageChanged = function () {

            console.log('fromPage', vm.state.fromPage);
            console.log('toPage', vm.state.currentPage);
            console.log(vm.data.Rows);

            var fromPage = vm.state.fromPage;
            var toPage = vm.state.currentPage;
            var lastPage = vm.data.LastPage;

            if (toPage === lastPage) {
                // Get Last Page
                userLastPage();
                return;
            }
            if (toPage === 1) {
                // Get First Page
                userFirstPage();
                return;
            }
            if (toPage < fromPage) {
                // Get prev page
                userPrevPage();
                return;
            }
            if (toPage > fromPage) {
                // Get Next page
                userNextPage();
                return;
            }

            vm.state.isLastPage = vm.state.currentPage === vm.data.LastPage;
            // Switch off AutoRefresh if we are not on the last page
            if (vm.state.currentPage < vm.data.LastPage) {
                vm.toggleAutoRefresh(false);
            }
            // vm.state.item
            var take = vm.state.itemsPerPage;
            var skip = (vm.state.currentPage - 1) * take;
            vm.state.traceSummaryRequest.Skip = skip;
            // If we are in autorefresh then show the last page
            if (vm.state.autoRefresh) {
                userLastPage();
            } else {
                // TODO: We need to know wether we are going to next or prev page
                userPage();
            }
        };

        var getItemById = function (collection, id) {
            // TODO: If we can't find the item we should return the 
            return _.find(collection, _.matchesProperty('Id', id));
        };
          
        // TODO: Review this                 
        var setState = function (node) {
            // NOTE:  If we are we don't have a traceId then we are not on the root node
            if (!node.$model.traceId) {
                return;
            }
            // NOTE: This is what we need for trace details
            vm.state.selectedTraceUid = node.$model.TraceUid;
            console.log(vm.state);
            // NOTE: Set vm.state with sim/user/suite/test
            var userId = node.$model.UserId;
            var simId = node.$model.SimId;
            var suiteId = node.$model.SuiteId;
            var testId = node.$model.TestId;
            var lookups = vm.data.TesterLookups;

            vm.state.isSelected = true;

            // Lookup tester/sim/suite
            if (userId <= 0) {
                vm.state.selectedTester = { Id: userId, Name: 'Unknown' };
            } else {
                vm.state.selectedTester = getItemById(lookups.Testers, userId);
                // NOTE: Always use the Id from the trace even if we dont have a lookup for it
                vm.state.selectedTester.Id = userId;
            }
            // NOTE: Handle case where we have a simId/suiteId but it has been deleted from the Sims table
            vm.state.selectedSim = getItemById(lookups.Sims, simId) || { Id: simId, Name: 'Unknown' };
            vm.state.selectedSuite = getItemById(lookups.Suites, suiteId) || { Id: suiteId, Name: 'Unknown' };
            // Make api call for test name
            SummaryService.getTestIdNameResponse(testId).then(function (response) {
                vm.state.selectedTest = response.data;
                // NOTE: Always use the testId from the trace 
                vm.state.selectedTest.Id = testId;
            });
        }   

        // TODO: Create a new controller soley for the treeview
        // NOTE: Treeview logic 
        vm.context = {
            selectedNodes: []
        };

        // NOTE: See TraceDetailsController
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

        vm.options = {
            onExpand: function ($event, node, context) { // onExpand => lazyLoad Message.Fields
                var traceId = node.$model.traceId;
                var loaded = node.$model.loaded;
                vm.context.selectedNodes = [node];
                setState(node);
                if (traceId > 0 && !loaded) {
                    SummaryService.getTraceChildren(traceId).then(function (response) {
                        node.$model.children = response.data;
                        node.$children = context.nodifyArray(response.data);
                        nodifyChildren(node, context); // Do this to populate grandchildren                              
                        node.$model.loaded = true;
                    });
                }
            },
            onSelect: function ($event, node, context) {
                vm.context.selectedNodes = [node];
                // If we are not on the root node then just return
                // NOTE: traceId is camel cased???

                // Disable toggle on  select OTSUTP-206
                vm.toggleAutoRefresh(false);

                setState(node);
            },
            onCollapse: function ($event, node, context) {
                vm.context.selectedNodes = [node];
                setState(node);
            }
        };

        ///////////////////END treeview logic////////////////////////////////////////////////   

        vm.changePageSize = function (itemsPerPage) {
            // TODO: Deprecate vm.state.itemsPerPage
            vm.state.itemsPerPage = itemsPerPage;
            vm.state.traceSummaryRequest.Take = itemsPerPage;
            userLastPage();
        };

        vm.downloadXml = function (previous24Hours) {
            vm.state.traceSummaryRequest.Previous24Hours = previous24Hours;
            DownloadXmlService.downloadXml(vm.state.traceSummaryRequest);
        };

        vm.downloadZip = function (previous24Hours) {
            vm.state.traceSummaryRequest.Previous24Hours = previous24Hours;
            DownloadXmlService.downloadZip(vm.state.traceSummaryRequest);
        };

        vm.toggleAutoRefresh = function (isAutoRefresh) {
            if (angular.isUndefined(isAutoRefresh)) {
                vm.state.autoRefresh = !vm.state.autoRefresh;
            } else {
                vm.state.autoRefresh = isAutoRefresh;
            }
            if (vm.state.autoRefresh) {
                userLastPage();
            }
        };
    
        //TODO: Move the hub logic to a service and host the main hub startup in the tempate page                                             
        // Set up our SignalR environment                
        var con = $.hubConnection();
        var hub = con.createHubProxy('traceHub');

        // Append new traces to the last page                                         
        var throttledNewTraces = _.throttle(function () {
            console.log('onNewTraces');
            if (vm.state.autoRefresh) {
                // Update our data and trace and page count
                userLastPage();
            }
        }, 3000, { trailing: true });
        // The SignalR server raises the onNewTraces event                              
        hub.on('onNewTraces', throttledNewTraces);

        con.connectionSlow(function () {
            toastr.warning('We are currently experiencing difficulties with the SignalR Auto Refresh connection.');
        });

        con.error(function (error) {
            toastr.warning('SignalR Auto Refresh error: ' + error);
        });

        // TODO: This should be part of a SignalR service              
        var addUser = function (userName) {
            hub.invoke('addUser', userName).done(function (data) {
                // Note: the response is the data here as we are using the SignalR api
                vm.connectedUsers = data;
                console.log(vm);
            }).fail(function (error) {
                console.log('addUser error: ' + error);
            });
        };

        hub.on('userConnected', function(user) {
            console.log(user.Id + ':' + user.Name);
        });

      /* NOTE: If you try and invoke any server methods before the connection is started
      angular will report "Uncaught RangeError: Maximum call stack size exceeded"                
      */
        var startConnection = function (userName) {
            con.logging = vm.debug;

            // Set the url to handle sub folder when deployed
            con.url = '~/signalr';
            //con.url = $browser.baseHref() + 'signalr';  
            console.log(con.url);

            con.start(function () {
                // TODO: Add the user's UserName to the connections dictionary on the server
                addUser(userName);
            }).done(function () {
                console.log('SignalR Auto Refresh Connected, transport = ' + con.transport.name);
            });
        };

        // Initialise                    
        var init = function () {
            UserDetails.get().then(function (data) {
                console.log($routeParams.testerId);

                vm.userDetails = data; // setup our user details  
                // NOTE: This is our initial state
                vm.state = {
                    debug: false,
                    itemsPerPage: 25,
                    // NOTE: This will be set to whichever page we are on so that we can navigate to next/prevPage
                    fromPage: null, 
                    // TODO: Get rid of skip
                    skip: 0,
                    currentPage: 0,
                    autoRefresh: true,
                    isLastPage: true,
                    // NOTE: This is the tester for the selected test or zero for everything
                    selectedTester: { Id: -1, Name: 'Not selected' },
                    selectedSim: { Id: -1, Name: 'Not selected' },
                    selectedSuite: { Id: -1, Name: 'Not selected' },
                    selectedTest: { Id: -1, Name: 'Not selected' },
                    selectedTraceUid: '',
                    isSearchResults: false,
                    traceSummaryRequest: {
                        Take: 25
                    }
                };


                // Let's not select a test yet as we can't
                if (vm.state.selectedTest == null) {
                    vm.state.selectedTest = ({ Id: -1, Name: 'Test not selected' });
                };
                vm.state.selectedTest.Id = -1;
                console.log('vm.state', vm.state);

                // TODO: Get rid of this
                if (vm.userDetails.IsTester) {
                    var id = vm.userDetails.Id;
                    var userName = vm.userDetails.UserName;
                    vm.state.summaryTester = { Id: id, Name: userName };
                }

                // NOTE: Use $timeout to make sure that we have our state restored
                // Disable search when we first load and reenable in user last page
                vm.state.allowSearch = false;


                // NOTE: If we have a testerId then we are looking at a specific testers traces
                if ($routeParams.testerId) {
                    vm.state.traceSummaryRequest.UserId = $routeParams.testerId;
                }

                userLastPage();
 
                    
                // TODO: Delay starting the connection for 10 secs
                 $timeout(function () {startConnection(vm.userDetails.UserName);  }, 100);
                // switch on the signalR connection
            }, function () { // if no user details the redirect to login page
                toastr.error('Please make sure that you are logged in to OTS UTP!');
                $window.location.href = $browser.baseHref() + 'account/login';
                return;
            });
        };
        init();
                
        /////////////////////VIEW DETAILS MODAL/////////////////////////                 
        vm.openDetails = function () {
            if (!vm.state.isSelected) {
                toastr.warning('Please select a trace to view');
                return;
            }

            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                keyboard: false,
                templateUrl: $browser.baseHref() + 'scripts/app/partials/TraceDetails/TraceDetails.tpl.html',
                controller: 'TraceDetailsController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    user: function () {
                        return vm.userDetails;
                    },
                    selectedItems: function () {
                        return {
                            selectedTester: vm.state.selectedTester,
                            selectedSim: vm.state.selectedSim,
                            selectedSuite: vm.state.selectedSuite,
                            selectedTest: vm.state.selectedTest,
                            unknownUser: vm.state.traceSummaryRequest.UnknownUser
                            // TODO: Account for unknownUser                            
                        }
                    }
                }
            });

            modalInstance.result.then(function () {
                return;
            });
        };
        /////////////////////END VIEW DETAILS MODAL/////////////////////////

        ///////////////OPEN SEARCH MODAL//////////////////////////////
        vm.openSearch = function () {

            var isTesterView = false;
            if ($routeParams.testerId) {
                isTesterView = true;
            }

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: $browser.baseHref() + 'scripts/app/partials/UtpTraceSummary/UtpTraceSummarySearch.tpl.html',
                controller: 'UtpTraceSummarySearchController',
                controllerAs: 'vm',
                size: 'md',
                resolve: {
                    user: function () {
                        return vm.userDetails;
                    },
                    isTesterView: function () {
                        return isTesterView;
                    },
                    traceSummaryRequest: function () {
                        return vm.state.traceSummaryRequest;
                    }
                }
            });

            modalInstance.result.then(function (searchDto) {
                // TODO: Query the number of traces for the search and don't return with less than zero
                console.log('searchDto', searchDto);
                vm.state.traceSummaryRequest = searchDto.traceSummaryRequest;
                vm.state.searchText = searchDto.searchText;
                userLastPage();
                return;
            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        };
        ////////////////END SEARCH MODAL/////////////////////////////

    }) //////////////END OF CONTROLLER SCOPE////////////////////////////////////
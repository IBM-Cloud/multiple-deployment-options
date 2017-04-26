//------------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
(function () {
  // listen for request sent over XHR and automatically show/hide spinner
  angular.module('ngLoadingSpinner', [])
    .directive('spinner', ['$http', function ($http) {
      return {
        link: function (scope, elm, attrs) {
          scope.isLoading = function () {
            return $http.pendingRequests.length > 0;
          };
          scope.$watch(scope.isLoading, function (loading) {
            if (loading) {
              document.getElementById('loadingProgress').style.visibility = "visible";
            } else {
              document.getElementById('loadingProgress').style.visibility = "hidden";
            }
          });
        }
      };
    }]);

  // angular app initialization
  var app = angular.module('app', [
    'ngAnimate',
    'ngMaterial',
    'ngLoadingSpinner',
    'ngStorage',
  ]);

  // parse the query field into $location
  app.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
  });

  app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('orange')
      .warnPalette('red');
  });

  app.controller('MainController',
    ['$scope', '$rootScope', '$location', '$http', '$mdDialog', '$localStorage', '$interval', '$timeout', 'FibonacciEndpoint',
    function($scope, $rootScope, $location, $http, $mdDialog, $localStorage, $interval, $timeout, FibonacciEndpoint) {

    $scope.pingLoopRunning = false;
    $scope.pingIntervalInSeconds = 1;

    // default endpoints are empty
    $localStorage.$default({
      endPoints: []
    });

    function loadEnpoints() {
      $scope.endPoints = $localStorage.endPoints.map(function(options) {
        return new FibonacciEndpoint($http, options);
      });
    }

    function saveEndpoints() {
      $localStorage.endPoints = $scope.endPoints.map(function(ep) { return ep.options; });
    }

    loadEnpoints();

    // if an endpoint definition is specified on the query
    var searchParams = $location.search();
    if (searchParams.action === 'add') {
      // capture the parameters
      var options = {
        name: searchParams.name,
        icon: searchParams.icon,
        iterate: searchParams.iterate,
        crash: searchParams.crash,
        enabled: true,
        timeout: 5000,
      };

      // clear the search
      $location.search({});

      // schedule the add, leaving time to the UI to load
      $timeout(function() {
        console.log('Registering new endpoint', options);
        var newEndpoint = new FibonacciEndpoint($http, options);
        $scope.endPoints.push(newEndpoint);
        saveEndpoints();
      }, 500);
    }

    $scope.addEndpoint = function(ev) {
      $mdDialog.show({
        controller: AddEndpointController,
        templateUrl: 'routes/add-endpoint.tmpl.html',
        parent: angular.element(document.body),
        locals: {
          endpoint: null
        },
        targetEvent: ev,
        clickOutsideToClose: true
      })
      .then(function(endpoint) {
        console.log('Adding endpoint', endpoint);
        $scope.endPoints.push(new FibonacciEndpoint($http, endpoint));
        saveEndpoints();
      }, function() {
      });
    };

    $scope.editEndpoint = function(fibonacciEndpointToEdit) {
      $mdDialog.show({
        controller: AddEndpointController,
        locals: {
          endpoint: JSON.parse(JSON.stringify(fibonacciEndpointToEdit.options))
        },
        templateUrl: 'routes/add-endpoint.tmpl.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true
      })
      .then(function(endpoint) {
        console.log('Edit endpoint', endpoint);
        fibonacciEndpointToEdit.setOptions(endpoint);
        saveEndpoints();
      }, function() {
      });
    }

    $scope.toggleEndpoint = function(fibonacciEndpointToEdit) {
      fibonacciEndpointToEdit.toggle();
      saveEndpoints();
    }

    $scope.removeEndpoint = function(fibonacciEndpointToRemove) {
      $scope.endPoints = $scope.endPoints.filter(function(ep) { return ep !== fibonacciEndpointToRemove });
      saveEndpoints();
    };

    $scope.startPingLoop = function() {
      $scope.pingIntervalInSeconds = Math.max($scope.pingIntervalInSeconds || 1, 1);
      console.log('Using interval of', $scope.pingIntervalInSeconds, 'seconds');
      $scope.pingLoopRunning = true;

      // a first immediate ping
      $scope.endPoints.forEach(function(endPoint) {
        endPoint.ping(function(err, response) {
          console.log(endPoint.options.name, err, response);
        });
      });

      // and a ping at a regular interval
      $scope.pingLoop = $interval(function() {
        $scope.endPoints.forEach(function(endPoint) {
          endPoint.ping(function(err, response) {
            console.log(endPoint.options.name, err, response);
          });
        });
      }, $scope.pingIntervalInSeconds * 1000);
    };

    $scope.stopPingLoop = function() {
      $scope.pingLoopRunning = false;
      $interval.cancel($scope.pingLoop);
    };

    $scope.crash = function() {
      $scope.endPoints.forEach(function(endPoint) {
        endPoint.crash(function(err, response) {
          console.log(endPoint.options.name, err, response);
        });
      });
    };

    $scope.clear = function() {
      $scope.endPoints.forEach(function(endPoint) {
        endPoint.clear();
      });
    };

    function AddEndpointController($scope, $mdDialog, endpoint) {
      $scope.endpoint = endpoint || {
        name: null,
        icon: null,
        iterate: 'http://<host>/fibonacci?iteration=500',
        crash: 'http://<host>/fibonacci?crash=true',
        enabled: true,
        timeout: 5000,
      };
      $scope.computeIcons = [
        '/images/cloudfoundry.png',
        '/images/kubernetes.svg',
        '/images/openwhisk.png'
      ];
      $scope.isNew = endpoint === null;
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.submit = function() {
        $mdDialog.hide($scope.endpoint);
      };
    }

  }]);

}());

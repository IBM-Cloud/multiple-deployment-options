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
    'ngMaterial',
    'ngLoadingSpinner',
    'ngStorage',
  ]);

  app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('orange')
      .warnPalette('red');
  });

  app.controller('MainController', ['$scope', '$rootScope', '$http', '$mdDialog', '$localStorage', 'FibonacciEndpoint',
    function($scope, $rootScope, $http, $mdDialog, $localStorage, FibonacciEndpoint) {

    $scope.pingLoopRunning = false;

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
      $scope.pingLoopRunning = true;
      $scope.endPoints.forEach(function(endPoint) {
        if (!endPoint.options.disabled) {
          endPoint.startPing(function(err, response) {
            console.log(endPoint.options.name, err, response);
          });
        }
      });
    };

    $scope.stopPingLoop = function() {
      $scope.pingLoopRunning = false;
      $scope.endPoints.forEach(function(endPoint) {
        endPoint.stopPing();
      });
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
        iterate: 'http://<host>/iteration/1000',
        crash: 'http://<host>/crash'
      };
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

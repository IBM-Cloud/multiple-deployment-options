(function () {
  //
  angular.module('app')
    .factory('FibonacciEndpoint', function($http) {

      function FibonacciEndpoint($http, options) {
        this.options = options;
        this.$http = $http;
        this.pingLoopEnabled = false;

        this.results = [];
      }

      FibonacciEndpoint.prototype.setOptions = function(options) {
        this.options = options;
      }

      FibonacciEndpoint.prototype.successes = function() {
        return this.results.filter(function(f) { return f.result && f.result.status === 200});
      }

      FibonacciEndpoint.prototype.failures = function() {
        return this.results.filter(function(f) { return f.result && f.result.status !== 200});
      }

      FibonacciEndpoint.prototype.clear = function() {
        this.results = [];
      }

      FibonacciEndpoint.prototype.toggle = function() {
        this.options.enabled = !this.options.enabled;
      }

      FibonacciEndpoint.prototype.crash = function(callback) {
        var self = this;
        var entry = {
          date: new Date(),
        };
        self.results.push(entry);
        $http({
          method: 'POST',
          url: this.options.crash,
          timeout: 5000,
          })
        .then(function(response) {
          callback(null, response);
          response.status = -666;
          entry.result = response;
        })
        .catch(function(err) {
          callback(err);
          err.status = -666;
          entry.result = err;
        });
      }

      FibonacciEndpoint.prototype.stopPing = function(callback) {
        this.pingLoopEnabled = false;
      };

      FibonacciEndpoint.prototype.startPing = function(callback) {
        this.pingLoopEnabled = true;
        this.ping(callback);
      }

      FibonacciEndpoint.prototype.ping = function(callback) {
        var self = this;
        var entry = {
          date: new Date(),
        };
        self.results.push(entry);
        $http({
          method: 'GET',
          url: this.options.iterate,
          timeout: 5000,
          })
          .then(function(response) {
            callback(null, response);
            entry.result = response;
            if (self.pingLoopEnabled && self.options.enabled) {
              setTimeout(function() {
                self.ping(callback);
              }, 1000);
            }
          })
          .catch(function(err) {
            callback(err);
            entry.result = err;
            if (self.pingLoopEnabled && self.options.enabled) {
              setTimeout(function() {
                self.ping(callback);
              }, 1000);
            }
          });
      };

      return FibonacciEndpoint;
    });

}());

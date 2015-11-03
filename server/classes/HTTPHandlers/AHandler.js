// Generated by CoffeeScript 1.8.0
(function() {
  var AHandler, fs;

  fs = require("fs");

  AHandler = (function() {
    function AHandler(request, response) {
      this.request = request;
      this.response = response;
    }

    AHandler.prototype.responseError = function(code) {
      var response;
      response = this.response;
      response.statusCode = code;
      return response.end();
    };

    AHandler.prototype.responseFile = function(path) {
      var response;
      response = this.response;
      return fs.readFile(path, (function(_this) {
        return function(error, data) {
          if (error) {
            return console.log(error);
          } else {
            return response.end(data);
          }
        };
      })(this));
    };

    AHandler.prototype.responseFileCached = function(path) {
      var request, response, self;
      response = this.response, request = this.request;
      self = this;
      return fs.stat(path, function(error, stats) {
        var clientTime, exception, modified;
        if (error) {
          console.log(error);
          return self.responseError(500);
        } else {
          modified = true;
          try {
            clientTime = new Date(request.headers['if-modified-since']);
            response.setHeader('last-modified', stats.mtime);
            if (clientTime >= stats.mtime) {
              modified = false;
            }
          } catch (_error) {
            exception = _error;
            console.log(exception);
          }
          if (modified) {
            response.statusCode = 200;
            response.setHeader('last-modified', stats.mtime);
            return self.responseFile(path, response);
          } else {
            response.statusCode = 304;
            return response.end();
          }
        }
      });
    };

    return AHandler;

  })();

  module.exports = AHandler;

}).call(this);

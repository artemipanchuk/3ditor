// Generated by CoffeeScript 1.8.0
(function() {
  var AHandler, ResourceHandler, URL,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  URL = require("url");

  AHandler = require("./AHandler");

  ResourceHandler = (function(_super) {
    __extends(ResourceHandler, _super);

    function ResourceHandler(request, response) {
      this.request = request;
      this.response = response;
    }

    ResourceHandler.prototype.execute = function() {
      var data, path;
      data = URL.parse(this.request.url, true);
      path = data.pathname.slice(1);
      return this.responseFileCached(path);
    };

    return ResourceHandler;

  })(AHandler);

  module.exports = ResourceHandler;

}).call(this);
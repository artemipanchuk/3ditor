// Generated by CoffeeScript 1.8.0
(function() {
  var AHandler, Handler,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AHandler = require("./AHandler");

  Handler = (function(_super) {
    __extends(Handler, _super);

    function Handler(request, response) {
      this.request = request;
      this.response = response;
    }

    Handler.prototype.execute = function() {
      return this.responseFileCached("client/pages/index.html");
    };

    return Handler;

  })(AHandler);

  module.exports = Handler;

}).call(this);

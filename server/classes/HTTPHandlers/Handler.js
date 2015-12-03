var AHandler = require("./AHandler");

var Handler = (function() {
	function Handler(request, response) {
		AHandler.call(this);

		this.request  = request;
		this.response = response;
	}

	Handler.prototype = Object.create(AHandler.prototype);
	Handler.prototype.constructor = Handler;

	Handler.prototype.execute = function() {
		this.responseFileCached("client/pages/index.html");
	};

	return Handler;
})();

module.exports = Handler;
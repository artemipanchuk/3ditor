var AHandler = require("./AHandler");

var Handler404 = (function() {
	function Handler404(request, response) {
		AHandler.call(this);

		this.request  = request;
		this.response = response;
	}

	Handler404.prototype = Object.create(AHandler.prototype);
	Handler404.prototype.constructor = Handler404;

	Handler404.prototype.execute = function() {
		this.responseFileCached("client/pages/404.html");
	};

	return Handler404;
})();

module.exports = Handler404;
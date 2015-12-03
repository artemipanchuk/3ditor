var url = require("url");

var AHandler = require("./AHandler");

var ResourceHandler = (function() {
	function ResourceHandler(request, response) {
		AHandler.call(this);

		this.request  = request;
		this.response = response;
	}

	ResourceHandler.prototype = Object.create(AHandler.prototype);
	ResourceHandler.prototype.constructor = ResourceHandler;

	ResourceHandler.prototype.execute = function() {
		var data = url.parse(this.request.url, true),
			path = data.pathname.slice(1);

		this.responseFileCached(path);
	};

	return ResourceHandler;
})();

module.exports = ResourceHandler;
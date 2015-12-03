var HTTP       = require("http"),
	HTTPRouter = require("./HTTPServerRouter");

var HTTPServer = (function() {
	function HTTPServer() {
		this.router = new HTTPRouter;
	}

	HTTPServer.prototype.run = function(port) {
		var router = this.router;

		return HTTP.createServer(function(request, response) {
			return router.route(request, response);
		}).listen(port);
	};

	return HTTPServer;
})();

module.exports = HTTPServer;
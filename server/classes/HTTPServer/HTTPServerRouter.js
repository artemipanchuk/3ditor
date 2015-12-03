var url = require("url");

var HTTPServerRouter = (function() {
	function HTTPServerRouter () {}

	HTTPServerRouter.prototype.route = function(request, response) {
		request.setEncoding("utf8");

		var data = url.parse(request.url, true),
			path = data.pathname,
			pathParts = path.split("/");

		path = pathParts.map(function(part) {
			if (part.length > 0) {
				return part[0].toUpperCase() + part.slice(1);
			} else {
				return "";
			}
		}).join("").slice(1);

		var Handler;

		if (/\./.test(pathParts[pathParts.length - 1])) {
			Handler = require("../HTTPHandlers/ResourceHandler");
		} else {
			try {
				Handler = require("../HTTPHandlers/" + path + "Handler");
			} catch (e) {
				Handler = require("../HTTPHandlers/404Handler");
			}
		}

		var handler = new Handler(request, response);

		return handler.execute();
	};

	return HTTPServerRouter;
})();

module.exports = HTTPServerRouter;
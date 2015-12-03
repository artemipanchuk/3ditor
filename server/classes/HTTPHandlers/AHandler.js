var fs = require("fs");

var AHandler = (function() {
	function AHandler (request, response) {
		this.request  = request;
		this.response = response;
	}

	AHandler.prototype.responseError = function(code) {
		var response = this.response;

		response.statusCode = code;

		response.end();
	};

	AHandler.prototype.responseFile = function(path) {
		var response = this.response;

		fs.readFile(path, function(error, data) {
			if (error) {
				return console.log(error);
			} else {
				return response.end(data);
			}
		});
	};

	AHandler.prototype.responseFileCached = function(path) {
		var response = this.response,
			request  = this.request,
			self     = this;

		fs.stat(path, function(error, stats) {
			var clientTime, exception, modified;

			if (error) {
				console.log(error);

				self.responseError(500);
			} else {
				modified = true;

				try {
					clientTime = new Date(request.headers['if-modified-since']);
					response.setHeader('last-modified', stats.mtime);
					if (clientTime >= stats.mtime) {
						modified = false;
					}
				} catch (e) {
					console.log(e);
				}

				if (modified) {
					response.statusCode = 200;
					response.setHeader('last-modified', stats.mtime);

					self.responseFile(path, response);
				} else {
					response.statusCode = 304;

					response.end();
				}
			}
		});
	};

	return AHandler;
})();

module.exports = AHandler;
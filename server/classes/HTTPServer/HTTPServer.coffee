#### ———————————————————————————————————————
##   HTTP Server
#### Provides HTTP Server interface
#### ———————————————————————————————————————

HTTP = require("http")

HTTPRouter = require("./HTTPServerRouter")

#### ———————————————————————————————————————

class HTTPServer
	constructor: ->
		@router = new HTTPRouter

	run: (port) ->
		{router} = @

		HTTP.createServer (request, response) ->
			router.route(request, response)
		.listen(port)

#### ———————————————————————————————————————

module.exports = HTTPServer
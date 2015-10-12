#### ———————————————————————————————————————
##   HTTP Server Router
#### Provides routing
#### ———————————————————————————————————————

URL = require("url")

#### ———————————————————————————————————————

class HTTPServerRouter
	constructor: ->

	route: (request, response) ->
		request.setEncoding("utf8")

		data = URL.parse(request.url, true)
		path = data.pathname

		pathParts = path.split("/")

		path = pathParts.map (part) ->
				if part.length > 0
					return part[0].toUpperCase() + part.slice(1)
				else
					return ""
			.join("")

		if (/\./.test(pathParts[pathParts.length - 1]))
			Handler = require("../HTTPHandlers/ResourceHandler")
		else
			try
				Handler = require("../HTTPHandlers/#{path}Handler")
			catch exception
				Handler = require("../HTTPHandlers/404Handler")

		handler = new Handler(request, response)

		handler.execute()

#### ———————————————————————————————————————

module.exports = HTTPServerRouter
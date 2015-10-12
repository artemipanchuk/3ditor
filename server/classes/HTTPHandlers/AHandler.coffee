#### ———————————————————————————————————————
##   HTTP Abstract Handler
#### Provides base methods
#### ———————————————————————————————————————

fs = require("fs")

#### ———————————————————————————————————————

class AHandler
	constructor: (@request, @response) ->

	responseError: (code) ->
		{response} = @

		response.statusCode = code

		response.end()

	responseFile: (path) ->
		{response} = @

		fs.readFile path, (error, data) =>
			if error
				console.log(error)
			else
				response.end(data)

	responseFileCached: (path) ->
		{response, request} = @
		self = @

		fs.stat path, (error, stats) ->
			if error
				console.log(error)

				self.responseError(500)
			else
				modified = true

				try
					clientTime = new Date(request.headers['if-modified-since'])

					response.setHeader('last-modified', stats.mtime)

					if clientTime >= stats.mtime
						modified = false
				catch exception
					console.log(exception)

				if modified
					response.statusCode = 200
					response.setHeader('last-modified', stats.mtime)

					self.responseFile(path, response)
				else
					response.statusCode = 304

					response.end()

#### ———————————————————————————————————————

module.exports = AHandler
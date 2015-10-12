#### ———————————————————————————————————————
##   HTTP Root Handler
#### Provides root handling
#### ———————————————————————————————————————

URL = require("url")

AHandler = require("./AHandler")

#### ———————————————————————————————————————

class ResourceHandler extends AHandler
	constructor: (@request, @response) ->

	execute: ->
		data = URL.parse(@request.url, true)
		path = data.pathname

		@responseFileCached path

#### ———————————————————————————————————————

module.exports = ResourceHandler
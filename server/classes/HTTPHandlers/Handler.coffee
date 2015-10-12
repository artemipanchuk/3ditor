#### ———————————————————————————————————————
##   HTTP Root Handler
#### Provides root handling
#### ———————————————————————————————————————

AHandler = require("./AHandler")

#### ———————————————————————————————————————

class Handler extends AHandler
	constructor: (@request, @response) ->

	execute: ->
		@responseFileCached "client/pages/index.html"

#### ———————————————————————————————————————

module.exports = Handler
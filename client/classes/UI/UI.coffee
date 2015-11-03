define ['text!templates/ui.html', 'css!styles/ui'], (tmplUI) ->
	class @UI
		constructor: ->
			$.templates
				tmplUI: tmplUI

			$.templates.tmplUI.link 'body', @
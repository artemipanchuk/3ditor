define([
	"text!templates/menu.html",
	"css!styles/menu"
], function(tmplUI) {
	this.Menu = (function() {
		function Menu () {
			$.templates({
				tmplUI: tmplUI
			});

			$.templates.tmplUI.link("body", this);
		}

		Menu.prototype.switchToEdit = function() {
			requirejs(['classes/Editor'], function() {
				new Editor;

				$("#homeSection").toggleClass("active");
				$("#editorSection").toggleClass("active");
			});
		};

		Menu.prototype.switchToLoad = function() {
			$("#homeSection").toggleClass("active");
			$("#loaderSection").toggleClass("active");
		};

		return Menu;
	})();
});
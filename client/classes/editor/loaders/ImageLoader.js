ImageLoader = function () {};

ImageLoader.prototype = new Loader();
ImageLoader.prototype.constructor = ImageLoader;

ImageLoader.prototype.load = function (url, callback) {
	var that = this;
	var image = new Image();

	image.onload = function () {
		callback(image);

		that.onLoadComplete();
	};

	image.crossOrigin = this.crossOrigin;
	image.src = path;

	that.onLoadStart();
};
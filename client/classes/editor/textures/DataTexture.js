DataTexture = function (data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter) {
	Texture.call(this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type);

	this.image = { data: data, width: width, height: height };
};

DataTexture.prototype = new Texture();
DataTexture.prototype.constructor = DataTexture;

DataTexture.prototype.clone = function () {
	var clonedTexture = new DataTexture(this.image.data,  this.image.width, this.image.height, this.format, this.type, this.mapping, this.wrapS, this.wrapT, this.magFilter, this.minFilter);

	clonedTexture.offset.copy(this.offset);
	clonedTexture.repeat.copy(this.repeat);

	return clonedTexture;
};
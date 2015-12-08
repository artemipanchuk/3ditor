Texture = function (image, mapping, wrapS, wrapT, magFilter, minFilter, format, type) {
	this.id = TextureCount ++;

	this.image = image;

	this.mapping = mapping !== undefined ? mapping : new UVMapping();

	this.wrapS = wrapS !== undefined ? wrapS : ClampToEdgeWrapping;
	this.wrapT = wrapT !== undefined ? wrapT : ClampToEdgeWrapping;

	this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;
	this.minFilter = minFilter !== undefined ? minFilter : LinearMipMapLinearFilter;

	this.format = format !== undefined ? format : RGBAFormat;
	this.type = type !== undefined ? type : UnsignedByteType;

	this.offset = new Vector2(0, 0);
	this.repeat = new Vector2(1, 1);

	this.generateMipmaps = true;
	this.premultiplyAlpha = false;

	this.needsUpdate = false;
	this.onUpdate = null;
};

Texture.prototype = {
	constructor: Texture,

	clone: function () {
		var clonedTexture = new Texture(this.image, this.mapping, this.wrapS, this.wrapT, this.magFilter, this.minFilter, this.format, this.type);

		clonedTexture.offset.copy(this.offset);
		clonedTexture.repeat.copy(this.repeat);

		return clonedTexture;
	}
};

window.TextureCount = 0;

window.MultiplyOperation = 0;
window.MixOperation = 1;

UVMapping = function () {};

CubeReflectionMapping = function () {};
CubeRefractionMapping = function () {};

SphericalReflectionMapping = function () {};
SphericalRefractionMapping = function () {};

window.RepeatWrapping = 0;
window.ClampToEdgeWrapping = 1;
window.MirroredRepeatWrapping = 2;

window.NearestFilter = 3;
window.NearestMipMapNearestFilter = 4;
window.NearestMipMapLinearFilter = 5;
window.LinearFilter = 6;
window.LinearMipMapNearestFilter = 7;
window.LinearMipMapLinearFilter = 8;

window.ByteType = 9;
window.UnsignedByteType = 10;
window.ShortType = 11;
window.UnsignedShortType = 12;
window.IntType = 13;
window.UnsignedIntType = 14;
window.FloatType = 15;

window.AlphaFormat = 16;
window.RGBFormat = 17;
window.RGBAFormat = 18;
window.LuminanceFormat = 19;
window.LuminanceAlphaFormat = 20;
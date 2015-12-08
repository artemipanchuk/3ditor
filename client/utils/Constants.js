define([], function() {
	Math.HALFPI = 1.5707963267948966;
	Math.EPSILON = Math.pow(2, -52);

	if (Math.sign === undefined) {
		Math.sign = function (x) {
			return (x < 0) ? - 1 : (x > 0) ? 1 : + x;
		};
	}

	if (Function.prototype.name === undefined && Object.defineProperty !== undefined) {
		Object.defineProperty(Function.prototype, 'name', {
			get: function () {
				return this.toString().match(/^\s*function\s*(\S*)\s*\(/)[ 1 ];
			}
		});
	}

	this.MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };

	this.CullFaceNone = 0;
	this.CullFaceBack = 1;
	this.CullFaceFront = 2;
	this.CullFaceFrontBack = 3;

	this.FrontFaceDirectionCW = 0;
	this.FrontFaceDirectionCCW = 1;

	// SHADOWING TYPES

	this.BasicShadowMap = 0;
	this.PCFShadowMap = 1;
	this.PCFSoftShadowMap = 2;

	// MATERIAL CONSTANTS

	// side

	this.FrontSide = 0;
	this.BackSide = 1;
	this.DoubleSide = 2;

	// shading

	this.FlatShading = 1;
	this.SmoothShading = 2;

	// colors

	this.NoColors = 0;
	this.FaceColors = 1;
	this.VertexColors = 2;

	// blending modes

	this.NoBlending = 0;
	this.NormalBlending = 1;
	this.AdditiveBlending = 2;
	this.SubtractiveBlending = 3;
	this.MultiplyBlending = 4;
	this.CustomBlending = 5;

	// custom blending equations
	// (numbers start from 100 not to clash with other
	// mappings to OpenGL constants defined in Texture.js)

	this.AddEquation = 100;
	this.SubtractEquation = 101;
	this.ReverseSubtractEquation = 102;
	this.MinEquation = 103;
	this.MaxEquation = 104;

	// custom blending destination factors

	this.ZeroFactor = 200;
	this.OneFactor = 201;
	this.SrcColorFactor = 202;
	this.OneMinusSrcColorFactor = 203;
	this.SrcAlphaFactor = 204;
	this.OneMinusSrcAlphaFactor = 205;
	this.DstAlphaFactor = 206;
	this.OneMinusDstAlphaFactor = 207;

	// custom blending source factors

	//this.ZeroFactor = 200;
	//this.OneFactor = 201;
	//this.SrcAlphaFactor = 204;
	//this.OneMinusSrcAlphaFactor = 205;
	//this.DstAlphaFactor = 206;
	//this.OneMinusDstAlphaFactor = 207;
	this.DstColorFactor = 208;
	this.OneMinusDstColorFactor = 209;
	this.SrcAlphaSaturateFactor = 210;

	// depth modes

	this.NeverDepth = 0;
	this.AlwaysDepth = 1;
	this.LessDepth = 2;
	this.LessEqualDepth = 3;
	this.EqualDepth = 4;
	this.GreaterEqualDepth = 5;
	this.GreaterDepth = 6;
	this.NotEqualDepth = 7;


	// TEXTURE CONSTANTS

	this.MultiplyOperation = 0;
	this.MixOperation = 1;
	this.AddOperation = 2;

	// Mapping modes

	this.UVMapping = 300;

	this.CubeReflectionMapping = 301;
	this.CubeRefractionMapping = 302;

	this.EquirectangularReflectionMapping = 303;
	this.EquirectangularRefractionMapping = 304;

	this.SphericalReflectionMapping = 305;

	// Wrapping modes

	this.RepeatWrapping = 1000;
	this.ClampToEdgeWrapping = 1001;
	this.MirroredRepeatWrapping = 1002;

	// Filters

	this.NearestFilter = 1003;
	this.NearestMipMapNearestFilter = 1004;
	this.NearestMipMapLinearFilter = 1005;
	this.LinearFilter = 1006;
	this.LinearMipMapNearestFilter = 1007;
	this.LinearMipMapLinearFilter = 1008;

	// Data types

	this.UnsignedByteType = 1009;
	this.ByteType = 1010;
	this.ShortType = 1011;
	this.UnsignedShortType = 1012;
	this.IntType = 1013;
	this.UnsignedIntType = 1014;
	this.FloatType = 1015;
	this.HalfFloatType = 1025;

	// Pixel types

	//this.UnsignedByteType = 1009;
	this.UnsignedShort4444Type = 1016;
	this.UnsignedShort5551Type = 1017;
	this.UnsignedShort565Type = 1018;

	// Pixel formats

	this.AlphaFormat = 1019;
	this.RGBFormat = 1020;
	this.RGBAFormat = 1021;
	this.LuminanceFormat = 1022;
	this.LuminanceAlphaFormat = 1023;
	// this.RGBEFormat handled as this.RGBAFormat in shaders
	this.RGBEFormat = this.RGBAFormat; //1024;

	// DDS / ST3C Compressed texture formats

	this.RGB_S3TC_DXT1_Format = 2001;
	this.RGBA_S3TC_DXT1_Format = 2002;
	this.RGBA_S3TC_DXT3_Format = 2003;
	this.RGBA_S3TC_DXT5_Format = 2004;


	// PVRTC compressed texture formats

	this.RGB_PVRTC_4BPPV1_Format = 2100;
	this.RGB_PVRTC_2BPPV1_Format = 2101;
	this.RGBA_PVRTC_4BPPV1_Format = 2102;
	this.RGBA_PVRTC_2BPPV1_Format = 2103;

	// Loop styles for AnimationAction

	this.LoopOnce = 2200;
	this.LoopRepeat = 2201;
	this.LoopPingPong = 2202;
});
Material = function (parameters) {
	parameters = parameters || {};

	this.id = MaterialCount ++;

	this.name = '';

	this.opacity = parameters.opacity !== undefined ? parameters.opacity : 1;
	this.transparent = parameters.transparent !== undefined ? parameters.transparent : false;

	this.blending = parameters.blending !== undefined ? parameters.blending : NormalBlending;

	this.blendSrc = parameters.blendSrc !== undefined ? parameters.blendSrc : SrcAlphaFactor;
	this.blendDst = parameters.blendDst !== undefined ? parameters.blendDst : OneMinusSrcAlphaFactor;
	this.blendEquation = parameters.blendEquation !== undefined ? parameters.blendEquation : AddEquation;

	this.depthTest = parameters.depthTest !== undefined ? parameters.depthTest : true;
	this.depthWrite = parameters.depthWrite !== undefined ? parameters.depthWrite : true;

	this.polygonOffset = parameters.polygonOffset !== undefined ? parameters.polygonOffset : false;
	this.polygonOffsetFactor = parameters.polygonOffsetFactor !== undefined ? parameters.polygonOffsetFactor : 0;
	this.polygonOffsetUnits = parameters.polygonOffsetUnits !== undefined ? parameters.polygonOffsetUnits : 0;

	this.alphaTest = parameters.alphaTest !== undefined ? parameters.alphaTest : 0;

	this.overdraw = parameters.overdraw !== undefined ? parameters.overdraw : false;

	this.visible = true;

	this.needsUpdate = true;
}

MaterialCount = 0;

NoShading = 0;
FlatShading = 1;
SmoothShading = 2;

NoColors = 0;
FaceColors = 1;
VertexColors = 2;

NoBlending = 0;
NormalBlending = 1;
AdditiveBlending = 2;
SubtractiveBlending = 3;
MultiplyBlending = 4;
AdditiveAlphaBlending = 5;
CustomBlending = 6;

AddEquation = 100;
SubtractEquation = 101;
ReverseSubtractEquation = 102;

ZeroFactor = 200;
OneFactor = 201;
SrcColorFactor = 202;
OneMinusSrcColorFactor = 203;
SrcAlphaFactor = 204;
OneMinusSrcAlphaFactor = 205;
DstAlphaFactor = 206;
OneMinusDstAlphaFactor = 207;
DstColorFactor = 208;
OneMinusDstColorFactor = 209;
SrcAlphaSaturateFactor = 210;
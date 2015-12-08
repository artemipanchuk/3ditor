BufferGeometry = function () {
	this.id = GeometryCount ++;

	this.vertexIndexBuffer = null;
	this.vertexPositionBuffer = null;
	this.vertexNormalBuffer = null;
	this.vertexUvBuffer = null;
	this.vertexColorBuffer = null;

	this.vertexIndexArray = null;
	this.vertexPositionArray = null;
	this.vertexNormalArray = null;
	this.vertexUvArray = null;
	this.vertexColorArray = null;

	this.dynamic = false;

	this.boundingBox = null;
	this.boundingSphere = null;

	this.morphTargets = [];
};

BufferGeometry.prototype = {
	constructor : BufferGeometry,

	computeBoundingBox: function () {
	},

	computeBoundingSphere: function () {
	}
};
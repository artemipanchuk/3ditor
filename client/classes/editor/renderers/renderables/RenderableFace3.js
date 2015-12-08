RenderableFace3 = function () {
	this.v1 = new RenderableVertex();
	this.v2 = new RenderableVertex();
	this.v3 = new RenderableVertex();

	this.centroidWorld = new Vector3();
	this.centroidScreen = new Vector3();

	this.normalWorld = new Vector3();
	this.vertexNormalsWorld = [new Vector3(), new Vector3(), new Vector3()];

	this.material = null;
	this.faceMaterial = null;
	this.uvs = [[]];

	this.z = null;
};
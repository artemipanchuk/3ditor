RenderableVertex = function () {
	this.positionWorld = new Vector3();
	this.positionScreen = new Vector4();

	this.visible = true;
};

RenderableVertex.prototype.copy = function (vertex) {
	this.positionWorld.copy(vertex.positionWorld);
	this.positionScreen.copy(vertex.positionScreen);
}
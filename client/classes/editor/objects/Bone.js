Bone = function(belongsToSkin) {
	Object3D.call(this);

	this.skin = belongsToSkin;
	this.skinMatrix = new Matrix4();
};

Bone.prototype = new Object3D();
Bone.prototype.constructor = Bone;
Bone.prototype.supr = Object3D.prototype;

Bone.prototype.update = function(parentSkinMatrix, forceUpdate) {
	if (this.matrixAutoUpdate) {
		forceUpdate |= this.updateMatrix();
	}

	if (forceUpdate || this.matrixWorldNeedsUpdate) {
		if(parentSkinMatrix) {
			this.skinMatrix.multiply(parentSkinMatrix, this.matrix);
		} else {
			this.skinMatrix.copy(this.matrix);
		}

		this.matrixWorldNeedsUpdate = false;
		forceUpdate = true;
	}

	var child, i, l = this.children.length;

	for (i = 0; i < l; i ++) {
		this.children[i].update(this.skinMatrix, forceUpdate);
	}
};
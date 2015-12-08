Sprite = function (parameters) {
	Object3D.call(this);

	this.color = (parameters.color !== undefined) ? new Color(parameters.color) : new Color(0xffffff);
	this.map = (parameters.map !== undefined) ? parameters.map : new Texture();

	this.blending = (parameters.blending !== undefined) ? parameters.blending : NormalBlending;

	this.blendSrc = parameters.blendSrc !== undefined ? parameters.blendSrc : SrcAlphaFactor;
	this.blendDst = parameters.blendDst !== undefined ? parameters.blendDst : OneMinusSrcAlphaFactor;
	this.blendEquation = parameters.blendEquation !== undefined ? parameters.blendEquation : AddEquation;

	this.useScreenCoordinates = (parameters.useScreenCoordinates !== undefined) ? parameters.useScreenCoordinates : true;
	this.mergeWith3D = (parameters.mergeWith3D !== undefined) ? parameters.mergeWith3D : !this.useScreenCoordinates;
	this.affectedByDistance = (parameters.affectedByDistance !== undefined) ? parameters.affectedByDistance : !this.useScreenCoordinates;
	this.scaleByViewport = (parameters.scaleByViewport !== undefined) ? parameters.scaleByViewport : !this.affectedByDistance;
	this.alignment = (parameters.alignment instanceof Vector2) ? parameters.alignment : SpriteAlignment.center;

	this.rotation3d = this.rotation;
	this.rotation = 0;
	this.opacity = 1;

	this.uvOffset = new Vector2(0, 0);
	this.uvScale  = new Vector2(1, 1);
};

Sprite.prototype = new Object3D();
Sprite.prototype.constructor = Sprite;

Sprite.prototype.updateMatrix = function () {
	this.matrix.setPosition(this.position);

	this.rotation3d.set(0, 0, this.rotation);
	this.matrix.setRotationFromEuler(this.rotation3d);

	if (this.scale.x !== 1 || this.scale.y !== 1) {
		this.matrix.scale(this.scale);
		this.boundRadiusScale = Math.max(this.scale.x, this.scale.y);
	}

	this.matrixWorldNeedsUpdate = true;
};

SpriteAlignment = {};
SpriteAlignment.topLeft = new Vector2(1, -1);
SpriteAlignment.topCenter = new Vector2(0, -1);
SpriteAlignment.topRight = new Vector2(-1, -1);
SpriteAlignment.centerLeft = new Vector2(1, 0);
SpriteAlignment.center = new Vector2(0, 0);
SpriteAlignment.centerRight = new Vector2(-1, 0);
SpriteAlignment.bottomLeft = new Vector2(1, 1);
SpriteAlignment.bottomCenter = new Vector2(0, 1);
SpriteAlignment.bottomRight = new Vector2(-1, 1);
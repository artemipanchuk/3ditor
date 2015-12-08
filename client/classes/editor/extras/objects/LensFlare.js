LensFlare = function (texture, size, distance, blending, color) {
	Object3D.call(this);

	this.lensFlares = [];

	this.positionScreen = new Vector3();
	this.customUpdateCallback = undefined;

	if(texture !== undefined) {
		this.add(texture, size, distance, blending, color);
	}
};

LensFlare.prototype = new Object3D();
LensFlare.prototype.constructor = LensFlare;
LensFlare.prototype.supr = Object3D.prototype;

LensFlare.prototype.add = function (texture, size, distance, blending, color, opacity) {
	if(size === undefined) size = -1;
	if(distance === undefined) distance = 0;
	if(opacity === undefined) opacity = 1;
	if(color === undefined) color = new Color(0xffffff);
	if(blending === undefined) blending = NormalBlending;

	distance = Math.min(distance, Math.max(0, distance));

	this.lensFlares.push({ texture: texture,
		                    size: size,
		                    distance: distance,
		                    x: 0, y: 0, z: 0,
		                    scale: 1,
		                    rotation: 1,
		                    opacity: opacity,
							color: color,
		                    blending: blending });
};

LensFlare.prototype.updateLensFlares = function () {
	var f, fl = this.lensFlares.length;
	var flare;
	var vecX = -this.positionScreen.x * 2;
	var vecY = -this.positionScreen.y * 2;

	for(f = 0; f < fl; f ++) {
		flare = this.lensFlares[f];

		flare.x = this.positionScreen.x + vecX * flare.distance;
		flare.y = this.positionScreen.y + vecY * flare.distance;

		flare.wantedRotation = flare.x * Math.PI * 0.25;
		flare.rotation += (flare.wantedRotation - flare.rotation) * 0.25;
	}
};
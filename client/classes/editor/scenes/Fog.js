Fog = function (hex, near, far) {
	this.color = new Color(hex);

	this.near = (near !== undefined) ? near : 1;
	this.far = (far !== undefined) ? far : 1000;
};
FogExp2 = function (hex, density) {
	this.color = new Color(hex);
	this.density = (density !== undefined) ? density : 0.00025;
};
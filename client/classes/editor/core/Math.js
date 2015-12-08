Math.clamp = function(x, a, b) {
	return (x < a) ? a : ((x > b) ? b : x);
};

Math.clampBottom = function(x, a) {
	return x < a ? a : x;
};

Math.mapLinear = function(x, a1, a2, b1, b2) {
	return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
};

Math.random16 = function() {
	return (65280 * Math.random() + 255 * Math.random()) / 65535;
};

Math.randInt = function(low, high) {
	return low + Math.floor(Math.random() * (high - low + 1));
};

Math.randFloat = function(low, high) {
	return low + Math.random() * (high - low);
};

Math.randFloatSpread = function(range) {
	return range * (0.5 - Math.random());
};

Math.sign = function(x) {
	return (x < 0) ? -1 : ((x > 0) ? 1 : 0);
};

Math.HALFPI = 1.5707963267948966;
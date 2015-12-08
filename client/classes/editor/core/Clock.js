Clock = function (autoStart) {
	this.autoStart = (autoStart !== undefined) ? autoStart : true;

	this.startTime = 0;
	this.oldTime = 0;
	this.elapsedTime = 0;

	this.running = false;
};

Clock.prototype.start = function () {
	this.startTime = Date.now();
	this.oldTime = this.startTime;

	this.running = true;
};

Clock.prototype.stop = function () {
	this.getElapsedTime();

	this.running = false;
};

Clock.prototype.getElapsedTime = function () {
	this.elapsedTime += this.getDelta();

	return this.elapsedTime;
};

Clock.prototype.getDelta = function () {
	var diff = 0;

	if (this.autoStart && ! this.running) {
		this.start();
	}

	if (this.running) {
		var newTime = Date.now();
		diff = 0.001 * (newTime - this.oldTime);
		this.oldTime = newTime;

		this.elapsedTime += diff;
	}

	return diff;
};
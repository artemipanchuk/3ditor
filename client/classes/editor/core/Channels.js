define([], function() {
	this.Channels = function() {
		function Channels() {
			this.mask = 1;
		};

		Channels.prototype = {
			constructor: Channels,

			set: function(channel) {
				this.mask = 1 << channel;
			},

			enable: function(channel) {
				this.mask |= 1 << channel;
			},

			toggle: function(channel) {
				this.mask ^= 1 << channel;
			},

			disable: function(channel) {
				this.mask &= ~ (1 << channel);
			}
		};

		return Channels;
	}();
});
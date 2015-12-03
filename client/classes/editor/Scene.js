define([
	"classes/editor/core/Object3D"
], function() {
	this.Scene = (function () {
		function Scene() {
			Object3D.call(this);

			this.type = 'Scene';

			this.fog = null;
			this.overrideMaterial = null;

			this.autoUpdate = true;
		}

		Scene.prototype = Object.create(Object3D.prototype);
		Scene.prototype.constructor = Scene;

		Scene.prototype.copy = function (source) {
			Object3D.prototype.copy.call(this, source);

			if (source.fog !== null)
				this.fog = source.fog.clone();

			if (source.overrideMaterial !== null)
				this.overrideMaterial = source.overrideMaterial.clone();

			this.autoUpdate       = source.autoUpdate;
			this.matrixAutoUpdate = source.matrixAutoUpdate;

			return this;
		};

		return Scene;
	})();
});
define([
	"classes/editor/core/Object3D"
], function() {
	this.Camera = function() {
		function Camera() {
			Object3D.call(this);

			this.type = 'Camera';

			this.matrixWorldInverse = new Matrix4();
			this.projectionMatrix   = new Matrix4();
		}

		Camera.prototype = Object.create(Object3D.prototype);
		Camera.prototype.constructor = Camera;

		Camera.prototype.getWorldDirection = function () {
			var quaternion = new Quaternion();

			return function(optionalTarget) {
				var result = optionalTarget || new Vector3();

				this.getWorldQuaternion(quaternion);

				return result.set(0, 0, - 1).applyQuaternion(quaternion);
			};
		}();

		Camera.prototype.lookAt = function() {
			var m1 = new Matrix4();

			return function(vector) {
				m1.lookAt(this.position, vector, this.up);

				this.quaternion.setFromRotationMatrix(m1);
			};
		}();

		Camera.prototype.clone = function() {
			return new this.constructor().copy(this);
		};

		Camera.prototype.copy = function(source) {
			Object3D.prototype.copy.call(this, source);

			this.matrixWorldInverse.copy(source.matrixWorldInverse);
			this.projectionMatrix.copy(source.projectionMatrix);

			return this;
		};

		return Camera;
	}();
});
define([
	"classes/editor/structures/Vector3",
	"classes/editor/structures/Matrix3"
], function() {
	this.Plane = function() {
		function Plane(normal, constant) {
			this.normal = (normal !== undefined) ? normal : new Vector3(1, 0, 0);
			this.constant = (constant !== undefined) ? constant : 0;
		};

		Plane.prototype = {
			constructor: Plane,

			set: function (normal, constant) {
				this.normal.copy(normal);
				this.constant = constant;

				return this;
			},

			setComponents: function (x, y, z, w) {
				this.normal.set(x, y, z);
				this.constant = w;

				return this;
			},

			setFromNormalAndCoplanarPoint: function (normal, point) {
				this.normal.copy(normal);
				this.constant = - point.dot(this.normal);

				return this;
			},

			setFromCoplanarPoints: function () {
				var v1 = new Vector3();
				var v2 = new Vector3();

				return function (a, b, c) {
					var normal = v1.subVectors(c, b).cross(v2.subVectors(a, b)).normalize();

					this.setFromNormalAndCoplanarPoint(normal, a);

					return this;
				};
			}(),

			clone: function () {
				return new this.constructor().copy(this);
			},

			copy: function (plane) {
				this.normal.copy(plane.normal);
				this.constant = plane.constant;

				return this;
			},

			normalize: function () {
				var inverseNormalLength = 1.0 / this.normal.length();
				this.normal.multiplyScalar(inverseNormalLength);
				this.constant *= inverseNormalLength;

				return this;
			},

			negate: function () {
				this.constant *= - 1;
				this.normal.negate();

				return this;
			},

			distanceToPoint: function (point) {
				return this.normal.dot(point) + this.constant;
			},

			distanceToSphere: function (sphere) {
				return this.distanceToPoint(sphere.center) - sphere.radius;
			},

			projectPoint: function (point, optionalTarget) {
				return this.orthoPoint(point, optionalTarget).sub(point).negate();
			},

			orthoPoint: function (point, optionalTarget) {
				var perpendicularMagnitude = this.distanceToPoint(point);

				var result = optionalTarget || new Vector3();
				return result.copy(this.normal).multiplyScalar(perpendicularMagnitude);
			},

			isIntersectionLine: function (line) {
				var startSign = this.distanceToPoint(line.start);
				var endSign = this.distanceToPoint(line.end);

				return (startSign < 0 && endSign > 0) || (endSign < 0 && startSign > 0);
			},

			intersectLine: function () {
				var v1 = new Vector3();

				return function (line, optionalTarget) {
					var result = optionalTarget || new Vector3();

					var direction = line.delta(v1);

					var denominator = this.normal.dot(direction);

					if (denominator === 0) {
						if (this.distanceToPoint(line.start) === 0) {
							return result.copy(line.start);
						}

						return undefined;
					}

					var t = - (line.start.dot(this.normal) + this.constant) / denominator;

					if (t < 0 || t > 1) {
						return undefined;
					}

					return result.copy(direction).multiplyScalar(t).add(line.start);
				};
			}(),


			coplanarPoint: function (optionalTarget) {
				var result = optionalTarget || new Vector3();
				return result.copy(this.normal).multiplyScalar(- this.constant);
			},

			applyMatrix4: function () {
				var v1 = new Vector3();
				var v2 = new Vector3();
				var m1 = new Matrix3();

				return function (matrix, optionalNormalMatrix) {
					var normalMatrix = optionalNormalMatrix || m1.getNormalMatrix(matrix);
					var newNormal = v1.copy(this.normal).applyMatrix3(normalMatrix);

					var newCoplanarPoint = this.coplanarPoint(v2);
					newCoplanarPoint.applyMatrix4(matrix);

					this.setFromNormalAndCoplanarPoint(newNormal, newCoplanarPoint);

					return this;
				};
			}(),

			translate: function (offset) {
				this.constant = this.constant - offset.dot(this.normal);

				return this;
			},

			equals: function (plane) {
				return plane.normal.equals(this.normal) && (plane.constant === this.constant);
			}
		};

		return Plane;
	}();
});
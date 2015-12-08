CubeCamera = function (near, far, cubeResolution) {
	Object3D.call(this);

	var fov = 90, aspect = 1;

	var cameraPX = new PerspectiveCamera(fov, aspect, near, far);
	cameraPX.up.set(0, -1, 0);
	cameraPX.lookAt(new Vector3(1, 0, 0));
	this.add(cameraPX);

	var cameraNX = new PerspectiveCamera(fov, aspect, near, far);
	cameraNX.up.set(0, -1, 0);
	cameraNX.lookAt(new Vector3(-1, 0, 0));
	this.add(cameraNX);

	var cameraPY = new PerspectiveCamera(fov, aspect, near, far);
	cameraPY.up.set(0, 0, 1);
	cameraPY.lookAt(new Vector3(0, 1, 0));
	this.add(cameraPY);

	var cameraNY = new PerspectiveCamera(fov, aspect, near, far);
	cameraNY.up.set(0, 0, -1);
	cameraNY.lookAt(new Vector3(0, -1, 0));
	this.add(cameraNY);

	var cameraPZ = new PerspectiveCamera(fov, aspect, near, far);
	cameraPZ.up.set(0, -1, 0);
	cameraPZ.lookAt(new Vector3(0, 0, 1));
	this.add(cameraPZ);

	var cameraNZ = new PerspectiveCamera(fov, aspect, near, far);
	cameraNZ.up.set(0, -1, 0);
	cameraNZ.lookAt(new Vector3(0, 0, -1));
	this.add(cameraNZ);

	this.renderTarget = new WebGLRenderTargetCube(cubeResolution, cubeResolution, { format: RGBFormat, magFilter: LinearFilter, minFilter: LinearFilter });

	this.updateCubeMap = function (renderer, scene) {
		var renderTarget = this.renderTarget;
		var generateMipmaps = renderTarget.generateMipmaps;

		renderTarget.generateMipmaps = false;

		renderTarget.activeCubeFace = 0;
		renderer.render(scene, cameraPX, renderTarget);

		renderTarget.activeCubeFace = 1;
		renderer.render(scene, cameraNX, renderTarget);

		renderTarget.activeCubeFace = 2;
		renderer.render(scene, cameraPY, renderTarget);

		renderTarget.activeCubeFace = 3;
		renderer.render(scene, cameraNY, renderTarget);

		renderTarget.activeCubeFace = 4;
		renderer.render(scene, cameraPZ, renderTarget);

		renderTarget.generateMipmaps = generateMipmaps;

		renderTarget.activeCubeFace = 5;
		renderer.render(scene, cameraNZ, renderTarget);
	};
};

CubeCamera.prototype = new Object3D();
CubeCamera.prototype.constructor = CubeCamera;
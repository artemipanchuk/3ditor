DepthPassPlugin = function () {
	this.enabled = false;
	this.renderTarget = null;

	var _gl,
	_renderer,
	_depthMaterial, _depthMaterialMorph,

	_frustum = new Frustum(),
	_projScreenMatrix = new Matrix4();

	this.init = function (renderer) {
		_gl = renderer.context;
		_renderer = renderer;

		var depthShader = ShaderLib["depthRGBA"];
		var depthUniforms = UniformsUtils.clone(depthShader.uniforms);

		_depthMaterial = new ShaderMaterial({ fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms });
		_depthMaterialMorph = new ShaderMaterial({ fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, morphTargets: true });

		_depthMaterial._shadowPass = true;
		_depthMaterialMorph._shadowPass = true;
	};

	this.render = function (scene, camera) {
		if (! this.enabled) return;

		this.update(scene, camera);
	};

	this.update = function (scene, camera) {
		var i, il, j, jl, n,

		program, buffer, material,
		webglObject, object, light,
		renderList,

		fog = null;

		_gl.clearColor(1, 1, 1, 1);
		_gl.disable(_gl.BLEND);

		_renderer.setDepthTest(true);

		if (_renderer.autoUpdateScene) scene.updateMatrixWorld();

		if (! camera._viewMatrixArray) camera._viewMatrixArray = new Float32Array(16);
		if (! camera._projectionMatrixArray) camera._projectionMatrixArray = new Float32Array(16);

		camera.matrixWorldInverse.getInverse(camera.matrixWorld);

		camera.matrixWorldInverse.flattenToArray(camera._viewMatrixArray);
		camera.projectionMatrix.flattenToArray(camera._projectionMatrixArray);

		_projScreenMatrix.multiply(camera.projectionMatrix, camera.matrixWorldInverse);
		_frustum.setFromMatrix(_projScreenMatrix);

		_renderer.setRenderTarget(this.renderTarget);
		_renderer.clear();

		renderList = scene.__webglObjects;

		for (j = 0, jl = renderList.length; j < jl; j ++) {
			webglObject = renderList[j];
			object = webglObject.object;

			webglObject.render = false;

			if (object.visible) {
				if (! (object instanceof Mesh) || ! (object.frustumCulled) || _frustum.contains(object)) {
					object._modelViewMatrix.multiply(camera.matrixWorldInverse, object.matrixWorld);

					webglObject.render = true;
				}
			}
		}

		for (j = 0, jl = renderList.length; j < jl; j ++) {
			webglObject = renderList[j];

			if (webglObject.render) {
				object = webglObject.object;
				buffer = webglObject.buffer;

				_renderer.setObjectFaces(object);

				if (object.customDepthMaterial) {
					material = object.customDepthMaterial;
				} else if (object.geometry.morphTargets.length) {
					material = _depthMaterialMorph;
				} else {
					material = _depthMaterial;
				}

				if (buffer instanceof BufferGeometry) {
					_renderer.renderBufferDirect(camera, scene.__lights, fog, material, buffer, object);
				} else {
					_renderer.renderBuffer(camera, scene.__lights, fog, material, buffer, object);
				}
			}
		}

		renderList = scene.__webglObjectsImmediate;

		for (j = 0, jl = renderList.length; j < jl; j ++) {
			webglObject = renderList[j];
			object = webglObject.object;

			if (object.visible && object.castShadow) {

				object._modelViewMatrix.multiply(camera.matrixWorldInverse, object.matrixWorld);

				_renderer.renderImmediateObject(camera, scene.__lights, fog, _depthMaterial, object);
			}
		}

		var clearColor = _renderer.getClearColor(),
		clearAlpha = _renderer.getClearAlpha();

		_gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearAlpha);
		_gl.enable(_gl.BLEND);
	};
};
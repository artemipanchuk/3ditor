ShadowMapPlugin = function () {
	var _gl,
	_renderer,
	_depthMaterial, _depthMaterialMorph,

	_frustum = new Frustum(),
	_projScreenMatrix = new Matrix4(),

	_min = new Vector3(),
	_max = new Vector3();

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
		if (! (_renderer.shadowMapEnabled && _renderer.shadowMapAutoUpdate)) return;

		this.update(scene, camera);
	};

	this.update = function (scene, camera) {
		var i, il, j, jl, n,

		shadowMap, shadowMatrix, shadowCamera,
		program, buffer, material,
		webglObject, object, light,
		renderList,

		lights = [],
		k = 0,

		fog = null;

		_gl.clearColor(1, 1, 1, 1);
		_gl.disable(_gl.BLEND);

		_gl.enable(_gl.CULL_FACE);

		if (_renderer.shadowMapCullFrontFaces) {
			_gl.cullFace(_gl.FRONT);
		} else {
			_gl.cullFace(_gl.BACK);
		}

		_renderer.setDepthTest(true);

		for (i = 0, il = scene.__lights.length; i < il; i ++) {
			light = scene.__lights[i];

			if (! light.castShadow) continue;

			if ((light instanceof DirectionalLight) && light.shadowCascade) {
				for (n = 0; n < light.shadowCascadeCount; n ++) {
					var virtualLight;

					if (! light.shadowCascadeArray[n]) {
						virtualLight = createVirtualLight(light, n);
						virtualLight.originalCamera = camera;

						var gyro = new Gyroscope();
						gyro.position = light.shadowCascadeOffset;

						gyro.add(virtualLight);
						gyro.add(virtualLight.target);

						camera.add(gyro);

						light.shadowCascadeArray[n] = virtualLight;

						console.log("Created virtualLight", virtualLight);
					} else {
						virtualLight = light.shadowCascadeArray[n];
					}

					updateVirtualLight(light, n);

					lights[k] = virtualLight;
					k ++;
				}
			} else {
				lights[k] = light;
				k ++;
			}
		}

		for (i = 0, il = lights.length; i < il; i ++) {
			light = lights[i];

			if (! light.shadowMap) {
				var pars = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat };

				light.shadowMap = new WebGLRenderTarget(light.shadowMapWidth, light.shadowMapHeight, pars);
				light.shadowMapSize = new Vector2(light.shadowMapWidth, light.shadowMapHeight);

				light.shadowMatrix = new Matrix4();
			}

			if (! light.shadowCamera) {
				if (light instanceof SpotLight) {
					light.shadowCamera = new PerspectiveCamera(light.shadowCameraFov, light.shadowMapWidth / light.shadowMapHeight, light.shadowCameraNear, light.shadowCameraFar);
				} else if (light instanceof DirectionalLight) {
					light.shadowCamera = new OrthographicCamera(light.shadowCameraLeft, light.shadowCameraRight, light.shadowCameraTop, light.shadowCameraBottom, light.shadowCameraNear, light.shadowCameraFar);
				} else {
					console.error("Unsupported light type for shadow");
					continue;
				}

				scene.add(light.shadowCamera);

				if (_renderer.autoUpdateScene) scene.updateMatrixWorld();
			}

			if (light.shadowCameraVisible && ! light.cameraHelper) {
				light.cameraHelper = new CameraHelper(light.shadowCamera);
				light.shadowCamera.add(light.cameraHelper);
			}

			if (light.isVirtual && virtualLight.originalCamera == camera) {
				updateShadowCamera(camera, light);
			}

			shadowMap = light.shadowMap;
			shadowMatrix = light.shadowMatrix;
			shadowCamera = light.shadowCamera;

			shadowCamera.position.copy(light.matrixWorld.getPosition());
			shadowCamera.lookAt(light.target.matrixWorld.getPosition());
			shadowCamera.updateMatrixWorld();

			shadowCamera.matrixWorldInverse.getInverse(shadowCamera.matrixWorld);

			if (light.cameraHelper) light.cameraHelper.lines.visible = light.shadowCameraVisible;
			if (light.shadowCameraVisible) light.cameraHelper.update();

			shadowMatrix.set(0.5, 0.0, 0.0, 0.5,
							  0.0, 0.5, 0.0, 0.5,
							  0.0, 0.0, 0.5, 0.5,
							  0.0, 0.0, 0.0, 1.0);

			shadowMatrix.multiplySelf(shadowCamera.projectionMatrix);
			shadowMatrix.multiplySelf(shadowCamera.matrixWorldInverse);

			if (! shadowCamera._viewMatrixArray) shadowCamera._viewMatrixArray = new Float32Array(16);
			if (! shadowCamera._projectionMatrixArray) shadowCamera._projectionMatrixArray = new Float32Array(16);

			shadowCamera.matrixWorldInverse.flattenToArray(shadowCamera._viewMatrixArray);
			shadowCamera.projectionMatrix.flattenToArray(shadowCamera._projectionMatrixArray);

			_projScreenMatrix.multiply(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse);
			_frustum.setFromMatrix(_projScreenMatrix);

			_renderer.setRenderTarget(shadowMap);
			_renderer.clear();

			renderList = scene.__webglObjects;

			for (j = 0, jl = renderList.length; j < jl; j ++) {
				webglObject = renderList[j];
				object = webglObject.object;

				webglObject.render = false;

				if (object.visible && object.castShadow) {
					if (! (object instanceof Mesh) || ! (object.frustumCulled) || _frustum.contains(object)) {
						object._modelViewMatrix.multiply(shadowCamera.matrixWorldInverse, object.matrixWorld);

						webglObject.render = true;
					}
				}
			}

			for (j = 0, jl = renderList.length; j < jl; j ++) {
				webglObject = renderList[j];

				if (webglObject.render) {
					object = webglObject.object;
					buffer = webglObject.buffer;

					if (object.customDepthMaterial) {
						material = object.customDepthMaterial;
					} else if (object.geometry.morphTargets.length) {
						material = _depthMaterialMorph;
					} else {
						material = _depthMaterial;
					}

					if (buffer instanceof BufferGeometry) {
						_renderer.renderBufferDirect(shadowCamera, scene.__lights, fog, material, buffer, object);
					} else {
						_renderer.renderBuffer(shadowCamera, scene.__lights, fog, material, buffer, object);
					}
				}
			}

			renderList = scene.__webglObjectsImmediate;

			for (j = 0, jl = renderList.length; j < jl; j ++) {
				webglObject = renderList[j];
				object = webglObject.object;

				if (object.visible && object.castShadow) {
					object._modelViewMatrix.multiply(shadowCamera.matrixWorldInverse, object.matrixWorld);

					_renderer.renderImmediateObject(shadowCamera, scene.__lights, fog, _depthMaterial, object);
				}
			}
		}

		var clearColor = _renderer.getClearColor(),
		clearAlpha = _renderer.getClearAlpha();

		_gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearAlpha);
		_gl.enable(_gl.BLEND);

		if (_renderer.shadowMapCullFrontFaces) {
			_gl.cullFace(_gl.BACK);
		}
	};

	function createVirtualLight(light, cascade) {
		var virtualLight = new DirectionalLight();

		virtualLight.isVirtual = true;

		virtualLight.onlyShadow = true;
		virtualLight.castShadow = true;

		virtualLight.shadowCameraNear = light.shadowCameraNear;
		virtualLight.shadowCameraFar = light.shadowCameraFar;

		virtualLight.shadowCameraLeft = light.shadowCameraLeft;
		virtualLight.shadowCameraRight = light.shadowCameraRight;
		virtualLight.shadowCameraBottom = light.shadowCameraBottom;
		virtualLight.shadowCameraTop = light.shadowCameraTop;

		virtualLight.shadowCameraVisible = light.shadowCameraVisible;

		virtualLight.shadowDarkness = light.shadowDarkness;

		virtualLight.shadowBias = light.shadowCascadeBias[cascade];
		virtualLight.shadowMapWidth = light.shadowCascadeWidth[cascade];
		virtualLight.shadowMapHeight = light.shadowCascadeHeight[cascade];

		virtualLight.pointsWorld = [];
		virtualLight.pointsFrustum = [];

		var pointsWorld = virtualLight.pointsWorld,
			pointsFrustum = virtualLight.pointsFrustum;

		for (var i = 0; i < 8; i ++) {
			pointsWorld[i] = new Vector3();
			pointsFrustum[i] = new Vector3();
		}

		var nearZ = light.shadowCascadeNearZ[cascade];
		var farZ = light.shadowCascadeFarZ[cascade];

		pointsFrustum[0].set(-1, -1, nearZ);
		pointsFrustum[1].set( 1, -1, nearZ);
		pointsFrustum[2].set(-1,  1, nearZ);
		pointsFrustum[3].set( 1,  1, nearZ);

		pointsFrustum[4].set(-1, -1, farZ);
		pointsFrustum[5].set( 1, -1, farZ);
		pointsFrustum[6].set(-1,  1, farZ);
		pointsFrustum[7].set( 1,  1, farZ);

		return virtualLight;
	}

	function updateVirtualLight(light, cascade) {
		var virtualLight = light.shadowCascadeArray[cascade];

		virtualLight.position.copy(light.position);
		virtualLight.target.position.copy(light.target.position);
		virtualLight.lookAt(virtualLight.target);

		virtualLight.shadowCameraVisible = light.shadowCameraVisible;
		virtualLight.shadowDarkness = light.shadowDarkness;

		virtualLight.shadowBias = light.shadowCascadeBias[cascade];

		var nearZ = light.shadowCascadeNearZ[cascade];
		var farZ = light.shadowCascadeFarZ[cascade];

		var pointsFrustum = virtualLight.pointsFrustum;

		pointsFrustum[0].z = nearZ;
		pointsFrustum[1].z = nearZ;
		pointsFrustum[2].z = nearZ;
		pointsFrustum[3].z = nearZ;

		pointsFrustum[4].z = farZ;
		pointsFrustum[5].z = farZ;
		pointsFrustum[6].z = farZ;
		pointsFrustum[7].z = farZ;
	}

	function updateShadowCamera(camera, light) {
		var shadowCamera = light.shadowCamera,
			pointsFrustum = light.pointsFrustum,
			pointsWorld = light.pointsWorld;

		_min.set(Infinity, Infinity, Infinity);
		_max.set(-Infinity, -Infinity, -Infinity);

		for (var i = 0; i < 8; i ++) {
			var p = pointsWorld[i];

			p.copy(pointsFrustum[i]);
			ShadowMapPlugin.__projector.unprojectVector(p, camera);

			shadowCamera.matrixWorldInverse.multiplyVector3(p);

			if (p.x < _min.x) _min.x = p.x;
			if (p.x > _max.x) _max.x = p.x;

			if (p.y < _min.y) _min.y = p.y;
			if (p.y > _max.y) _max.y = p.y;

			if (p.z < _min.z) _min.z = p.z;
			if (p.z > _max.z) _max.z = p.z;
		}

		shadowCamera.left = _min.x;
		shadowCamera.right = _max.x;
		shadowCamera.top = _max.y;
		shadowCamera.bottom = _min.y;

		shadowCamera.updateProjectionMatrix();
	}
};

ShadowMapPlugin.__projector = new Projector();
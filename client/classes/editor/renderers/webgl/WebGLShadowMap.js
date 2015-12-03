define([
	"classes/editor/structures/Vector4",
	"classes/editor/renderers/shaders/ShaderLib",
	"classes/editor/materials/ShaderMaterial"
], function() {
	this.WebGLShadowMap = function(_renderer, _lights, _objects) {
		var _gl = _renderer.context,
		_state = _renderer.state,
		_frustum = new Frustum(),
		_projScreenMatrix = new Matrix4(),

		_min = new Vector3(),
		_max = new Vector3(),

		_lookTarget = new Vector3(),
		_lightPositionWorld = new Vector3(),

		_renderList = [],

		_MorphingFlag = 1,
		_SkinningFlag = 2,

		_NumberOfMaterialVariants = (_MorphingFlag | _SkinningFlag) + 1,

		_depthMaterials = new Array(_NumberOfMaterialVariants),
		_distanceMaterials = new Array(_NumberOfMaterialVariants);

		var cubeDirections = [
			new Vector3(1, 0, 0), new Vector3(- 1, 0, 0), new Vector3(0, 0, 1),
			new Vector3(0, 0, - 1), new Vector3(0, 1, 0), new Vector3(0, - 1, 0)
		];

		var cubeUps = [
			new Vector3(0, 1, 0), new Vector3(0, 1, 0), new Vector3(0, 1, 0),
			new Vector3(0, 1, 0), new Vector3(0, 0, 1),	new Vector3(0, 0, - 1)
		];

		var cube2DViewPorts = [
			new Vector4(), new Vector4(), new Vector4(),
			new Vector4(), new Vector4(), new Vector4()
		];

		var _vector4 = new Vector4();

		// init

		var depthShader = ShaderLib[ "depthRGBA" ];
		var depthUniforms = UniformsUtils.clone(depthShader.uniforms);

		var distanceShader = ShaderLib[ "distanceRGBA" ];
		var distanceUniforms = UniformsUtils.clone(distanceShader.uniforms);

		for (var i = 0; i !== _NumberOfMaterialVariants; ++ i) {
			var useMorphing = (i & _MorphingFlag) !== 0;
			var useSkinning = (i & _SkinningFlag) !== 0;

			var depthMaterial = new ShaderMaterial({
				uniforms: depthUniforms,
				vertexShader: depthShader.vertexShader,
				fragmentShader: depthShader.fragmentShader,
				morphTargets: useMorphing,
				skinning: useSkinning
			});

			depthMaterial._shadowPass = true;

			_depthMaterials[ i ] = depthMaterial;

			var distanceMaterial = new ShaderMaterial({
				uniforms: distanceUniforms,
				vertexShader: distanceShader.vertexShader,
				fragmentShader: distanceShader.fragmentShader,
				morphTargets: useMorphing,
				skinning: useSkinning
			});

			distanceMaterial._shadowPass = true;

			_distanceMaterials[ i ] = distanceMaterial;
		}

		//

		var scope = this;

		this.enabled = false;

		this.autoUpdate = true;
		this.needsUpdate = false;

		this.type = PCFShadowMap;
		this.cullFace = CullFaceFront;

		this.render = function(scene) {
			var faceCount, isPointLight;

			if (scope.enabled === false) return;
			if (scope.autoUpdate === false && scope.needsUpdate === false) return;

			// Set GL state for depth map.
			_gl.clearColor(1, 1, 1, 1);
			_state.disable(_gl.BLEND);
			_state.enable(_gl.CULL_FACE);
			_gl.frontFace(_gl.CCW);
			_gl.cullFace(scope.cullFace === CullFaceFront ? _gl.FRONT : _gl.BACK);
			_state.setDepthTest(true);

			// save the existing viewport so it can be restored later
			_renderer.getViewport(_vector4);

			// render depth map

			for (var i = 0, il = _lights.length; i < il; i ++) {
				var light = _lights[ i ];

				if (light.castShadow === true) {
					var shadow = light.shadow;
					var shadowCamera = shadow.camera;
					var shadowMapSize = shadow.mapSize;

					if (light instanceof PointLight) {
						faceCount = 6;
						isPointLight = true;

						var vpWidth = shadowMapSize.x / 4.0;
						var vpHeight = shadowMapSize.y / 2.0;

						// These viewports map a cube-map onto a 2D texture with the
						// following orientation:
						//
						//  xzXZ
						//   y Y
						//
						// X - Positive x direction
						// x - Negative x direction
						// Y - Positive y direction
						// y - Negative y direction
						// Z - Positive z direction
						// z - Negative z direction

						// positive X
						cube2DViewPorts[ 0 ].set(vpWidth * 2, vpHeight, vpWidth, vpHeight);
						// negative X
						cube2DViewPorts[ 1 ].set(0, vpHeight, vpWidth, vpHeight);
						// positive Z
						cube2DViewPorts[ 2 ].set(vpWidth * 3, vpHeight, vpWidth, vpHeight);
						// negative Z
						cube2DViewPorts[ 3 ].set(vpWidth, vpHeight, vpWidth, vpHeight);
						// positive Y
						cube2DViewPorts[ 4 ].set(vpWidth * 3, 0, vpWidth, vpHeight);
						// negative Y
						cube2DViewPorts[ 5 ].set(vpWidth, 0, vpWidth, vpHeight);
					} else {
						faceCount = 1;
						isPointLight = false;
					}

					if (shadow.map === null) {
						var shadowFilter = LinearFilter;

						if (scope.type === PCFSoftShadowMap) {
							shadowFilter = NearestFilter;
						}

						var pars = { minFilter: shadowFilter, magFilter: shadowFilter, format: RGBAFormat };

						shadow.map = new WebGLRenderTarget(shadowMapSize.x, shadowMapSize.y, pars);
						shadow.matrix = new Matrix4();

						//

						if (light instanceof SpotLight) {
							shadowCamera.aspect = shadowMapSize.x / shadowMapSize.y;
						}

						shadowCamera.updateProjectionMatrix();
					}

					var shadowMap = shadow.map;
					var shadowMatrix = shadow.matrix;

					_lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
					shadowCamera.position.copy(_lightPositionWorld);

					_renderer.setRenderTarget(shadowMap);
					_renderer.clear();

					// render shadow map for each cube face (if omni-directional) or
					// run a single pass if not

					for (var face = 0; face < faceCount; face ++) {
						if (isPointLight) {
							_lookTarget.copy(shadowCamera.position);
							_lookTarget.add(cubeDirections[ face ]);
							shadowCamera.up.copy(cubeUps[ face ]);
							shadowCamera.lookAt(_lookTarget);
							var vpDimensions = cube2DViewPorts[ face ];
							_renderer.setViewport(vpDimensions.x, vpDimensions.y, vpDimensions.z, vpDimensions.w);
						} else {
							_lookTarget.setFromMatrixPosition(light.target.matrixWorld);
							shadowCamera.lookAt(_lookTarget);
						}

						shadowCamera.updateMatrixWorld();
						shadowCamera.matrixWorldInverse.getInverse(shadowCamera.matrixWorld);

						// compute shadow matrix

						shadowMatrix.set(
							0.5, 0.0, 0.0, 0.5,
							0.0, 0.5, 0.0, 0.5,
							0.0, 0.0, 0.5, 0.5,
							0.0, 0.0, 0.0, 1.0
						);

						shadowMatrix.multiply(shadowCamera.projectionMatrix);
						shadowMatrix.multiply(shadowCamera.matrixWorldInverse);

						// update camera matrices and frustum

						_projScreenMatrix.multiplyMatrices(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse);
						_frustum.setFromMatrix(_projScreenMatrix);

						// set object matrices & frustum culling

						_renderList.length = 0;

						projectObject(scene, shadowCamera);

						// render shadow map
						// render regular objects

						for (var j = 0, jl = _renderList.length; j < jl; j ++) {
							var object = _renderList[ j ];
							var geometry = _objects.update(object);
							var material = object.material;

							if (material instanceof MeshFaceMaterial) {
								var groups = geometry.groups;
								var materials = material.materials;

								for (var k = 0, kl = groups.length; k < kl; k ++) {
									var group = groups[ k ];
									var groupMaterial = materials[ group.materialIndex ];

									if (groupMaterial.visible === true) {
										var depthMaterial = getDepthMaterial(object, groupMaterial, isPointLight, _lightPositionWorld);
										_renderer.renderBufferDirect(shadowCamera, _lights, null, geometry, depthMaterial, object, group);
									}
								}
							} else {
								var depthMaterial = getDepthMaterial(object, material, isPointLight, _lightPositionWorld);
								_renderer.renderBufferDirect(shadowCamera, _lights, null, geometry, depthMaterial, object, null);
							}
						}
					}

					// We must call _renderer.resetGLState() at the end of each iteration of
					// the light loop in order to force material updates for each light.
					_renderer.resetGLState();
				}
			}

			_renderer.setViewport(_vector4.x, _vector4.y, _vector4.z, _vector4.w);

			// Restore GL state.
			var clearColor = _renderer.getClearColor(),
			clearAlpha = _renderer.getClearAlpha();
			_renderer.setClearColor(clearColor, clearAlpha);
			_state.enable(_gl.BLEND);

			if (scope.cullFace === CullFaceFront) {
				_gl.cullFace(_gl.BACK);
			}

			_renderer.resetGLState();

			scope.needsUpdate = false;
		};

		function getDepthMaterial(object, material, isPointLight, lightPositionWorld) {
			var geometry = object.geometry;

			var newMaterial = null;

			var materialVariants = _depthMaterials;
			var customMaterial = object.customDepthMaterial;

			if (isPointLight) {
				materialVariants = _distanceMaterials;
				customMaterial = object.customDistanceMaterial;
			}

			if (! customMaterial) {
				var useMorphing = geometry.morphTargets !== undefined &&
						geometry.morphTargets.length > 0 && material.morphTargets;

				var useSkinning = object instanceof SkinnedMesh && material.skinning;

				var variantIndex = 0;

				if (useMorphing) variantIndex |= _MorphingFlag;
				if (useSkinning) variantIndex |= _SkinningFlag;

				newMaterial = materialVariants[ variantIndex ];
			} else {
				newMaterial = customMaterial;
			}

			newMaterial.visible = material.visible;
			newMaterial.wireframe = material.wireframe;
			newMaterial.wireframeLinewidth = material.wireframeLinewidth;

			if (isPointLight && newMaterial.uniforms.lightPos !== undefined) {
				newMaterial.uniforms.lightPos.value.copy(lightPositionWorld);
			}

			return newMaterial;
		}

		function projectObject(object, camera) {
			if (object.visible === false)
				return;

			if (object instanceof Mesh || object instanceof Line || object instanceof Points) {
				if (object.castShadow && (object.frustumCulled === false || _frustum.intersectsObject(object) === true)) {
					var material = object.material;

					if (material.visible === true) {
						object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
						_renderList.push(object);
					}
				}
			}

			var children = object.children;

			for (var i = 0, l = children.length; i < l; i ++) {
				projectObject(children[ i ], camera);
			}
		}
	};
});
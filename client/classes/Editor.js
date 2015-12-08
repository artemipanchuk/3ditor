define([
	"client/classes/editor/core/Color.js",
	"client/classes/editor/core/Vector2.js",
	"client/classes/editor/core/Vector3.js",
	"client/classes/editor/core/Vector4.js",
	"client/classes/editor/core/Frustum.js",
	"client/classes/editor/core/Ray.js",
	"client/classes/editor/core/Rectangle.js",
	"client/classes/editor/core/Math.js",
	"client/classes/editor/core/Matrix3.js",
	"client/classes/editor/core/Matrix4.js",
	"client/classes/editor/core/Object3D.js",
	"client/classes/editor/core/Projector.js",
	"client/classes/editor/core/Quaternion.js",
	"client/classes/editor/core/Vertex.js",
	"client/classes/editor/core/Face3.js",
	"client/classes/editor/core/Face4.js",
	"client/classes/editor/core/UV.js",
	"client/classes/editor/core/Geometry.js",
	"client/classes/editor/core/Spline.js",
	"client/classes/editor/cameras/Camera.js",
	"client/classes/editor/cameras/OrthographicCamera.js",
	"client/classes/editor/cameras/PerspectiveCamera.js",
	"client/classes/editor/lights/Light.js",
	"client/classes/editor/lights/AmbientLight.js",
	"client/classes/editor/lights/DirectionalLight.js",
	"client/classes/editor/lights/PointLight.js",
	"client/classes/editor/lights/SpotLight.js",
	"client/classes/editor/loaders/Loader.js",
	"client/classes/editor/loaders/BinaryLoader.js",
	"client/classes/editor/loaders/JSONLoader.js",
	"client/classes/editor/loaders/SceneLoader.js",
	"client/classes/editor/materials/Material.js",
	"client/classes/editor/materials/LineBasicMaterial.js",
	"client/classes/editor/materials/MeshBasicMaterial.js",
	"client/classes/editor/materials/MeshLambertMaterial.js",
	"client/classes/editor/materials/MeshPhongMaterial.js",
	"client/classes/editor/materials/MeshDepthMaterial.js",
	"client/classes/editor/materials/MeshNormalMaterial.js",
	"client/classes/editor/materials/MeshFaceMaterial.js",
	"client/classes/editor/materials/ParticleBasicMaterial.js",
	"client/classes/editor/materials/ShaderMaterial.js",
	"client/classes/editor/textures/Texture.js",
	"client/classes/editor/textures/DataTexture.js",
	"client/classes/editor/objects/Particle.js",
	"client/classes/editor/objects/ParticleSystem.js",
	"client/classes/editor/objects/Line.js",
	"client/classes/editor/objects/Mesh.js",
	"client/classes/editor/objects/Bone.js",
	"client/classes/editor/objects/SkinnedMesh.js",
	"client/classes/editor/objects/Ribbon.js",
	"client/classes/editor/objects/LOD.js",
	"client/classes/editor/objects/Sprite.js",
	"client/classes/editor/scenes/Scene.js",
	"client/classes/editor/scenes/Fog.js",
	"client/classes/editor/scenes/FogExp2.js",
	"client/classes/editor/renderers/WebGLShaders.js",
	"client/classes/editor/renderers/WebGLRenderer.js",
	"client/classes/editor/renderers/WebGLRenderTarget.js",
	"client/classes/editor/renderers/WebGLRenderTargetCube.js",
	"client/classes/editor/renderers/renderables/RenderableVertex.js",
	"client/classes/editor/renderers/renderables/RenderableFace3.js",
	"client/classes/editor/renderers/renderables/RenderableFace4.js",
	"client/classes/editor/renderers/renderables/RenderableObject.js",
	"client/classes/editor/renderers/renderables/RenderableParticle.js",
	"client/classes/editor/renderers/renderables/RenderableLine.js",
	"client/classes/editor/extras/core/BufferGeometry.js",
	"client/classes/editor/extras/core/Gyroscope.js",
	"client/classes/editor/extras/helpers/CameraHelper.js",
	"client/classes/editor/extras/objects/LensFlare.js",
	"client/classes/editor/extras/objects/ImmediateRenderObject.js",
	"client/classes/editor/extras/renderers/plugins/LensFlarePlugin.js",
	"client/classes/editor/extras/renderers/plugins/ShadowMapPlugin.js",
	"client/classes/editor/extras/renderers/plugins/SpritePlugin.js",
	"client/classes/editor/extras/shaders/ShaderFlares.js",
	"client/classes/editor/extras/shaders/ShaderSprite.js",
	"client/classes/editor/extras/ColorUtils.js",
	"client/classes/editor/extras/GeometryUtils.js",
	"client/classes/editor/extras/ImageUtils.js",
	"client/classes/editor/extras/SceneUtils.js",
	"client/classes/editor/extras/ShaderUtils.js",
	"client/classes/editor/extras/core/BufferGeometry.js",
	"client/classes/editor/extras/core/Curve.js",
	"client/classes/editor/extras/core/CurvePath.js",
	"client/classes/editor/extras/core/EventTarget.js",
	"client/classes/editor/extras/core/Gyroscope.js",
	"client/classes/editor/extras/core/Path.js",
	"client/classes/editor/extras/core/Shape.js",
	"client/classes/editor/extras/core/TextPath.js",
	"client/classes/editor/extras/animation/AnimationHandler.js",
	"client/classes/editor/extras/animation/Animation.js",
	"client/classes/editor/extras/animation/KeyFrameAnimation.js",
	"client/classes/editor/extras/cameras/CubeCamera.js",
	"client/classes/editor/extras/cameras/CombinedCamera.js",
	"client/classes/editor/extras/controls/FirstPersonControls.js",
	"client/classes/editor/extras/controls/PathControls.js",
	"client/classes/editor/extras/controls/FlyControls.js",
	"client/classes/editor/extras/controls/RollControls.js",
	"client/classes/editor/extras/controls/TrackballControls.js",
	"client/classes/editor/extras/geometries/CubeGeometry.js",
	"client/classes/editor/extras/geometries/CylinderGeometry.js",
	"client/classes/editor/extras/geometries/ExtrudeGeometry.js",
	"client/classes/editor/extras/geometries/LatheGeometry.js",
	"client/classes/editor/extras/geometries/PlaneGeometry.js",
	"client/classes/editor/extras/geometries/SphereGeometry.js",
	"client/classes/editor/extras/geometries/TextGeometry.js",
	"client/classes/editor/extras/geometries/TorusGeometry.js",
	"client/classes/editor/extras/geometries/TorusKnotGeometry.js",
	"client/classes/editor/extras/geometries/TubeGeometry.js",
	"client/classes/editor/extras/geometries/PolyhedronGeometry.js",
	"client/classes/editor/extras/geometries/IcosahedronGeometry.js",
	"client/classes/editor/extras/geometries/OctahedronGeometry.js",
	"client/classes/editor/extras/geometries/TetrahedronGeometry.js",
	"client/classes/editor/extras/geometries/ParametricGeometry.js",
	"client/classes/editor/extras/helpers/AxisHelper.js",
	"client/classes/editor/extras/helpers/ArrowHelper.js",
	"client/classes/editor/extras/helpers/CameraHelper.js",
	"client/classes/editor/extras/modifiers/SubdivisionModifier.js",
	"client/classes/editor/extras/objects/ImmediateRenderObject.js",
	"client/classes/editor/extras/objects/LensFlare.js",
	"client/classes/editor/extras/objects/MorphBlendMesh.js",
	"client/classes/editor/extras/renderers/plugins/LensFlarePlugin.js",
	"client/classes/editor/extras/renderers/plugins/ShadowMapPlugin.js",
	"client/classes/editor/extras/renderers/plugins/SpritePlugin.js",
	"client/classes/editor/extras/renderers/plugins/DepthPassPlugin.js",
	"client/classes/editor/extras/shaders/ShaderFlares.js"
], function() {
	this.Editor = (function() {
		function Editor () {
			var self = this,
				initCalled = 0;

			this.update = function() {
				self.updateController();
				self.updateRenderer();

				self.uniforms.uTime.value += 0.02;

				requestAnimationFrame(self.update);
			};

			this.init = function() {
				++initCalled;

				if (initCalled === 2) {
					self.initCanvas();
					self.initScene();
					self.initController();
					self.initRenderer();

					requestAnimationFrame(self.update);
				}
			};

			$("#vertexShader")  .load("client/shaders/vertexShader.glsl",   this.init);
			$("#fragmentShader").load("client/shaders/fragmentShader.glsl", this.init);

			$(window).resize(function() {
				self.setSize();
			});

			self.setSize();
		}

		Editor.prototype.setSize = function() {
			$.observable(this).setProperty({
				innerWidth:  window.innerWidth,
				innerHeight: window.innerHeight
			});
		}

		Editor.prototype.recompileShader = function() {
			var addString = "";

			addString += "#define MAX_STEPS 128\n"
			addString += "#define DE_BOX\n";
			addString += "#define DE_GROUND\n";

			console.log("recompile shader:\n"+addString);

			this.view.material.fragmentShader = addString + $("#fragmentShader").text();
			this.view.material.needsUpdate    = true;
		}

		Editor.prototype.updateController = function() {
			this.controller.update();
		};

		Editor.prototype.updateRenderer = function() {
			this.renderer.render(this.scene, this.orthographicCamera);
		};

		Editor.prototype.initCanvas = function() {
			this.section = $("#editorSection");
		}

		Editor.prototype.initScene = function() {
			this.scene = new Scene;

			this.light = new Vector3(2.0, 10.0, 5.0);

			this.orthographicCamera = new OrthographicCamera(-.5, .5, .5, -.5, -1, 1);

			this.scene.add(this.orthographicCamera);

			this.perspectiveCamera = new PerspectiveCamera(
				30,
				this.innerWidth / this.innerHeight,
				1,
				1000
			);

			this.perspectiveCamera.position.z = 10;
		};

		Editor.prototype.initController = function() {
			this.controller = new TrackballControls(this.perspectiveCamera);

			this.controller.rotateSpeed = 1.0;
			this.controller.zoomSpeed   = 1.2;
			this.controller.panSpeed    = 1.0;
			this.controller.dynamicDampingFactor = 0.3;
			this.controller.staticMoving = false;
			this.controller.noZoom       = false;
			this.controller.noPan        = false;
		};

		Editor.prototype.initRenderer = function() {
			this.renderer = new WebGLRenderer;
			this.renderer.setSize(this.innerWidth, this.innerHeight);
			this.renderer.setClearColorHex(0x000000, 1);
			this.section.append(this.renderer.domElement);

			this.uniforms = {
				uCamPos:    {type: "v3", value: this.perspectiveCamera.position},
				uCamCenter: {type: "v3", value: this.controller.target},
				uCamUp:     {type: "v3", value: this.perspectiveCamera.up},
				uAspect:    {type: "f",  value: this.innerWidth/this.innerHeight},
				uTime:      {type: "f",  value: 0.0},
				uLightP:    {type: "v3", value: this.light}
			};

			var shader = new ShaderMaterial({
				uniforms:       this.uniforms,
				vertexShader:   $("#vertexShader").text(),
				fragmentShader: $("#fragmentShader").text()
			});

			this.view = new Mesh(new PlaneGeometry(1, 1), shader);

			var node = new Object3D();
			node.rotation.x = Math.HALFPI;
			node.add(this.view);

			this.scene.add(node);

			this.recompileShader();
		};

		return Editor;
	})();
});
define([
	"utils/Math",
	"utils/Constants",
	"classes/editor/Scene",
	"classes/editor/cameras/OrthographicCamera",
	"classes/editor/cameras/PerspectiveCamera",
	"classes/editor/renderers/WebGLRenderer",
	"classes/editor/controls/TrackballControls"
], function(tmplUI) {
	this.Editor = (function() {
		function Editor () {
			var self = this;

			this.initCalled = 0;

			$("#vertexShader")  .load("client/shaders/vertexShader.glsl",   this.init.bind(this));
			$("#fragmentShader").load("client/shaders/fragmentShader.glsl", this.init.bind(this));

			$(window).resize(function() {
				self.setSize();
			});
		}

		Editor.prototype.setSize = function() {
			$.observable(this).setProperty({
				innerWidth:  window.innerWidth,
				innerHeight: window.innerHeight
			});
		}

		Editor.prototype.update = function() {
			this.updateController();
			this.updateRenderer();

			requestAnimationFrame(this.update.bind(this));
		};

		Editor.prototype.updateController = function() {
		};

		Editor.prototype.updateRenderer = function() {
		};

		Editor.prototype.init = function() {
			++this.initCalled;

			if (this.initCalled === 2) {
				this.initCanvas();
				this.initCamera();
				this.initScene();
				this.initController();
				this.initRenderer();

				requestAnimationFrame(this.update.bind(this));
			}
		};

		Editor.prototype.initCanvas = function() {
			var section = this.section = $("#editorSection");
		}

		Editor.prototype.initCamera = function() {
			this.perspectiveCamera = new PerspectiveCamera(
				30,
				this.innerWidth / this.innerHeight,
				1,
				1000
			);

			this.perspectiveCamera.position.z = 10;

			this.orthographicCamera = new OrthographicCamera(-.5, .5, .5, -.5, -1, 1);
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
			this.renderer = new WebGLRenderer();

			this.renderer.setSize(this.innerWidth, this.innerHeight);
			this.renderer.setClearColor(0x000000, 1);

			// todo append element

			this.uniforms = {
				uCamPos: {
					type: "v3",
					value: this.perspectiveCamera.position
				},
				uCamCenter: {
					type: "v3",
					value: this.controller.target
				},
				uCamUp: {
					type: "v3",
					value: this.perspectiveCamera.up
				},
				uAspect: {
					type: "f",
					value: this.innerWidth/this.innerHeight
				},
				uTime: {
					type: "f",
					value: 0.0
				},
				uLightP: {
					type: "v3",
					value: this.light
				}
			};

			var shader = new ShaderMaterial({
				uniforms:       this.uniforms,
				vertexShader:   $("#vertexShader").text(),
				fragmentShader: $("#fragmentShader").text()
			});
		};

		Editor.prototype.initScene = function() {
			this.scene = new Scene;

			this.scene.add(this.orthographicCamera);
		};

		return Editor;
	})();
});
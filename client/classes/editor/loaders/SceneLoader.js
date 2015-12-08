SceneLoader = function () {
	this.onLoadStart = function () {};
	this.onLoadProgress = function() {};
	this.onLoadComplete = function () {};

	this.callbackSync = function () {};
	this.callbackProgress = function () {};
};

SceneLoader.prototype.constructor = SceneLoader;

SceneLoader.prototype.load = function(url, callbackFinished) {
	var context = this;

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (xhr.status == 200 || xhr.status == 0) {
				var json = JSON.parse(xhr.responseText);
				context.createScene(json, callbackFinished, url);
			} else {
				console.error("SceneLoader: Couldn't load [" + url + "] [" + xhr.status + "]");
			}
		}
	};

	xhr.open("GET", url, true);
	if (xhr.overrideMimeType) xhr.overrideMimeType("text/plain; charset=x-user-defined");
	xhr.setRequestHeader("Content-Type", "text/plain");
	xhr.send(null);
};

SceneLoader.prototype.createScene = function (json, callbackFinished, url) {
	var scope = this;

	var urlBase = Loader.prototype.extractUrlBase(url);

	var dg, dm, dd, dl, dc, df, dt,
		g, o, m, l, d, p, r, q, s, c, t, f, tt, pp, u,
		geometry, material, camera, fog,
		texture, images,
		light,
		data, binLoader, jsonLoader,
		counter_models, counter_textures,
		total_models, total_textures,
		result;

	data = json;

	binLoader = new BinaryLoader();
	jsonLoader = new JSONLoader();

	counter_models = 0;
	counter_textures = 0;

	result = {
		scene: new Scene(),
		geometries: {},
		materials: {},
		textures: {},
		objects: {},
		cameras: {},
		lights: {},
		fogs: {},
		empties: {}
	};

	if (data.transform) {
		var position = data.transform.position,
			rotation = data.transform.rotation,
			scale = data.transform.scale;

		if (position)
			result.scene.position.set(position[0], position[1], position [2]);

		if (rotation)
			result.scene.rotation.set(rotation[0], rotation[1], rotation [2]);

		if (scale)
			result.scene.scale.set(scale[0], scale[1], scale [2]);

		if (position || rotation || scale) {
			result.scene.updateMatrix();
			result.scene.updateMatrixWorld();
		}
	}

	function get_url(source_url, url_type) {
		if (url_type == "relativeToHTML") {
			return source_url;
		} else {
			return urlBase + "/" + source_url;
		}
	};

	function handle_objects() {
		var object;

		for(dd in data.objects) {
			if (!result.objects[dd]) {
				o = data.objects[dd];

				if (o.geometry !== undefined) {
					geometry = result.geometries[o.geometry];

					if (geometry) {
						var hasNormals = false;

						material = result.materials[o.materials[0]];
						hasNormals = material instanceof ShaderMaterial;

						if (hasNormals) {
							geometry.computeTangents();
						}

						p = o.position;
						r = o.rotation;
						q = o.quaternion;
						s = o.scale;
						m = o.matrix;

						q = 0;

						if (o.materials.length == 0) {
							material = new MeshFaceMaterial();
						}

						if (o.materials.length > 1) {
							material = new MeshFaceMaterial();
						}

						object = new Mesh(geometry, material);
						object.name = dd;
						if (m) {
							object.matrixAutoUpdate = false;
							object.matrix.set(m[0], m[1], m[2], m[3],
											   m[4], m[5], m[6], m[7],
											   m[8], m[9], m[10], m[11],
											   m[12], m[13], m[14], m[15]);
						} else {
							object.position.set(p[0], p[1], p[2]);
							if (q) {
								object.quaternion.set(q[0], q[1], q[2], q[3]);
								object.useQuaternion = true;
							} else {
								object.rotation.set(r[0], r[1], r[2]);
							}
							object.scale.set(s[0], s[1], s[2]);
						}

						object.visible = o.visible;
						object.doubleSided = o.doubleSided;
						object.castShadow = o.castShadow;
						object.receiveShadow = o.receiveShadow;

						result.scene.add(object);

						result.objects[dd] = object;
					}
				} else {
					p = o.position;
					r = o.rotation;
					q = o.quaternion;
					s = o.scale;

					q = 0;

					object = new Object3D();
					object.name = dd;
					object.position.set(p[0], p[1], p[2]);

					if (q) {
						object.quaternion.set(q[0], q[1], q[2], q[3]);
						object.useQuaternion = true;
					} else {
						object.rotation.set(r[0], r[1], r[2]);
					}

					object.scale.set(s[0], s[1], s[2]);
					object.visible = (o.visible !== undefined) ? o.visible : false;

					result.scene.add(object);

					result.objects[dd] = object;
					result.empties[dd] = object;
				}
			}
		}
	};

	function handle_mesh(geo, id) {
		result.geometries[id] = geo;
		handle_objects();
	};

	function create_callback(id) {
		return function(geo) {
			handle_mesh(geo, id);

			counter_models -= 1;

			scope.onLoadComplete();

			async_callback_gate();
		}
	};

	function create_callback_embed(id) {
		return function(geo) {
			result.geometries[id] = geo;
		}
	};

	function async_callback_gate() {
		var progress = {
			totalModels		: total_models,
			totalTextures	: total_textures,
			loadedModels	: total_models - counter_models,
			loadedTextures	: total_textures - counter_textures
		};

		scope.callbackProgress(progress, result);

		scope.onLoadProgress();

		if(counter_models == 0 && counter_textures == 0) {
			callbackFinished(result);
		}
	};

	var callbackTexture = function(images) {
		counter_textures -= 1;
		async_callback_gate();

		scope.onLoadComplete();
	};

	for(dc in data.cameras) {
		c = data.cameras[dc];

		if (c.type == "perspective") {
			camera = new PerspectiveCamera(c.fov, c.aspect, c.near, c.far);
		} else if (c.type == "ortho") {
			camera = new OrthographicCamera(c.left, c.right, c.top, c.bottom, c.near, c.far);
		}

		p = c.position;
		t = c.target;
		u = c.up;

		camera.position.set(p[0], p[1], p[2]);
		camera.target = new Vector3(t[0], t[1], t[2]);
		if (u) camera.up.set(u[0], u[1], u[2]);

		result.cameras[dc] = camera;
	}

	var hex, intensity;

	for (dl in data.lights) {
		l = data.lights[dl];

		hex = (l.color !== undefined) ? l.color : 0xffffff;
		intensity = (l.intensity !== undefined) ? l.intensity : 1;

		if (l.type == "directional") {
			p = l.direction;

			light = new DirectionalLight(hex, intensity);
			light.position.set(p[0], p[1], p[2]);
			light.position.normalize();
		} else if (l.type == "point") {
			p = l.position;
			d = l.distance;

			light = new PointLight(hex, intensity, d);
			light.position.set(p[0], p[1], p[2]);
		} else if (l.type == "ambient") {
			light = new AmbientLight(hex);
		}

		result.scene.add(light);

		result.lights[dl] = light;
	}

	for(df in data.fogs) {
		f = data.fogs[df];

		if (f.type == "linear") {
			fog = new Fog(0x000000, f.near, f.far);
		} else if (f.type == "exp2") {
			fog = new FogExp2(0x000000, f.density);
		}

		c = f.color;
		fog.color.setRGB(c[0], c[1], c[2]);

		result.fogs[df] = fog;
	}

	if (result.cameras && data.defaults.camera) {
		result.currentCamera = result.cameras[data.defaults.camera];
	}

	if (result.fogs && data.defaults.fog) {
		result.scene.fog = result.fogs[data.defaults.fog];
	}

	c = data.defaults.bgcolor;
	result.bgColor = new Color();
	result.bgColor.setRGB(c[0], c[1], c[2]);

	result.bgColorAlpha = data.defaults.bgalpha;

	for(dg in data.geometries) {
		g = data.geometries[dg];

		if (g.type == "bin_mesh" || g.type == "ascii_mesh") {
			counter_models += 1;

			scope.onLoadStart();
		}
	}

	total_models = counter_models;

	for (dg in data.geometries) {
		g = data.geometries[dg];

		if (g.type == "cube") {
			geometry = new CubeGeometry(g.width, g.height, g.depth, g.segmentsWidth, g.segmentsHeight, g.segmentsDepth, null, g.flipped, g.sides);
			result.geometries[dg] = geometry;
		} else if (g.type == "plane") {
			geometry = new PlaneGeometry(g.width, g.height, g.segmentsWidth, g.segmentsHeight);
			result.geometries[dg] = geometry;
		} else if (g.type == "sphere") {
			geometry = new SphereGeometry(g.radius, g.segmentsWidth, g.segmentsHeight);
			result.geometries[dg] = geometry;
		} else if (g.type == "cylinder") {
			geometry = new CylinderGeometry(g.topRad, g.botRad, g.height, g.radSegs, g.heightSegs);
			result.geometries[dg] = geometry;
		} else if (g.type == "torus") {
			geometry = new TorusGeometry(g.radius, g.tube, g.segmentsR, g.segmentsT);
			result.geometries[dg] = geometry;
		} else if (g.type == "icosahedron") {
			geometry = new IcosahedronGeometry(g.radius, g.subdivisions);
			result.geometries[dg] = geometry;
		} else if (g.type == "bin_mesh") {
			binLoader.load(get_url(g.url, data.urlBaseType), create_callback(dg));
		} else if (g.type == "ascii_mesh") {
			jsonLoader.load(get_url(g.url, data.urlBaseType), create_callback(dg));
		} else if (g.type == "embedded_mesh") {
			var modelJson = data.embeds[g.id],
				texture_path = "";
			modelJson.metadata = data.metadata;

			if (modelJson) {
				jsonLoader.createModel(modelJson, create_callback_embed(dg), texture_path);
			}
		}
	}

	for(dt in data.textures) {
		tt = data.textures[dt];

		if(tt.url instanceof Array) {
			counter_textures += tt.url.length;

			for(var n = 0; n < tt.url.length; n ++) {
				scope.onLoadStart();
			}
		} else {
			counter_textures += 1;

			scope.onLoadStart();
		}
	}

	total_textures = counter_textures;

	for(dt in data.textures) {
		tt = data.textures[dt];

		if (tt.mapping != undefined &&  window[tt.mapping] != undefined ) {
			tt.mapping = new  window[tt.mapping]();
		}

		if(tt.url instanceof Array) {
			var url_array = [];

			for(var i = 0; i < tt.url.length; i ++) {
				url_array[i] = get_url(tt.url[i], data.urlBaseType);
			}

			texture = ImageUtils.loadTextureCube(url_array, tt.mapping, callbackTexture);
		} else {
			texture = ImageUtils.loadTexture(get_url(tt.url, data.urlBaseType), tt.mapping, callbackTexture);

			if (window[tt.minFilter] != undefined)
				texture.minFilter = window[tt.minFilter];

			if (window[tt.magFilter] != undefined)
				texture.magFilter = window[tt.magFilter];

			if (tt.repeat) {
				texture.repeat.set(tt.repeat[0], tt.repeat[1]);

				if (tt.repeat[0] != 1) texture.wrapS = RepeatWrapping;
				if (tt.repeat[1] != 1) texture.wrapT = RepeatWrapping;
			}

			if (tt.offset) {
				texture.offset.set(tt.offset[0], tt.offset[1]);
			}

			if (tt.wrap) {
				var wrapMap = {
				"repeat" 	: RepeatWrapping,
				"mirror"	: MirroredRepeatWrapping
				}

				if (wrapMap[tt.wrap[0]] !== undefined) texture.wrapS = wrapMap[tt.wrap[0]];
				if (wrapMap[tt.wrap[1]] !== undefined) texture.wrapT = wrapMap[tt.wrap[1]];
			}
		}

		result.textures[dt] = texture;
	}

	for (dm in data.materials) {
		m = data.materials[dm];

		for (pp in m.parameters) {
			if (pp == "envMap" || pp == "map" || pp == "lightMap") {
				m.parameters[pp] = result.textures[m.parameters[pp]];
			} else if (pp == "shading") {
				m.parameters[pp] = (m.parameters[pp] == "flat") ? FlatShading : SmoothShading;
			} else if (pp == "blending") {
				m.parameters[pp] =  window[m.parameters[pp]] ?  window[m.parameters[pp]] : NormalBlending;
			} else if (pp == "combine") {
				m.parameters[pp] = (m.parameters[pp] == "MixOperation") ? MixOperation : MultiplyOperation;
			} else if (pp == "vertexColors") {
				if (m.parameters[pp] == "face") {
					m.parameters[pp] = FaceColors;
				} else if (m.parameters[pp])   {
					m.parameters[pp] = VertexColors;
				}
			}
		}

		if (m.parameters.opacity !== undefined && m.parameters.opacity < 1.0) {
			m.parameters.transparent = true;
		}

		if (m.parameters.normalMap) {
			var shader = ShaderUtils.lib["normal"];
			var uniforms = UniformsUtils.clone(shader.uniforms);

			var diffuse = m.parameters.color;
			var specular = m.parameters.specular;
			var ambient = m.parameters.ambient;
			var shininess = m.parameters.shininess;

			uniforms["tNormal"].texture = result.textures[m.parameters.normalMap];

			if (m.parameters.normalMapFactor) {
				uniforms["uNormalScale"].value = m.parameters.normalMapFactor;
			}

			if (m.parameters.map) {
				uniforms["tDiffuse"].texture = m.parameters.map;
				uniforms["enableDiffuse"].value = true;
			}

			if (m.parameters.lightMap) {
				uniforms["tAO"].texture = m.parameters.lightMap;
				uniforms["enableAO"].value = true;
			}

			if (m.parameters.specularMap) {
				uniforms["tSpecular"].texture = result.textures[m.parameters.specularMap];
				uniforms["enableSpecular"].value = true;
			}

			uniforms["uDiffuseColor"].value.setHex(diffuse);
			uniforms["uSpecularColor"].value.setHex(specular);
			uniforms["uAmbientColor"].value.setHex(ambient);

			uniforms["uShininess"].value = shininess;

			if (m.parameters.opacity) {
				uniforms["uOpacity"].value = m.parameters.opacity;
			}

			var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: true };

			material = new ShaderMaterial(parameters);
		} else {
			material = new  window[m.type](m.parameters);
		}

		result.materials[dm] = material;
	}

	handle_objects();

	scope.callbackSync(result);
	async_callback_gate();
};
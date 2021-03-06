ShaderFlares = {
	'lensFlareVertexTexture': {
		vertexShader: [

			"uniform vec3 screenPosition;",
			"uniform vec2 scale;",
			"uniform float rotation;",
			"uniform int renderType;",

			"uniform sampler2D occlusionMap;",

			"attribute vec2 position;",
			"attribute vec2 uv;",

			"varying vec2 vUV;",
			"varying float vVisibility;",

			"void main() {",

				"vUV = uv;",

				"vec2 pos = position;",

				"if(renderType == 2) {",

					"vec4 visibility = texture2D(occlusionMap, vec2(0.1, 0.1)) +",
									  "texture2D(occlusionMap, vec2(0.5, 0.1)) +",
									  "texture2D(occlusionMap, vec2(0.9, 0.1)) +",
									  "texture2D(occlusionMap, vec2(0.9, 0.5)) +",
									  "texture2D(occlusionMap, vec2(0.9, 0.9)) +",
									  "texture2D(occlusionMap, vec2(0.5, 0.9)) +",
									  "texture2D(occlusionMap, vec2(0.1, 0.9)) +",
									  "texture2D(occlusionMap, vec2(0.1, 0.5)) +",
									  "texture2D(occlusionMap, vec2(0.5, 0.5));",

					"vVisibility = (      visibility.r / 9.0) *",
								  "(1.0 - visibility.g / 9.0) *",
								  "(      visibility.b / 9.0) *",
								  "(1.0 - visibility.a / 9.0);",

					"pos.x = cos(rotation) * position.x - sin(rotation) * position.y;",
					"pos.y = sin(rotation) * position.x + cos(rotation) * position.y;",

				"}",

				"gl_Position = vec4((pos * scale + screenPosition.xy).xy, screenPosition.z, 1.0);",

			"}"

		].join("\n"),

		fragmentShader: [

			"precision mediump float;",

			"uniform sampler2D map;",
			"uniform float opacity;",
			"uniform int renderType;",
			"uniform vec3 color;",

			"varying vec2 vUV;",
			"varying float vVisibility;",

			"void main() {",

				"if(renderType == 0) {",

					"gl_FragColor = vec4(1.0, 0.0, 1.0, 0.0);",

				"} else if(renderType == 1) {",

					"gl_FragColor = texture2D(map, vUV);",

				"} else {",

					"vec4 texture = texture2D(map, vUV);",
					"texture.a *= opacity * vVisibility;",
					"gl_FragColor = texture;",
					"gl_FragColor.rgb *= color;",

				"}",

			"}"
		].join("\n")
	},

	'lensFlare': {
		vertexShader: [

			"uniform vec3 screenPosition;",
			"uniform vec2 scale;",
			"uniform float rotation;",
			"uniform int renderType;",

			"attribute vec2 position;",
			"attribute vec2 uv;",

			"varying vec2 vUV;",

			"void main() {",

				"vUV = uv;",

				"vec2 pos = position;",

				"if(renderType == 2) {",

					"pos.x = cos(rotation) * position.x - sin(rotation) * position.y;",
					"pos.y = sin(rotation) * position.x + cos(rotation) * position.y;",

				"}",

				"gl_Position = vec4((pos * scale + screenPosition.xy).xy, screenPosition.z, 1.0);",

			"}"

		].join("\n"),

		fragmentShader: [

			"precision mediump float;",

			"uniform sampler2D map;",
			"uniform sampler2D occlusionMap;",
			"uniform float opacity;",
			"uniform int renderType;",
			"uniform vec3 color;",

			"varying vec2 vUV;",

			"void main() {",

				"if(renderType == 0) {",

					"gl_FragColor = vec4(texture2D(map, vUV).rgb, 0.0);",

				"} else if(renderType == 1) {",

					"gl_FragColor = texture2D(map, vUV);",

				"} else {",

					"float visibility = texture2D(occlusionMap, vec2(0.5, 0.1)).a +",
									   "texture2D(occlusionMap, vec2(0.9, 0.5)).a +",
									   "texture2D(occlusionMap, vec2(0.5, 0.9)).a +",
									   "texture2D(occlusionMap, vec2(0.1, 0.5)).a;",

					"visibility = (1.0 - visibility / 4.0);",

					"vec4 texture = texture2D(map, vUV);",
					"texture.a *= opacity * visibility;",
					"gl_FragColor = texture;",
					"gl_FragColor.rgb *= color;",

				"}",

			"}"

		].join("\n")
	}
};
#ifdef GL_ES

precision highp float;

#endif // GL_ES

#define EPS       0.001
#define EPS1      0.01
#define PI        3.1415926535897932
#define HALFPI    1.5707963267948966
#define QUARTPI   0.7853981633974483
#define ROOTTHREE 0.57735027
#define HUGEVAL   1e20

/*
 * Auxiliary Functions:
 */

float maxcomp( in vec3 p) {
	return max(p.x,max(p.y,p.z));
}

float rand(in vec2 seed) {
	return fract(sin(dot(seed.xy,vec2(12.9898,78.233))) * 43758.5453);
}

/*
 * Distance Functions:
 * (Primitives)
 */

float sdPlane(vec3 p, vec4 n)
{
	return dot(p,n.xyz) + n.w;
}

float sdSphere(vec3 p, float s)
{
	return length(p)-s;
}

float sdBox(vec3 p, vec3 b) {
	vec3  di = abs(p) - b;
	float mc = maxcomp(di);
	return min(mc,length(max(di,0.0)));
}

float udBox(vec3 p, vec3 b)
{
	return length(max(abs(p)-b,0.0));
}

float udRoundBox(vec3 p, vec3 b, float r)
{
	return length(max(abs(p)-b,0.0))-r;
}

float sdCylinder(vec3 p, vec3 c)
{
	return length(p.xz-c.xy)-c.z;
}

float sdTorus(vec3 p, vec2 t)
{
	vec2 q = vec2(length(p.xz)-t.x,p.y);
	return length(q)-t.y;
}

float lengthN(vec2 v, float n) {
	return pow(pow(v.x,n)+pow(v.y,n), 1.0/n);
}

float sdTorusN(vec3 p, vec2 t, float n)
{
	vec2 q = vec2(lengthN(p.xz,n)-t.x,p.y);
	return lengthN(q,n)-t.y;
}

/*
 * Distance Functions:
 * (Operations)
 */

float opU(float d1, float d2)
{
	return min(d1,d2);
}

float opS(float d1, float d2)
{
	return max(-d1,d2);
}

float opI(float d1, float d2)
{
	return max(d1,d2);
}

/*
 * Shader Variables:
 */

varying vec2 vUv;

uniform vec3 uCamCenter;
uniform vec3 uCamPos;
uniform vec3 uCamUp;
uniform float uAspect;
uniform float uTime;
uniform vec3 uLightP;

/*
 * Shader Constants:
 */

const float c_fBounds = 15.0;
const float c_fSmooth = 0.70;
const float c_fDither = 0.001;

const vec3 c_vFogColor = vec3(0.6, 0.6, 0.7);
const vec3 c_vMaterial0 = vec3(0.5);
const vec3 c_vMaterial1 = vec3(0.9, 0.7, 0.5);
const vec3 c_vMaterial2 = vec3(0.3, 0.5, 1.0);

/*
 * Global variables:
 */

float gMin = 0.0;
float gMax = HUGEVAL;

vec3 currCol = c_vMaterial2;
float currSSS = 1.0;
bool currHit = false;
vec3 currPos, currNor;

float getDist(in vec3 p) {

	#ifdef DE_WARP

	p.x = mod(p.x,5.0)-2.5;
	p.z = mod(p.z,5.0)-2.5;

	#endif // DE_WARP

	vec3 p1 = p;

	#ifdef DE_ROTATE

	mat3 rotateY = mat3(
		cos(uTime),   0.0,  sin(uTime),
		0.0,          1.0,  0.0,       
		-sin(uTime),  0.0,  cos(uTime)
	);

	mat3 rotateX = mat3(
		1.0, 0.0, 0.0,
		0.0, cos(uTime), sin(uTime), 
		0.0, -sin(uTime), cos(uTime)
	);

	p1 = rotateY*rotateX*p;

	#endif // DE_ROTATE

	#ifdef DE_TWIST

	float twist = sin(2.0*uTime);
	float c = cos(twist*p1.y);
	float s = sin(twist*p1.y);
	mat2  m = mat2(c,-s,s,c);
	p1 = vec3(m*p1.xz,p1.y);

	#endif // DE_TWIST

	/* SCENE CONSTRUCTION */

	float d0 = HUGEVAL;
	float d1 = HUGEVAL;

	#ifdef DE_KNOT
	d0 = sdKnot(p1/2.0, 2.0*uTime)*2.0;
	#endif

	#ifdef DE_QUATERNION
	d0 = sdQuaternion(p1/2.0)*2.0;
	#endif

	#ifdef DE_MENGER
	d0 = sdMenger(p1/2.0)*2.0;
	#endif

	#ifdef DE_BOX
	d0 = sdBox(p1, vec3(1.0));
	#endif

	#ifdef DE_ROUNDBOX
	d0 = udRoundBox(p1, vec3(1.0), 0.2);
	#endif

	#ifdef DE_USHAPE
	d0 = sdBox(p1,vec3(2.0, 2.0, 1.0));
	d1 = sdSphere(p1-vec3(0.0, 1.5, 0.0), 1.5);
	d0 = opS(d1, d0);
	#endif

	#ifdef DE_DISPLACE
	float d2 = 0.3*sin(PI*p1.x)*sin(PI*p1.y)*sin(PI*p1.z);
	d0 += d2;
	#endif


	#ifdef DE_GROUND

	d1 = sdPlane(p+vec3(0.0,3.0,0.0), vec4(0.0,1.0,0.0,0.0));
	if (d1<d0) {
		d0 = d1;
		currCol = c_vMaterial0;
		currSSS = 0.0;
	}
	else {
		d0 = d0;
		currCol = c_vMaterial2;
		currSSS = 1.0;
	}

	#else

	d1 = p.z*p.z+HUGEVAL;
	d0 = d1 < d0 ? d1 : d0;

	#endif // DE_GROUND

	return d0;
}

vec3 getNormal(in vec3 pos) {
	vec3 eps = vec3(EPS, 0.0, 0.0);
	vec3 nor;
	nor.x = getDist(pos+eps.xyy) - getDist(pos-eps.xyy);
	nor.y = getDist(pos+eps.yxy) - getDist(pos-eps.yxy);
	nor.z = getDist(pos+eps.yyx) - getDist(pos-eps.yyx);
	return normalize(nor);
}

bool intersectBounds (in vec3 ro, in vec3 rd) {
	float B = dot(ro,rd);
	float C = dot(ro,ro) - c_fBounds;

	float d = B*B - C;

	if (d<0.0) return false;

	d = sqrt(d);
	B = -B;
	gMin = max(0.0, B-d);
	gMax = B+d;

	return true;
}

int intersectSteps(in vec3 ro, in vec3 rd) {
	float t = 0.0;
	int steps = -1;  

	for(int i=0; i<MAX_STEPS; ++i)
	{
		float dt = getDist(ro + rd*t) * c_fSmooth;
		if(dt >= EPS) {
			steps++;
		}
		else {
			break;
		}
		t += dt;
	}

	return steps;
}

float intersectDist(in vec3 ro, in vec3 rd) {
	float t = gMin;
	float dist = -1.0;

	for(int i=0; i<MAX_STEPS; ++i)
	{
		float dt = getDist(ro + rd*t) * c_fSmooth;

		if(dt < EPS) {
			dist = t;
			break;
		}

		t += dt;

		if(t > gMax)
			break;
	}

	return dist;
}

float getShadow(in vec3 pos, in vec3 toLight) {
	float shadow    = 1.0;
	float lightDist = distance(uLightP, pos);

	float t = EPS1;
	float dt;

	for(int i = 0; i < MAX_STEPS; ++i)
	{
		dt = getDist(pos+(toLight*t)) * c_fSmooth;

		if(dt < EPS)
			return 0.0;

		shadow = min(shadow, SS_K*(dt/t));

		t += dt;

		if(t > lightDist)
			break;
	}

	return clamp(shadow, 0.0, 1.0);
}

#define AO_K      1.5
#define AO_DELTA  0.2
#define AO_N      5
float getAO(in vec3 pos, in vec3 nor) {
	float sum = 0.0;
	float weight = 0.5;
	float delta = AO_DELTA;

	for (int i=0; i<AO_N; ++i) {
		sum += weight * (delta - getDist(pos+nor*delta));

		delta += AO_DELTA;
		weight *= 0.5;
	}

	return clamp(1.0 - AO_K*sum, 0.0, 1.0);
}

#define SSS_K      1.5
#define SSS_DELTA  0.3
#define SSS_N      5
float getSSS (in vec3 pos, in vec3 look) {
	float sum    = 0.0;
	float weight = -0.5;
	float delta  = SSS_DELTA;

	for (int i=0; i<SSS_N; ++i) {
		sum += weight * min(0.0, getDist(pos+look*delta));

		delta += delta;
		weight *= 0.5;
	}

	return clamp(SSS_K*sum, 0.0, 1.0);
}

#define KA  0.1
#define KD  0.9
#define KR  0.3
vec3 rayMarch (in vec3 ro, in vec3 rd) {

	#ifdef CHECK_BOUNDS

	if (intersectBounds(ro, rd)) {

	#endif // CHECK_BOUNDS

		#ifdef RENDER_STEPS

		int steps = intersectSteps(ro, rd);  
		return vec3(float(MAX_STEPS-steps)/float(MAX_STEPS));

		#else

		float t = intersectDist(ro, rd);

		if (t > 0.0) {

			#ifdef RENDER_DIST

			const float maxDist = 20.0;
			t = min(t, maxDist);
			return vec3((maxDist-t)/maxDist);

			#else

			vec3 pos = ro + rd*t;
			vec3 nor = getNormal(pos-rd*EPS);

			vec3 col = currCol;
			float sss = currSSS;

			#ifdef FX_DIFFUSE

			vec3 toLight = normalize(uLightP-pos);
			float shadow = 1.0; 

			#ifdef FX_SHADOW

			shadow = getShadow(pos, toLight);

			#endif // FX_SHADOW

			col *= (KA + KD*max(dot(toLight,nor),0.0)*shadow);

			#endif // FX_DIFFUSE

			#ifdef FX_OCCLUSION

			float ao = getAO(pos, nor);
			col *= ao;

			#endif // FX_OCCLUSION

			#ifdef FX_SUBSURFACE

			sss *= getSSS(pos, rd);
			col *= 1.0-sss;

			#endif // FX_SUBSURFACE

			#ifdef FX_FOG

			float fogAmount = exp(-0.05*t);
			col *= fogAmount;

			#endif // FX_FOG

			currHit = true;
			currPos = pos;
			currNor = nor;

			return col;

			#endif // ENDER_DIST
		}

		#endif // RENDER_STEPS

		currHit = false;

	#ifdef CHECK_BOUNDS

	}

	#endif // CHECK_BOUNDS

	return vec3(0.0);
}

vec3 render(in vec3 ro, in vec3 rd) {
	vec3 col = rayMarch(ro, rd);

	#ifdef FX_REFLECTION

	if (currHit) {
		vec3 reflRay = reflect(rd, currNor);
		col = col*(1.0-KR) + rayMarch(currPos+reflRay*EPS1, reflRay)*KR;
	}

	#endif // FX_REFLECTION

	return col;
}

void main(void) {
	vec3 C = normalize(uCamCenter-uCamPos);
	vec3 A = uAspect*normalize(cross(C,uCamUp));
	vec3 B = -normalize(uCamUp);

	vec3 rd = normalize(C + (2.0*vUv.x-1.0)*ROOTTHREE*A + (2.0*vUv.y-1.0)*ROOTTHREE*B);
	vec3 ro = uCamPos;

	#ifdef FX_DITHER

	float t = intersectDist(ro, rd);
	vec2 uv = vUv;
	float dither = t*t*c_fDither;
	uv.x += rand(vUv+vec2(.12, .32))*dither - dither/2.0;
	uv.y += rand(vUv+vec2(.42, .52))*dither - dither/2.0;
	ro = uCamPos+C + (2.0*uv.x-1.0)*ROOTTHREE*A + (2.0*uv.y-1.0)*ROOTTHREE*B;

	#endif // FX_DITHER

	gl_FragColor.a = 1.0;
	gl_FragColor.rgb = render(ro, rd);
}
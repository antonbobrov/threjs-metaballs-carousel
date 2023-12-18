varying vec2 vUv;

struct Point {
  float currentX;
  float currentY;
};

uniform float u_aspect;
uniform float u_time;
uniform float u_radius;
uniform float u_loopProgress;
uniform float u_textureNoiseShift;
uniform float u_textureNoiseScale;
uniform float u_metaballsNoiseShift;
uniform float u_metaballsNoiseScale;

uniform sampler2D u_textures[TEXTURES_COUNT];
uniform Point u_points[POINTS_COUNT];

vec2 getAspectCoords(vec2 coords) {
  coords.x *= u_aspect;

  return coords;
}

void main() {
  float textureNoise = snoise(vec3(vUv * u_textureNoiseShift, 0.0)) * u_textureNoiseScale;
  float metaballsNoise = snoise(vec3(vUv * u_metaballsNoiseShift, u_time)) * u_metaballsNoiseScale;

  float radius = u_radius - (u_radius * u_loopProgress) * 0.2;
  float metaballs = 0.0;

  for (int i = 0; i < POINTS_COUNT; i += 1) {
    Point point = u_points[i];

    float x = point.currentX + metaballsNoise;
    float y = point.currentY + metaballsNoise;

    float dist = distance(vec2(x * u_aspect, 1.0 - y), getAspectCoords(vUv));
    
    metaballs += radius / dist;
  }

  float smoothMetaballs = smoothstep(0.95, 1.0, metaballs);

  float prevDistortion = metaballs < 1.0 ? 1.0 - metaballs : 0.0;
  prevDistortion *= 3.0;
  prevDistortion += u_loopProgress * textureNoise;

  vec4 prev = texture2D(u_textures[PREV_INDEX], vUv + prevDistortion);
  vec4 next = texture2D(u_textures[NEXT_INDEX], vUv);
  
  vec3 color = mix(next.rgb, prev.rgb, smoothMetaballs);

  gl_FragColor = vec4(color, 1.0);
}

/** Screens: still frames that power on like a projector gate and fall out of focus with distance. */
export const frameVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const frameFragment = /* glsl */ `
  uniform sampler2D map;
  uniform float uOn;
  uniform float uFocus;
  uniform float uTime;
  uniform float uSeed;
  uniform vec2 uCover; // uv scale to emulate object-fit: cover
  uniform float uAlpha;
  varying vec2 vUv;

  void main() {
    // Slow push-in, different phase per screen.
    float z = 1.0 - 0.05 * (0.5 + 0.5 * sin(uTime * 0.07 + uSeed * 6.28));
    vec2 uv = (vUv - 0.5) * uCover * z + 0.5;
    vec3 c = texture2D(map, uv).rgb;

    float g = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(g) * vec3(0.92, 0.96, 1.0), c, uFocus);
    c *= mix(0.3, 1.0, uFocus);

    // Gate opens from a horizontal slit; a brief over-exposure on the edge of the slit.
    float d = abs(vUv.y - 0.5);
    float open = uOn * 0.5;
    float m = smoothstep(open + 0.004, open - 0.004, d);
    float edge = smoothstep(0.03, 0.0, abs(d - open)) * (1.0 - uOn) * step(0.001, uOn);
    c = c * m + vec3(1.0, 0.86, 0.82) * edge * 0.45;

    // Projector flicker, very small.
    c *= 0.985 + 0.015 * sin(uTime * 37.0 + uSeed * 91.0);

    gl_FragColor = vec4(c, uAlpha);
  }
`

/** Eclipse corona: a billboard ring, brighter on the left like the logo's gradient. */
export const coronaVertex = frameVertex

export const coronaFragment = /* glsl */ `
  uniform float uIgnite;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * 4.0; // 1.0 == sphere radius
    float r = length(p);
    float ang = atan(p.y, p.x);
    float side = 0.35 + 0.65 * pow(0.5 + 0.5 * (-p.x / max(r, 0.001)), 1.6);

    float photon = exp(-pow((r - 1.0) * 22.0, 2.0));
    float halo = exp(-max(r - 1.0, 0.0) * 2.6) * step(0.985, r);
    float shimmer = 0.85 + 0.15 * sin(ang * 9.0 + uTime * 0.6) * sin(ang * 4.0 - uTime * 0.37);

    vec3 red = vec3(0.75, 0.031, 0.067);
    vec3 col = red * (photon * 2.6 + halo * 1.1) * side * shimmer;
    col += vec3(1.0, 0.55, 0.45) * photon * pow(side, 3.0) * 1.4;
    col *= uIgnite;
    float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
    gl_FragColor = vec4(col, a);
  }
`

/** Projector dust: soft points that drift and fade with depth. */
export const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.11 + aSeed * 40.0) * 0.35;
    p.y += sin(uTime * 0.07 + aSeed * 17.0) * 0.45 + uTime * 0.02 * (aSeed - 0.5);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    gl_PointSize = uSize * (0.6 + aSeed) * (12.0 / max(depth, 0.5));
    vAlpha = smoothstep(26.0, 3.0, depth) * smoothstep(0.2, 1.4, depth) * (0.35 + 0.65 * fract(aSeed * 13.7));
    gl_Position = projectionMatrix * mv;
  }
`

export const dustFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vec3(1.0, 0.93, 0.86) * a * 0.32, a);
  }
`

/** Final grade: grain, vignette, slight lateral chromatic aberration, fade and the white cut. */
export const gradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uFade: { value: 0 },
    uFlash: { value: 0 },
    uGrain: { value: 0.09 },
    uAberration: { value: 0.0018 },
  },
  vertexShader: frameVertex,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uFade;
    uniform float uFlash;
    uniform float uGrain;
    uniform float uAberration;
    varying vec2 vUv;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c);
      vec2 off = c * uAberration * (1.0 + r2 * 4.0);
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;

      float vig = smoothstep(0.85, 0.18, r2 * 1.6);
      col *= mix(0.55, 1.0, vig);

      // Multiplicative grain keeps the blacks black.
      float n = hash(vUv * vec2(1920.0, 1080.0) + fract(uTime * 7.13) * 100.0) - 0.5;
      col *= 1.0 + n * uGrain * 2.2;
      col += n * 0.006;

      col *= uFade;
      col = mix(col, vec3(1.0, 0.97, 0.94), uFlash);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
}

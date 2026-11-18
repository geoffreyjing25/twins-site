var e=`#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 uv;
out vec4 o;
`,t=`
float hash1(float n) { return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
`,n=`
uniform sampler2D uH;
uniform vec2 uPaperScale;
// 0 = open channel (fibre), 1 = dense sizing. Ink and water move more easily where this is low.
float paperBarrier(vec2 p) {
  vec4 t = texture(uH, p * uPaperScale, 1.2);
  float coarse = texture(uH, p * uPaperScale * 0.31 + 0.37).r;
  float fib = texture(uH, p * uPaperScale).g;
  return clamp(0.66 + (t.r - 0.5) * 0.5 + (coarse - 0.5) * 0.8 - fib * 0.66, 0.0, 1.0);
}
`,r=`
uniform float uAspect, uScroll, uDoc;
uniform sampler2D uPath;
// On the site the river follows a path laid out in page space (uDoc > 0): uPath holds centre and half-width
// along the page, uScroll is how far the page is scrolled, both in viewport heights. In the lab it is a formula.
float riverW(float y) { return uScroll + (1.0 - y); }
float riverCx(float y) { if (uDoc > 0.0) return texture(uPath, vec2(riverW(y) / uDoc, 0.5)).r; return 0.5 + 0.17 * sin(y * 5.65 + 0.8) + 0.05 * sin(y * 14.4 + 2.0); }
float riverHalf(float y) { if (uDoc > 0.0) return texture(uPath, vec2(riverW(y) / uDoc, 0.5)).g; return (0.075 + 0.03 * sin(y * 9.0 + 1.0)) * 1.2 / max(uAspect, 1.0); }
float riverBed(vec2 p) {
  float d = abs(p.x - riverCx(p.y)), hw = riverHalf(p.y);
  if (uDoc > 0.0) p.y = -riverW(p.y);   // bank detail stays with the page as it scrolls
  // banks are never two clean parallel lines
  hw *= 0.80 + 0.42 * vnoise(p * vec2(7.0 * uAspect, 9.0) + 3.1) + 0.10 * vnoise(p * vec2(31.0 * uAspect, 43.0));
  return 1.0 - smoothstep(hw * 0.78, hw, d);
}
// on the site the settled wash is streaked along the current instead of an even tone
float riverTone(vec2 p) {
  if (uDoc <= 0.0) return 1.0;
  float yw = riverW(p.y), x = (p.x - riverCx(p.y)) * uAspect;
  float streak = fbm(vec2(x * 95.0, yw * 2.0)) * 0.6 + fbm(vec2(x * 34.0 + 9.0, yw * 1.1)) * 0.4;
  float pool = vnoise(vec2(p.x * uAspect * 3.0, yw * 2.6) + 7.0);
  float bed = riverBed(p);
  // a wash dries darkest along its edge, and stops at the bank instead of fading out like a spray
  float rim = smoothstep(0.0, 0.35, bed) * (1.0 - smoothstep(0.35, 0.95, bed));
  float body = 0.10 + 1.15 * smoothstep(0.32, 0.66, streak) * (0.40 + 0.80 * pool);
  return clamp((body * 0.85 + rim * 0.75) * smoothstep(0.0, 0.2, bed), 0.0, 1.4);
}
vec2 riverDir(float y) {
  float dc = (riverCx(y + 0.004) - riverCx(y - 0.004)) / 0.008;
  return normalize(vec2(-dc * uAspect, -1.0));
}
`,i=e+t+r+`
uniform sampler2D uT; uniform float uOff, uFill, uPale;
void main() {
  vec2 p = uv - vec2(0.0, uOff);
  if (p.y >= 0.0 && p.y <= 1.0) { o = texture(uT, p); return; }
  if (uFill > 0.5) { float bed = riverBed(uv); o = vec4(0.05 * bed * uPale, bed * 1.15, 0.085 * uPale * riverTone(uv), 0.0); }
  else o = vec4(0.0);
}`,a=e+`uniform sampler2D uT; void main() { o = texture(uT, uv); }`,o=e+`uniform vec4 uC; void main() { o = uC; }`,s=e+`
uniform sampler2D uV; uniform float uDt; uniform float uAspect;
void main() {
  vec3 v = texture(uV, uv).xyz;
  vec2 p = uv - uDt * v.xy * vec2(1.0 / uAspect, 1.0);
  o = vec4(texture(uV, p).xy, v.z, 1.0);
}`,c=e+`
uniform sampler2D uV; uniform vec2 uTexel;
void main() {
  float L = texture(uV, uv - vec2(uTexel.x, 0)).y, R = texture(uV, uv + vec2(uTexel.x, 0)).y;
  float B = texture(uV, uv - vec2(0, uTexel.y)).x, T = texture(uV, uv + vec2(0, uTexel.y)).x;
  o = vec4(0.5 * ((R - L) - (T - B)), 0, 0, 1);
}`,l=e+t+r+`
uniform sampler2D uV, uCurl, uS; uniform vec2 uTexel; uniform float uDt, uVort, uTime; uniform int uMode;
void main() {
  vec3 v = texture(uV, uv).xyz;
  float L = texture(uCurl, uv - vec2(uTexel.x, 0)).x, R = texture(uCurl, uv + vec2(uTexel.x, 0)).x;
  float B = texture(uCurl, uv - vec2(0, uTexel.y)).x, T = texture(uCurl, uv + vec2(0, uTexel.y)).x;
  float C = texture(uCurl, uv).x;
  vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f = f / (length(f) + 1e-4) * uVort * C; f.y *= -1.0;
  v.xy += f * uDt;
  float w = texture(uS, uv).g;
  if (uMode == 2) {
    // the tray is never perfectly still: a very slow drift draws the ink out into threads
    vec2 q2 = uv * vec2(uAspect, 1.0) * 2.3;
    float e = 0.02;
    float n0 = fbm(q2 + vec2(0.0, uTime * 0.02));
    vec2 drift = vec2(fbm(q2 + vec2(0.0, e) + vec2(0.0, uTime * 0.02)) - n0, -(fbm(q2 + vec2(e, 0.0) + vec2(0.0, uTime * 0.02)) - n0)) / e;
    v.xy += drift * 0.004 * uDt;
    v.xy *= 0.990;
  } else if (uMode == 4) {
    float bed = riverBed(uv);
    vec2 q = uv * vec2(uAspect, 1.0);
    float n1 = vnoise(q * 5.0 + vec2(0.0, uTime * 0.35)) - 0.5;
    float n2 = vnoise(q * 9.0 - vec2(uTime * 0.2, 3.0)) - 0.5;
    vec2 d = riverDir(uv.y);
    v.xy += (d * (0.62 + 0.5 * n1) + vec2(-d.y, d.x) * n2 * 0.9) * bed * uDt;
    v.xy *= mix(0.55, 0.972, smoothstep(0.0, 0.7, bed));
  } else {
    v.xy *= mix(0.45, 0.90, smoothstep(0.35, 1.1, w));
  }
  v.z *= 0.86;
  o = vec4(v, 1.0);
}`,u=e+`
uniform sampler2D uV; uniform vec2 uTexel; uniform int uMode;
void main() {
  float L = texture(uV, uv - vec2(uTexel.x, 0)).x, R = texture(uV, uv + vec2(uTexel.x, 0)).x;
  float B = texture(uV, uv - vec2(0, uTexel.y)).y, T = texture(uV, uv + vec2(0, uTexel.y)).y;
  vec3 c = texture(uV, uv).xyz;
  float open = uMode == 4 ? 1.0 : -1.0;
  if (uv.x - uTexel.x < 0.0) L = -c.x; if (uv.x + uTexel.x > 1.0) R = -c.x;
  if (uv.y - uTexel.y < 0.0) B = open * c.y; if (uv.y + uTexel.y > 1.0) T = open * c.y;
  o = vec4(0.5 * (R - L + T - B) - c.z, 0, 0, 1);
}`,d=e+`
uniform sampler2D uP, uD; uniform vec2 uTexel;
void main() {
  float L = texture(uP, uv - vec2(uTexel.x, 0)).x, R = texture(uP, uv + vec2(uTexel.x, 0)).x;
  float B = texture(uP, uv - vec2(0, uTexel.y)).x, T = texture(uP, uv + vec2(0, uTexel.y)).x;
  o = vec4((L + R + B + T - texture(uD, uv).x) * 0.25, 0, 0, 1);
}`,f=e+`
uniform sampler2D uP, uV; uniform vec2 uTexel;
void main() {
  float L = texture(uP, uv - vec2(uTexel.x, 0)).x, R = texture(uP, uv + vec2(uTexel.x, 0)).x;
  float B = texture(uP, uv - vec2(0, uTexel.y)).x, T = texture(uP, uv + vec2(0, uTexel.y)).x;
  vec3 v = texture(uV, uv).xyz;
  o = vec4(v.xy - 0.5 * vec2(R - L, T - B), v.z, 1.0);
}`,p=e+`
uniform sampler2D uV; uniform vec2 uPoint; uniform vec3 uForce; uniform float uRadius, uAspect;
void main() {
  vec2 d = (uv - uPoint) * vec2(uAspect, 1.0);
  float g = exp(-dot(d, d) / (uRadius * uRadius));
  vec3 v = texture(uV, uv).xyz;
  o = vec4(v + uForce * g, 1.0);
}`,m=e+t+`
uniform sampler2D uS, uV; uniform float uDt, uAspect, uTime; uniform int uMode; uniform vec2 uRes;
vec2 curl(vec2 p) {
  float e = 0.01, n = fbm(p);
  return vec2(fbm(p + vec2(0.0, e)) - n, -(fbm(p + vec2(e, 0.0)) - n)) / e;
}
void main() {
  vec4 c = texture(uS, uv);
  vec2 v = texture(uV, uv).xy;
  vec2 p = uv - uDt * v * vec2(1.0 / uAspect, 1.0);
  if (uMode == 2) {
    // while a drop is fresh, small eddies curl its edge and open gaps inside it
    vec2 q = uv * vec2(uAspect, 1.0);
    vec2 tv = curl(q * 9.0 + vec2(0.0, uTime * 0.05)) * 0.55 + curl(q * 26.0 + vec2(uTime * 0.07, 3.0)) * 0.30;
    p -= uDt * tv * 0.19 * c.a * vec2(1.0 / uAspect, 1.0);
  }
  if (uMode == 2 || uMode == 4) {
    // plain bilinear back-tracing blurs a little every frame; easing the fractional part keeps fronts crisp
    vec2 st = p * uRes - 0.5, i = floor(st), f = fract(st);
    f = f * f * (3.0 - 2.0 * f);
    f = mix(fract(st), f, 0.85);
    p = (i + f + 0.5) / uRes;
  }
  vec4 a = texture(uS, p);
  o = vec4(a.r, (uMode == 2) ? 1.0 : (uMode == 4) ? c.g : a.g, c.b, (uMode == 2) ? a.a : c.a);
}`,h=e+t+n+r+`
uniform sampler2D uS; uniform vec2 uTexel, uRes; uniform int uMode;
uniform float uKw, uKm, uEdge, uDep, uEvap, uGran, uTime, uPale, uFade;
void main() {
  vec4 c = texture(uS, uv);
  float m = c.r, w = c.g, d = c.b, a = c.a;
  vec2 pp = uv * uRes;
  if (uMode == 2) {
    // still water in a tray: only slow molecular diffusion, nothing settles
    // wet paper, not open water: ink creeps outward mostly along fibres, which feathers the rim into
    // thin tendrils; then it sinks into the sheet, fastest where it is dense (a darker core)
    float hb = paperBarrier(pp);
    float dm2 = 0.0;
    for (int i = 0; i < 4; i++) {
      vec2 e = i == 0 ? vec2(1, 0) : i == 1 ? vec2(-1, 0) : i == 2 ? vec2(0, 1) : vec2(0, -1);
      vec4 s = texture(uS, uv + e * uTexel);
      float hh = max(hb, paperBarrier(pp + e));
      float cond = mix(0.235, 0.0012, smoothstep(0.14, 0.42, hh));
      dm2 += cond * (s.r - m);
    }
    m = max(0.0, m + dm2 * (0.35 + 0.65 * a));
    float settle = 0.0035 * (1.0 - 0.75 * a) + 0.012 * smoothstep(0.35, 1.0, m);
    float sink = m * settle * (0.8 + 0.4 * (1.0 - hb));
    o = vec4(m - sink, 1.0, d + sink, a * 0.9885);
    return;
  }
  float h = paperBarrier(pp);
  float dm = 0.0, dw = 0.0;
  for (int i = 0; i < 4; i++) {
    vec2 e = i == 0 ? vec2(1, 0) : i == 1 ? vec2(-1, 0) : i == 2 ? vec2(0, 1) : vec2(0, -1);
    vec4 s = texture(uS, uv + e * uTexel);
    float hn = paperBarrier(pp + e);
    float hh = max(h, hn) * 0.65 + min(h, hn) * 0.35;
    float theta = mix(0.05, 0.62, hh);
    float gate = smoothstep(theta, theta + 0.12, max(w, s.g));
    dw += uKw * gate * (s.g - w);
    float gm = gate * smoothstep(0.04, 0.30, min(w, s.g));
    dm += uKm * gm * (s.r * (1.0 + uEdge * max(0.0, s.g - w)) - m * (1.0 + uEdge * max(0.0, w - s.g)));
  }
  m = max(0.0, m + dm);
  w = max(0.0, w + dw);
  if (uMode == 4) {
    float bed = riverBed(uv);
    w = max(w, bed * 1.15);
    // ink enters at the head of the river in uneven pulses and leaves at the foot
    vec2 q = uv * vec2(uAspect, 1.0);
    float pulse = smoothstep(0.38, 0.75, vnoise(vec2(uTime * 0.55, 3.0)) * 0.6 + fbm(q * 7.0 + vec2(1.3, uTime * 0.6)) * 0.6);
    float head = smoothstep(0.90, 0.985, uv.y) * bed;
    float streak = smoothstep(0.52, 0.80, vnoise(vec2(q.x * 70.0, uTime * 0.9))) * (0.4 + 0.6 * vnoise(vec2(q.x * 19.0, uTime * 0.4 + 5.0)));
    m += head * (0.03 + pulse) * streak * 0.024;
    m = max(m, 0.014 * smoothstep(0.35, 0.62, bed));
    // ink also joins the current at a few places downstream, always as threads, so the whole length has moving detail
    float station = pow(abs(sin(uv.y * 3.14159 * 4.0 + 0.6)), 24.0);
    float thread = smoothstep(0.50, 0.78, vnoise(vec2(q.x * 85.0 + floor(uv.y * 4.0) * 17.0, uTime * 0.7 + uv.y * 3.0)));
    m += station * thread * bed * (0.05 + pulse) * 0.03;
    m = min(m, 0.40 * uPale);
    float mid = bed * smoothstep(0.63, 0.80, fbm(q * 4.0 + vec2(uTime * 0.07, uTime * 0.31)));
    m += mid * 0.012;
    m *= 1.0 - 0.06 * smoothstep(0.05, 0.0, uv.y);
    m *= 1.0 - 0.0012 * bed;
  }
  // settling: fast as the sheet dries, slower in standing water, more in the low parts of the paper
  float dry = 1.0 - smoothstep(0.0, 0.45, w);
  float rate = uDep * (0.18 + 1.6 * dry) * (1.0 + uGran * (0.5 - h) * 2.0);
  if (uMode == 4) rate *= (1.0 - smoothstep(0.08, 0.30, d)) * 0.5;
  float dep = m * clamp(rate, 0.0, 1.0);
  if (w < 0.012) dep = m;
  // a standing river would otherwise draw a hard black line where its bank meets dry paper
  if (uMode == 4) dep = min(m * clamp(uDep * 0.5 * (1.0 + uGran * (0.5 - h) * 2.0), 0.0, 1.0) + (w < 0.012 ? m : 0.0), max(0.0, 0.13 * uPale * riverTone(uv) * (uDoc > 0.0 ? 0.55 + 0.9 * (1.0 - h) : 1.0) - d));
  m -= dep; d += dep;
  if (uMode == 4 && uFade > 0.0) {
    // painted strokes outside the river slowly leave the paper
    float away = 1.0 - smoothstep(0.0, 0.3, riverBed(uv));
    d -= d * uFade * away; m -= m * uFade * away * (1.0 - smoothstep(0.0, 0.2, w));
  }
  w = max(0.0, w - uEvap * (0.4 + 0.6 * h));
  a = max(a * 0.9985, smoothstep(0.02, 0.2, w));
  o = vec4(m, w, d, a);
}`,g=e+t+n+`
uniform sampler2D uS; uniform vec2 uA, uB, uRes; uniform float uRa, uRb, uPig, uWater, uDry, uSeed, uAspect;
void main() {
  vec4 c = texture(uS, uv);
  vec2 asp = vec2(uAspect, 1.0);
  vec2 p = uv * asp, a = uA * asp, b = uB * asp;
  vec2 ab = b - a; float l2 = dot(ab, ab);
  float t = l2 > 1e-10 ? clamp(dot(p - a, ab) / l2, 0.0, 1.0) : 0.0;
  float r = mix(uRa, uRb, t);
  vec2 dv = p - (a + ab * t);
  float dist = length(dv);
  if (dist > r * 1.25) { o = c; return; }
  float h = paperBarrier(uv * uRes);
  vec2 dir = l2 > 1e-10 ? ab / sqrt(l2) : vec2(1, 0);
  float q = dot(dv, vec2(-dir.y, dir.x)) / max(r, 1e-5);          // across the brush, -1..1
  float along = dot(p, dir);
  // ragged contact edge: hairs splay unevenly and catch the paper tooth
  float edgeN = vnoise(vec2(q * 9.0 + uSeed, along * 34.0)) * 0.55 + vnoise(vec2(along * 9.0, uSeed)) * 0.30 + vnoise(vec2(along * 160.0, uSeed + q * 3.0)) * 0.07;
  float rr = r * (0.84 + 0.22 * edgeN + 0.10 * (0.5 - h));
  float cov = 1.0 - smoothstep(rr * 0.90, rr, dist);
  // bristles: fixed pattern across the brush, drifting slowly along the stroke
  float nb = 26.0 + 50.0 * r / 0.03;
  float br = vnoise(vec2(q * nb * 0.13 + uSeed * 3.0, along * 2.2)) * 0.40 + vnoise(vec2(q * nb * 0.5 + uSeed * 7.0, along * 5.0)) * 0.36 + vnoise(vec2(q * nb * 1.7 + uSeed, along * 16.0)) * 0.24;
  float tooth = 1.0 - h;                                           // fibres stand proud of the sheet
  float grain = vnoise(uv * uRes * 0.55) * 0.5 + hash2(floor(uv * uRes)) * 0.5;
  float wet = br * 0.60 + tooth * 0.30 + grain * 0.22;
  float mask = mix(1.0, smoothstep(uDry * 1.02 - 0.06, uDry * 1.02 + 0.07, wet), smoothstep(0.0, 0.12, uDry));
  // a loaded brush is darkest in the belly, paler at the tip hairs
  float belly = mix(0.70, 1.0, smoothstep(1.0, 0.25, abs(q))) * (0.62 + 0.62 * br);
  float k = cov * mask;
  float pig = uPig * belly;
  float wetPart = 1.0 - uDry;
  float thin = smoothstep(0.35, 1.1, uWater);
  c.r = mix(c.r, max(c.r, pig * mix(0.12, 0.60, thin)), k * wetPart);
  c.b = mix(c.b, max(c.b, pig * mix(0.90, 0.48, thin)), k * wetPart);
  c.g = mix(c.g, max(c.g, uWater), k * wetPart) + uWater * k * wetPart * 0.02;
  c.g = min(c.g, 1.6);
  c.b = mix(c.b, max(c.b, pig * 0.95), k * uDry);
  o = c;
}`,_=e+t+`
uniform sampler2D uS; uniform vec2 uPoint; uniform float uRadius, uAmount, uSeed, uAspect, uWet;
void main() {
  vec4 c = texture(uS, uv);
  vec2 d = (uv - uPoint) * vec2(uAspect, 1.0);
  float ang = atan(d.y, d.x);
  float rr = uRadius * (1.0 + 0.16 * (vnoise(vec2(ang * 2.2 + uSeed, uSeed)) - 0.5) + 0.10 * (vnoise(vec2(ang * 7.0, uSeed * 3.0)) - 0.5) + 0.09 * (vnoise(vec2(ang * 19.0, uSeed * 5.0)) - 0.5));
  float g = exp(-pow(dot(d, d) / (rr * rr), 4.0));
  float tex = smoothstep(0.30, 0.66, fbm(d / uRadius * 4.5 + uSeed)) * 1.25 + 0.08;   // broken, with gaps
  float core = exp(-dot(d, d) / (rr * rr * 0.11));
  c.r += uAmount * (g * tex * 0.75 + core * 1.1);
  c.a = max(c.a, exp(-pow(dot(d, d) / (rr * rr * 3.0), 2.0)));
  c.g = max(c.g, uWet * g);
  o = c;
}`,v=e+t+`
uniform sampler2D uS, uPaper, uH, uMottle; uniform vec2 uPaperScale, uCanvas; uniform int uMode; uniform float uSeedPaper, uMottleAmt, uStain, uPlain, uRem;
// an old water stain: barely darker inside, a slightly stronger line where it dried
float stain(vec2 uv, vec2 c, float r, float seed) {
  vec2 d = (uv - c) * vec2(uCanvas.x / uCanvas.y, 1.0);
  float ang = atan(d.y, d.x);
  float rr = r * (1.0 + 0.5 * (vnoise(vec2(ang * 1.3 + seed, seed)) - 0.5) + 0.16 * (vnoise(vec2(ang * 5.0, seed * 2.0)) - 0.5));
  float x = length(d) / rr;
  return (1.0 - smoothstep(0.90, 1.0, x)) * 0.010 + smoothstep(0.84, 0.975, x) * (1.0 - smoothstep(0.975, 1.02, x)) * 0.022;
}
vec3 toLin(vec3 c) { return pow(c, vec3(2.2)); }
vec3 toSrgb(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }
void main() {
  vec2 px = uv * uCanvas;
  vec2 pc = px * uPaperScale;
  // two rotated layers of the same scan, mixed by a slow mask, so the tile never reads as a repeat
  vec2 pc2 = mat2(0.8, -0.6, 0.6, 0.8) * pc * 0.83 + vec2(0.31, 0.67);
  float mixn = smoothstep(0.35, 0.65, vnoise(px / 420.0 + uSeedPaper));
  vec3 paper = mix(texture(uPaper, pc).rgb, texture(uPaper, pc2).rgb, mixn);
  vec4 hA = texture(uH, pc), hB = texture(uH, pc2);
  float relief = mix(hA.r, hB.r, mixn) - 0.5;
  float fibre = hA.g;
  float mot = mix(texture(uMottle, pc * 0.27).r, texture(uMottle, pc2 * 0.19).r, 0.5) - 0.5;
  paper *= 1.0 + mot * uMottleAmt;
  float st = (stain(uv, vec2(0.83, 0.74), 0.19, 3.0) + stain(uv, vec2(0.12, 0.18), 0.13, 8.0)) * uStain;
  paper *= vec3(1.0 - st, 1.0 - st * 1.15, 1.0 - st * 1.6);
  paper = toLin(paper);

  vec4 s = texture(uS, uv - vec2(0.0, uRem));
  float h = clamp(0.5 + relief * 1.3 - fibre * 0.10, 0.0, 1.0);
  // pigment collects in the low parts of the sheet; thin washes show the grain most
  float gran = 1.0 + (0.5 - h) * 0.55;
  float mob = s.r;
  if (uMode == 4) mob = mob * (0.35 + 0.65 * smoothstep(0.0, 0.22, mob)) * 1.15;
  float dens = s.b * gran + mob * (uMode == 2 ? 1.0 : 0.85) * (uMode == 4 ? mix(1.0, gran, 0.8) : 1.0);
  // soot ink: neutral black that warms slightly where it is thin
  vec3 k = vec3(2.55, 2.68, 2.9);
  vec3 T = exp(-k * dens);
  vec3 inkFloor = vec3(0.012, 0.011, 0.011);
  vec3 col = paper * T + inkFloor * (1.0 - T);
  // wet paper is a little darker and cooler until it dries
  float wetv = (uMode == 2) ? 0.0 : smoothstep(0.02, 0.6, s.g);
  col *= mix(vec3(1.0), vec3(0.90, 0.905, 0.915), wetv * (uMode == 4 ? 0.45 : 1.0) * (1.0 - smoothstep(0.0, 1.2, dens)));
  // photographed, not rendered: gentle uneven light and lens falloff, sensor grain
  vec2 cc = uv - vec2(0.46, 0.56);
  if (uPlain < 0.5) col *= 1.03 - 0.16 * dot(cc, cc);
  col = toSrgb(col);
  if (uPlain < 0.5) col += (hash2(px + 0.5) - 0.5) * 0.012;
  o = vec4(col, 1.0);
}`,y=class{constructor(e,t,n,r){this.canvas=e,this.mode=1,this.time=0,this.quality=1,this.progs=new Map,this.papers={},this.paperKind=`a`,this.doc=0,this.simScroll=0,this.rem=0,this.pale=1,this.fade=0,this.paperSeed=Math.random()*10,this.tilePx=640,this.tile=640;let y=e.getContext(`webgl2`,{alpha:!1,antialias:!1,preserveDrawingBuffer:!0,powerPreference:`high-performance`});if(!y)throw Error(`webgl2 unavailable`);if(!y.getExtension(`EXT_color_buffer_float`)&&!y.getExtension(`EXT_color_buffer_half_float`))throw Error(`float targets unavailable`);this.gl=y,this.half=y.HALF_FLOAT;let ee=y.createVertexArray();y.bindVertexArray(ee);let b=y.createBuffer();y.bindBuffer(y.ARRAY_BUFFER,b),y.bufferData(y.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),y.STATIC_DRAW),y.enableVertexAttribArray(0),y.vertexAttribPointer(0,2,y.FLOAT,!1,0,0);let x=[[`copy`,a],[`shift`,i],[`clear`,o],[`advectVel`,s],[`curl`,c],[`forces`,l],[`divergence`,u],[`pressure`,d],[`gradient`,f],[`splatVel`,p],[`advectInk`,m],[`flowInk`,h],[`splatInk`,g],[`dropInk`,_],[`render`,v]];for(let[e,t]of x)this.progs.set(e,this.compile(t));this.tile=t.naturalWidth||640,this.papers.a=this.image(t),this.mottle=this.image(r);let S=document.createElement(`canvas`);S.width=S.height=4;let C=S.getContext(`2d`);C.fillStyle=`#fff`,C.fillRect(0,0,4,4),this.papers.w=this.image(S),this.height=this.image(n),this.path=y.createTexture(),this.setPath(new Float32Array([.5,0,0,0]),0),this.resize()}compile(e){let t=this.gl,n=(e,n)=>{let r=t.createShader(e);if(t.shaderSource(r,n),t.compileShader(r),!t.getShaderParameter(r,t.COMPILE_STATUS))throw Error(t.getShaderInfoLog(r)+`
`+n.split(`
`).map((e,t)=>`${t+1}: ${e}`).join(`
`));return r},r=t.createProgram();if(t.attachShader(r,n(t.VERTEX_SHADER,`#version 300 es
in vec2 aPos;
out vec2 uv;
void main() { uv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`)),t.attachShader(r,n(t.FRAGMENT_SHADER,e)),t.bindAttribLocation(r,0,`aPos`),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS))throw Error(t.getProgramInfoLog(r)??`link failed`);return{p:r,u:new Map}}image(e){let t=this.gl,n=t.createTexture();return t.bindTexture(t.TEXTURE_2D,n),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.REPEAT),t.generateMipmap(t.TEXTURE_2D),n}setPath(e,t){let n=this.gl;n.bindTexture(n.TEXTURE_2D,this.path),n.texImage2D(n.TEXTURE_2D,0,n.RGBA16F,e.length/4,1,0,n.RGBA,n.FLOAT,e),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),this.doc=t}riverU(){return{uScroll:this.simScroll,uDoc:this.doc,uPath:this.path,uPale:this.pale,uFade:this.fade}}scrollTo(e,t=!1){let n=this.ink,r=Math.round((e-this.simScroll)*n.read.h);if(r!==0||t){let i=t?9:r/n.read.h;this.simScroll=t?e:this.simScroll+i,this.pass(`shift`,n.write,{uT:n.read.tex,uOff:i,uFill:1,uAspect:this.aspect,...this.riverU()}),n.swap(),this.pass(`shift`,this.vel.write,{uT:this.vel.read.tex,uOff:i,uFill:0,uAspect:this.aspect,...this.riverU()}),this.vel.swap()}this.rem=e-this.simScroll}target(e,t,n,r){let i=this.gl,a=i.createTexture();i.bindTexture(i.TEXTURE_2D,a),i.texImage2D(i.TEXTURE_2D,0,n,e,t,0,r,this.half,null),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE);let o=i.createFramebuffer();return i.bindFramebuffer(i.FRAMEBUFFER,o),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,a,0),i.viewport(0,0,e,t),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),{tex:a,fbo:o,w:e,h:t}}double(e,t,n,r){let i={read:this.target(e,t,n,r),write:this.target(e,t,n,r),swap(){let e=i.read;i.read=i.write,i.write=e}};return i}free(e){e&&(this.gl.deleteTexture(e.tex),this.gl.deleteFramebuffer(e.fbo))}get aspect(){return this.canvas.width/this.canvas.height}resize(){let e=this.gl,t=this.canvas.width,n=this.canvas.height,r=Math.round(Math.min(Math.max(t,n),2048)*this.quality),i=Math.round(320*Math.min(1,this.quality+.25)),a=e=>t>=n?[e,Math.max(2,Math.round(e*n/t))]:[Math.max(2,Math.round(e*t/n)),e],[o,s]=a(r),[c,l]=a(i),u=this.ink;this.ink=this.double(o,s,e.RGBA16F,e.RGBA),u&&(this.pass(`copy`,this.ink.read,{uT:u.read.tex}),this.free(u.read),this.free(u.write)),this.vel&&[this.vel.read,this.vel.write,this.prs.read,this.prs.write,this.div,this.curl].forEach(e=>this.free(e)),this.vel=this.double(c,l,e.RGBA16F,e.RGBA),this.prs=this.double(c,l,e.RGBA16F,e.RGBA),this.div=this.target(c,l,e.RGBA16F,e.RGBA),this.curl=this.target(c,l,e.RGBA16F,e.RGBA);let d=Math.max(1,t/Math.max(1,this.canvas.clientWidth||t));this.tilePx=this.tile*Math.max(1,d*.62)}pass(e,t,n){let r=this.gl,i=this.progs.get(e);r.useProgram(i.p);let a=0;for(let e in n){let t=i.u.get(e);if(t===void 0&&(t=r.getUniformLocation(i.p,e),i.u.set(e,t)),!t)continue;let o=n[e];typeof o==`number`?e===`uMode`?r.uniform1i(t,o):r.uniform1f(t,o):Array.isArray(o)?o.length===2?r.uniform2fv(t,o):o.length===3?r.uniform3fv(t,o):r.uniform4fv(t,o):(r.activeTexture(r.TEXTURE0+a),r.bindTexture(r.TEXTURE_2D,o),r.uniform1i(t,a++))}r.bindFramebuffer(r.FRAMEBUFFER,t?t.fbo:null),t?r.viewport(0,0,t.w,t.h):r.viewport(0,0,this.canvas.width,this.canvas.height),r.drawArrays(r.TRIANGLES,0,3)}paperU(){let e=this.ink.read;return{uH:this.height,uPaperScale:[this.canvas.width/e.w/this.tilePx,this.canvas.height/e.h/this.tilePx],uRes:[e.w,e.h]}}setMode(e){this.mode=e,this.clear()}clear(){this.pass(`clear`,this.ink.read,{uC:[0,+(this.mode===2),0,0]}),this.pass(`clear`,this.vel.read,{uC:[0,0,0,0]}),this.pass(`clear`,this.prs.read,{uC:[0,0,0,0]}),this.time=0}stroke(e,t,n,r,i,a,o,s,c,l){this.pass(`splatInk`,this.ink.write,{uS:this.ink.read.tex,...this.paperU(),uA:[e,t],uB:[n,r],uRa:i,uRb:a,uPig:o,uWater:s,uDry:c,uSeed:l,uAspect:this.aspect}),this.ink.swap()}push(e,t,n,r,i,a=0){this.pass(`splatVel`,this.vel.write,{uV:this.vel.read.tex,uPoint:[e,t],uForce:[n,r,a],uRadius:i,uAspect:this.aspect}),this.vel.swap()}drop(e,t,n,r,i=0){let a=Math.random()*100;this.pass(`dropInk`,this.ink.write,{uS:this.ink.read.tex,uPoint:[e,t],uRadius:n,uAmount:r,uSeed:a,uAspect:this.aspect,uWet:i}),this.ink.swap(),this.push(e,t,0,0,n*1.2,.24);let o=8+Math.floor(Math.random()*9);for(let r=0;r<o;r++){let r=Math.random()*6.283,i=n*(.55+Math.random()*.6),a=.05+Math.random()**3*.9;this.push(e+Math.cos(r)*i/this.aspect,t+Math.sin(r)*i,Math.cos(r)*a,Math.sin(r)*a,n*(.09+Math.random()*.16))}}step(e){let t=this.mode,n=this.vel,r=[1/n.read.w,1/n.read.h],i=this.aspect;this.time+=e,this.pass(`advectVel`,n.write,{uV:n.read.tex,uDt:e,uAspect:i}),n.swap(),this.pass(`curl`,this.curl,{uV:n.read.tex,uTexel:r}),this.pass(`forces`,n.write,{uV:n.read.tex,uCurl:this.curl.tex,uS:this.ink.read.tex,uTexel:r,uDt:e,uVort:t===2?.2:t===4?.05:0,uTime:this.time,uMode:t,uAspect:i,...this.riverU()}),n.swap(),this.pass(`divergence`,this.div,{uV:n.read.tex,uTexel:r,uMode:t});for(let e=0;e<18;e++)this.pass(`pressure`,this.prs.write,{uP:this.prs.read.tex,uD:this.div.tex,uTexel:r}),this.prs.swap();this.pass(`gradient`,n.write,{uP:this.prs.read.tex,uV:n.read.tex,uTexel:r}),n.swap();let a=this.ink,o=[1/a.read.w,1/a.read.h];this.pass(`advectInk`,a.write,{uS:a.read.tex,uV:n.read.tex,uDt:e,uAspect:i,uMode:t,uRes:[a.read.w,a.read.h],uTime:this.time}),a.swap();let s=t===4,c={...this.paperU(),...this.riverU(),uTexel:o,uMode:t,uTime:this.time,uAspect:i,uKw:s?.16:.2,uKm:s?.02:.04,uEdge:s?.9:.7,uDep:s?.004:.012,uEvap:s?.0016:.0011,uGran:.25},l=t===2?1:Math.max(a.read.w,a.read.h)>1500?3:2;for(let e=0;e<l;e++)this.pass(`flowInk`,a.write,{uS:a.read.tex,...c}),a.swap()}render(){this.pass(`render`,null,{uS:this.ink.read.tex,uPaper:this.papers[this.paperKind],uMottle:this.mottle,uMottleAmt:this.paperKind===`a`?.075:0,uStain:0,uPlain:+(this.paperKind===`w`),uRem:this.rem,uH:this.height,uPaperScale:[1/this.tilePx,1/this.tilePx],uCanvas:[this.canvas.width,this.canvas.height],uMode:this.mode,uSeedPaper:this.paperSeed})}},ee=class{constructor(e){this.ink=e,this.x=0,this.y=0,this.vx=0,this.vy=0,this.tx=0,this.ty=0,this.down=!1,this.load=1,this.size=.03,this.wetness=1,this.stiff=520,this.damp=34,this.speedDry=.6,this.response=26,this.entryLen=1.7,this.follow=.085,this.hand=null,this.travelled=0,this.drain=26,this.scripted=null,this.pressure=0,this.lastR=0,this.seed=Math.random()*100,this.contact=0}dip(e=1){this.load=e}press(e,t){this.x=this.tx=e,this.y=this.ty=t,this.vx=this.vy=0,this.down=!0,this.pressure=0,this.lastR=0,this.contact=0,this.travelled=0,this.seed=Math.random()*100}moveTo(e,t){this.tx=e,this.ty=t}lift(){this.down&&(this.tx=this.x+this.vx*this.follow,this.ty=this.y+this.vy*this.follow),this.down=!1}update(e){if(!this.down&&this.pressure<.02)return;let t=e/3,n=this.ink.aspect;for(let e=0;e<3;e++){let e=this.x,r=this.y,i=this.stiff,a=this.damp;this.vx+=((this.tx-this.x)*i-this.vx*a)*t,this.vy+=((this.ty-this.y)*i-this.vy*a)*t,this.x+=this.vx*t,this.y+=this.vy*t;let o=Math.hypot(this.vx,this.vy);this.contact+=t;let s;s=this.down?this.scripted===null?this.hand===null?.22+.78*(1-b(.12,2.4,o)):.15+.85*this.hand:this.scripted:0;let c=this.down?s>this.pressure?this.response:this.response*.62:Math.max(13,this.response*.4);this.pressure+=(s-this.pressure)*Math.min(1,c*t);let l=Math.hypot(this.x-e,this.y-r);this.travelled+=l;let u=.07+.93*b(0,this.size*this.entryLen,this.travelled),d=this.size*(.05+.95*this.pressure*this.pressure*(3-2*this.pressure)*.6+.95*this.pressure*.4)*u*(.86+.14*Math.min(1,this.load*2.5)),f=1-b(.02,.5,this.load),p=b(26,120,o/this.size)*this.speedDry*(1-.45*this.pressure),m=this.down?0:.35*(1-this.pressure),h=Math.min(.97,f*.9+p+m),g=.45+.95*Math.min(1,this.load*1.3),_=(.5+.55*this.load)*(.75+.5*this.pressure)*this.wetness*(1.15-.4*b(.1,1.2,o));d>4e-4&&(this.ink.stroke(e/n,r,this.x/n,this.y,this.lastR||d,d,g,_,h,this.seed),l>1e-5&&this.ink.push(this.x/n,this.y,this.vx*.012,this.vy*.012,d*1.4)),this.lastR=d,this.load=Math.max(0,this.load-l*d*this.drain-t*d*.08*this.pressure)}}};function b(e,t,n){let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)}var x={paper:{kind:0,k:[2.55,2.68,2.9],ink:[0,0,0],feather:.6},indigo:{kind:1,k:[1.7,1.7,1.7],ink:[.05,.05,.11],feather:1},stone:{kind:1,k:[2.2,2.2,2.2],ink:[0,0,.004],feather:1}},S={runny:.92,push:.2,radius:.07,swirl:.15,wet:16,dark:.85},C={paper:{...S},indigo:{...S},stone:{...S}},w={apply:()=>{}},te=46,T=.9988,ne=2.5,re=1.6,ie=`/albert/`,ae=e=>new Promise((t,n)=>{let r=new Image;r.onload=()=>t(r),r.onerror=n,r.src=e}),E=`#version 300 es
precision highp float; precision highp sampler2D;
in vec2 uv; out vec4 o;
`,oe=E+`uniform sampler2D uT; uniform float uOff; uniform vec4 uFill;
void main() { vec2 p = uv - vec2(0.0, uOff); o = (p.y >= 0.0 && p.y <= 1.0) ? texture(uT, p) : uFill; }`,se=E+`uniform sampler2D uS; uniform float uF;
void main() { vec4 c = texture(uS, uv); o = vec4(c.r * uF, c.g, c.b * uF, c.a); }`,ce=E+`
uniform sampler2D uS, uH, uMask; uniform vec2 uPaperScale, uTexel, uView, uDoc;
uniform vec3 uField, uK, uInk; uniform float uKind, uFeather, uRem, uScroll, uDensity, uLife, uGain;
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { return vn(p) * 0.55 + vn(p * 2.1 + 3.7) * 0.28 + vn(p * 4.3 + 8.1) * 0.17; }
vec3 toLin(vec3 c) { return pow(c, vec3(2.2)); }
vec3 toSrgb(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }
float dens(vec2 p) { vec4 s = texture(uS, p); return (s.b + s.r) * uGain; }
void main() {
  vec2 page = vec2(uv.x * uView.x, (1.0 - uv.y) * uView.y + uScroll);       // CSS px on the page
  vec2 st = uv + vec2(0.0, uRem);                                             // the sub-texel part of the scroll
  // the outline is never a circle: warped by slow noise (lobes) and fine noise (a torn edge), fixed to the page
  vec2 pq = page / uView.y, asp = vec2(uView.y / uView.x, 1.0);
  st += (vec2(fbm(pq * 5.0), fbm(pq * 5.0 + 9.2)) - 0.5) * 0.05 * asp + (vec2(vn(pq * 34.0), vn(pq * 34.0 + 4.1)) - 0.5) * 0.012 * asp;
  vec4 s = texture(uS, st) * vec4(uGain, 1.0, uGain, 1.0);
  float relief = texture(uH, st / uTexel * uPaperScale).r - 0.5;
  vec3 field = toLin(uField), col;
  if (uKind < 0.5) {
    // ink in a sheet: pigment gathers in the low parts of the paper, thin washes show the grain
    float d = (s.b + s.r * 0.95) * (1.0 + (-relief) * 0.7);   // wet or dry, the pigment sits in the paper's low parts
    d *= max(0.0, 1.0 + relief * 2.2 * uFeather * (1.0 - smoothstep(0.0, 0.4, d)));   // the thin edge breaks along the fibres
    vec3 Tr = exp(-uK * d);
    col = field * Tr + vec3(0.012, 0.011, 0.011) * (1.0 - Tr);
  } else {
    // ink spreading into a dark ground: soft at the edge (no ring), broken by the fibres it follows
    float d = 0.0;
    for (int i = 0; i < 4; i++) { float an = float(i) * 1.5708 + 0.785; d += dens(st + vec2(cos(an), sin(an)) * uTexel * 2.5); }
    d = mix(s.r * 0.9 + s.b * 0.7, d / 4.0, 0.5);
    d *= max(0.0, 1.0 + relief * 1.6 * uFeather * (1.0 - smoothstep(0.0, 0.5, d)));
    col = mix(field, toLin(uInk), 1.0 - exp(-uK.r * d));
  }
  // tight, soft clearings around every line of text (a map of the page: white = ground, black = words)
  vec2 mp = page / uDoc;
  float clear = (mp.x >= 0.0 && mp.x <= 1.0 && mp.y >= 0.0 && mp.y <= 1.0) ? texture(uMask, mp).r : 1.0;
  col = mix(field, col, uDensity * clear * uLife);
  // multiply: the canvas holds the factor that turns the ground into the inked ground
  o = vec4(clamp(toSrgb(col) / max(uField, vec3(0.002)), 0.0, 1.0), 1.0);
}`;function le(e,t,n){if(!(e instanceof Element)||e.closest(`a, button, input, label, select, textarea, blockquote, [data-tune]`))return!0;let r=document.caretPositionFromPoint?.(t,n)?.offsetNode??document.caretRangeFromPoint?.(t,n)?.startContainer;if(!r||r.nodeType!==3)return!1;let i=document.createRange();return i.selectNodeContents(r),[...i.getClientRects()].some(e=>t>=e.left-4&&t<=e.right+4&&n>=e.top-4&&n<=e.bottom+4)}async function D(e=[]){let[t,n,r]=await Promise.all([`tex/paper-a.jpg`,`tex/paper-h.png`,`tex/mottle.jpg`].map(e=>ae(ie+e))),i=document.createElement(`canvas`);i.className=`ink`,i.setAttribute(`aria-hidden`,`true`);let a=()=>{let e=Math.min(devicePixelRatio||1,2),t=Math.round(innerWidth*e),n=Math.round(innerHeight*e);return i.width===t&&i.height===n?!1:(i.width=t,i.height=n,!0)};a();let o;try{o=new y(i,t,n,r)}catch(e){return console.warn(e),null}let s=o,c=()=>matchMedia(`(pointer: coarse)`).matches?.85:Math.min(1,Math.max(.4,Math.max(innerWidth,innerHeight)/Math.min(2048,Math.max(i.width,i.height))));o.quality=c(),o.resize();let u=(e,t)=>t.reduce((e,[t,n])=>{if(!e.includes(t))throw Error(`ink: engine shader changed: `+t);return e.replace(t,n)},e),d=e=>{let t=e.indexOf(`  if (uMode == 4) {
    float bed = riverBed(uv);`),n=e.indexOf(`    m *= 1.0 - 0.0012 * bed;
  }
`,t);if(t<0||n<0)throw Error(`ink: engine shader changed: river block`);return e.slice(0,t)+e.slice(n+33)},f=u(l,[[`uniform float uDt, uVort, uTime;`,`uniform float uDt, uVort, uTime, uRunny, uSwirl;`],[`* uVort * C;`,`* uSwirl * C;`],[`v.xy *= mix(0.55, 0.972, smoothstep(0.0, 0.7, bed));`,`v.xy *= mix(uRunny, 0.972, smoothstep(0.0, 0.7, bed));`],[`float bed = riverBed(uv);`,`float bed = 0.0;`]]),p=u(d(h),[[`riverTone(uv)`,`0.0`]]);for(let[e,t]of[[`pageShift`,oe],[`dryFade`,se],[`overlay`,ce],[`forces`,f],[`flowInk`,p]])s.progs.set(e,s.compile(t));o.setPath(new Float32Array([-10,0,0,0,-10,0,0,0]),1),o.pale=1,o.fade=0;let m=()=>o.setMode(4);m();let g=new ee(o),_=o.gl,v=_.createTexture(),b=[1,1];function S(){let e=document.documentElement.scrollWidth,t=document.documentElement.scrollHeight,n=Math.min(.5,4096/t),r=document.createElement(`canvas`);r.width=Math.ceil(e*n),r.height=Math.ceil(t*n);let i=document.createElement(`canvas`);i.width=r.width,i.height=r.height;let a=i.getContext(`2d`);a.fillStyle=`#000`;let o=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),s;for(;s=o.nextNode();){if(!s.textContent?.trim()||s.parentElement?.closest(`script, style`))continue;let e=document.createRange();e.selectNodeContents(s);for(let t of e.getClientRects())a.fillRect((t.left+scrollX-1)*n,(t.top+scrollY+t.height*.12)*n,(t.width+2)*n,t.height*.8*n)}let c=r.getContext(`2d`);c.fillStyle=`#fff`,c.fillRect(0,0,r.width,r.height),c.filter=`blur(${7*n}px)`,c.drawImage(i,0,0),c.drawImage(i,0,0),c.filter=`none`,_.bindTexture(_.TEXTURE_2D,v),_.pixelStorei(_.UNPACK_FLIP_Y_WEBGL,!1),_.texImage2D(_.TEXTURE_2D,0,_.RGBA,_.RGBA,_.UNSIGNED_BYTE,r),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_MIN_FILTER,_.LINEAR),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_MAG_FILTER,_.LINEAR),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_WRAP_S,_.CLAMP_TO_EDGE),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_WRAP_T,_.CLAMP_TO_EDGE),b=[e,t]}S();let E=document.documentElement,D=()=>(E.dataset.colorway??`paper`)in x?E.dataset.colorway??`paper`:`paper`,O=x[D()],k=C[D()];w.apply=()=>{k=C[D()];let e=s.progs.get(`forces`);_.useProgram(e.p),_.uniform1f(_.getUniformLocation(e.p,`uRunny`),k.runny),_.uniform1f(_.getUniformLocation(e.p,`uSwirl`),k.swirl),F||R()};let A=()=>{let e=getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number);return[e[0]/255,e[1]/255,e[2]/255]},j=A(),M=scrollY,N=0,P=0,F=!1,I=()=>performance.now()/1e3,L={input:0,ink:0};window.__inkTiming=L;function R(){let e=s.ink.read;s.pass(`overlay`,null,{uS:e.tex,uH:s.height,uMask:v,uPaperScale:s.paperU().uPaperScale,uTexel:[1/e.w,1/e.h],uView:[innerWidth,innerHeight],uDoc:b,uScroll:scrollY,uRem:(scrollY-M)/innerHeight,uField:j,uK:O.k,uInk:O.ink,uKind:O.kind,uFeather:O.feather,uDensity:k.dark,uGain:ne,uLife:Math.min(1,Math.max(0,(P-I())/6))})}function z(){let e=s.ink.read,t=Math.round((scrollY-M)/innerHeight*e.h);if(!t)return;let n=t/e.h;M+=n*innerHeight,s.pass(`pageShift`,s.ink.write,{uT:s.ink.read.tex,uOff:n,uFill:[0,0,0,0]}),s.ink.swap(),s.pass(`pageShift`,s.vel.write,{uT:s.vel.read.tex,uOff:n,uFill:[0,0,0,0]}),s.vel.swap()}let B=performance.now(),V=0,H=0;function U(e){let t=e-B;B=e,document.hidden?F=!1:I()>P&&!g.down?(m(),R(),F=!1):(z(),I()<N||g.down?(g.update(1/60),o.step(1/60),t>21&&t<200?V++:H++,V+H>=90&&(V>45&&o.quality>.4&&(o.quality=Math.max(.4,o.quality-.15),o.resize()),V=H=0)):(s.pass(`dryFade`,s.ink.write,{uS:s.ink.read.tex,uF:T}),s.ink.swap()),R(),requestAnimationFrame(U))}function W(){N=I()+k.wet,P=N+te,F||(F=!0,B=performance.now(),requestAnimationFrame(U))}function G(e,t){z(),K(e,t),W(),R(),_.flush(),L.ink=performance.now()}function K(e,t){let n=e/innerWidth,r=1-t/innerHeight,i=Math.max(.75,Math.min(1.1,o.aspect)),a=(.022+Math.random()*.012)*i;o.drop(n,r,a,.95,1);let c=2+Math.floor(Math.random()*3);for(let e=0;e<c;e++){let e=Math.random()*6.283,t=a*(.45+Math.random()*.4),i=n+Math.cos(e)*t/o.aspect,c=r+Math.sin(e)*t,l=a*(.18+Math.random()*.22);s.pass(`dropInk`,s.ink.write,{uS:s.ink.read.tex,uPoint:[i,c],uRadius:l,uAmount:.3+Math.random()*.35,uSeed:Math.random()*100,uAspect:o.aspect,uWet:1}),s.ink.swap(),o.push(i,c,0,0,l*1.2,.24)}}let q=matchMedia(`(pointer: fine)`).matches,J=-1,Y=-1,X=0,Z=null,Q=!1,ue=(e,t)=>[e/innerWidth*o.aspect,1-t/innerHeight],de=e=>{if(e.pointerType===`touch`)return;if(Z&&!Q&&Math.hypot(e.clientX-Z.x,e.clientY-Z.y)>=4&&(Q=!0,E.classList.add(`painting`),getSelection()?.removeAllRanges(),z(),g.size=.036*Math.max(.7,Math.min(1,o.aspect)),g.dip(1),g.wetness=.9,g.drain=30,g.press(...ue(Z.x,Z.y)),W()),Q){g.moveTo(...ue(e.clientX,e.clientY)),W();return}let t=performance.now(),n=Math.max(8,t-X)/1e3;if(F&&I()<N&&J>=0&&t-X<120){let t=(e.clientX-J)/innerHeight/n,r=-(e.clientY-Y)/innerHeight/n,i=Math.hypot(t,r);if(i>.02){let n=Math.min(1,re/i)*k.push;o.push(e.clientX/innerWidth,1-e.clientY/innerHeight,t*n,r*n,k.radius)}}J=e.clientX,Y=e.clientY,X=t},fe=e=>{e.pointerType!==`touch`&&e.button===0&&q&&(le(e.target,e.clientX,e.clientY)||(Z={x:e.clientX,y:e.clientY}))},$=e=>{e.pointerType!==`touch`&&(Q?g.lift():Z&&e.type===`pointerup`&&Math.hypot(e.clientX-Z.x,e.clientY-Z.y)<4&&!String(getSelection()??``).length&&(L.input=performance.now(),G(e.clientX,e.clientY)),Q=!1,Z=null,E.classList.remove(`painting`))},pe=e=>{q&&e.pointerType!==`touch`||e.detail===0||le(e.target,e.clientX,e.clientY)||(L.input=performance.now(),G(e.clientX,e.clientY))};addEventListener(`pointermove`,de,{passive:!0}),addEventListener(`pointerdown`,fe),addEventListener(`pointerup`,$),addEventListener(`pointercancel`,$),addEventListener(`click`,pe),addEventListener(`colorway`,()=>{O=x[D()],j=A(),m(),P=N=0,w.apply(),R()});let me=0;addEventListener(`resize`,()=>{clearTimeout(me),me=window.setTimeout(()=>{a()&&(o.quality=c(),o.resize()),S(),R()},120)}),new ResizeObserver(()=>S()).observe(document.body),document.fonts?.ready.then(S),addEventListener(`scroll`,()=>{F||(M=scrollY,R())},{passive:!0}),document.addEventListener(`visibilitychange`,()=>{!document.hidden&&I()<P&&!F&&(F=!0,B=performance.now(),requestAnimationFrame(U))}),w.apply(),K(innerWidth/2,innerHeight/2),o.step(1/60),o.stroke(.5,.5,.5,.5,.01,.01,.5,.5,0,1),s.pass(`pageShift`,s.ink.write,{uT:s.ink.read.tex,uOff:0,uFill:[0,0,0,0]}),s.ink.swap(),s.pass(`dryFade`,s.ink.write,{uS:s.ink.read.tex,uF:T}),s.ink.swap(),R(),m(),R(),document.body.prepend(i);for(let t of e)({pointerdown:fe,pointerup:$,click:pe})[t.type]?.(t);return window.__ink={ink:o,drop:G,FLOW:C,live:w,info:()=>({quality:o.quality,w:i.width,h:i.height,running:F})},o}export{D as start};
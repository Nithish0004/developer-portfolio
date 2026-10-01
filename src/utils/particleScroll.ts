/**
 * Canvas UI "Particle Scroll" (WebGL2) — Optimized ThreeUI implementation
 * 
 * Performance Enhancements:
 * 1. Document coordinate caching: Eliminates synchronous layout thrashing (getBoundingClientRect) from 60FPS animation and scroll loops.
 * 2. Deferred scroll rasterization: Replaces per-event 2D canvas repaints with single batched RAF updates, skipping when sections are already assembled.
 * 3. Zero-stall texture uploads: Removed synchronous gl.generateMipmap pipeline stalls on full-screen textures.
 * 4. Adaptive DPR: Caps canvas devicePixelRatio to 1.35 (1.0 on mobile) to eliminate fill-rate bottlenecks on high-DPI screens.
 * 5. Lifecycle & Tab Visibility: Pauses animation loops when the tab is hidden or when all visible rows are assembled.
 */

export interface ParticleScrollOptions {
  point?: number;     // Viewport trigger threshold
  band?: number;      // Pixel height of the reconstruction band
  density?: number;   // Grid spacing in px (e.g. 2.0)
  size?: number;      // Particle size in CSS px
  spread?: number;    // Scatter dispersal distance
  gravity?: number;   // Vertical bias during scatter (-1 to 1)
  drift?: number;     // Swirl drift speed
  swirl?: number;     // Tangential rotational swirl magnitude
  stagger?: number;   // Noise jitter across row cells
  fade?: number;      // Alpha floor during scatter
  settle?: number;    // Transition ceiling speed
  hold?: number;      // Transition floor speed
  smoothing?: number; // Scroll smoothing latency factor
  tintA?: [number, number, number]; // Warm highlight tint A (#c4543f)
  tintB?: [number, number, number]; // Warm highlight tint B (#df6b55)
  bg?: [number, number, number];    // Background fill color (#f5f1eb)
}

export const DEFAULTS: Required<ParticleScrollOptions> = {
  point: 0.60,
  band: 220,
  density: 2,
  size: 1.25,
  spread: 180,
  gravity: 0.28,
  drift: 0.6,
  swirl: 50,
  stagger: 0.35,
  fade: 0.85,
  settle: 0.24,
  hold: 0.34,
  smoothing: 0.16,
  tintA: [0.77, 0.33, 0.25], // Warm terracotta (#c4543f)
  tintB: [0.93, 0.54, 0.42], // Warm coral-orange (#df6b55)
  bg: [0.96, 0.945, 0.92],   // Warm cream (#f5f1eb)
};

const COMMIT = 0.35;

const HASH = `
float hash (vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}`;

const QUAD_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const BASE_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;
uniform sampler2D uRowTex;
uniform vec2 uRes;
uniform float uDensity;
uniform float uRowCount;
uniform float uStagger;
uniform float uMaxX;
uniform float uCover;
uniform float uScroll;
uniform float uWinStart;
uniform vec3 uBg;
${HASH}
void main () {
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  vec2 cell = floor(vec2(px.x, px.y + uScroll) / uDensity);
  float h1 = hash(cell);
  float d = h1 * uStagger;
  int row = int(clamp(cell.y - uWinStart, 0.0, uRowCount - 1.0));
  float p = texelFetch(uRowTex, ivec2(row, 0), 0).r;
  float t = clamp((p - d) / max(1.0 - d, 1e-3), 0.0, 1.0);
  float vis = step(0.9995, t) * step(px.x, uMaxX * uRes.x);
  vec4 tex = texture(uContent, vec2(vUv.x, 1.0 - vUv.y));
  outColor = vec4(mix(uBg, tex.rgb, vis * tex.a), max(uCover, vis * tex.a));
}`;

const POINT_VERT = `#version 300 es
precision highp float;
uniform sampler2D uRowTex;
uniform vec2 uRes;
uniform vec2 uGrid;
uniform float uDensity;
uniform float uStagger;
uniform float uSpread;
uniform float uGravity;
uniform float uDrift;
uniform float uSwirl;
uniform float uTime;
uniform float uFade;
uniform float uSize;
uniform float uDpr;
uniform float uMaxX;
uniform float uLag;
uniform float uScroll;
uniform float uWinStart;
out vec2 vCenter;
out float vSize;
out float vAlpha;
out float vMerge;
out float vHeat;
out float vHash;
${HASH}
void main () {
  float fid = float(gl_VertexID);
  vec2 local = vec2(mod(fid, uGrid.x), floor(fid / uGrid.x));
  vec2 cell = vec2(local.x, local.y + uWinStart);
  float h1 = hash(cell);
  float h2 = hash(cell + vec2(1.7, 9.1));
  float h3 = hash(cell + vec2(5.5, 2.9));
  float h4 = hash(cell + vec2(8.4, 4.2));
  float d = h1 * uStagger;
  vec2 home = vec2(
    (cell.x + 0.5) * uDensity,
    (cell.y + 0.5) * uDensity - uScroll
  );
  int row = int(clamp(local.y, 0.0, uGrid.y - 1.0));
  float p = texelFetch(uRowTex, ivec2(row, 0), 0).r;
  float t = clamp((p - d) / max(1.0 - d, 1e-3), 0.0, 1.0);
  float e = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);   // Quintic smootherstep
  float vis = (1.0 - step(0.9995, t))
    * step(home.x, uMaxX * uRes.x)
    * step(home.y, uRes.y)
    * step(-uDensity, home.y);
  if (vis < 0.5) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vCenter = vec2(0.0);
    vSize = 0.0;
    vAlpha = 0.0;
    vMerge = 0.0;
    vHeat = 0.0;
    vHash = 0.0;
    return;
  }
  vec2 dir = normalize(vec2(h2 - 0.5, h3 - 0.5) + vec2(1e-4, 0.0));
  float reach = 0.08 + 0.92 * pow(h4, 2.4);
  vec2 off = dir * uSpread * reach;
  off.y += uGravity * uSpread * (0.25 + 0.75 * h4);
  vec2 scat = home + off;
  vec2 pos = mix(scat, home, e);
  vec2 perp = vec2(-dir.y, dir.x);
  pos += perp * (h2 - 0.5) * 2.0 * uSwirl * sin(e * 3.14159);
  float tt = uTime * uDrift;
  float amp = (1.0 - e) * (uSpread * 0.05 + 2.5);
  pos += vec2(
    sin(tt * (4.0 + 5.0 * h2) + h3 * 40.0),
    cos(tt * (3.5 + 5.5 * h3) + h2 * 40.0)
  ) * amp;
  pos.y += uLag * (1.0 - e) * (0.5 + 0.5 * h4);
  pos += vec2(h4 - 0.5, h1 - 0.5) * uDensity * 3.0
    * (1.0 - smoothstep(0.5, 0.85, t));
  float grow = smoothstep(0.55, 1.0, e);
  float sizeCss = mix(uSize, uDensity * 1.3, grow);
  vCenter = home;
  vSize = sizeCss;
  vAlpha = mix(uFade, 1.0, e);
  vMerge = smoothstep(0.75, 0.97, t);
  vHeat = 1.0 - e;
  vHash = h3;
  gl_Position = vec4(
    pos.x / uRes.x * 2.0 - 1.0,
    1.0 - pos.y / uRes.y * 2.0,
    0.0,
    1.0
  );
  gl_PointSize = max(sizeCss * uDpr, 1.0);
}`;

const POINT_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uContent;
uniform vec2 uRes;
uniform vec3 uTintA;
uniform vec3 uTintB;
in vec2 vCenter;
in float vSize;
in float vAlpha;
in float vMerge;
in float vHeat;
in float vHash;
out vec4 outColor;
void main () {
  vec2 o = gl_PointCoord - 0.5;
  vec2 uv = clamp((vCenter + o * vSize) / uRes, 0.0, 1.0);
  vec4 tex = texture(uContent, uv);
  float circle = 1.0 - smoothstep(0.25, 0.5, length(o));
  float mask = mix(circle, 1.0, vMerge);
  float a = vAlpha * mask * tex.a;
  if (a < 0.01) discard;
  vec3 tint = mix(uTintA, uTintB, vHash);
  float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
  vec3 rgb = mix(tex.rgb, tint * (0.8 + 0.6 * lum), smoothstep(0.0, 0.9, vHeat));
  outColor = vec4(rgb, a);
}`;

export interface TrackedItem {
  el: HTMLElement;
  assembled: boolean;
  docTop: number;
  docBottom: number;
  height: number;
  width: number;
  from: number;
  to: number;
  anchor: number;
}

export interface ParticleScrollInstance {
  setOptions: (next: Partial<ParticleScrollOptions>) => void;
  resize: () => void;
  setUnits: (units: Array<{ from: number; to: number; anchor: number }>) => void;
  repaint: () => void;
  destroy: () => void;
}

export function createParticleScroll(
  elements: {
    source: HTMLCanvasElement;
    content: { scrollTop: number; scrollHeight: number; clientHeight: number; clientWidth: number };
    output: HTMLCanvasElement;
    paint: (source: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
    onRows?: (rows: Float32Array, density: number, winStart: number, winLen: number) => void;
    scrollTarget?: Window | HTMLElement;
  },
  options: Partial<ParticleScrollOptions> = {}
): ParticleScrollInstance | null {
  const config = { ...DEFAULTS, ...options };
  const { source, content, output, paint, onRows, scrollTarget } = elements;
  const gl = output.getContext('webgl2', {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  });
  if (!gl || gl.isContextLost()) return null;

  const sourceCtx = source.getContext('2d');
  if (!sourceCtx) return null;

  let contentDirty = false;
  let wake = () => {};
  const requestPaint = () => {
    try {
      paint(source, sourceCtx);
      contentDirty = true;
      wake();
    } catch (e) {
      console.warn(e);
    }
  };

  function compile(type: number, text: string) {
    const shader = gl!.createShader(type)!;
    gl!.shaderSource(shader, text);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      console.error('ParticleScroll shader error:', gl!.getShaderInfoLog(shader));
    }
    return shader;
  }

  function link(vertText: string, fragText: string) {
    const vert = compile(gl!.VERTEX_SHADER, vertText);
    const frag = compile(gl!.FRAGMENT_SHADER, fragText);
    const program = gl!.createProgram()!;
    gl!.attachShader(program, vert);
    gl!.attachShader(program, frag);
    gl!.linkProgram(program);
    const uniforms: Record<string, WebGLUniformLocation> = {};
    const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl!.getActiveUniform(program, i)!;
      const loc = gl!.getUniformLocation(program, info.name);
      if (loc) uniforms[info.name] = loc;
    }
    return { program, vert, frag, uniforms };
  }

  const base = link(QUAD_VERT, BASE_FRAG);
  const points = link(POINT_VERT, POINT_FRAG);
  const quadVao = gl.createVertexArray();
  gl.bindVertexArray(quadVao);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const pointVao = gl.createVertexArray();
  const contentTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, contentTexture);
  // Linear filtering without mipmaps eliminates heavy synchronous mipmap generation stalls
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

  let contentMaxX = 1;
  const rowTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, rowTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let rowProgress = new Float32Array(0);
  let rowWindow = new Float32Array(0);
  let rowsAnimating = false;
  let rowsAssembled = false;
  let units: Array<{ from: number; to: number; anchor: number }> = [];

  function syncCanvasSize() {
    // Capped DPR prevents fill-rate saturation on Retina/4K displays
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.0 : 1.35);
    const width = Math.max(1, Math.round(output.clientWidth * dpr));
    const height = Math.max(1, Math.round(output.clientHeight * dpr));
    if (output.width !== width || output.height !== height) {
      output.width = width;
      output.height = height;
    }
    contentMaxX = Math.min(1, Math.max(0.05, content.clientWidth / Math.max(output.clientWidth, 1)));
    const cssWidth = Math.max(1, Math.round(output.clientWidth));
    const cssHeight = Math.max(1, Math.round(output.clientHeight));
    if (source.width !== cssWidth * dpr || source.height !== cssHeight * dpr) {
      source.width = cssWidth * dpr;
      source.height = cssHeight * dpr;
    }
    requestPaint();
  }

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionQuery.matches;
  let time = 0;
  let introDone = false;
  let introWait = 0;
  let introReady = false;
  let scrollSmooth = content.scrollTop;

  syncCanvasSize();

  function uploadContent() {
    if (!contentDirty) return;
    contentDirty = false;
    introReady = true;
    gl!.bindTexture(gl!.TEXTURE_2D, contentTexture);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source);
  }

  function rowTargetFor(docRowY: number) {
    if (reducedMotion || !introDone) return 1;
    const h = Math.max(output.clientHeight, 1);
    const vy = docRowY - scrollSmooth;

    const distIntoView = h - vy;
    if (distIntoView <= 0) return 0;

    const revealRange = Math.max(h * 0.40, 1);
    const u = Math.min(Math.max(distIntoView / revealRange, 0), 1);
    const p = u * (2 - u);
    return Math.min(Math.max(p, 0), 1);
  }

  function unitAt(i: number) {
    for (let u = 0; u < units.length; u++) {
      const r = units[u];
      if (i >= r.from && i <= r.to) return r;
    }
    return null;
  }

  function targetForRow(i: number, density: number) {
    const u = unitAt(i);
    return rowTargetFor(u ? u.anchor : (i + 0.5) * density);
  }

  function updateRows(dt: number, density: number, winStart: number, winLen: number) {
    const docRows = Math.max(1, Math.ceil(content.scrollHeight / density));
    if (rowProgress.length !== docRows) {
      const next = new Float32Array(docRows);
      for (let i = 0; i < docRows; i++) next[i] = targetForRow(i, density);
      rowProgress = next;
    }
    if (rowWindow.length !== winLen) rowWindow = new Float32Array(winLen);
    rowsAnimating = false;
    let minP = 1;

    const settle = Math.max(config.settle, 0.05);
    const hold = Math.max(config.hold || settle, settle);

    for (let i = 0; i < docRows; i++) {
      const target = targetForRow(i, density);
      let p = rowProgress[i];
      const inWin = i >= winStart - 4 && i < winStart + winLen + 4;
      if (reducedMotion || !inWin) {
        if (p !== target) {
          rowProgress[i] = target;
          p = target;
        }
      } else {
        const diff = target - p;
        const rate = Math.max(dt / settle, Math.abs(diff) * 0.35);

        if (target >= COMMIT) {
          const next = Math.min(1, Math.max(Math.min(target, p + rate), p + dt / hold));
          if (next > p) {
            p = next;
            rowsAnimating = true;
            rowProgress[i] = p;
          }
        } else if (p < target) {
          const next = Math.min(p + rate, target);
          if (next > p) {
            p = next;
            rowsAnimating = true;
            rowProgress[i] = p;
          }
        } else if (p > target) {
          const next = Math.max(p - dt / (settle * 0.6), target);
          if (next < p) {
            p = next;
            rowsAnimating = true;
            rowProgress[i] = p;
          }
        }
      }
      if (inWin && p < minP) minP = p;
    }

    rowsAssembled = minP >= 0.9995;
    rowWindow.fill(1);
    const from = Math.min(Math.max(winStart, 0), docRows);
    const to = Math.min(winStart + winLen, docRows);
    if (to > from) rowWindow.set(rowProgress.subarray(from, to), from - winStart);
    gl!.bindTexture(gl!.TEXTURE_2D, rowTex);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.R32F, winLen, 1, 0, gl!.RED, gl!.FLOAT, rowWindow);
    if (onRows) onRows(rowProgress, density, winStart, winLen);
  }

  function render(dt: number) {
    uploadContent();
    const w = Math.max(output.clientWidth, 1);
    const h = Math.max(output.clientHeight, 1);
    const dpr = output.width / w;
    const density = Math.max(Math.max(config.density, 1), Math.sqrt((w * h) / 800000));
    const scrollTop = content.scrollTop;
    const gridX = Math.ceil(w / density);
    const winStart = Math.floor(scrollTop / density);
    const winLen = Math.ceil(h / density) + 2;
    const stagger = Math.min(Math.max(config.stagger, 0), 0.95);

    updateRows(dt, density, winStart, winLen);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.viewport(0, 0, output.width, output.height);
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);

    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, rowTex);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, contentTexture);
    gl!.enable(gl!.BLEND);
    gl!.blendFuncSeparate(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA, gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);

    gl!.useProgram(base.program);
    gl!.bindVertexArray(quadVao);
    gl!.uniform1i(base.uniforms.uContent, 0);
    gl!.uniform1i(base.uniforms.uRowTex, 1);
    gl!.uniform2f(base.uniforms.uRes, w, h);
    gl!.uniform1f(base.uniforms.uDensity, density);
    gl!.uniform1f(base.uniforms.uRowCount, winLen);
    gl!.uniform1f(base.uniforms.uStagger, stagger);
    gl!.uniform1f(base.uniforms.uMaxX, contentMaxX);
    gl!.uniform1f(base.uniforms.uCover, 0);
    gl!.uniform1f(base.uniforms.uScroll, scrollTop);
    gl!.uniform1f(base.uniforms.uWinStart, winStart);
    gl!.uniform3f(base.uniforms.uBg, config.bg[0], config.bg[1], config.bg[2]);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

    if (rowsAssembled) {
      gl!.disable(gl!.BLEND);
      return;
    }

    gl!.useProgram(points.program);
    gl!.bindVertexArray(pointVao);
    gl!.uniform1i(points.uniforms.uRowTex, 1);
    gl!.uniform2f(points.uniforms.uRes, w, h);
    gl!.uniform2f(points.uniforms.uGrid, gridX, winLen);
    gl!.uniform1f(points.uniforms.uDensity, density);
    gl!.uniform1f(points.uniforms.uStagger, stagger);
    gl!.uniform1f(points.uniforms.uSpread, Math.max(config.spread, 0));
    gl!.uniform1f(points.uniforms.uGravity, Math.min(Math.max(config.gravity, -1), 1));
    gl!.uniform1f(points.uniforms.uDrift, Math.max(config.drift, 0));
    gl!.uniform1f(points.uniforms.uSwirl, Math.max(config.swirl, 0));
    gl!.uniform1f(points.uniforms.uTime, time);
    gl!.uniform1f(points.uniforms.uFade, Math.min(Math.max(config.fade, 0), 1));
    gl!.uniform1f(points.uniforms.uSize, Math.max(config.size, 0.5));
    gl!.uniform1f(points.uniforms.uDpr, dpr);
    gl!.uniform1f(points.uniforms.uMaxX, contentMaxX);
    gl!.uniform1i(points.uniforms.uContent, 0);
    gl!.uniform1f(points.uniforms.uLag, lag);
    gl!.uniform1f(points.uniforms.uScroll, scrollTop);
    gl!.uniform1f(points.uniforms.uWinStart, winStart);
    gl!.uniform3f(points.uniforms.uTintA, config.tintA[0], config.tintA[1], config.tintA[2]);
    gl!.uniform3f(points.uniforms.uTintB, config.tintB[0], config.tintB[1], config.tintB[2]);
    gl!.drawArrays(gl!.POINTS, 0, gridX * winLen);
    gl!.bindVertexArray(quadVao);
    gl!.disable(gl!.BLEND);
  }

  let raf = 0;
  let lastTime = performance.now();
  let destroyed = false;
  let running = false;
  let visible = true;
  let lag = 0;
  let lastScrollTop = content.scrollTop;

  function frame(now: number) {
    if (destroyed) return;
    if (!visible || document.hidden) {
      running = false;
      return;
    }
    const delta = Math.min((now - lastTime) / 1000, 1 / 30);
    lastTime = now;
    time += delta;

    const scrollTop = content.scrollTop;
    lag += scrollTop - lastScrollTop;
    lastScrollTop = scrollTop;
    lag *= Math.exp(-delta / 0.22);
    lag = Math.min(Math.max(lag, -400), 400);
    if (reducedMotion || Math.abs(lag) < 0.1) lag = 0;

    if (!introDone) {
      if (reducedMotion) {
        introDone = true;
      } else if (introReady) {
        introWait += delta;
        if (introWait >= 0.8) introDone = true;
      }
    }

    const tau = config.smoothing;
    const k = reducedMotion || tau <= 0 ? 1 : 1 - Math.exp(-delta / Math.max(tau, 1e-4));
    scrollSmooth += (scrollTop - scrollSmooth) * k;
    if (Math.abs(scrollTop - scrollSmooth) < 0.5) scrollSmooth = scrollTop;

    render(delta);

    // PERFORMANCE PAUSE: When all rows in view have assembled and motion has settled, stop loop
    if (!contentDirty && scrollSmooth === scrollTop && !rowsAnimating && rowsAssembled && introDone && lag === 0) {
      running = false;
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (destroyed || running || !visible || document.hidden) return;
    running = true;
    lastTime = performance.now();
    raf = requestAnimationFrame(frame);
  }

  wake = start;
  start();

  // Scroll listener only wakes RAF and avoids direct synchronous rasterization
  function onScroll() {
    start();
  }

  (scrollTarget || window).addEventListener('scroll', onScroll, { passive: true });

  const onVisibilityChange = () => {
    if (document.hidden) {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    } else {
      start();
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  function onMotionChange() {
    reducedMotion = motionQuery.matches;
    start();
  }
  motionQuery.addEventListener('change', onMotionChange);

  const observer = new ResizeObserver(() => {
    syncCanvasSize();
    start();
  });
  observer.observe(output);

  return {
    setOptions(next: Partial<ParticleScrollOptions>) {
      if (!Object.entries(next).some(([key, value]) => (config as any)[key] !== value)) return;
      Object.assign(config, next);
      start();
    },
    resize() {
      syncCanvasSize();
      start();
    },
    setUnits(next: Array<{ from: number; to: number; anchor: number }>) {
      units = next || [];
      start();
    },
    repaint() {
      requestPaint();
      start();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      (scrollTarget || window).removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
      motionQuery.removeEventListener('change', onMotionChange);
      gl.deleteTexture(contentTexture);
      gl.deleteTexture(rowTex);
      gl.deleteProgram(base.program);
      gl.deleteProgram(points.program);
      gl.deleteShader(base.vert);
      gl.deleteShader(base.frag);
      gl.deleteShader(points.vert);
      gl.deleteShader(points.frag);
      gl.deleteBuffer(quad);
      gl.deleteVertexArray(quadVao);
      gl.deleteVertexArray(pointVao);
    },
  };
}

const svgImageCache = new Map<string, HTMLImageElement>();

export function rasterise(
  tracked: Array<TrackedItem>,
  source: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  const dpr = source.width / Math.max(1, source.clientWidth || window.innerWidth);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, source.width, source.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const sy = window.scrollY || document.documentElement.scrollTop;
  const vh = window.innerHeight;
  const margin = 400;

  for (let i = 0; i < tracked.length; i++) {
    const t = tracked[i];
    if (t.assembled) continue;
    // Fast viewport culling using cached document coordinates (no layout reflow)
    const top = t.docTop - sy;
    const bottom = t.docBottom - sy;
    if (bottom < -margin || top > vh + margin) continue;
    t.el.classList.add('ps-hidden');
    paintElement(t.el, ctx);
  }
}

export function paintElement(root: HTMLElement, ctx: CanvasRenderingContext2D) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node: Node | null = root;

  const paintBox = (el: HTMLElement) => {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;

    const hasBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
    const borderTopWidth = parseFloat(cs.borderTopWidth) || 0;
    const borderTopColor = cs.borderTopColor;
    const hasBorder = borderTopWidth > 0 && borderTopColor && borderTopColor !== 'transparent' && borderTopColor !== 'rgba(0, 0, 0, 0)';
    const hasShadow = cs.boxShadow && cs.boxShadow !== 'none';

    if (!hasBg && !hasBorder && !hasShadow) return;

    const tl = parseFloat(cs.borderTopLeftRadius) || 0;
    const tr = parseFloat(cs.borderTopRightRadius) || 0;
    const br = parseFloat(cs.borderBottomRightRadius) || 0;
    const bl = parseFloat(cs.borderBottomLeftRadius) || 0;
    const hasRadius = tl > 0 || tr > 0 || br > 0 || bl > 0;

    ctx.save();

    if (hasShadow && hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.09)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
    }

    ctx.beginPath();
    if (hasRadius && (ctx as any).roundRect) {
      (ctx as any).roundRect(r.left, r.top, r.width, r.height, [tl, tr, br, bl]);
    } else {
      ctx.rect(r.left, r.top, r.width, r.height);
    }

    if (hasBg) {
      ctx.fillStyle = bg;
      ctx.fill();
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    if (hasBorder) {
      ctx.strokeStyle = borderTopColor;
      ctx.lineWidth = borderTopWidth;
      ctx.stroke();
    }

    ctx.restore();
  };

  const paintImg = (img: HTMLImageElement) => {
    if (!img.complete || !img.naturalWidth) return;
    const r = img.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;

    const cs = getComputedStyle(img);
    const tl = parseFloat(cs.borderTopLeftRadius) || 0;
    const tr = parseFloat(cs.borderTopRightRadius) || 0;
    const br = parseFloat(cs.borderBottomRightRadius) || 0;
    const bl = parseFloat(cs.borderBottomLeftRadius) || 0;
    const hasRadius = tl > 0 || tr > 0 || br > 0 || bl > 0;

    ctx.save();
    if (hasRadius) {
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(r.left, r.top, r.width, r.height, [tl, tr, br, bl]);
      } else {
        ctx.rect(r.left, r.top, r.width, r.height);
      }
      ctx.clip();
    }

    const fit = cs.objectFit;
    if (fit === 'cover') {
      const s = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
      const sw = r.width / s;
      const sh = r.height / s;
      ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, r.left, r.top, r.width, r.height);
    } else {
      ctx.drawImage(img, r.left, r.top, r.width, r.height);
    }
    ctx.restore();
  };

  const paintSvg = (svg: SVGSVGElement) => {
    const r = svg.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    try {
      const xml = new XMLSerializer().serializeToString(svg);
      let img = svgImageCache.get(xml);
      if (!img) {
        img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
        svgImageCache.set(xml, img);
      }
      if (img.complete && img.naturalWidth) {
        ctx.drawImage(img, r.left, r.top, r.width, r.height);
      }
    } catch (e) {
      // Fallback
    }
  };

  const paintText = (tn: Text) => {
    const text = tn.nodeValue;
    if (!text || !text.trim()) return;
    const parent = tn.parentElement;
    if (!parent) return;
    const cs = getComputedStyle(parent);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.fillStyle = cs.color;
    ctx.textBaseline = 'alphabetic';
    try {
      (ctx as any).letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    } catch (e) {}

    const re = /\S+/g;
    let m: RegExpExecArray | null;
    const range = document.createRange();
    const fs = parseFloat(cs.fontSize);
    const met = ctx.measureText('Hg');
    const asc = met.fontBoundingBoxAscent || fs * 0.8;
    const desc = met.fontBoundingBoxDescent || fs * 0.2;

    while ((m = re.exec(text))) {
      range.setStart(tn, m.index);
      range.setEnd(tn, m.index + m[0].length);
      const rects = range.getClientRects();
      if (!rects.length) continue;
      const r = rects[0];
      if (r.width === 0) continue;
      ctx.fillText(m[0], r.left, r.top + (r.height - (asc + desc)) / 2 + asc);
    }
  };

  if (root.tagName === 'IMG') {
    paintImg(root as HTMLImageElement);
    return;
  }
  paintBox(root);

  while ((node = walker.nextNode())) {
    if (node.nodeType === 3) {
      paintText(node as Text);
    } else if ((node as HTMLElement).tagName === 'IMG') {
      paintImg(node as HTMLImageElement);
    } else if ((node as HTMLElement).tagName === 'SVG' || (node as HTMLElement).tagName === 'svg') {
      paintSvg(node as unknown as SVGSVGElement);
    } else {
      paintBox(node as HTMLElement);
    }
  }
}

export function mountParticleScroll(
  selectorList: string,
  options: Partial<ParticleScrollOptions> = {}
): ParticleScrollInstance | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  const output = document.createElement('canvas');
  output.id = 'ps-output';
  output.setAttribute('aria-hidden', 'true');
  document.body.appendChild(output);

  const source = document.createElement('canvas');
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selectorList));
  if (elements.length === 0) {
    output.remove();
    return null;
  }

  const density = Math.max(1, options.density || DEFAULTS.density);
  const scroller = document.scrollingElement || document.documentElement;

  // Tracked items with cached document coordinates
  const tracked: TrackedItem[] = elements.map((el) => ({
    el,
    assembled: false,
    docTop: 0,
    docBottom: 0,
    height: 0,
    width: 0,
    from: 0,
    to: 0,
    anchor: 0,
  }));

  const measureTracked = () => {
    const sy = scroller.scrollTop;
    for (let i = 0; i < tracked.length; i++) {
      const t = tracked[i];
      const r = t.el.getBoundingClientRect();
      t.docTop = r.top + sy;
      t.docBottom = r.bottom + sy;
      t.height = r.height;
      t.width = r.width;
      const from = Math.max(0, Math.floor(t.docTop / density) - 1);
      const to = Math.max(from, Math.ceil(t.docBottom / density) + 1);
      const anchorBias = r.height > 120 ? 0.35 : 0.50;
      t.from = from;
      t.to = to;
      t.anchor = t.docTop + r.height * anchorBias;
    }
    if (inst) {
      inst.setUnits(tracked.map((t) => ({ from: t.from, to: t.to, anchor: t.anchor })));
    }
  };

  let inst: ParticleScrollInstance | null = null;
  const content = {
    get scrollTop() {
      return scroller.scrollTop;
    },
    get scrollHeight() {
      return scroller.scrollHeight;
    },
    get clientHeight() {
      return window.innerHeight;
    },
    get clientWidth() {
      return window.innerWidth;
    },
  };

  const instance = createParticleScroll(
    {
      source,
      content,
      output,
      scrollTarget: window,
      paint: (src, ctx) => rasterise(tracked, src, ctx),
      onRows(rows) {
        let changed = false;
        for (let i = 0; i < tracked.length; i++) {
          const t = tracked[i];
          const top = Math.max(0, Math.min(rows.length - 1, t.from));
          const bottom = Math.max(top, Math.min(rows.length - 1, t.to));
          let min = 1;
          for (let j = top; j <= bottom; j++) {
            if (rows[j] < min) min = rows[j];
          }
          const done = min >= 0.9995;
          if (done && !t.assembled) {
            t.assembled = true;
            t.el.classList.remove('ps-hidden');
            t.el.classList.add('ps-in');
            changed = true;
          } else if (!done && t.assembled && min < 0.6) {
            t.assembled = false;
            t.el.classList.remove('ps-in');
            changed = true;
          }
        }
        if (changed && inst) inst.repaint();
      },
    },
    options
  );

  inst = instance;
  if (!instance) {
    output.remove();
    return null;
  }

  measureTracked();

  const repaint = () => {
    measureTracked();
    instance.repaint();
  };

  window.addEventListener('resize', repaint, { passive: true });
  document.fonts?.ready.then(repaint);
  document.querySelectorAll('img').forEach((i) => i.addEventListener('load', repaint, { once: true }));
  const ro = new ResizeObserver(measureTracked);
  ro.observe(document.body);

  const originalDestroy = instance.destroy;
  instance.destroy = () => {
    originalDestroy();
    window.removeEventListener('resize', repaint);
    ro.disconnect();
    output.remove();
    source.remove();
    for (const t of tracked) {
      t.el.classList.remove('ps-hidden', 'ps-in');
    }
  };

  return instance;
}

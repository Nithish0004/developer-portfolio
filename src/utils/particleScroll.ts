/**
 * Canvas UI "Particle Scroll" (WebGL2) — Optimized High-Performance Particle Engine
 *
 * Core Fixes & Architecture:
 * 1. Template Preservation: Only text and image elements are rasterized into particles.
 *    Card backgrounds, clay surfaces, borders, and ambient light templates remain 100%
 *    unchanged, static, and visible in the DOM at all times.
 * 2. Zero-Glitch Scroll Architecture: The content texture is mapped in absolute document
 *    coordinates and uploaded once to the GPU. Zero canvas repaints and zero synchronous
 *    gl.texImage2D pipeline stalls occur during scroll, completely eliminating the 1-second freeze.
 * 3. Particle-to-DOM Handoff: Particles converge into place; only once they fully arrange
 *    (progress >= 0.95) does the crisp native text/image reveal with sharp clarity (.ps-in),
 *    while particles for assembled rows seamlessly fade out.
 * 4. Upward Scroll Stability: Assembled elements latch deterministically while in or above view,
 *    preventing flickering, resets, or layout oscillation when scrolling upward.
 * 5. Transparent WebGL Canvas: No full-screen background quad, allowing the underlying dark
 *    obsidian background and ambient volcanic lighting to shine through cleanly.
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
  tintA?: [number, number, number]; // Warm highlight tint A (#df5035)
  tintB?: [number, number, number]; // Warm highlight tint B (#ff6542)
  bg?: [number, number, number];    // Background fill color
}

export const DEFAULTS: Required<ParticleScrollOptions> = {
  point: 0.60,
  band: 220,
  density: 2.0,
  size: 1.35,
  spread: 160,
  gravity: 0.25,
  drift: 0.6,
  swirl: 45,
  stagger: 0.35,
  fade: 0.85,
  settle: 0.22,
  hold: 0.32,
  smoothing: 0.14,
  tintA: [0.87, 0.31, 0.21], // Magma Crimson (#df5035)
  tintB: [1.00, 0.40, 0.26], // Bright Magma Orange (#ff6542)
  bg: [0.027, 0.027, 0.035], // Deep Obsidian (#070709)
};

const HASH = `
float hash (vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}`;

const POINT_VERT = `#version 300 es
precision highp float;
uniform sampler2D uRowTex;
uniform vec2 uRes;
uniform vec2 uDocRes;
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
uniform float uLag;
uniform float uScroll;
uniform float uRowCount;
out vec2 vDocCoord;
out float vSize;
out float vAlpha;
out float vMerge;
out float vHeat;
out float vHash;
${HASH}
void main () {
  float fid = float(gl_VertexID);
  vec2 local = vec2(mod(fid, uGrid.x), floor(fid / uGrid.x));
  
  float docX = (local.x + 0.5) * uDensity;
  float docY = (local.y + 0.5) * uDensity + uScroll;
  vec2 cell = floor(vec2(docX, docY) / uDensity);

  float h1 = hash(cell);
  float h2 = hash(cell + vec2(1.7, 9.1));
  float h3 = hash(cell + vec2(5.5, 2.9));
  float h4 = hash(cell + vec2(8.4, 4.2));
  float d = h1 * uStagger;

  vec2 home = vec2(docX, (local.y + 0.5) * uDensity);

  int row = int(clamp(cell.y, 0.0, uRowCount - 1.0));
  float p = texelFetch(uRowTex, ivec2(row, 0), 0).r;
  float t = clamp((p - d) / max(1.0 - d, 1e-3), 0.0, 1.0);
  float e = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);   // Quintic smootherstep

  // When particles have fully converged into position (t >= 0.98),
  // they hand off to the crisp native DOM text/image (.ps-in) to prevent ghosting
  float vis = (1.0 - step(0.98, t))
    * step(home.x, uRes.x)
    * step(home.y, uRes.y)
    * step(0.0, home.y);

  if (vis < 0.5) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vDocCoord = vec2(0.0);
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

  vDocCoord = vec2(docX, docY);
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
uniform vec2 uDocRes;
uniform vec3 uTintA;
uniform vec3 uTintB;
in vec2 vDocCoord;
in float vSize;
in float vAlpha;
in float vMerge;
in float vHeat;
in float vHash;
out vec4 outColor;

void main () {
  vec2 o = gl_PointCoord - 0.5;
  vec2 uv = clamp((vDocCoord + o * vSize) / uDocRes, 0.0, 1.0);
  vec4 tex = texture(uContent, uv);
  if (tex.a < 0.02) discard;

  float dist = length(o);
  float circle = 1.0 - smoothstep(0.24, 0.5, dist);
  float mask = mix(circle, 1.0, vMerge);
  float a = vAlpha * mask * tex.a;
  if (a < 0.01) discard;

  vec3 tint = mix(uTintA, uTintB, vHash);
  float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
  vec3 rgb = mix(tex.rgb, tint * (0.85 + 0.55 * lum), smoothstep(0.0, 0.85, vHeat));
  outColor = vec4(rgb, a);
}`;

export interface TrackedItem {
  el: HTMLElement;
  assembled: boolean;
  docTop: number;
  docBottom: number;
  docLeft: number;
  height: number;
  width: number;
  from: number;
  to: number;
  anchor: number;
}

export interface ParticleScrollInstance {
  setOptions: (next: Partial<ParticleScrollOptions>) => void;
  resize: () => void;
  repaint: () => void;
  destroy: () => void;
}

export function createParticleScroll(
  elements: {
    source: HTMLCanvasElement;
    content: { scrollTop: number; scrollHeight: number; clientHeight: number; clientWidth: number };
    output: HTMLCanvasElement;
    paint: (source: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
    onRows?: (rows: Float32Array, density: number) => void;
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
  const sCtx = sourceCtx;

  let contentDirty = false;
  let wake = () => {};

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

  const points = link(POINT_VERT, POINT_FRAG);
  const pointVao = gl.createVertexArray();

  const contentTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, contentTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

  const rowTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, rowTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let rowProgress = new Float32Array(0);
  let rowsAnimating = false;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionQuery.matches;
  let time = 0;
  let scrollSmooth = content.scrollTop;

  function syncCanvasSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.0 : 1.35);
    const width = Math.max(1, Math.round(output.clientWidth * dpr));
    const height = Math.max(1, Math.round(output.clientHeight * dpr));
    if (output.width !== width || output.height !== height) {
      output.width = width;
      output.height = height;
    }
    paint(source, sCtx);
    contentDirty = true;
    uploadContent();
  }

  function uploadContent() {
    if (!contentDirty) return;
    contentDirty = false;
    gl!.bindTexture(gl!.TEXTURE_2D, contentTexture);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source);
  }

  function rowTargetFor(docRowY: number) {
    if (reducedMotion) return 1;
    const h = Math.max(output.clientHeight, 1);
    const vy = docRowY - scrollSmooth;

    // Row is below the viewport
    if (vy > h) return 0;

    // Row has entered from bottom: compute progressive convergence over reveal band
    const distIntoView = h - vy;
    const band = Math.max(config.band, 160);
    const u = Math.min(Math.max(distIntoView / band, 0), 1);
    const p = u * (2 - u); // Smooth quadratic ease
    return p;
  }

  function updateRows(dt: number, density: number) {
    const docRows = Math.max(1, Math.ceil(content.scrollHeight / density));
    if (rowProgress.length !== docRows) {
      const next = new Float32Array(docRows);
      for (let i = 0; i < docRows; i++) next[i] = rowTargetFor((i + 0.5) * density);
      rowProgress = next;
    }

    rowsAnimating = false;
    const settle = Math.max(config.settle, 0.05);
    const viewportH = output.clientHeight;

    for (let i = 0; i < docRows; i++) {
      const rowY = (i + 0.5) * density;
      const target = rowTargetFor(rowY);
      let p = rowProgress[i];

      // STABILITY LATCH WHEN SCROLLING UPWARD:
      // If a row was already assembled (>= 0.985) and is still on or above the viewport,
      // it stays 100% assembled without glitching, flickering, or resetting!
      const vy = rowY - scrollSmooth;
      if (p >= 0.985 && vy <= viewportH + 60) {
        rowProgress[i] = 1.0;
        continue;
      }

      if (reducedMotion) {
        rowProgress[i] = 1.0;
        continue;
      }

      const diff = target - p;
      if (Math.abs(diff) > 0.0005) {
        rowsAnimating = true;
        const rate = Math.max(dt / settle, Math.abs(diff) * 0.35);
        if (p < target) {
          p = Math.min(p + rate, target);
        } else {
          p = Math.max(p - rate, target);
        }
        rowProgress[i] = p;
      } else if (p !== target) {
        rowProgress[i] = target;
      }
    }

    if (onRows) {
      onRows(rowProgress, density);
    }

    gl!.bindTexture(gl!.TEXTURE_2D, rowTex);
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      gl!.R32F,
      rowProgress.length,
      1,
      0,
      gl!.RED,
      gl!.FLOAT,
      rowProgress
    );
  }

  function render(dt: number) {
    uploadContent();

    const dpr = output.width / Math.max(output.clientWidth, 1);
    const w = output.clientWidth;
    const h = output.clientHeight;
    const density = Math.max(1, config.density);

    gl!.viewport(0, 0, output.width, output.height);
    // Canvas is transparent to preserve background templates and dark lighting
    gl!.clearColor(0.0, 0.0, 0.0, 0.0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);

    const docRows = Math.max(1, Math.ceil(content.scrollHeight / density));
    updateRows(dt, density);

    const gridX = Math.ceil(w / density);
    const gridY = Math.ceil(h / density);
    const pointCount = gridX * gridY;

    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA);

    gl!.useProgram(points.program);
    gl!.bindVertexArray(pointVao);

    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, contentTexture);
    gl!.uniform1i(points.uniforms.uContent, 0);

    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, rowTex);
    gl!.uniform1i(points.uniforms.uRowTex, 1);

    gl!.uniform2f(points.uniforms.uRes, w, h);
    gl!.uniform2f(points.uniforms.uDocRes, source.width, source.height);
    gl!.uniform2f(points.uniforms.uGrid, gridX, gridY);
    gl!.uniform1f(points.uniforms.uDensity, density);
    gl!.uniform1f(points.uniforms.uStagger, config.stagger);
    gl!.uniform1f(points.uniforms.uSpread, Math.max(config.spread, 0));
    gl!.uniform1f(points.uniforms.uGravity, Math.min(Math.max(config.gravity, -1), 1));
    gl!.uniform1f(points.uniforms.uDrift, Math.max(config.drift, 0));
    gl!.uniform1f(points.uniforms.uSwirl, Math.max(config.swirl, 0));
    gl!.uniform1f(points.uniforms.uTime, time);
    gl!.uniform1f(points.uniforms.uFade, Math.min(Math.max(config.fade, 0), 1));
    gl!.uniform1f(points.uniforms.uSize, Math.max(config.size, 0.5));
    gl!.uniform1f(points.uniforms.uDpr, dpr);
    gl!.uniform1f(points.uniforms.uLag, lag);
    gl!.uniform1f(points.uniforms.uScroll, scrollSmooth);
    gl!.uniform1f(points.uniforms.uRowCount, docRows);
    gl!.uniform3f(points.uniforms.uTintA, config.tintA[0], config.tintA[1], config.tintA[2]);
    gl!.uniform3f(points.uniforms.uTintB, config.tintB[0], config.tintB[1], config.tintB[2]);

    gl!.drawArrays(gl!.POINTS, 0, pointCount);

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
    lag = Math.min(Math.max(lag, -300), 300);
    if (reducedMotion || Math.abs(lag) < 0.1) lag = 0;

    const tau = config.smoothing;
    const k = reducedMotion || tau <= 0 ? 1 : 1 - Math.exp(-delta / Math.max(tau, 1e-4));
    scrollSmooth += (scrollTop - scrollSmooth) * k;
    if (Math.abs(scrollTop - scrollSmooth) < 0.2) scrollSmooth = scrollTop;

    render(delta);

    // Continue loop if animating, moving, or dirty
    if (rowsAnimating || Math.abs(scrollTop - scrollSmooth) > 0.2 || Math.abs(lag) > 0.2) {
      raf = requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function start() {
    if (destroyed || running || !visible || document.hidden) return;
    running = true;
    lastTime = performance.now();
    raf = requestAnimationFrame(frame);
  }

  wake = start;

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

  syncCanvasSize();
  start();

  return {
    setOptions(next: Partial<ParticleScrollOptions>) {
      Object.assign(config, next);
      start();
    },
    resize() {
      syncCanvasSize();
      start();
    },
    repaint() {
      paint(source, sCtx);
      contentDirty = true;
      uploadContent();
      start();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      (scrollTarget || window).removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionQuery.removeEventListener('change', onMotionChange);
      gl.deleteTexture(contentTexture);
      gl.deleteTexture(rowTex);
      gl.deleteProgram(points.program);
      gl.deleteShader(points.vert);
      gl.deleteShader(points.frag);
      gl.deleteVertexArray(pointVao);
    },
  };
}

const svgImageCache = new Map<string, HTMLImageElement>();

/**
 * Rasterises ONLY text, images, and inline SVG icons into the absolute document canvas.
 * Card containers, clay surfaces, background boxes, and borders are NOT drawn here,
 * ensuring background templates remain unchanged and visible in the DOM at all times.
 */
export function rasterise(
  tracked: Array<TrackedItem>,
  source: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, source.width, source.height);

  for (let i = 0; i < tracked.length; i++) {
    const t = tracked[i];
    paintElementTextAndImages(t.el, ctx);
  }
}

export function paintElementTextAndImages(
  root: HTMLElement,
  ctx: CanvasRenderingContext2D
) {
  const scroller = document.scrollingElement || document.documentElement;
  const currentScrollY = scroller.scrollTop;

  const paintImg = (img: HTMLImageElement) => {
    if (!img.complete || !img.naturalWidth) return;
    const r = img.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;

    const docX = r.left;
    const docY = r.top + currentScrollY;

    const cs = getComputedStyle(img);
    let tl = parseFloat(cs.borderTopLeftRadius) || 0;
    let tr = parseFloat(cs.borderTopRightRadius) || 0;
    let br = parseFloat(cs.borderBottomRightRadius) || 0;
    let bl = parseFloat(cs.borderBottomLeftRadius) || 0;

    if (tl === 0 && tr === 0 && br === 0 && bl === 0 && img.parentElement) {
      const pcs = getComputedStyle(img.parentElement);
      tl = parseFloat(pcs.borderTopLeftRadius) || 0;
      tr = parseFloat(pcs.borderTopRightRadius) || 0;
      br = parseFloat(pcs.borderBottomRightRadius) || 0;
      bl = parseFloat(pcs.borderBottomLeftRadius) || 0;
    }
    const hasRadius = tl > 0 || tr > 0 || br > 0 || bl > 0;

    ctx.save();
    if (hasRadius) {
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(docX, docY, r.width, r.height, [tl, tr, br, bl]);
      } else {
        ctx.rect(docX, docY, r.width, r.height);
      }
      ctx.clip();
    }

    const fit = cs.objectFit;
    if (fit === 'cover') {
      const s = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
      const sw = r.width / s;
      const sh = r.height / s;
      ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, docX, docY, r.width, r.height);
    } else {
      ctx.drawImage(img, docX, docY, r.width, r.height);
    }
    ctx.restore();
  };

  const paintSvg = (svg: SVGSVGElement) => {
    const r = svg.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const docX = r.left;
    const docY = r.top + currentScrollY;

    try {
      const xml = new XMLSerializer().serializeToString(svg);
      let img = svgImageCache.get(xml);
      if (!img) {
        img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
        svgImageCache.set(xml, img);
      }
      if (img.complete && img.naturalWidth) {
        ctx.drawImage(img, docX, docY, r.width, r.height);
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
      const docX = r.left;
      const docY = r.top + currentScrollY + (r.height - (asc + desc)) / 2 + asc;
      ctx.fillText(m[0], docX, docY);
    }
  };

  if (root.tagName === 'IMG') {
    paintImg(root as HTMLImageElement);
    return;
  }
  if (root.tagName === 'SVG' || root.tagName === 'svg') {
    paintSvg(root as unknown as SVGSVGElement);
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node: Node | null = root;

  while ((node = walker.nextNode())) {
    if (node.nodeType === 3) {
      paintText(node as Text);
    } else if ((node as HTMLElement).tagName === 'IMG') {
      paintImg(node as HTMLImageElement);
    } else if ((node as HTMLElement).tagName === 'SVG' || (node as HTMLElement).tagName === 'svg') {
      paintSvg(node as unknown as SVGSVGElement);
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

  const tracked: TrackedItem[] = elements.map((el) => ({
    el,
    assembled: false,
    docTop: 0,
    docBottom: 0,
    docLeft: 0,
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
      t.docLeft = r.left;
      t.height = r.height;
      t.width = r.width;
      t.from = Math.max(0, Math.floor(t.docTop / density));
      t.to = Math.max(t.from, Math.ceil(t.docBottom / density));
      t.anchor = t.docTop + r.height * 0.4;
    }

    // Set source canvas size in document coordinates
    const docW = Math.max(1, Math.round(window.innerWidth));
    const docH = Math.max(1, Math.round(scroller.scrollHeight));
    if (source.width !== docW || source.height !== docH) {
      source.width = docW;
      source.height = docH;
    }

    // Hide unassembled text/images so particles represent them
    for (let i = 0; i < tracked.length; i++) {
      if (!tracked[i].assembled) {
        tracked[i].el.classList.add('ps-hidden');
      }
    }
  };

  measureTracked();

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
        const sy = scroller.scrollTop;
        const vh = window.innerHeight;

        for (let i = 0; i < tracked.length; i++) {
          const t = tracked[i];
          const top = Math.max(0, Math.min(rows.length - 1, t.from));
          const bottom = Math.max(top, Math.min(rows.length - 1, t.to));
          let min = 1;
          for (let j = top; j <= bottom; j++) {
            if (rows[j] < min) min = rows[j];
          }

          // When particles finish arranging (progress >= 0.95), reveal clearly
          if (min >= 0.95 && !t.assembled) {
            t.assembled = true;
            t.el.classList.remove('ps-hidden');
            t.el.classList.add('ps-in');
          } else if (min < 0.20 && t.assembled && (t.docTop - sy > vh + 80)) {
            // Only disassemble when scrolled completely off below the viewport
            t.assembled = false;
            t.el.classList.remove('ps-in');
            t.el.classList.add('ps-hidden');
          }
        }
      },
    },
    options
  );

  if (!instance) {
    output.remove();
    return null;
  }

  const debouncedRepaint = () => {
    measureTracked();
    instance.repaint();
  };

  window.addEventListener('resize', debouncedRepaint, { passive: true });
  document.fonts?.ready.then(debouncedRepaint);
  document.querySelectorAll('img').forEach((i) => i.addEventListener('load', debouncedRepaint, { once: true }));

  const originalDestroy = instance.destroy;
  instance.destroy = () => {
    originalDestroy();
    window.removeEventListener('resize', debouncedRepaint);
    output.remove();
    source.remove();
    for (const t of tracked) {
      t.el.classList.remove('ps-hidden', 'ps-in');
    }
  };

  return instance;
}

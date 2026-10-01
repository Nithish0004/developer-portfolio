import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';

export interface NithishWarpOverlayHandle {
  render: (
    normCursorX: number,
    normCursorY: number,
    activeIntensity: number,
    nodePositions: Float32Array,
    scalesX: Float32Array,
    strokes: Float32Array
  ) => void;
  resize: () => void;
}

interface NithishWarpOverlayProps {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  className?: string;
}

const HERO_LETTERS = ['N', 'I', 'T', 'H', 'I', 'S', 'H'];
const N_CHARS = HERO_LETTERS.length;

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
uniform float uMotion;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture2D(uTextTexture, uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;
  float scale = max(uWarpScale, 0.001);
  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 3.1 + drift);
  float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
  vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.045 * uMotion;

  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);

  // Restrained subtle ripple ring
  float rippleWave = sin(dist * 26.0 - time * 3.8) * 0.5 + 0.5;
  float rippleRing = (rippleWave - 0.5) * uRipple;

  // React Bits pointer warp vector
  vec2 pointerWarp = -dir * bulge * uPointerStrength * 0.055;
  pointerWarp += dir * rippleRing * bulge * uPointerStrength * 0.020;

  vec2 displaced = uv + ambient + pointerWarp;
  vec2 splitDir = ambient + pointerWarp;
  float splitLen = length(splitDir);
  splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
  vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65);

  vec4 base = sampleText(displaced);
  float r = sampleText(displaced + split).a;
  float g = base.a;
  float b = sampleText(displaced - split).a;
  float a = max(max(r, g), b);

  // Black NITHISH text with warm terracotta / red-orange accent at active warp zone
  vec3 blackText = vec3(0.122, 0.110, 0.098); // #1f1c19 deep graphite black
  vec3 terracotta = vec3(0.769, 0.329, 0.247); // #c4543f warm terracotta
  
  float warmth = clamp(lens * 0.45 + length(split) * 28.0, 0.0, 1.0);
  vec3 finalColor = mix(blackText, terracotta, warmth * 0.65);

  gl_FragColor = vec4(finalColor, a);
}
`;

export const NithishWarpOverlay = forwardRef<NithishWarpOverlayHandle, NithishWarpOverlayProps>(
  ({ headingRef, className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const glResourcesRef = useRef<{
      renderer: Renderer;
      gl: any;
      program: Program;
      mesh: Mesh;
      texture: Texture;
      textCanvas: HTMLCanvasElement;
      textCtx: CanvasRenderingContext2D | null;
      width: number;
      height: number;
      dpr: number;
      startTime: number;
      pointerX: number;
      pointerY: number;
    } | null>(null);

    useEffect(() => {
      const container = containerRef.current;
      if (!container || typeof window === 'undefined') return;

      let renderer: Renderer;
      let gl: any;
      let texture: Texture;
      let program: Program;
      let mesh: Mesh;
      let geometry: Triangle;

      try {
        renderer = new Renderer({
          alpha: true,
          premultipliedAlpha: false,
          antialias: true,
          dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        });
        gl = renderer.gl;
      } catch (err) {
        console.warn('NithishWarpOverlay: WebGL initialization skipped', err);
        return;
      }

      gl.clearColor(0, 0, 0, 0);
      const canvas = gl.canvas;
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.pointerEvents = 'none';
      canvas.setAttribute('aria-hidden', 'true');
      container.appendChild(canvas);

      const textCanvas = document.createElement('canvas');
      const textCtx = textCanvas.getContext('2d');

      texture = new Texture(gl, {
        generateMipmaps: false,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
        flipY: true,
      });

      geometry = new Triangle(gl);
      program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTextTexture: { value: texture },
          uResolution: { value: new Float32Array([1, 1]) },
          uPointer: { value: new Float32Array([0.5, 0.5]) },
          uPointerActive: { value: 0 },
          uTime: { value: 0 },
          uWarpStrength: { value: 0.015 }, // Very low at rest
          uWarpScale: { value: 8.0 },
          uSpeed: { value: 0.08 }, // Very low at rest (no heavy waving)
          uPointerInfluence: { value: 0.35 },
          uPointerStrength: { value: 0.38 },
          uRefraction: { value: 0.016 },
          uRipple: { value: 1.0 },
          uMotion: { value: 1.0 },
        },
      });

      mesh = new Mesh(gl, { geometry, program });

      glResourcesRef.current = {
        renderer,
        gl,
        program,
        mesh,
        texture,
        textCanvas,
        textCtx,
        width: 1,
        height: 1,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        startTime: performance.now(),
        pointerX: 0.5,
        pointerY: 0.5,
      };

      const handleResize = () => {
        if (!glResourcesRef.current || !container) return;
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const res = glResourcesRef.current;
        res.width = rect.width;
        res.height = rect.height;
        res.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        res.renderer.dpr = res.dpr;
        res.renderer.setSize(rect.width, rect.height);
        res.program.uniforms.uResolution.value[0] = gl.drawingBufferWidth;
        res.program.uniforms.uResolution.value[1] = gl.drawingBufferHeight;

        res.textCanvas.width = Math.max(1, Math.floor(rect.width * res.dpr));
        res.textCanvas.height = Math.max(1, Math.floor(rect.height * res.dpr));
      };

      const ro = new ResizeObserver(handleResize);
      ro.observe(container);
      handleResize();

      return () => {
        ro.disconnect();
        glResourcesRef.current = null;
        try {
          if (texture?.texture) gl.deleteTexture(texture.texture);
          geometry?.remove?.();
          program?.remove?.();
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        } catch (e) {
          void e;
        }
        if (canvas.parentNode === container) {
          container.removeChild(canvas);
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      resize: () => {
        const res = glResourcesRef.current;
        const container = containerRef.current;
        if (!res || !container) return;
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        res.width = rect.width;
        res.height = rect.height;
        res.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        res.renderer.dpr = res.dpr;
        res.renderer.setSize(rect.width, rect.height);
        res.program.uniforms.uResolution.value[0] = res.gl.drawingBufferWidth;
        res.program.uniforms.uResolution.value[1] = res.gl.drawingBufferHeight;
        res.textCanvas.width = Math.max(1, Math.floor(rect.width * res.dpr));
        res.textCanvas.height = Math.max(1, Math.floor(rect.height * res.dpr));
      },

      render: (
        normCursorX: number,
        normCursorY: number,
        activeIntensity: number,
        nodePositions: Float32Array,
        scalesX: Float32Array,
        strokes: Float32Array
      ) => {
        const res = glResourcesRef.current;
        const container = containerRef.current;
        if (!res || !container || !res.textCtx) return;

        const { textCanvas, textCtx, width, height, dpr, program, renderer, mesh, texture, startTime } = res;
        if (width <= 0 || height <= 0) return;

        // Container opacity follows active intensity: 0 when outside, 1 when inside
        container.style.opacity = Math.min(1.0, activeIntensity * 1.35).toFixed(3);

        if (activeIntensity <= 0.001) return;

        // 1. Rasterize current dynamically deformed typography
        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

        // Find inner frame width from heading
        let contentLeft = 0;
        let contentWidth = textCanvas.width;
        const heading = headingRef.current;
        if (heading) {
          const innerFrame = heading.firstElementChild as HTMLElement | null;
          if (innerFrame) {
            const hRect = heading.getBoundingClientRect();
            const iRect = innerFrame.getBoundingClientRect();
            contentLeft = (iRect.left - hRect.left) * dpr;
            contentWidth = iRect.width * dpr;
          }
        }

        const fontSize = Math.floor(height * dpr * 0.94);
        textCtx.font = `bold ${fontSize}px "Antonio", "Bebas Neue", "League Gothic", sans-serif`;
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';

        const centerY = textCanvas.height * 0.5;

        for (let i = 0; i < N_CHARS; i++) {
          const x0 = contentLeft + nodePositions[i] * contentWidth;
          const x1 = contentLeft + nodePositions[i + 1] * contentWidth;
          const cx = (x0 + x1) * 0.5;
          const sx = scalesX[i];
          const str = strokes[i];

          textCtx.save();
          textCtx.translate(cx, centerY);
          textCtx.scale(sx, 1.0);
          textCtx.fillStyle = '#1f1c19'; // Deep black NITHISH

          if (str > 0.04) {
            textCtx.lineWidth = str * 2.2 * dpr;
            textCtx.strokeStyle = '#1f1c19';
            textCtx.strokeText(HERO_LETTERS[i], 0, 0);
          }
          textCtx.fillText(HERO_LETTERS[i], 0, 0);
          textCtx.restore();
        }

        // Upload live deformed canvas to texture
        texture.image = textCanvas;
        texture.needsUpdate = true;

        // 2. Smoothly update pointer coordinates in WebGL texture UV space (0 to 1)
        const targetPointerX = Math.min(Math.max(normCursorX, 0.0), 1.0);
        // Note: UV space Y goes 0 at bottom to 1 at top
        const targetPointerY = Math.min(Math.max(1.0 - normCursorY, 0.0), 1.0);

        res.pointerX += (targetPointerX - res.pointerX) * 0.22;
        res.pointerY += (targetPointerY - res.pointerY) * 0.22;

        const now = performance.now();
        const elapsed = (now - startTime) * 0.001;

        program.uniforms.uPointer.value[0] = res.pointerX;
        program.uniforms.uPointer.value[1] = res.pointerY;
        program.uniforms.uPointerActive.value = activeIntensity;
        program.uniforms.uTime.value = elapsed;

        // Render shader pass
        renderer.render({ scene: mesh });
      },
    }));

    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 pointer-events-none z-10 overflow-visible transition-opacity duration-150 ${className}`}
        style={{ opacity: 0 }}
      />
    );
  }
);

NithishWarpOverlay.displayName = 'NithishWarpOverlay';

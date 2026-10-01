'use client';
import React, { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './GlowCursor.css';

const MAX_POINTS = 64;

export type BlendMode = 'normal' | 'screen' | 'plus-lighter';

export interface GlowCursorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  boundRef?: React.RefObject<HTMLElement | null>;
  color?: string;
  secondaryColor?: string;
  trailLength?: number;
  trailWidth?: number;
  trailTaper?: number;
  followSpeed?: number;
  glowIntensity?: number;
  glowSpread?: number;
  hotspot?: number;
  brightness?: number;
  opacity?: number;
  pulseSpeed?: number;
  noiseStrength?: number;
  idleFade?: boolean;
  idleTimeout?: number;
  fadeDuration?: number;
  blendMode?: BlendMode;
  maxDevicePixelRatio?: number;
  enabled?: boolean;
  children?: ReactNode;
}

interface GlowCursorConfig {
  color: string;
  secondaryColor: string;
  trailLength: number;
  trailWidth: number;
  trailTaper: number;
  followSpeed: number;
  glowIntensity: number;
  glowSpread: number;
  hotspot: number;
  brightness: number;
  opacity: number;
  pulseSpeed: number;
  noiseStrength: number;
  idleFade: boolean;
  idleTimeout: number;
  fadeDuration: number;
  blendMode: BlendMode;
  maxDevicePixelRatio: number;
  enabled: boolean;
}

const VERTEX_SHADER = `attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `precision highp float;
#define MAX_POINTS 64
uniform vec2 uResolution;
uniform vec2 uPoints[MAX_POINTS];
uniform float uPointCount;
uniform vec3 uColor;
uniform vec3 uSecondaryColor;
uniform float uTrailWidth;
uniform float uTaper;
uniform float uGlowIntensity;
uniform float uGlowSpread;
uniform float uHotspot;
uniform float uBrightness;
uniform float uOpacity;
uniform float uPulseSpeed;
uniform float uNoiseStrength;
uniform float uNormalBlend;
uniform float uTime;
uniform float uFade;
varying vec2 vUv;

float sRGB(float x) {
  if (x <= 0.00031308) return 12.92 * x;
  return 1.055 * pow(x, 1.0 / 2.4) - 0.055;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float filmGrain(vec2 p, float time) {
  float frame = time * 18.0;
  float frameIndex = mod(floor(frame), 256.0);
  float nextFrameIndex = mod(frameIndex + 1.0, 256.0);
  float blend = fract(frame);
  blend = blend * blend * (3.0 - 2.0 * blend);
  vec2 pixel = floor(p);
  float current = hash(pixel + vec2(frameIndex * 17.0, frameIndex * 31.0));
  float next = hash(pixel + vec2(nextFrameIndex * 17.0, nextFrameIndex * 31.0));
  return mix(current, next, blend) * 2.0 - 1.0;
}

void main() {
  vec2 pixel = vUv * uResolution;
  float denominator = max(uPointCount - 1.0, 1.0);
  float strongest = 0.0;
  float strongestCore = 0.0;
  float colorWeight = 0.0;
  vec3 colorSum = vec3(0.0);

  for (int i = 0; i < MAX_POINTS - 1; i++) {
    float index = float(i);
    float active = 1.0 - step(uPointCount - 1.0, index);
    vec2 start = uPoints[i];
    vec2 end = uPoints[i + 1];
    vec2 toPixel = pixel - start;
    vec2 segment = end - start;
    float along = clamp(dot(toPixel, segment) / max(dot(segment, segment), 0.0001), 0.0, 1.0);
    float progress = clamp((index + along) / denominator, 0.0, 1.0);
    float life = pow(max(1.0 - progress, 0.0), mix(0.55, 1.25, uTaper));
    float width = uTrailWidth * mix(1.0, 0.25, pow(progress, mix(0.55, 1.6, uTaper)));
    float distanceToTrail = length(toPixel - segment * along);
    float falloff = max(width * (0.8 + uGlowSpread * 1.4), 0.5);
    float beam = min(1.0, (falloff * falloff) / (distanceToTrail * distanceToTrail + falloff * falloff));
    float core = exp(-pow(distanceToTrail / max(width, 0.5), 2.0) * 2.5);
    float pulseAmount = min(abs(uPulseSpeed), 1.0);
    float pulse = 1.0 + sin(uTime * uPulseSpeed * 3.0 - progress * 11.0) * 0.16 * pulseAmount;
    float intensity = (core + beam * uGlowIntensity * 0.55) * life * pulse * active;
    vec3 segmentColor = mix(uColor, uSecondaryColor, progress);

    strongest = max(strongest, intensity);
    strongestCore = max(strongestCore, core * life * active);
    colorSum += segmentColor * intensity;
    colorWeight += intensity;
  }

  float grain = filmGrain(pixel, uTime);
  float noiseAmount = (1.0 - exp(-uNoiseStrength * 2.2)) * 0.4;
  float alpha = clamp(strongest * uOpacity * uFade, 0.0, 1.0);
  if (alpha < 0.0005) discard;

  vec3 color = colorSum / max(colorWeight, 0.0001);
  color = mix(color, vec3(1.0), smoothstep(0.25, 0.95, strongestCore) * uHotspot);
  float luminance = sRGB(clamp(strongest * uBrightness, 0.0, 1.0));
  luminance *= 1.0 + grain * noiseAmount;
  vec3 additiveColor = color * luminance;
  float normalAlpha = clamp(strongest * uBrightness * uOpacity * uFade, 0.0, 1.0);
  vec3 normalColor = mix(color, vec3(1.0), smoothstep(0.45, 1.0, strongestCore) * uHotspot * 0.35);

  gl_FragColor = vec4(mix(additiveColor, normalColor, uNormalBlend), mix(alpha, normalAlpha, uNormalBlend));
}`;

const hexToRgb = (hex: string): [number, number, number] => {
  let value = (hex || '').replace('#', '').trim();
  if (value.length === 3)
    value = value
      .split('')
      .map((char: string) => char + char)
      .join('');
  const parsed = Number.parseInt(value || '000000', 16);
  return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const GlowCursor = ({
  boundRef,
  color = '#c4543f',
  secondaryColor = '#c4543f',
  trailLength = 35,
  trailWidth = 7,
  trailTaper = 0.85,
  followSpeed = 0.18,
  glowIntensity = 1.6,
  glowSpread = 1.1,
  hotspot = 0.35,
  brightness = 1.15,
  opacity = 0.85,
  pulseSpeed = 0.7,
  noiseStrength = 0.02,
  idleFade = true,
  idleTimeout = 600,
  fadeDuration = 600,
  blendMode = 'normal',
  maxDevicePixelRatio = 1.5,
  enabled = true,
  children,
  className = '',
  style,
  ...rest
}: GlowCursorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef<GlowCursorConfig>({} as GlowCursorConfig);

  propsRef.current = {
    color,
    secondaryColor,
    trailLength,
    trailWidth,
    trailTaper,
    followSpeed,
    glowIntensity,
    glowSpread,
    hotspot,
    brightness,
    opacity,
    pulseSpeed,
    noiseStrength,
    idleFade,
    idleTimeout,
    fadeDuration,
    maxDevicePixelRatio,
    blendMode,
    enabled
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Strictly disable on touch-only devices or devices without fine pointer/hover capability
    const hasFinePointer = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasFinePointer) {
      canvas.style.display = 'none';
      return;
    }

    const initialConfig = propsRef.current;
    // Capped DPR to prevent fragment overload on high-resolution Retina displays
    const effectiveDpr = Math.min(
      window.devicePixelRatio || 1,
      initialConfig.maxDevicePixelRatio,
      typeof window !== 'undefined' && window.innerWidth < 768 ? 1.0 : 1.35
    );

    const renderer = new Renderer({
      canvas,
      alpha: true,
      dpr: effectiveDpr
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const pointData = Array(MAX_POINTS * 2).fill(0);
    const points = Array.from({ length: MAX_POINTS }, () => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uResolution: { value: [1, 1] },
        uPoints: { value: pointData },
        uPointCount: { value: initialConfig.trailLength },
        uColor: { value: hexToRgb(initialConfig.color) },
        uSecondaryColor: { value: hexToRgb(initialConfig.secondaryColor) },
        uTrailWidth: { value: initialConfig.trailWidth },
        uTaper: { value: initialConfig.trailTaper },
        uGlowIntensity: { value: initialConfig.glowIntensity },
        uGlowSpread: { value: initialConfig.glowSpread },
        uHotspot: { value: initialConfig.hotspot },
        uBrightness: { value: initialConfig.brightness },
        uOpacity: { value: initialConfig.opacity },
        uPulseSpeed: { value: initialConfig.pulseSpeed },
        uNoiseStrength: { value: initialConfig.noiseStrength },
        uNormalBlend: { value: initialConfig.blendMode === 'normal' ? 1 : 0 },
        uTime: { value: 0 },
        uFade: { value: 0 }
      },
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    let width = 1;
    let height = 1;
    let initialized = false;
    let pointerInside = false;
    let fade = 0;
    let lastInputTime = performance.now();
    let lastFrameTime = performance.now();
    let raf = 0;
    let rafRunning = false;
    let destroyed = false;
    let isHeroInView = true;

    // Cached rects to eliminate forced reflows during pointer movement
    let cachedTargetRect = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
    let cachedCanvasRect = { left: 0, top: 0, width: 0, height: 0 };

    const updateRects = () => {
      const targetEl = boundRef?.current || container;
      const tr = targetEl.getBoundingClientRect();
      const cr = container.getBoundingClientRect();
      cachedTargetRect = {
        left: tr.left,
        right: tr.right,
        top: tr.top,
        bottom: tr.bottom,
        width: tr.width,
        height: tr.height
      };
      cachedCanvasRect = {
        left: cr.left,
        top: cr.top,
        width: cr.width,
        height: cr.height
      };
    };

    const resize = () => {
      width = Math.max(container.clientWidth, 1);
      height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
      updateRects();
    };

    const startRaf = () => {
      if (destroyed || rafRunning || !isHeroInView || document.hidden) return;
      rafRunning = true;
      lastFrameTime = performance.now();
      raf = requestAnimationFrame(render);
    };

    const stopRaf = () => {
      rafRunning = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const initializeTrail = (x: number, y: number) => {
      target.x = x;
      target.y = y;
      head.x = x;
      head.y = y;
      for (const point of points) {
        point.x = x;
        point.y = y;
      }
      initialized = true;
      fade = 1;
    };

    const updatePointer = (event: PointerEvent) => {
      if (!isHeroInView || document.hidden) return;

      const isInside =
        event.clientX >= cachedTargetRect.left &&
        event.clientX <= cachedTargetRect.right &&
        event.clientY >= cachedTargetRect.top &&
        event.clientY <= cachedTargetRect.bottom;

      if (!isInside) {
        if (pointerInside) {
          pointerInside = false;
          lastInputTime = performance.now();
        }
        return;
      }

      // Convert to canvas local coordinates (Y origin at bottom for WebGL)
      const x = clamp(event.clientX - cachedCanvasRect.left, 0, cachedCanvasRect.width);
      const y = clamp(cachedCanvasRect.height - (event.clientY - cachedCanvasRect.top), 0, cachedCanvasRect.height);

      if (!initialized) initializeTrail(x, y);
      target.x = x;
      target.y = y;
      pointerInside = true;
      lastInputTime = performance.now();

      startRaf();
    };

    const onPointerEnter = (event: PointerEvent) => {
      updateRects();
      updatePointer(event);
    };

    const onPointerLeave = () => {
      pointerInside = false;
      lastInputTime = performance.now();
    };

    const onScroll = () => {
      updateRects();
      if (!pointerInside) return;
      if (
        head.x < 0 ||
        head.x > cachedCanvasRect.width ||
        cachedTargetRect.bottom < 0 ||
        cachedTargetRect.top > window.innerHeight
      ) {
        pointerInside = false;
        lastInputTime = performance.now();
      }
    };

    const render = (now: number) => {
      if (destroyed || !isHeroInView || document.hidden) {
        stopRaf();
        return;
      }

      const config = propsRef.current;
      const delta = Math.min((now - lastFrameTime) / 16.667, 3);
      lastFrameTime = now;

      if (initialized) {
        const headEase = 1 - Math.pow(1 - clamp(config.followSpeed, 0.01, 0.99), delta);
        const chainBase = clamp(0.28 + config.followSpeed * 0.35, 0.08, 0.92);
        const chainEase = 1 - Math.pow(1 - chainBase, delta);

        head.x += (target.x - head.x) * headEase;
        head.y += (target.y - head.y) * headEase;
        points[0].x = head.x;
        points[0].y = head.y;

        for (let i = 1; i < MAX_POINTS; i++) {
          points[i].x += (points[i - 1].x - points[i].x) * chainEase;
          points[i].y += (points[i - 1].y - points[i].y) * chainEase;
        }

        for (let i = 0; i < MAX_POINTS; i++) {
          pointData[i * 2] = points[i].x;
          pointData[i * 2 + 1] = points[i].y;
        }
      }

      const idleFor = now - lastInputTime;
      const shouldFade = config.idleFade && (!pointerInside || idleFor > config.idleTimeout);
      const fadeStep = (16.667 * delta) / Math.max(config.fadeDuration, 16);
      const fadeTarget = initialized && config.enabled && !shouldFade ? 1 : 0;
      fade += (fadeTarget - fade) * Math.min(1, fadeStep * 7);

      // PERFORMANCE AUTO-PAUSE: If fully faded out and pointer is outside or idle, stop RAF loop immediately
      if (shouldFade && fade < 0.001) {
        fade = 0;
        program.uniforms.uFade.value = 0;
        gl.clear(gl.COLOR_BUFFER_BIT);
        stopRaf();
        return;
      }

      program.uniforms.uPointCount.value = clamp(Math.round(config.trailLength), 2, MAX_POINTS);
      program.uniforms.uColor.value = hexToRgb(config.color);
      program.uniforms.uSecondaryColor.value = hexToRgb(config.secondaryColor);
      program.uniforms.uTrailWidth.value = Math.max(config.trailWidth, 0.1);
      program.uniforms.uTaper.value = clamp(config.trailTaper, 0, 1);
      program.uniforms.uGlowIntensity.value = Math.max(config.glowIntensity, 0);
      program.uniforms.uGlowSpread.value = Math.max(config.glowSpread, 0);
      program.uniforms.uHotspot.value = clamp(config.hotspot, 0, 1);
      program.uniforms.uBrightness.value = Math.max(config.brightness, 0);
      program.uniforms.uOpacity.value = clamp(config.opacity, 0, 1);
      program.uniforms.uPulseSpeed.value = config.pulseSpeed;
      program.uniforms.uNoiseStrength.value = clamp(config.noiseStrength, 0, 1);
      program.uniforms.uNormalBlend.value = config.blendMode === 'normal' ? 1 : 0;
      program.uniforms.uTime.value = now * 0.001;
      program.uniforms.uFade.value = fade;

      renderer.render({ scene: mesh });
      if (!destroyed && rafRunning) raf = requestAnimationFrame(render);
    };

    const targetElement = boundRef?.current || container;

    // IntersectionObserver to pause GlowCursor WebGL rendering when Hero is offscreen
    const io = new IntersectionObserver(
      (entries) => {
        const inView = entries[0]?.isIntersecting ?? true;
        isHeroInView = inView;
        if (!inView) {
          stopRaf();
        } else {
          updateRects();
          if (pointerInside || fade > 0.001) {
            startRaf();
          }
        }
      },
      { threshold: 0 }
    );
    io.observe(targetElement);

    // Tab visibility handling: pause render loop when browser tab is inactive
    const onVisibilityChange = () => {
      if (document.hidden) {
        stopRaf();
      } else if (isHeroInView && (pointerInside || fade > 0.001)) {
        startRaf();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    targetElement.addEventListener('pointerenter', onPointerEnter);
    targetElement.addEventListener('pointermove', updatePointer);
    targetElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    resize();
    startRaf();

    return () => {
      destroyed = true;
      stopRaf();
      io.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      targetElement.removeEventListener('pointerenter', onPointerEnter);
      targetElement.removeEventListener('pointermove', updatePointer);
      targetElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      mesh.geometry.remove();
      program.remove();
    };
  }, [maxDevicePixelRatio, boundRef]);

  return (
    <div
      ref={containerRef}
      className={`glow-cursor${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className="glow-cursor__canvas"
        style={{ mixBlendMode: blendMode }}
        aria-hidden="true"
      />
      {children && <div className="glow-cursor__content">{children}</div>}
    </div>
  );
};

export default GlowCursor;

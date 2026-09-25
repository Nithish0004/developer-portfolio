import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface ElementsCollectionProps {
  variant?: 'water' | string;
  speed?: number;
  size?: number;
  particleAmount?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
  opacity?: number;
  // Dynamic sequence control
  progress?: number; // 0.0 to 1.0 across the 6.0s sequence
  showText?: boolean;
  textProgress?: number; // 0.0 to 1.0
  finalRippleProgress?: number; // 0.0 to 1.0 for the 4.0s-5.8s expanding pulse
  className?: string;
  onPointerMove?: (x: number, y: number) => void;
  onClick?: () => void;
}

export const ElementsCollection: React.FC<ElementsCollectionProps> = ({
  variant = 'water',
  speed = 1.0,
  size = 1.0,
  particleAmount = 1.0,
  hue = 0,
  saturation = 1.0,
  brightness = 1.0,
  opacity = 1.0,
  progress = 0,
  showText = false,
  textProgress = 0,
  finalRippleProgress = 0,
  className = '',
  onPointerMove,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to keep animation loop clean
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const waterMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const markTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const markCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const reqIdRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
  });
  const clickRipplesRef = useRef<Array<{ x: number; y: number; age: number }>>([]);

  // Store latest props in refs for RAF loop
  const propsRef = useRef({
    speed,
    size,
    particleAmount,
    hue,
    saturation,
    brightness,
    opacity,
    progress,
    showText,
    textProgress,
    finalRippleProgress,
  });

  useEffect(() => {
    propsRef.current = {
      speed,
      size,
      particleAmount,
      hue,
      saturation,
      brightness,
      opacity,
      progress,
      showText,
      textProgress,
      finalRippleProgress,
    };
  }, [
    speed,
    size,
    particleAmount,
    hue,
    saturation,
    brightness,
    opacity,
    progress,
    showText,
    textProgress,
    finalRippleProgress,
  ]);

  // Helper to draw custom geometric "N" monogram and "NITHISH S" onto offscreen canvas
  const updateMarkTexture = (tProgress: number, isTextVisible: boolean) => {
    if (!markCanvasRef.current) return;
    const canvas = markCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear with transparent black
    ctx.clearRect(0, 0, w, h);

    // Center coordinates
    const cx = w / 2;
    const cy = h / 2 - (isTextVisible ? 36 : 0);

    // Draw Geometric "N" Monogram in warm cream (#f5f2ea)
    ctx.save();
    ctx.fillStyle = '#f5f2ea';
    ctx.strokeStyle = '#f5f2ea';

    // Monogram dimensions
    const nW = 160;
    const nH = 210;
    const stemW = 32;

    const left = cx - nW / 2;
    const right = cx + nW / 2;
    const top = cy - nH / 2;
    const bottom = cy + nH / 2;

    // Path for modern architectural geometric "N"
    ctx.beginPath();
    // Left vertical stem
    ctx.rect(left, top, stemW, nH);
    ctx.fill();

    // Right vertical stem
    ctx.beginPath();
    ctx.rect(right - stemW, top, stemW, nH);
    ctx.fill();

    // Diagonal connecting slash with crisp beveled corners
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + stemW + 10, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(right - stemW - 10, bottom);
    ctx.closePath();
    ctx.fill();

    // Subtle fine architectural tick line under the N
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(245, 242, 234, 0.45)';
    ctx.moveTo(cx - 90, cy + nH / 2 + 20);
    ctx.lineTo(cx + 90, cy + nH / 2 + 20);
    ctx.stroke();

    // If Text is revealing: draw "NITHISH S" with crisp monospace spacing
    if (isTextVisible && tProgress > 0) {
      ctx.save();
      const alpha = Math.min(1, Math.max(0, tProgress));
      ctx.globalAlpha = alpha;
      ctx.font = '600 24px "Plus Jakarta Sans", "JetBrains Mono", sans-serif';
      ctx.fillStyle = '#f5f2ea';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Clip horizontal reveal for text
      const textY = cy + nH / 2 + 56;
      const textW = 280;
      const revealWidth = textW * Math.min(1, tProgress * 1.2);

      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - textW / 2, textY - 20, revealWidth, 40);
      ctx.clip();

      // Letter spaced text
      ctx.letterSpacing = '0.42em';
      ctx.fillText('NITHISH S', cx, textY);
      ctx.restore();

      // Secondary subtitle
      if (tProgress > 0.4) {
        const subAlpha = (tProgress - 0.4) / 0.6;
        ctx.globalAlpha = alpha * subAlpha * 0.75;
        ctx.font = '500 12px "JetBrains Mono", monospace';
        ctx.letterSpacing = '0.28em';
        ctx.fillStyle = '#9ea3a8';
        ctx.fillText('ISE // RVCE // BENGALURU', cx, textY + 34);
      }

      ctx.restore();
    }

    ctx.restore();

    if (markTextureRef.current) {
      markTextureRef.current.needsUpdate = true;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Create Offscreen Canvas for "N" Monogram
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 1024;
    offCanvas.height = 1024;
    markCanvasRef.current = offCanvas;

    const markTexture = new THREE.CanvasTexture(offCanvas);
    markTexture.minFilter = THREE.LinearFilter;
    markTexture.magFilter = THREE.LinearFilter;
    markTextureRef.current = markTexture;

    // Initial draw
    updateMarkTexture(0, false);

    // 2. Initialize Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      rendererRef.current = renderer;
    } catch {
      // Graceful fallback if WebGL is unavailable
      return;
    }

    // 3. Water Refraction & Ripple Shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;

      uniform sampler2D uMarkTexture;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uSpeed;
      uniform float uSize;
      uniform float uProgress;
      uniform float uFinalRipple;
      uniform float uHue;
      uniform float uSaturation;
      uniform float uBrightness;
      uniform float uOpacity;
      uniform vec3 uRipples[5]; // x, y, age

      // High-quality procedural noise for subtle water caustics
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        for (int i = 0; i < 3; ++i) {
          v += a * noise(p);
          p = p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv;
        vec2 aspectUv = (uv - 0.5) * vec2(uResolution.x / min(uResolution.x, uResolution.y), uResolution.y / min(uResolution.x, uResolution.y)) + 0.5;

        // Stage-based intensity multipliers
        // 0.0 - 1.0s: water begins subtle
        // 1.0 - 2.0s: water clearer
        // 2.0 - 3.0s: controlled distortion + cyan depth
        // 4.0 - 5.0s: energetic final ripple
        // 5.0 - 5.8s: easing out
        float stageMultiplier = smoothstep(0.0, 0.25, uProgress);
        float exitDamp = 1.0 - smoothstep(0.85, 1.0, uProgress);

        float t = uTime * 0.9 * uSpeed;

        // Fluid wave simulation
        vec2 waveCoord = aspectUv * 5.0 * uSize;
        float wave1 = sin(waveCoord.x * 3.5 + t * 2.2 + fbm(waveCoord * 1.5)) * cos(waveCoord.y * 3.0 - t * 1.8);
        float wave2 = sin(waveCoord.y * 4.0 - t * 2.5) * cos(waveCoord.x * 2.8 + t * 1.5);
        float fluidDistort = (wave1 + wave2 * 0.75) * 0.022 * stageMultiplier;

        // Interactive mouse ripples
        vec2 mouseAspect = (uMouse - 0.5) * vec2(uResolution.x / min(uResolution.x, uResolution.y), uResolution.y / min(uResolution.x, uResolution.y)) + 0.5;
        float mouseDist = length(aspectUv - mouseAspect);
        float mouseRipple = sin(mouseDist * 28.0 - t * 6.0) * exp(-mouseDist * 6.5) * 0.035 * stageMultiplier;

        // Click / tap dynamic ripples
        float clickRippleSum = 0.0;
        for (int i = 0; i < 5; i++) {
          if (uRipples[i].z > 0.0) {
            vec2 ripPos = vec2(uRipples[i].x, uRipples[i].y);
            vec2 ripAspect = (ripPos - 0.5) * vec2(uResolution.x / min(uResolution.x, uResolution.y), uResolution.y / min(uResolution.x, uResolution.y)) + 0.5;
            float rDist = length(aspectUv - ripAspect);
            float age = uRipples[i].z;
            float waveRadius = age * 0.7;
            float waveDiff = abs(rDist - waveRadius);
            clickRippleSum += sin(waveDiff * 45.0) * exp(-waveDiff * 18.0) * (1.0 - age) * 0.035;
          }
        }

        // 4.0 - 5.0s FINAL EXPANDING RIPPLE from Center (N)
        float finalRippleWave = 0.0;
        if (uFinalRipple > 0.0) {
          vec2 centerAspect = vec2(0.5);
          float cDist = length(aspectUv - centerAspect);
          float fRadius = uFinalRipple * 1.1;
          float fDiff = abs(cDist - fRadius);
          finalRippleWave = sin(fDiff * 40.0 - uTime * 4.0) * exp(-fDiff * 12.0) * (1.0 - uFinalRipple * 0.8) * 0.065;
        }

        // Combined normal distortion
        vec2 totalDistortion = vec2(fluidDistort + mouseRipple + clickRippleSum + finalRippleWave);
        totalDistortion *= exitDamp;

        // Calculate Chromatic Aberration / Refraction for the Monogram
        // Red, Green, Blue sampled with subtle offsets for liquid dispersion
        vec2 refractedUvR = uv + totalDistortion * 1.0;
        vec2 refractedUvG = uv + totalDistortion * 1.12;
        vec2 refractedUvB = uv + totalDistortion * 1.25;

        // Sample "N" Monogram with chromatic separation
        vec4 markR = texture2D(uMarkTexture, refractedUvR);
        vec4 markG = texture2D(uMarkTexture, refractedUvG);
        vec4 markB = texture2D(uMarkTexture, refractedUvB);

        // Alpha & appearance progression
        float markAlpha = max(markR.a, max(markG.a, markB.a));
        float appearanceAlpha = smoothstep(0.08, 0.45, uProgress);
        markAlpha *= appearanceAlpha;

        // Reconstruct refracted mark color
        vec3 markColor = vec3(markR.r, markG.g, markB.b);

        // Water depth & Cyan / Deep blue ambient shading
        // As requested: subtle cyan/blue depth inside the water effect
        vec3 deepCyanWater = vec3(0.02, 0.09, 0.14);
        vec3 lightCyanGlint = vec3(0.18, 0.58, 0.72);
        
        float caustics = fbm(aspectUv * 8.0 + totalDistortion * 4.0 + t * 0.5);
        float waterDepthGlint = smoothstep(0.48, 0.75, caustics) * 0.22 * stageMultiplier * exitDamp;

        // Water specular highlight
        vec2 normalApprox = vec2(
          sin((aspectUv.x + totalDistortion.x) * 35.0),
          cos((aspectUv.y + totalDistortion.y) * 35.0)
        );
        vec3 lightDir = normalize(vec3(0.3, 0.5, 0.8));
        float specular = pow(max(dot(vec3(normalApprox, 1.0), lightDir), 0.0), 16.0) * 0.25 * stageMultiplier * exitDamp;

        // Base Background: Near-Black (#070709) with fluid cyan ambient light
        vec3 baseBg = vec3(0.027, 0.027, 0.035);
        vec3 waterField = mix(baseBg, deepCyanWater, length(totalDistortion) * 4.0 + waterDepthGlint * 0.3);
        waterField += lightCyanGlint * specular;

        // Composite Mark over Water
        vec3 finalColor = mix(waterField, markColor + lightCyanGlint * 0.15 * length(totalDistortion), markAlpha);

        // Final overall brightness & opacity
        finalColor *= uBrightness;

        gl_FragColor = vec4(finalColor, uOpacity);
      }
    `;

    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uMarkTexture: { value: markTexture },
        uResolution: { value: new THREE.Vector2(width, height) },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uSpeed: { value: speed },
        uSize: { value: size },
        uProgress: { value: progress },
        uFinalRipple: { value: finalRippleProgress },
        uHue: { value: hue },
        uSaturation: { value: saturation },
        uBrightness: { value: brightness },
        uOpacity: { value: opacity },
        uRipples: { value: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)] },
      },
      transparent: true,
    });
    waterMaterialRef.current = waterMaterial;

    const planeGeo = new THREE.PlaneGeometry(2, 2);
    const planeMesh = new THREE.Mesh(planeGeo, waterMaterial);
    scene.add(planeMesh);

    // 4. Suspended 3D Floating Particles (Fluid Depth)
    const particleCount = Math.floor(120 * particleAmount);
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 2.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      scales[i] = Math.random() * 2.5 + 1.0;
      opacities[i] = Math.random() * 0.4 + 0.15;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Shader for soft luminous underwater spheres
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(0x56a6c4), // Subtle cyan/water tone
      size: 3.5,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMaterial);
    particles.position.z = 0.2;
    scene.add(particles);
    particlesRef.current = particles;

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !waterMaterial) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      waterMaterial.uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.08;
      m.y += (m.targetY - m.y) * 0.08;

      // Update ripples age
      const ripples = clickRipplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].age += delta * 1.2;
        if (ripples[i].age > 1.0) {
          ripples.splice(i, 1);
        }
      }

      // Pack ripples for shader
      const rippleVectors: THREE.Vector3[] = [];
      for (let i = 0; i < 5; i++) {
        if (ripples[i]) {
          rippleVectors.push(new THREE.Vector3(ripples[i].x, ripples[i].y, ripples[i].age));
        } else {
          rippleVectors.push(new THREE.Vector3(0, 0, 0));
        }
      }

      // Update uniforms
      if (waterMaterial) {
        const p = propsRef.current;
        waterMaterial.uniforms.uTime.value = elapsedTime;
        waterMaterial.uniforms.uMouse.value.set(m.x, m.y);
        waterMaterial.uniforms.uSpeed.value = p.speed;
        waterMaterial.uniforms.uSize.value = p.size;
        waterMaterial.uniforms.uProgress.value = p.progress;
        waterMaterial.uniforms.uFinalRipple.value = p.finalRippleProgress;
        waterMaterial.uniforms.uBrightness.value = p.brightness;
        waterMaterial.uniforms.uOpacity.value = p.opacity;
        waterMaterial.uniforms.uRipples.value = rippleVectors;
      }

      // Animate floating particles in fluid currents
      if (particles) {
        const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const p = propsRef.current;
        const particleSpeed = 0.15 * p.speed;

        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] += Math.sin(elapsedTime * 0.5 + i) * 0.0008 * particleSpeed;
          arr[i * 3 + 0] += Math.cos(elapsedTime * 0.4 + i) * 0.0006 * particleSpeed;

          // Outward response to final ripple
          if (p.finalRippleProgress > 0) {
            const dx = arr[i * 3 + 0];
            const dy = arr[i * 3 + 1];
            arr[i * 3 + 0] += dx * 0.005 * p.finalRippleProgress;
            arr[i * 3 + 1] += dy * 0.005 * p.finalRippleProgress;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Update offscreen text progress if changed
      const p = propsRef.current;
      updateMarkTexture(p.textProgress, p.showText);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      if (renderer) renderer.dispose();
      if (planeGeo) planeGeo.dispose();
      if (waterMaterial) waterMaterial.dispose();
      if (particleGeo) particleGeo.dispose();
      if (particleMaterial) particleMaterial.dispose();
      if (markTexture) markTexture.dispose();
    };
  }, []);

  // Pointer move handler (supports mouse & touch)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // Invert Y for WebGL UV

    mouseRef.current.targetX = Math.max(0, Math.min(1, x));
    mouseRef.current.targetY = Math.max(0, Math.min(1, y));

    if (onPointerMove) {
      onPointerMove(x, y);
    }
  };

  // Click handler creates dynamic water ripples
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;

    if (clickRipplesRef.current.length >= 5) {
      clickRipplesRef.current.shift();
    }
    clickRipplesRef.current.push({ x, y, age: 0.01 });

    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      className={`relative w-full h-full cursor-crosshair overflow-hidden touch-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

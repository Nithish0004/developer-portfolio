import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ArrowUpRight, Cpu, Layers, Activity } from 'lucide-react';
import projectImgUrl from '../assets/images/project_preview_systems_1790178775486.jpg';

interface ParticleReconstructionSectionProps {
  onViewProject?: () => void;
}

export const ParticleReconstructionSection: React.FC<ParticleReconstructionSectionProps> = ({
  onViewProject,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const progressBadgeRef = useRef<HTMLSpanElement | null>(null);
  const stageBadgeRef = useRef<HTMLSpanElement | null>(null);

  const [isWebGLEnabled, setIsWebGLEnabled] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setIsWebGLEnabled(false);
      return;
    }

    const scene = new THREE.Scene();

    // Responsive sizing
    let width = track.clientWidth || window.innerWidth;
    let height = window.innerHeight;
    const isMobile = width < 768;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Orthographic Camera: 1 Three.js unit = 1 physical screen pixel
    // Allows 100% pixel-perfect matching between sampled image/typography and reconstructed points
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      1000
    );
    camera.position.z = 500;

    let pointsMesh: THREE.Points | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let rafId: number | null = null;

    let targetProgress = 0;
    let currentProgress = 0;

    // Preload project artwork image
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = projectImgUrl;

    const buildParticleField = () => {
      width = track.clientWidth || window.innerWidth;
      height = window.innerHeight;
      const isMob = width < 768;

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();

      if (renderer) {
        renderer.setSize(width, height);
      }

      // Offscreen canvas for pixel sampling
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      // ── DRAW CONTENT ONTO OFFSCREEN CANVAS TO SAMPLE COLORS & COORDINATES ──
      const centerY = height * 0.5;

      if (!isMob) {
        // Desktop Layout:
        // Left Column: Editorial Typography & Technical Specs
        // Right Column: Flagship Project Photography Artwork
        const leftX = Math.max(50, width * 0.08);

        // 1. Category Tagline in Website Accent Red (#c4543f)
        ctx.fillStyle = '#c4543f';
        ctx.font = '600 13px "JetBrains Mono", monospace';
        ctx.fillText('01 // FEATURED ARCHITECTURE', leftX, centerY - 150);

        // 2. Primary Headline in Dark Black (#1f1c19)
        ctx.fillStyle = '#1f1c19';
        ctx.font = 'bold 44px "Syne", "Plus Jakarta Sans", sans-serif';
        ctx.fillText('DISTRIBUTED SYSTEMS', leftX, centerY - 90);

        ctx.font = 'bold 40px "Syne", "Plus Jakarta Sans", sans-serif';
        ctx.fillText('& REAL-TIME TELEMETRY', leftX, centerY - 38);

        // 3. Subtitle / Architecture summary
        ctx.fillStyle = '#5e5852';
        ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('High-throughput stream engine with fault-tolerant worker pools', leftX, centerY + 10);

        // 4. Engineering Metrics Line
        ctx.fillStyle = '#c4543f';
        ctx.font = '600 12.5px "JetBrains Mono", monospace';
        ctx.fillText('⚡ < 1.2ms LATENCY   •   100K MSG/SEC   •   99.99% RESILIENT', leftX, centerY + 58);

        // 5. Tech Stack Badges
        ctx.fillStyle = '#7a7269';
        ctx.font = '600 11.5px "JetBrains Mono", monospace';
        ctx.fillText('TYPESCRIPT  //  NODE.JS  //  REDIS  //  DOCKER  //  WEBSOCKETS', leftX, centerY + 96);

        // 6. Project Artwork Image on Right Column
        const imgW = Math.min(480, Math.max(380, width * 0.38));
        const imgH = imgW * 0.64;
        const imgX = Math.max(leftX + 460, width * 0.52);
        const imgY = centerY - imgH / 2 - 10;

        if (image.complete && image.naturalWidth > 0) {
          ctx.drawImage(image, imgX, imgY, imgW, imgH);
        } else {
          // Fallback colored card while image loads
          ctx.fillStyle = '#22201d';
          ctx.fillRect(imgX, imgY, imgW, imgH);
        }

        // Draw refined accent border around image frame
        ctx.strokeStyle = '#c4543f';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(imgX, imgY, imgW, imgH);
      } else {
        // Mobile Layout: Compact Stacked Representation
        const startX = 24;
        ctx.fillStyle = '#c4543f';
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillText('01 // FEATURED ARCHITECTURE', startX, centerY - 170);

        ctx.fillStyle = '#1f1c19';
        ctx.font = 'bold 26px "Syne", "Plus Jakarta Sans", sans-serif';
        ctx.fillText('DISTRIBUTED SYSTEMS', startX, centerY - 130);

        ctx.fillStyle = '#5e5852';
        ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('High-throughput stream engine & telemetry', startX, centerY - 95);

        // Mobile image below text
        const imgW = Math.min(320, width - 48);
        const imgH = imgW * 0.60;
        const imgX = startX;
        const imgY = centerY - 65;

        if (image.complete && image.naturalWidth > 0) {
          ctx.drawImage(image, imgX, imgY, imgW, imgH);
        }

        ctx.fillStyle = '#c4543f';
        ctx.font = '600 10.5px "JetBrains Mono", monospace';
        ctx.fillText('⚡ < 1.2ms LATENCY  •  100K MSG/S', startX, imgY + imgH + 28);
      }

      // ── SAMPLE NON-EMPTY PIXELS INTO 3D PARTICLES ──
      const imgData = ctx.getImageData(0, 0, width, height).data;
      const step = isMob ? 6 : 4; // Higher density on desktop (~14K), lightweight on mobile (~4K)

      const targets: number[] = [];
      const scatters: number[] = [];
      const colors: number[] = [];
      const phases: number[] = [];
      const sizes: number[] = [];

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const a = imgData[index + 3];
          if (a < 35) continue;

          const r = imgData[index];
          const g = imgData[index + 1];
          const b = imgData[index + 2];

          // Skip pure cream background pixels if any bleed occurred
          if (r > 240 && g > 238 && b > 230 && a < 180) continue;

          // Target 3D coordinates (centered origin for Orthographic camera)
          const tx = x - width / 2;
          const ty = -(y - height / 2);
          // Subtle dimensional layer: text sits slightly forward (z = 12), artwork at z = 0
          const isText = isMob ? y < centerY - 70 : x < width * 0.50;
          const tz = isText ? 12.0 : (Math.random() - 0.5) * 8.0;

          targets.push(tx, ty, tz);

          // Scatter 3D coordinates:
          // Elegant, controlled dispersion in 3D volume (no explosions, no chaotic storm)
          const angle = Math.random() * Math.PI * 2;
          const dist = 120 + Math.random() * 240;
          const sx = tx + Math.cos(angle) * dist + (Math.random() - 0.5) * 60;
          const sy = ty + Math.sin(angle) * dist + (Math.random() - 0.5) * 60;
          const sz = (Math.random() - 0.5) * 280; // Gentle Z depth

          scatters.push(sx, sy, sz);

          // Normalized color channels
          colors.push(r / 255, g / 255, b / 255);

          // Staggered assembly phase (cascading reveal from left to right + organic variance)
          const spatialRatio = Math.max(0, Math.min(1, x / width));
          const phase = Math.min(1.0, Math.max(0.0, spatialRatio * 0.35 + Math.random() * 0.65));
          phases.push(phase);

          // Dot size: very small, crisp points
          const dotSize = isMob ? 3.0 : isText ? 2.0 : 2.4;
          sizes.push(dotSize);
        }
      }

      // Dispose existing mesh if resizing
      if (pointsMesh) {
        scene.remove(pointsMesh);
        pointsMesh.geometry.dispose();
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(scatters, 3));
      geometry.setAttribute('aTargetPosition', new THREE.Float32BufferAttribute(targets, 3));
      geometry.setAttribute('aScatterPosition', new THREE.Float32BufferAttribute(scatters, 3));
      geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
      geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));

      // GPU Shader for 60 FPS scroll-driven reconstruction
      material = new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: `
          uniform float uProgress;
          uniform float uTime;

          attribute vec3 aTargetPosition;
          attribute vec3 aScatterPosition;
          attribute vec3 aColor;
          attribute float aPhase;
          attribute float aSize;

          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            vColor = aColor;

            // Staggered progress per particle for organic cascading assembly
            float start = aPhase * 0.32;
            float end = start + 0.68;
            float t = clamp((uProgress - start) / (end - start), 0.0, 1.0);

            // Smooth cubic easeInOut curve
            float ease = smoothstep(0.0, 1.0, t);

            // Ambient floating drift that softly settles to 0 as ease approaches 1.0
            float driftDecay = (1.0 - ease) * (1.0 - ease);
            vec3 drift = vec3(
              sin(uTime * 0.75 + aPhase * 6.28) * 14.0 * driftDecay,
              cos(uTime * 0.60 + aPhase * 6.28) * 12.0 * driftDecay,
              sin(uTime * 0.65 + aPhase * 3.14) * 18.0 * driftDecay
            );

            vec3 currentPos = mix(aScatterPosition + drift, aTargetPosition, ease);

            vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            // Subtle depth perspective for points
            float depthScale = 1.0 + (currentPos.z / 320.0) * 0.35;
            gl_PointSize = aSize * depthScale;

            // Smooth fade-in as user initiates scroll into the section
            vAlpha = clamp(uProgress * 3.5, 0.0, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            if (dist > 0.5) discard;

            // Soft anti-aliased circular particle edge
            float alpha = smoothstep(0.5, 0.36, dist) * vAlpha;
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
      });

      pointsMesh = new THREE.Points(geometry, material);
      scene.add(pointsMesh);
    };

    image.onload = () => {
      buildParticleField();
    };
    if (image.complete) {
      buildParticleField();
    }

    // ── SCROLL-PROGRESS CALCULATION & RAF INTERPOLATION (60 FPS) ──
    const onScroll = () => {
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      // Progress: 0.0 at entrance -> 1.0 when fully scrolled through track
      const scrolled = -rect.top;
      targetProgress = Math.max(0, Math.min(1, scrolled / totalScrollable));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    let lastTime = 0;
    const updateLoop = (now: number) => {
      lastTime = now;

      // Smooth inertia interpolation (no abrupt jumps)
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.001) {
        currentProgress += diff * 0.12;
      } else {
        currentProgress = targetProgress;
      }

      if (material) {
        material.uniforms.uProgress.value = currentProgress;
        material.uniforms.uTime.value = now * 0.001;
      }

      // Update telemetry badges
      if (progressBadgeRef.current) {
        const percent = Math.round(currentProgress * 100);
        progressBadgeRef.current.textContent = `${percent}%`;
      }

      if (stageBadgeRef.current) {
        if (currentProgress < 0.22) {
          stageBadgeRef.current.textContent = 'SCATTERED PARTICLES';
        } else if (currentProgress < 0.55) {
          stageBadgeRef.current.textContent = 'ORGANIZING FIELD';
        } else if (currentProgress < 0.86) {
          stageBadgeRef.current.textContent = 'RECONSTRUCTING DETAILS';
        } else {
          stageBadgeRef.current.textContent = 'SYSTEM ASSEMBLED';
        }
      }

      // Seamless cross-fade to clean interactive DOM layer when fully reconstructed
      if (contentRef.current) {
        if (currentProgress > 0.88) {
          const domFade = Math.min(1, (currentProgress - 0.88) / 0.12);
          contentRef.current.style.opacity = domFade.toFixed(3);
          contentRef.current.style.pointerEvents = domFade > 0.7 ? 'auto' : 'none';
        } else {
          contentRef.current.style.opacity = '0';
          contentRef.current.style.pointerEvents = 'none';
        }
      }

      if (renderer) {
        renderer.render(scene, camera);
      }

      rafId = requestAnimationFrame(updateLoop);
    };

    rafId = requestAnimationFrame(updateLoop);

    let resizeTimer: number | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        buildParticleField();
        onScroll();
      }, 150);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (pointsMesh) {
        pointsMesh.geometry.dispose();
      }
      if (material) {
        material.dispose();
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <section
      ref={trackRef}
      className="relative w-full h-[220vh] bg-[#f5f1eb] select-none"
      aria-label="Scroll-driven particle reconstruction transition"
    >
      {/* ── STICKY VIEWPORT CONTAINER ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-6 sm:py-8 px-4 sm:px-8 md:px-12 pointer-events-none">
        {/* Top Minimal Telemetry HUD */}
        <div className="w-full flex items-center justify-between text-xs font-mono tracking-widest text-[#7a7269] uppercase border-b border-[#e5decb] pb-3 z-30">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#c4543f] animate-pulse" />
            <span className="font-semibold text-[#1f1c19]">01 // ARCHITECTURAL REVEAL</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 text-[11px] sm:text-xs">
            <span
              ref={stageBadgeRef}
              className="text-[#8a8175] hidden sm:inline-block font-medium"
            >
              SCATTERED PARTICLES
            </span>
            <span className="text-[#1f1c19] font-bold">
              RECONSTRUCTION:{' '}
              <span ref={progressBadgeRef} className="text-[#c4543f]">
                0%
              </span>
            </span>
          </div>
        </div>

        {/* ── THREE.JS WEBGL PARTICLE CANVAS (Z-10) ── */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* ── CLEAN INTERACTIVE DOM OVERLAY (Z-20, Fades in seamlessly when assembly reaches 100%) ── */}
        <div
          ref={contentRef}
          className="relative z-20 w-full flex-1 flex items-center justify-center max-w-6xl mx-auto opacity-0 transition-opacity duration-300 pointer-events-none"
          style={{ willChange: 'opacity' }}
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Reconstructed Typography & Live Controls */}
            <div className="md:col-span-6 flex flex-col justify-center text-left space-y-4">
              <span className="text-[#c4543f] font-mono text-xs sm:text-sm font-semibold tracking-widest uppercase">
                01 // FEATURED ARCHITECTURE
              </span>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1f1c19] tracking-tight leading-[1.05]">
                Distributed Systems & Real-time Telemetry
              </h2>

              <p className="text-sm sm:text-base text-[#5e5852] font-sans leading-relaxed">
                High-throughput stream processing engine with fault-tolerant worker pools, zero-drop
                buffering, and live sub-millisecond metrics telemetry.
              </p>

              {/* Engineering Metrics Pills */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 py-2">
                <div className="clay-inset p-2.5 rounded-xl text-center">
                  <div className="text-[10px] font-mono text-[#8a8175] uppercase">Latency</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-[#c4543f]">&lt; 1.2ms</div>
                </div>
                <div className="clay-inset p-2.5 rounded-xl text-center">
                  <div className="text-[10px] font-mono text-[#8a8175] uppercase">Throughput</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-[#1f1c19]">100K msg/s</div>
                </div>
                <div className="clay-inset p-2.5 rounded-xl text-center">
                  <div className="text-[10px] font-mono text-[#8a8175] uppercase">Uptime</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-[#1f1c19]">99.99%</div>
                </div>
              </div>

              {/* Tech stack badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {['TypeScript', 'Node.js', 'Redis', 'Docker', 'WebSockets'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10.5px] font-mono font-semibold uppercase px-2.5 py-1 rounded-lg bg-[#e8e2d7] text-[#5e5852]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Live interactive button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onViewProject}
                  className="clay-btn-accent inline-flex items-center gap-2.5 text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider px-6 py-3 cursor-pointer shadow-md"
                >
                  <span>EXPLORE PROJECT</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>

            {/* Right Column: High-Res Project Preview Card */}
            <div className="md:col-span-6 flex justify-center items-center">
              <div className="clay-card p-3 sm:p-4 rounded-3xl w-full max-w-lg overflow-hidden border border-white/80 shadow-xl">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#24211d]">
                  <img
                    src={projectImgUrl}
                    alt="Distributed Systems & Real-time Telemetry"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] font-mono text-white/90 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    <Activity size={12} className="text-[#df6b55]" />
                    <span>SYSTEM STREAM ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Guide */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-widest text-[#8a8175] uppercase border-t border-[#e5decb] pt-3 z-30">
          <span className="flex items-center gap-2">
            <Cpu size={13} className="text-[#c4543f]" />
            <span>GPU PARTICLE SHADER ENGINE</span>
          </span>

          <span className="flex items-center gap-2">
            <span>SCROLL TO DISPERSE / ASSEMBLE</span>
            <Layers size={13} />
          </span>
        </div>
      </div>
    </section>
  );
};

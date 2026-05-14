'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Props {
  isThinking: boolean;
  isSpeaking: boolean;
  isListening: boolean;
}

interface Node {
  bx: number;
  by: number;
  bz: number;
  r: number;
  phase: number;
  edges: number[];
}

function buildMolecule(): Node[] {
  const nodes: Node[] = [];

  // Central atom
  nodes.push({ bx: 0, by: 0, bz: 0, r: 14, phase: 0, edges: [] });

  // Inner hexagonal ring (6 nodes)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    nodes.push({
      bx: Math.cos(a) * 95,
      by: Math.sin(a) * 95,
      bz: Math.sin(a + 0.8) * 48,
      r: 8,
      phase: (i / 6) * Math.PI * 2,
      edges: [0],
    });
  }
  // Inner ring loop bonds
  for (let i = 1; i <= 6; i++) {
    nodes[i].edges.push(i < 6 ? i + 1 : 1);
  }
  nodes[0].edges = [1, 2, 3, 4, 5, 6];

  // Middle ring (8 nodes)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const connInner = (Math.round((i / 8) * 6) % 6) + 1;
    nodes.push({
      bx: Math.cos(a) * 150,
      by: Math.sin(a) * 150,
      bz: Math.cos(a * 2.1) * 55,
      r: 6,
      phase: (i / 8) * Math.PI * 2 + 0.4,
      edges: [connInner],
    });
  }

  // Outer ring (10 nodes)
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const midIdx = 7 + (Math.round((i / 10) * 8) % 8); // connects to middle ring
    nodes.push({
      bx: Math.cos(a) * 210,
      by: Math.sin(a) * 210,
      bz: Math.cos(a * 1.7) * 70,
      r: 4,
      phase: (i / 10) * Math.PI * 2 + 0.9,
      edges: [midIdx],
    });
  }

  return nodes;
}

const NODES = buildMolecule();

// Pre-compute deduplicated edge pairs once at module level
const EDGES: [number, number][] = (() => {
  const seen = new Set<string>();
  const pairs: [number, number][] = [];
  NODES.forEach((node, i) => {
    node.edges.forEach((j) => {
      const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push([i, j]);
      }
    });
  });
  return pairs;
})();

export function MoleculeVisualizer({ isThinking, isSpeaking, isListening }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef({ ry: 0, rx: 0.42, pulse: 0, speed: 0.008, ring: 0 });
  const stateRef = useRef({ isThinking, isSpeaking, isListening });
  const rafRef = useRef<number>(0);

  // Keep stateRef in sync — the draw loop reads this without triggering re-renders
  useEffect(() => {
    stateRef.current = { isThinking, isSpeaking, isListening };
  }, [isThinking, isSpeaking, isListening]);

  // Smooth rotation speed transitions
  useEffect(() => {
    gsap.to(animRef.current, {
      speed: isThinking ? 0.022 : isSpeaking ? 0.016 : isListening ? 0.013 : 0.008,
      duration: 0.9,
      ease: 'power2.out',
    });
  }, [isThinking, isSpeaking, isListening]);

  // Canvas setup — runs once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const anim = animRef.current;

    // GSAP drives oscillating values
    const tiltTween = gsap.to(anim, {
      rx: 0.72,
      duration: 9,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    const pulseTween = gsap.to(anim, {
      pulse: 1,
      duration: 1.7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    const ringTween = gsap.to(anim, {
      ring: 1,
      duration: 1.25,
      repeat: -1,
      ease: 'none',
    });

    // Keep canvas pixels matching its CSS size
    const resize = () => {
      const p = canvas.parentElement;
      if (p) {
        canvas.width = p.clientWidth || 400;
        canvas.height = p.clientHeight || 500;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const project = (x: number, y: number, z: number, cx: number, cy: number) => {
      const fov = 500;
      const s = fov / (fov + z);
      return { px: cx + x * s, py: cy + y * s, s };
    };

    const rgba = ([r, g, b]: [number, number, number], a: number) =>
      `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      if (!W || !H) { rafRef.current = requestAnimationFrame(draw); return; }

      // Advance rotation each frame
      anim.ry += anim.speed;

      ctx.clearRect(0, 0, W, H);

      // ── Background ────────────────────────────────────────────────────────
      const bg = ctx.createRadialGradient(W / 2, H * 0.44, 0, W / 2, H * 0.44, Math.max(W, H));
      bg.addColorStop(0, '#0f0f22');
      bg.addColorStop(1, '#030308');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Subtle dot grid
      const gs = 30;
      ctx.fillStyle = 'rgba(99,102,241,0.055)';
      for (let gx = gs / 2; gx < W; gx += gs) {
        for (let gy = gs / 2; gy < H; gy += gs) {
          ctx.beginPath();
          ctx.arc(gx, gy, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const cx = W / 2;
      const cy = H * 0.44;

      const { isThinking: thinking, isSpeaking: speaking, isListening: listening } = stateRef.current;

      // State colour palettes
      let pc: [number, number, number];
      let sc: [number, number, number];
      let baseAlpha: number;

      if (thinking) {
        pc = [168, 85, 247]; sc = [99, 102, 241]; baseAlpha = 0.82;
      } else if (speaking) {
        pc = [52, 211, 153]; sc = [34, 211, 238]; baseAlpha = 0.88;
      } else if (listening) {
        pc = [96, 165, 250]; sc = [129, 140, 248]; baseAlpha = 0.72;
      } else {
        pc = [99, 102, 241]; sc = [139, 92, 246]; baseAlpha = 0.38;
      }

      // ── Speaking: expanding energy rings ─────────────────────────────────
      if (speaking) {
        for (let r = 0; r < 3; r++) {
          const prog = ((anim.ring + r / 3) % 1);
          const rr = prog * Math.min(W, H) * 0.5;
          ctx.strokeStyle = rgba(pc, (1 - prog) * 0.22);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ── Thinking: spinning dashed arc ─────────────────────────────────────
      if (thinking) {
        const sa = anim.ry * 3.5;
        ctx.strokeStyle = rgba(pc, 0.28);
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 13]);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(W, H) * 0.44, sa, sa + Math.PI * 1.35);
        ctx.stroke();
        ctx.setLineDash([]);

        // Inner reverse arc
        ctx.strokeStyle = rgba(sc, 0.18);
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 18]);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(W, H) * 0.38, -sa * 0.7, -sa * 0.7 + Math.PI * 0.9);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Project all nodes ────────────────────────────────────────────────
      const proj = NODES.map((node) => {
        const fy = Math.sin(anim.ry * 1.6 + node.phase) * 7;

        // Y-axis rotation
        const x1 = node.bx * Math.cos(anim.ry) - node.bz * Math.sin(anim.ry);
        const z1 = node.bx * Math.sin(anim.ry) + node.bz * Math.cos(anim.ry);

        // X-axis rotation (tilt)
        const y2 = (node.by + fy) * Math.cos(anim.rx) - z1 * Math.sin(anim.rx);
        const z2 = (node.by + fy) * Math.sin(anim.rx) + z1 * Math.cos(anim.rx);

        return project(x1, y2, z2, cx, cy);
      });

      // ── Draw bonds ──────────────────────────────────────────────────────
      EDGES.forEach(([i, j]) => {
        const a = proj[i];
        const b = proj[j];
        const avgS = (a.s + b.s) / 2;
        const ea = avgS * baseAlpha * 0.62;
        const grad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
        grad.addColorStop(0, rgba(pc, ea));
        grad.addColorStop(1, rgba(sc, ea * 0.45));
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(0.5, avgS * 1.9);
        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.stroke();
      });

      // ── Draw atoms (back-to-front by perceived depth) ────────────────────
      const order = NODES.map((_, i) => i).sort((a, b) => proj[a].s - proj[b].s);

      order.forEach((i) => {
        const { px, py, s } = proj[i];
        const node = NODES[i];
        const pr = node.r * s * (1 + anim.pulse * 0.22);

        // Outer glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, pr * 4.8);
        glow.addColorStop(0, rgba(pc, s * baseAlpha * 0.55));
        glow.addColorStop(0.4, rgba(pc, s * baseAlpha * 0.12));
        glow.addColorStop(1, rgba(pc, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, pr * 4.8, 0, Math.PI * 2);
        ctx.fill();

        // Sphere with highlight
        const sphere = ctx.createRadialGradient(
          px - pr * 0.35, py - pr * 0.38, pr * 0.05,
          px, py, pr,
        );
        sphere.addColorStop(0, `rgba(255,255,255,${s * 0.92})`);
        sphere.addColorStop(0.18, rgba(pc, s));
        sphere.addColorStop(1, rgba(sc, s * 0.72));
        ctx.fillStyle = sphere;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();

        // Rim light
        ctx.strokeStyle = rgba(pc, s * 0.55);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // ── Scan line ───────────────────────────────────────────────────────
      const scanProg = ((anim.ry * 0.38) % (Math.PI * 2)) / (Math.PI * 2);
      const scanY = H * 0.04 + scanProg * H * 0.88;
      const scanG = ctx.createLinearGradient(0, scanY - 3, 0, scanY + 3);
      scanG.addColorStop(0, 'transparent');
      scanG.addColorStop(0.5, rgba(pc, 0.07));
      scanG.addColorStop(1, 'transparent');
      ctx.fillStyle = scanG;
      ctx.fillRect(0, scanY - 3, W, 6);

      // ── Corner data readout ─────────────────────────────────────────────
      ctx.font = `bold 8px monospace`;
      ctx.fillStyle = rgba(pc, 0.35);
      ctx.textAlign = 'left';
      ctx.fillText(`SYN:${Math.round(anim.ry * 100) % 1000}`, 10, H - 24);
      ctx.fillText(`NLU:ACTIVE`, 10, H - 14);
      ctx.textAlign = 'right';
      ctx.fillText(`NODE:${NODES.length}`, W - 10, H - 24);
      ctx.fillText(`BOND:${EDGES.length}`, W - 10, H - 14);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      [tiltTween, pulseTween, ringTween].forEach((t) => t.kill());
      ro.disconnect();
    };
  }, []); // intentionally empty — state changes are read via stateRef

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}

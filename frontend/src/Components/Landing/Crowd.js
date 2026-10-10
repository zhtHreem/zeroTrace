import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const COLS = 24;
const ROWS = 15;
const N = COLS * ROWS;
const SHARES = [0.42, 0.28, 0.18, 0.12];
const LABELS = ['A', 'B', 'C', 'D'];
const COLORS = ['#121211', '#d9331f', '#8a867a', '#c4bfb0'];
const INK = [18, 18, 17];

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);

// deterministic pseudo-random so the layout is stable between renders
const rand = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function useCrowdCanvas(canvasRef, progress) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, raf, smooth = progress.current;
    let start = [], target = [];

    // assign each dot an answer, shuffled so the grid looks random at first
    const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => rand(a) - rand(b));
    const cat = new Array(N);
    let k = 0;
    SHARES.forEach((s, c) => { const cnt = c === 3 ? N - k : Math.round(s * N); for (let j = 0; j < cnt; j++) cat[order[k++]] = c; });

    const layout = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      const padX = w * 0.1, padTop = h * 0.12, padBot = h * 0.16;
      const gx = (w - padX * 2) / (COLS - 1);
      const gy = (h - padTop - padBot) / (ROWS - 1);
      start = []; for (let i = 0; i < N; i++) start.push([padX + (i % COLS) * gx, padTop + Math.floor(i / COLS) * gy]);

      // bars: 4 columns, each 6 dots wide
      const perRow = 6;
      const barW = (w - padX * 2) / 4;
      const sp = Math.min((barW * 0.78) / (perRow - 1), (h - padTop - padBot) / 16);
      const counts = [0, 0, 0, 0];
      target = new Array(N);
      for (let i = 0; i < N; i++) {
        const c = cat[i];
        const idx = counts[c]++;
        const col = idx % perRow, row = Math.floor(idx / perRow);
        const x0 = padX + c * barW + (barW - sp * (perRow - 1)) / 2;
        target[i] = [x0 + col * sp, h - padBot - row * sp];
      }
    };

    const drawLock = (cx, cy, size, open, alpha) => {
      const bw = size * 1.3, bh = size, r = 8;
      const top = cy - bh / 2;
      ctx.save();
      ctx.globalAlpha = alpha;
      // shackle lifts and swings open
      const lift = open * size * 0.42;
      ctx.strokeStyle = '#121211';
      ctx.lineWidth = Math.max(5, size * 0.12);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - bw * 0.27, top - lift + size * 0.04);
      ctx.lineTo(cx - bw * 0.27, top - size * 0.32 - lift);
      ctx.arc(cx, top - size * 0.32 - lift, bw * 0.27, Math.PI, 0);
      ctx.lineTo(cx + bw * 0.27, top - (open > 0.5 ? size * 0.12 : 0) - lift * (open > 0.5 ? 0.3 : 1) + size * 0.04);
      ctx.stroke();
      // body
      ctx.fillStyle = '#fbf9f3';
      ctx.strokeStyle = '#121211';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, top, bw, bh, r);
      ctx.fill(); ctx.stroke();
      // keyhole
      ctx.fillStyle = open > 0.5 ? '#8a867a' : '#d9331f';
      ctx.beginPath(); ctx.arc(cx, cy - bh * 0.06, size * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - size * 0.035, cy - bh * 0.06, size * 0.07, size * 0.26);
      ctx.restore();
    };

    const draw = () => {
      smooth += (progress.current - smooth) * 0.12;
      const p = smooth;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const padX = w * 0.1;
      const scanT = clamp(p / 0.22);                       // 1. verification sweep
      const scanX = padX - 10 + scanT * (w - padX * 2 + 20);
      const lockIn = clamp((p - 0.26) / 0.1);              // 2. lock appears + closes
      const lockOut = clamp((p - 0.66) / 0.06);            // 3. lock opens, then fades
      const open = clamp((p - 0.54) / 0.1);
      const sealed = clamp((p - 0.26) / 0.1) * (1 - clamp((p - 0.54) / 0.1));
      const colorT = clamp((p - 0.58) / 0.08);             // answers revealed only after unlock
      const moveBase = (p - 0.7) / 0.2;                    // dots fly into bars
      const rad = Math.max(2.2, Math.min(4.2, w / 150));

      for (let i = 0; i < N; i++) {
        const t = ease(clamp(moveBase * 1.5 - (i / N) * 0.5));
        const x = start[i][0] + (target[i][0] - start[i][0]) * t;
        const y = start[i][1] + (target[i][1] - start[i][1]) * t;
        const c = hex(COLORS[cat[i]]);
        const r = INK[0] + (c[0] - INK[0]) * colorT, g = INK[1] + (c[1] - INK[1]) * colorT, b = INK[2] + (c[2] - INK[2]) * colorT;
        ctx.globalAlpha = 1 - sealed * 0.78;
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();

        // verified ring on dots the scan line has passed
        if (p < 0.5 && start[i][0] < scanX && t === 0) {
          const age = clamp((scanX - start[i][0]) / 90);
          ctx.globalAlpha = (1 - clamp((p - 0.26) / 0.1)) * (0.2 + 0.8 * (1 - age * 0.5));
          ctx.strokeStyle = '#d9331f';
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(x, y, rad + 3.2, 0, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // scan line
      if (scanT > 0 && scanT < 1) {
        ctx.strokeStyle = '#d9331f';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(scanX, h * 0.08); ctx.lineTo(scanX, h * 0.9); ctx.stroke();
      }

      // padlock
      const lockAlpha = lockIn * (1 - lockOut);
      if (lockAlpha > 0.01) {
        const size = Math.min(w, h) * 0.2;
        const cx = w / 2, cy = h * 0.46;
        const drop = (1 - lockIn) * 24;
        drawLock(cx, cy - drop, size, open, lockAlpha);
        ctx.globalAlpha = lockAlpha;
        ctx.fillStyle = open > 0.5 ? '#8a867a' : '#d9331f';
        ctx.font = '600 12px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(open > 0.5 ? 'UNLOCKED' : 'SEALED · ENCRYPTED', cx, cy + size * 0.5 + 34 - drop);
        ctx.globalAlpha = 1;
      }

      // chart labels fade in once dots have settled
      const la = clamp((p - 0.88) / 0.08);
      if (la > 0) {
        ctx.globalAlpha = la;
        ctx.fillStyle = '#121211';
        ctx.font = '500 12px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        const barW = (w - padX * 2) / 4;
        SHARES.forEach((s, c) => {
          const cx = padX + c * barW + barW / 2;
          ctx.fillText(`${LABELS[c]} · ${Math.round(s * 100)}%`, cx, h - h * 0.16 + 26);
        });
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [canvasRef, progress]);
}

const CAPS = [
  { n: '01 / 03', t: 'Verified, but nameless.', d: 'Every respondent proves they’re a real, unique person with a zero-knowledge proof. The proof is checked; who they are never is.' },
  { n: '02 / 03', t: 'Answers are sealed.', d: 'Each response is encrypted before it’s stored and locked until the time you set. Not even you can read it early.' },
  { n: '03 / 03', t: 'The lock opens. The crowd speaks.', d: 'When the time passes, results open as a whole. You see the pattern, never the person behind a single answer.' },
];

export default function Crowd() {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const progress = useRef(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => { progress.current = v; });
  useCrowdCanvas(canvasRef, progress);

  const o0 = useTransform(scrollYProgress, [0, 0.2, 0.26], [1, 1, 0]);
  const o1 = useTransform(scrollYProgress, [0.24, 0.3, 0.52, 0.58], [0, 1, 1, 0]);
  const o2 = useTransform(scrollYProgress, [0.58, 0.68, 1], [0, 1, 1]);
  const ops = [o0, o1, o2];

  return (
    <section className="zt-crowd" id="how" ref={ref}>
      <div className="zt-wrap zt-crowd-stick">
        <div>
          <div className="zt-mono" style={{ marginBottom: 6 }}>How it works</div>
          <div className="zt-caps">
            {CAPS.map((c, i) => (
              <motion.div className="zt-cap" key={c.n} style={{ opacity: ops[i] }}>
                <span className="zt-cap-n">{c.n}</span>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="zt-canvas-box">
          <span className="zt-mono zt-canvas-tag">360 responses · illustrative</span>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </section>
  );
}

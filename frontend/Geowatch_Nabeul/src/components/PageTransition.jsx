import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition() {
  const { pathname } = useLocation();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx    = canvas.getContext("2d");
    const W      = window.innerWidth;
    const H      = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    // Color palette matching your theme
    const COLORS = [
      "rgba(217,119,6,",    // primary amber
      "rgba(194,65,12,",    // terracotta
      "rgba(101,163,13,",   // sage green
      "rgba(8,145,178,",    // water blue
      "rgba(251,191,36,",   // golden yellow
      "rgba(220,38,38,",    // built-up red
    ];

    // ── Particles ──────────────────────────────────────────
    const particles = Array.from({ length: 90 }, (_, i) => ({
      x:      Math.random() * W,
      y:      Math.random() * H,
      r:      Math.random() * 4 + 1.5,
      vx:     (Math.random() - 0.5) * 3.5,
      vy:     (Math.random() - 0.5) * 3.5,
      color:  COLORS[Math.floor(Math.random() * COLORS.length)],
      life:   1,
      decay:  Math.random() * 0.018 + 0.012,
      delay:  Math.random() * 0.4,         // stagger start
    }));

    // ── Ripples from center ────────────────────────────────
    const ripples = Array.from({ length: 5 }, (_, i) => ({
      x:     W / 2,
      y:     H / 2,
      r:     0,
      maxR:  Math.max(W, H) * (0.55 + i * 0.12),
      speed: 18 + i * 8,
      color: COLORS[i % COLORS.length],
      life:  1,
      delay: i * 0.08,
      born:  false,
    }));

    // ── Burst lines from center ────────────────────────────
    const lines = Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      return {
        angle,
        length: 0,
        maxLen: Math.random() * 180 + 80,
        speed:  Math.random() * 14 + 8,
        color:  COLORS[i % COLORS.length],
        life:   1,
        decay:  0.022 + Math.random() * 0.01,
        width:  Math.random() * 1.5 + 0.5,
      };
    });

    let start = null;

    const draw = (ts) => {
      if (!start) start = ts;
      const elapsed = (ts - start) / 1000; // seconds

      ctx.clearRect(0, 0, W, H);

      // ── Draw ripples ──
      ripples.forEach((rip) => {
        if (elapsed < rip.delay) return;
        if (!rip.born) { rip.born = true; }
        rip.r     += rip.speed;
        rip.life  -= 0.012;
        if (rip.life <= 0 || rip.r > rip.maxR) return;

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = `${rip.color}${(rip.life * 0.35).toFixed(2)})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      // ── Draw burst lines ──
      lines.forEach((ln) => {
        ln.length += ln.speed;
        ln.life   -= ln.decay;
        if (ln.life <= 0) return;

        const ox = W / 2;
        const oy = H / 2;
        const ex = ox + Math.cos(ln.angle) * Math.min(ln.length, ln.maxLen);
        const ey = oy + Math.sin(ln.angle) * Math.min(ln.length, ln.maxLen);

        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `${ln.color}${(ln.life * 0.55).toFixed(2)})`;
        ctx.lineWidth   = ln.width;
        ctx.stroke();
      });

      // ── Draw particles ──
      particles.forEach((p) => {
        if (elapsed < p.delay) return;
        p.x    += p.vx;
        p.y    += p.vy;
        p.vy   += 0.06;          // gentle gravity
        p.life -= p.decay;
        if (p.life <= 0) return;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${(p.life * 0.8).toFixed(2)})`;
        ctx.fill();

        // trail
        ctx.beginPath();
        ctx.arc(p.x - p.vx * 2, p.y - p.vy * 2, p.r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${(p.life * 0.25).toFixed(2)})`;
        ctx.fill();
      });

      // Stop when everything has faded
      const allDead =
        particles.every((p) => p.life <= 0) &&
        ripples.every((r)   => r.life  <= 0 || r.r >= r.maxR) &&
        lines.every((l)     => l.life  <= 0);

      if (!allDead) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        // Hide canvas after animation
        if (canvas) canvas.style.opacity = "0";
      }
    };

    canvas.style.opacity = "1";
    animRef.current = requestAnimationFrame(draw);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [pathname]);   // re-fires on every route change

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100vw",
        height:        "100vh",
        pointerEvents: "none",       // never blocks clicks
        zIndex:        9999,
        transition:    "opacity 0.4s ease",
      }}
    />
  );
}
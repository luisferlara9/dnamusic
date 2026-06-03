import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ──────────────────────────────────────────────────────────
// DNA Music — Preloader Global
// Animación SVG inspirada en el logo (onda sónica + anillos)
// ──────────────────────────────────────────────────────────

export default function Preloader({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'revealing' | 'done'>('loading');

  // Simular progreso de carga
  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const duration = 2400; // ms

    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - pct, 3);
      setProgress(Math.round(eased * 100));

      if (pct < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setPhase('revealing');
        setTimeout(() => {
          setPhase('done');
          setTimeout(onFinish, 600);
        }, 800);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onFinish]);

  // Wave path points del logo
  const wavePath = "M 15,50 L 22,20 L 30,70 L 38,15 L 46,75 L 54,25 L 62,68 L 70,18 L 78,72 L 85,50";

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at center, #12101f 0%, #0a0a14 60%, #050510 100%)' }}
        >
          {/* Partículas flotantes de fondo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 2 + Math.random() * 3,
                  height: 2 + Math.random() * 3,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `rgba(${139 + Math.random() * 50}, 92, 246, ${0.1 + Math.random() * 0.3})`,
                }}
                animate={{
                  y: [0, -40 - Math.random() * 60, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Anillos de ondas expansivas de fondo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`ring-bg-${i}`}
                className="absolute rounded-full border border-purple-500/5"
                animate={{
                  width: [100, 600],
                  height: [100, 600],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* ── Contenido central ── */}
          <div className="relative flex flex-col items-center gap-8">

            {/* Logo SVG animado */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
              className="relative"
            >
              {/* Glow pulsante detrás del logo */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              <svg
                width="160"
                height="160"
                viewBox="0 0 100 100"
                className="relative z-10"
              >
                {/* Anillos concéntricos animados */}
                {[42, 38, 34, 30].map((r, i) => (
                  <motion.circle
                    key={`ring-${i}`}
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    strokeWidth={1.2}
                    stroke="url(#ringGradient)"
                    initial={{ pathLength: 0, opacity: 0, rotate: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: [0, 0.6, 0.4],
                      rotate: i % 2 === 0 ? 360 : -360,
                    }}
                    transition={{
                      pathLength: { duration: 1.2, delay: i * 0.15, ease: 'easeOut' },
                      opacity: { duration: 1.2, delay: i * 0.15 },
                      rotate: { duration: 8 + i * 2, repeat: Infinity, ease: 'linear' },
                    }}
                    style={{ transformOrigin: '50px 50px' }}
                  />
                ))}

                {/* Círculo central con gradiente */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="24"
                  fill="url(#centerGradient)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4, type: 'spring' }}
                  style={{ transformOrigin: '50px 50px' }}
                />

                {/* Onda sónica (zigzag del logo) */}
                <motion.path
                  d={wavePath}
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
                />

                {/* Onda sónica brillo */}
                <motion.path
                  d={wavePath}
                  fill="none"
                  stroke="url(#waveGlow)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#blur)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 0.6, 0.3] }}
                  transition={{ duration: 1.4, delay: 0.8, ease: 'easeOut' }}
                />

                {/* Definiciones de gradientes */}
                <defs>
                  <radialGradient id="centerGradient" cx="40%" cy="30%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </radialGradient>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="waveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                  <filter id="blur">
                    <feGaussianBlur stdDeviation="2" />
                  </filter>
                </defs>
              </svg>
            </motion.div>

            {/* Texto DNA MUSIC con letras animadas */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="flex items-center gap-1">
                {'DNAMUSIC'.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 1.0 + i * 0.08,
                      type: 'spring',
                      bounce: 0.3,
                    }}
                    className="text-2xl font-black tracking-[0.2em]"
                    style={{
                      background: i < 3
                        ? 'linear-gradient(135deg, #a855f7, #c084fc)'
                        : 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {char === 'M' ? <>&nbsp;M</> : char}
                  </motion.span>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-medium"
              >
                Academy Management System
              </motion.p>
            </div>

            {/* Ecualizador musical animado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-end justify-center gap-[3px] h-6"
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{
                    background: `linear-gradient(to top, #6366f1, #a855f7, #c084fc)`,
                  }}
                  animate={{
                    height: [
                      `${4 + Math.random() * 4}px`,
                      `${12 + Math.random() * 14}px`,
                      `${4 + Math.random() * 4}px`,
                    ],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.4,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: i * 0.05,
                  }}
                />
              ))}
            </motion.div>

            {/* Barra de progreso */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 200 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="relative"
            >
              <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #6366f1, #a855f7, #c084fc)',
                    width: `${progress}%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-between mt-2"
              >
                <span className="text-[9px] text-slate-600 font-mono">
                  {phase === 'revealing' ? 'Iniciando...' : 'Cargando sistema'}
                </span>
                <span className="text-[9px] text-purple-400/60 font-mono font-bold">
                  {progress}%
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

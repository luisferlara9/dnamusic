import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Music2, Mail, Phone, MapPin, Calendar,
  Clock, User, Hash, Edit2, Activity,
  CheckCircle, AlertCircle, XCircle, RotateCcw
} from 'lucide-react';
import type { Estudiante } from '../pages/Estudiantes';

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function fmt(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function diffDays(from: string, to?: string) {
  const a = new Date(from);
  const b = to ? new Date(to) : new Date();
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

// ──────────────────────────────────────────────────────────
// Mini subcomponents
// ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-brand-400">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
        <div className="text-sm text-slate-200 font-medium">{value}</div>
      </div>
    </div>
  );
}

interface TimelineEventProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  date?: string | null;
  desc?: string;
  isLast?: boolean;
}
function TimelineEvent({ icon, color, title, date, desc, isLast }: TimelineEventProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${color}`}>
          {icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-white/10 my-1" />}
      </div>
      <div className="pb-5 flex-1">
        <p className="text-sm font-bold text-white">{title}</p>
        {date && <p className="text-xs text-slate-400 mt-0.5">{date}</p>}
        {desc && <p className="text-xs text-slate-500 mt-1 italic">{desc}</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────
interface EstudiantePerfilProps {
  estudiante: Estudiante;
  onClose: () => void;
  onEdit: () => void;
}

export default function EstudiantePerfil({ estudiante: e, onClose, onEdit }: EstudiantePerfilProps) {
  const ESTADO_CONFIG = {
    ACTIVO:   { label: 'Activo', cls: 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10', dot: 'bg-neon-cyan animate-pulse' },
    INACTIVO: { label: 'Inactivo', cls: 'border-brand-500/50 text-brand-400 bg-brand-500/10', dot: 'bg-brand-400' },
    RETIRADO: { label: 'Retirado', cls: 'border-pink-500/50 text-pink-400 bg-pink-500/10', dot: 'bg-pink-500' },
  };
  const estadoCfg = ESTADO_CONFIG[e.estado];

  // Build timeline
  const timeline: TimelineEventProps[] = [];

  timeline.push({
    icon: <CheckCircle size={14} className="text-neon-cyan" />,
    color: 'border-neon-cyan/30 bg-neon-cyan/5',
    title: 'Inscripción en DNA Music',
    date: fmt(e.fechaInscripcion),
    desc: `Programa: ${e.programa}`,
  });

  if (e.fechaInactividad) {
    timeline.push({
      icon: <AlertCircle size={14} className="text-brand-400" />,
      color: 'border-brand-500/30 bg-brand-500/5',
      title: 'Marcado como Inactivo',
      date: fmt(e.fechaInactividad),
      desc: `Duración: ${diffDays(e.fechaInactividad, e.fechaReintegro ?? undefined)} días`,
    });
  }

  if (e.fechaRetiro) {
    timeline.push({
      icon: <XCircle size={14} className="text-pink-400" />,
      color: 'border-pink-500/30 bg-pink-500/5',
      title: 'Retirado del programa',
      date: fmt(e.fechaRetiro),
    });
  }

  if (e.fechaReintegro) {
    timeline.push({
      icon: <RotateCcw size={14} className="text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-500/5',
      title: 'Reintegrado al sistema',
      date: fmt(e.fechaReintegro),
      desc: 'El estudiante fue reactivado',
    });
  }

  // Mark last
  timeline[timeline.length - 1].isLast = true;

  const daysActive = diffDays(e.fechaInscripcion);

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
      />

      {/* Panel */}
      <motion.div
        key="panel"
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0d0d1a] border-l border-white/10 z-[70] overflow-y-auto"
      >
        {/* ── Top gradient bar ── */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-neon-purple to-neon-cyan" />

        {/* ── Header con foto ── */}
        <div className="relative px-6 pt-6 pb-8 overflow-hidden">
          {/* Fondo decorativo */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 to-transparent pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Botón cerrar */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all z-20 cursor-pointer"
          >
            <X size={20} />
          </motion.button>

          {/* Foto/Iniciales */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="relative">
              {e.fotoPerfil ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                  className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-brand-500/40 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                >
                  <img src={`http://localhost:3000${e.fotoPerfil}`} alt={e.nombreCompleto} className="w-full h-full object-cover" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-600 to-neon-purple border-2 border-brand-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                >
                  <span className="text-3xl font-black text-white">
                    {e.nombreCompleto.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                  </span>
                </motion.div>
              )}
              {/* Badge de estado */}
              <span className={`absolute -bottom-2 -right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${estadoCfg.cls} shadow-lg`}>
                <span className={`w-1.5 h-1.5 rounded-full ${estadoCfg.dot}`} />
                {estadoCfg.label}
              </span>
            </div>

            {/* Nombre y badge */}
            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-black text-white leading-tight"
              >
                {e.nombreCompleto}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-xs text-neon-purple font-mono mt-1 tracking-widest"
              >
                ID · {e.documentoIdentidad}
              </motion.p>
            </div>

            {/* Stats rápidas */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 mt-1"
            >
              <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/8">
                <p className="text-lg font-black text-brand-300">{daysActive}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">días activo</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/8">
                <p className="text-lg font-black text-neon-purple">{timeline.length}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">eventos</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/8">
                <p className="text-sm font-black text-neon-cyan">🎵</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">música</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Secciones ── */}
        <div className="px-6 pb-8 space-y-6">

          {/* Información Personal */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <User size={12} className="text-brand-400" />
              <h3 className="text-[10px] font-black text-brand-400/80 uppercase tracking-[0.15em]">Información Personal</h3>
            </div>
            <div className="bg-white/3 rounded-2xl border border-white/8 px-4 divide-y divide-white/5">
              <InfoRow icon={<Mail size={14} />} label="Correo Electrónico" value={
                <a href={`mailto:${e.email}`} className="text-brand-300 hover:text-white transition-colors truncate block">{e.email}</a>
              } />
              <InfoRow icon={<Phone size={14} />} label="Teléfono / WhatsApp" value={
                <a href={`https://wa.me/${e.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-white transition-colors">
                  {e.telefono}
                </a>
              } />
              <InfoRow icon={<Hash size={14} />} label="Documento de Identidad" value={
                <span className="font-mono text-slate-200">{e.documentoIdentidad}</span>
              } />
            </div>
          </motion.section>

          {/* Información Académica */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Music2 size={12} className="text-neon-purple" />
              <h3 className="text-[10px] font-black text-neon-purple/80 uppercase tracking-[0.15em]">Información Académica</h3>
            </div>
            <div className="bg-white/3 rounded-2xl border border-white/8 px-4 divide-y divide-white/5">
              <InfoRow icon={<Music2 size={14} />} label="Programa Musical" value={e.programa} />
              <InfoRow icon={<MapPin size={14} />} label="Sede" value={
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neon-purple" />
                  {e.sede?.nombre || 'Sin asignar'}
                  {e.sede?.ciudad && <span className="text-slate-500">· {e.sede.ciudad}</span>}
                </span>
              } />
              <InfoRow icon={<Calendar size={14} />} label="Fecha de Inscripción" value={
                <span className="text-neon-cyan">{fmt(e.fechaInscripcion)}</span>
              } />
              <InfoRow icon={<Activity size={14} />} label="Estado Actual" value={
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${estadoCfg.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${estadoCfg.dot}`} />
                  {estadoCfg.label}
                </span>
              } />
            </div>
          </motion.section>

          {/* Historial de Estados */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock size={12} className="text-neon-cyan" />
              <h3 className="text-[10px] font-black text-neon-cyan/80 uppercase tracking-[0.15em]">Historial de Estados</h3>
            </div>
            <div className="pl-1">
              {timeline.map((ev, i) => (
                <TimelineEvent key={i} {...ev} />
              ))}
            </div>
          </motion.section>

          {/* Fechas adicionales si existen */}
          {(e.fechaInactividad || e.fechaRetiro || e.fechaReintegro) && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={12} className="text-slate-400" />
                <h3 className="text-[10px] font-black text-slate-400/80 uppercase tracking-[0.15em]">Fechas de Registro</h3>
              </div>
              <div className="bg-white/3 rounded-2xl border border-white/8 px-4 divide-y divide-white/5">
                {e.fechaInactividad && (
                  <InfoRow icon={<AlertCircle size={14} className="text-brand-400" />} label="Fecha de Inactividad" value={
                    <span className="text-brand-400">{fmt(e.fechaInactividad)}</span>
                  } />
                )}
                {e.fechaRetiro && (
                  <InfoRow icon={<XCircle size={14} className="text-pink-400" />} label="Fecha de Retiro" value={
                    <span className="text-pink-400">{fmt(e.fechaRetiro)}</span>
                  } />
                )}
                {e.fechaReintegro && (
                  <InfoRow icon={<RotateCcw size={14} className="text-emerald-400" />} label="Fecha de Reintegro" value={
                    <span className="text-emerald-400">{fmt(e.fechaReintegro)}</span>
                  } />
                )}
              </div>
            </motion.section>
          )}

          {/* Acción de editar */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-brand-600 to-neon-purple shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
          >
            <Edit2 size={16} /> Editar Perfil
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

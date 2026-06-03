import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MapPin, Calendar, User, Shield, Edit2, Clock } from 'lucide-react';
import type { Operador } from './OperadorForm';

interface OperadorPerfilProps {
  operador: Operador;
  onClose: () => void;
  onEdit: () => void;
}

function fmt(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

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

export default function OperadorPerfil({ operador: op, onClose, onEdit }: OperadorPerfilProps) {
  const ROLE_STYLE = {
    ADMIN: 'border-neon-purple/50 text-neon-purple bg-neon-purple/10 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    OPERADOR: 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
  };

  const ROLE_DOT = {
    ADMIN: 'bg-neon-purple',
    OPERADOR: 'bg-neon-cyan animate-pulse',
  };

  const initials = op.nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const charCodeSum = op.nombre.charCodeAt(0) + (op.nombre.charCodeAt(1) || 0);
  const gradients = [
    'from-brand-600/80 to-neon-purple/60',
    'from-neon-cyan/80 to-brand-600/60',
    'from-indigo-600/80 to-purple-600/60',
    'from-purple-600/80 to-pink-600/60',
  ];
  const gradient = gradients[charCodeSum % gradients.length];

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
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-neon-purple to-neon-cyan" />

        {/* Header section */}
        <div className="relative px-6 pt-6 pb-8 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 to-transparent pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all z-20 cursor-pointer"
          >
            <X size={20} />
          </motion.button>

          {/* Avatar and name */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring' }}
                className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${gradient} border-2 border-brand-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]`}
              >
                <span className="text-3xl font-black text-white">{initials}</span>
              </motion.div>
              {/* Role badge */}
              <span className={`absolute -bottom-2 -right-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border ${ROLE_STYLE[op.rol]} shadow-lg`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ROLE_DOT[op.rol]}`} />
                {op.rol}
              </span>
            </div>

            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-black text-white leading-tight"
              >
                {op.nombre}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-xs text-neon-purple font-mono mt-1 tracking-widest"
              >
                OPERADOR ID · {op.id}
              </motion.p>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="px-6 pb-8 space-y-6">
          {/* User info */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <User size={12} className="text-brand-400" />
              <h3 className="text-[10px] font-black text-brand-400/80 uppercase tracking-[0.15em]">Datos del Operador</h3>
            </div>
            <div className="bg-white/3 rounded-2xl border border-white/8 px-4 divide-y divide-white/5">
              <InfoRow icon={<Mail size={14} />} label="Correo Electrónico" value={
                <a href={`mailto:${op.email}`} className="text-brand-300 hover:text-white transition-colors truncate block">{op.email}</a>
              } />
              <InfoRow icon={<Shield size={14} />} label="Nivel de Acceso / Rol" value={
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${ROLE_STYLE[op.rol]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ROLE_DOT[op.rol]}`} />
                  {op.rol}
                </span>
              } />
            </div>
          </motion.section>

          {/* Sede / Jurisdiction info */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={12} className="text-neon-purple" />
              <h3 className="text-[10px] font-black text-neon-purple/80 uppercase tracking-[0.15em]">Jurisdicción Asignada</h3>
            </div>
            <div className="bg-white/3 rounded-2xl border border-white/8 px-4 divide-y divide-white/5">
              {op.rol === 'ADMIN' ? (
                <InfoRow icon={<Shield size={14} />} label="Área de Gestión" value={
                  <span className="text-neon-purple font-semibold">Toda la red (Acceso Global)</span>
                } />
              ) : op.sede ? (
                <>
                  <InfoRow icon={<MapPin size={14} />} label="Sede a Cargo" value={
                    <span className="text-white font-medium">{op.sede.nombre}</span>
                  } />
                  <InfoRow icon={<MapPin size={14} />} label="Ciudad" value={
                    <span className="text-slate-300 font-medium">{op.sede.ciudad}</span>
                  } />
                </>
              ) : (
                <InfoRow icon={<MapPin size={14} />} label="Sede a Cargo" value={
                  <span className="text-pink-400 italic">Sede no asignada</span>
                } />
              )}
            </div>
          </motion.section>

          {/* Activity info */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock size={12} className="text-neon-cyan" />
              <h3 className="text-[10px] font-black text-neon-cyan/80 uppercase tracking-[0.15em]">Auditoría de Cuenta</h3>
            </div>
            <div className="bg-white/3 rounded-2xl border border-white/8 px-4 divide-y divide-white/5">
              {op.hasOwnProperty('createdAt') && (
                <InfoRow icon={<Calendar size={14} />} label="Fecha de Registro" value={
                  <span className="text-neon-cyan">{fmt((op as any).createdAt)}</span>
                } />
              )}
              {op.hasOwnProperty('updatedAt') && (
                <InfoRow icon={<Clock size={14} />} label="Última Actualización" value={
                  <span className="text-slate-300">{fmt((op as any).updatedAt)}</span>
                } />
              )}
            </div>
          </motion.section>

          {/* Edit button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-brand-600 to-neon-purple shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
          >
            <Edit2 size={16} /> Editar Operador
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

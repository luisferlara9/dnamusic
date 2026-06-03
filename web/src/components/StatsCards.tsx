import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, MapPin, Shield } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export interface StatsData {
  totalEstudiantes: number;
  estudiantesActivos: number;
  totalSedes: number;
  sedesActivas: number;
  totalOperadores: number;
  estudiantesPorSede: { sedeId: number; sedeNombre: string; ciudad: string; total: number }[];
  operadoresPorSede: { sedeId: number | null; sedeNombre: string; ciudad: string; total: number }[];
  estadosEstudiantes: { estado: string; total: number; color: string }[];
  estudiantesPorPrograma: { programa: string; total: number }[];
  sedeMasActivos: { sedeId: number; nombre: string; ciudad: string; totalActivos: number } | null;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'brand' | 'cyan' | 'purple' | 'pink';
  delay: number;
}

const colorMap = {
  brand: {
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/30',
    text: 'text-brand-400',
    label: 'text-brand-300/80',
    glow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]',
    line: 'via-brand-500',
  },
  cyan: {
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    text: 'text-neon-cyan',
    label: 'text-neon-cyan/80',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    line: 'via-neon-cyan',
  },
  purple: {
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/30',
    text: 'text-neon-purple',
    label: 'text-neon-purple/80',
    glow: 'shadow-[0_0_15px_rgba(192,38,211,0.2)]',
    line: 'via-neon-purple',
  },
  pink: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    label: 'text-pink-300/80',
    glow: 'shadow-[0_0_15px_rgba(236,72,153,0.2)]',
    line: 'via-pink-500',
  },
};

function StatCard({ icon, label, value, color, delay }: StatCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 relative overflow-hidden group"
    >
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${c.line} to-transparent translate-y-1 group-hover:translate-y-0 transition-transform`} />
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${c.bg} border ${c.border} ${c.text} flex items-center justify-center flex-shrink-0 ${c.glow}`}>
          {icon}
        </div>
        <div>
          <p className={`text-xs font-bold ${c.label} uppercase tracking-widest mb-1`}>{label}</p>
          <p className="text-3xl font-black text-white font-mono tracking-tighter">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.rol === 'ADMIN' || user?.rol === 'OPERADOR') {
      api.get('/stats')
        .then(r => { if (r.data.success) setStats(r.data.data); })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return { stats, loading, user };
}

export default function StatsCards() {
  const { stats, loading, user } = useStats();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card h-28 animate-pulse-glow bg-dark-surface/40 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (user?.rol === 'OPERADOR') {
    const assignedSedeName = stats?.estudiantesPorSede[0]?.sedeNombre || 'Mi Sede';
    const assignedSedeCity = stats?.estudiantesPorSede[0]?.ciudad || '';

    return (
      <div className="w-full space-y-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-neon-purple/10" />
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                <Shield className="text-brand-400" size={20} />
                Terminal de Operaciones — {assignedSedeName}
              </h2>
              <p className="text-slate-400 text-xs font-medium">
                Acceso exclusivo a la información de estudiantes y operaciones de tu sede ({assignedSedeCity}).
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300 font-mono self-start sm:self-center">
              ID Sede: {stats?.estudiantesPorSede[0]?.sedeId || 'N/A'}
            </div>
          </div>
        </motion.div>

        {/* 4 KPI cards for Operator Sede */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Users size={26} />} label="Mis Estudiantes" value={stats?.totalEstudiantes ?? 0} color="brand" delay={0.1} />
          <StatCard icon={<UserCheck size={26} />} label="Activos en Sede" value={stats?.estudiantesActivos ?? 0} color="cyan" delay={0.2} />
          <StatCard icon={<Shield size={26} />} label="Operadores en Sede" value={stats?.totalOperadores ?? 0} color="purple" delay={0.3} />
          <StatCard icon={<MapPin size={26} />} label="Sede Asignada" value={1} color="pink" delay={0.4} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard icon={<Users size={26} />} label="Total Estudiantes" value={stats?.totalEstudiantes ?? 0} color="brand" delay={0.1} />
      <StatCard icon={<UserCheck size={26} />} label="Activos en Sistema" value={stats?.estudiantesActivos ?? 0} color="cyan" delay={0.2} />
      <StatCard icon={<MapPin size={26} />} label="Sedes Activas" value={stats?.sedesActivas ?? 0} color="purple" delay={0.3} />
      <StatCard icon={<Shield size={26} />} label="Operadores" value={stats?.totalOperadores ?? 0} color="pink" delay={0.4} />
    </div>
  );
}

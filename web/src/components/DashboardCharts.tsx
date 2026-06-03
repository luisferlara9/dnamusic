import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useStats } from './StatsCards';
import { BarChart2, PieChart as PieIcon, Users } from 'lucide-react';

// ─────────── Tooltip personalizado con tema oscuro ───────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-surface/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        {label && <p className="text-xs text-slate-400 mb-1 uppercase tracking-widest">{label}</p>}
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-bold font-mono" style={{ color: entry.color || '#06b6d4' }}>
            {entry.name}: <span className="text-white">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─────────── Etiquetas personalizadas para el Pie ───────────
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─────────── Wrapper de tarjeta de gráfico ───────────
function ChartCard({ title, icon, children, delay = 0 }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

export default function DashboardCharts() {
  const { stats, loading, user } = useStats();

  if (user?.rol !== 'ADMIN' && user?.rol !== 'OPERADOR') return null;

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card h-80 animate-pulse-glow bg-dark-surface/40 rounded-2xl" />
        ))}
      </div>
    );
  }



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

      {/* ── Gráfico 1: Estudiantes por Sede (Barras) ── */}
      {user?.rol === 'ADMIN' && (
        <ChartCard title="Estudiantes por Sede" icon={<BarChart2 size={18} />} delay={0.1}>
          {stats.estudiantesPorSede.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Sin datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.estudiantesPorSede} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradBar1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="sedeNombre"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => v.replace('Sede ', '')}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="total" name="Estudiantes" fill="url(#gradBar1)" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      )}

      {/* ── Gráfico 2: Operadores por Sede (Barras horizontales) ── */}
      {user?.rol === 'ADMIN' && (
        <ChartCard title="Operadores por Sede" icon={<Users size={18} />} delay={0.2}>
          {stats.operadoresPorSede.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Sin datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                layout="vertical"
                data={stats.operadoresPorSede}
                margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradBar2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="sedeNombre"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => v.replace('Sede ', '')}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="total" name="Operadores" fill="url(#gradBar2)" radius={[0, 6, 6, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      )}

      {/* ── Gráfico 3: Estado de Estudiantes (Donut) ── */}
      <ChartCard title={user?.rol === 'OPERADOR' ? "Estado de mis Estudiantes" : "Estado de Estudiantes"} icon={<PieIcon size={18} />} delay={0.3}>
        {stats.estadosEstudiantes.every(e => e.total === 0) ? (
          <p className="text-slate-500 text-sm text-center py-8">Sin datos disponibles</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={stats.estadosEstudiantes}
                dataKey="total"
                nameKey="estado"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                labelLine={false}
                label={renderCustomLabel}
              >
                {stats.estadosEstudiantes.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={10}
                formatter={(value) => (
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ── Gráfico 4: Estudiantes por Programa (Barras horizontales) ── */}
      <ChartCard title={user?.rol === 'OPERADOR' ? "Mis Estudiantes por Programa" : "Estudiantes por Programa"} icon={<BarChart2 size={18} />} delay={0.4}>
        {stats.estudiantesPorPrograma.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Sin datos disponibles</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              layout="vertical"
              data={stats.estudiantesPorPrograma}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradBar3" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="programa"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="total" name="Estudiantes" fill="url(#gradBar3)" radius={[0, 6, 6, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

    </div>
  );
}

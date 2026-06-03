import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Building, Users, Shield, Music2, Search } from 'lucide-react';
import api, { API_BASE_URL } from '../lib/api';

interface SedeDetalleProps {
  sedeId: number;
  onClose: () => void;
}

const ESTADO_STYLE: { [key: string]: string } = {
  ACTIVO: 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10',
  INACTIVO: 'border-brand-500/50 text-brand-400 bg-brand-500/10',
  RETIRADO: 'border-pink-500/50 text-pink-400 bg-pink-500/10',
};

const DOT_STYLE: { [key: string]: string } = {
  ACTIVO: 'bg-neon-cyan animate-pulse',
  INACTIVO: 'bg-brand-400',
  RETIRADO: 'bg-pink-500',
};

function StudentRow({ est }: { est: any }) {
  const initials = (est.nombreCompleto || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 px-2 rounded-xl transition-colors group">
      {est.fotoPerfil ? (
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
          <img src={`${API_BASE_URL}${est.fotoPerfil}`} alt={est.nombreCompleto} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600/80 to-neon-purple/60 border border-white/10 flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-white text-xs">{initials || '?'}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors truncate">
          {est.nombreCompleto}
        </h4>
        <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
          <Music2 size={10} className="text-brand-400" /> {est.programa}
        </p>
      </div>

      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${ESTADO_STYLE[est.estado] || ESTADO_STYLE.ACTIVO}`}>
        <span className={`w-1 h-1 rounded-full ${DOT_STYLE[est.estado] || DOT_STYLE.ACTIVO}`} />
        {est.estado}
      </span>
    </div>
  );
}

function OperatorRow({ op }: { op: any }) {
  const initials = (op.nombre || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 px-2 rounded-xl transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/80 to-brand-600/60 border border-white/10 flex items-center justify-center flex-shrink-0">
        <span className="font-bold text-white text-xs">{initials || '?'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors truncate">
          {op.nombre}
        </h4>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {op.email}
        </p>
      </div>

      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-neon-purple/50 text-neon-purple bg-neon-purple/10">
        <span className="w-1 h-1 rounded-full bg-neon-purple" />
        {op.rol}
      </span>
    </div>
  );
}

export default function SedeDetalle({ sedeId, onClose }: SedeDetalleProps) {
  const [sede, setSede] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'estudiantes' | 'operadores'>('estudiantes');
  const [filterText, setFilterText] = useState('');

  const filteredEstudiantes = (sede?.estudiantes || []).filter((est: any) => {
    const text = filterText.toLowerCase();
    const nombreMatch = (est.nombreCompleto || '').toLowerCase().includes(text);
    const documentoMatch = (est.documentoIdentidad || '').toLowerCase().includes(text);
    return nombreMatch || documentoMatch;
  });

  const filteredOperadores = (sede?.usuarios || []).filter((op: any) => {
    const text = filterText.toLowerCase();
    const nombreMatch = (op.nombre || '').toLowerCase().includes(text);
    const emailMatch = (op.email || '').toLowerCase().includes(text);
    return nombreMatch || emailMatch;
  });

  useEffect(() => {
    const fetchSedeDetail = async () => {
      try {
        const res = await api.get(`/sedes/${sedeId}`);
        if (res.data.success) {
          setSede(res.data.data);
        }
      } catch (err) {
        console.error('Error al cargar detalle de sede:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSedeDetail();
  }, [sedeId]);

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
        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0d0d1a] border-l border-white/10 z-[70] flex flex-col"
      >
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-neon-purple to-neon-cyan flex-shrink-0" />

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all z-20 cursor-pointer"
        >
          <X size={20} />
        </motion.button>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="flex items-end gap-1.5 h-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 rounded-full bg-brand-500/70"
                  animate={{ height: ['20%', '100%', '20%'] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                  style={{ minHeight: 4 }}
                />
              ))}
            </div>
            <p className="text-brand-300/80 text-xs font-bold tracking-widest uppercase">
              Conectando con la sede...
            </p>
          </div>
        ) : (
          <>
            {/* Header info */}
            <div className="px-6 pt-8 pb-6 border-b border-white/5 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-neon-purple border border-brand-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                  <Building size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-tight">{sede.nombre}</h2>
                  <p className="text-xs text-brand-300 font-mono mt-0.5 flex items-center gap-1">
                    <MapPin size={10} /> {sede.ciudad}
                  </p>
                </div>
              </div>

              <div className="bg-white/3 rounded-xl p-3 border border-white/5 text-xs text-slate-400">
                <span className="font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Dirección Física</span>
                {sede.direccion}
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex-shrink-0 flex gap-2 border-b border-white/5">
              {[
                { id: 'estudiantes', label: 'Estudiantes', count: sede.estudiantes.length, icon: Users },
                { id: 'operadores', label: 'Operadores', count: sede.usuarios.length, icon: Shield },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setFilterText('');
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? 'border-brand-500 text-brand-300 bg-brand-500/5'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon size={12} />
                    {tab.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                      isActive ? 'bg-brand-500/20 text-brand-300' : 'bg-white/5 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Filter Bar */}
            <div className="px-6 pt-4 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'estudiantes'
                      ? "Filtrar por nombre o documento..."
                      : "Filtrar por nombre o correo..."
                  }
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-surface/50 border border-white/8 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500/55 focus:ring-1 focus:ring-brand-500/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'estudiantes' ? (
                  <motion.div
                    key="students-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    {filteredEstudiantes.length === 0 ? (
                      <div className="py-16 text-center text-slate-600">
                        <Users size={28} className="mx-auto text-slate-700 mb-2" />
                        <p className="text-sm font-semibold">
                          {filterText ? "Sin resultados" : "Sin estudiantes registrados"}
                        </p>
                        <p className="text-xs mt-1">
                          {filterText
                            ? "No se encontraron estudiantes para este filtro."
                            : "No hay alumnos inscritos en esta sede aún."}
                        </p>
                      </div>
                    ) : (
                      filteredEstudiantes.map((est: any) => (
                        <StudentRow key={est.id} est={est} />
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="operators-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    {filteredOperadores.length === 0 ? (
                      <div className="py-16 text-center text-slate-600">
                        <Shield size={28} className="mx-auto text-slate-700 mb-2" />
                        <p className="text-sm font-semibold">
                          {filterText ? "Sin resultados" : "Sin personal asignado"}
                        </p>
                        <p className="text-xs mt-1">
                          {filterText
                            ? "No se encontraron operadores para este filtro."
                            : "No hay operadores asignados a esta sede."}
                        </p>
                      </div>
                    ) : (
                      filteredOperadores.map((op: any) => (
                        <OperatorRow key={op.id} op={op} />
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

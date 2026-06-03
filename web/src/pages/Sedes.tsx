import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Building, Search, Edit2, Trash2, Music2, Map } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';
import SedeForm, { type Sede } from '../components/SedeForm';
import SedeDetalle from '../components/SedeDetalle';

// Estilos de estado
const ESTADO_STYLE = {
  ACTIVA: 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
  INACTIVA: 'border-pink-500/50 text-pink-400 bg-pink-500/10 shadow-[0_0_10px_rgba(236,72,153,0.2)]',
};

const ESTADO_DOT = {
  ACTIVA: 'bg-neon-cyan animate-pulse',
  INACTIVA: 'bg-pink-500',
};

// Animación de ecualizador en hover
function HoverEqualizer() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end justify-between px-2 pb-1 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-t-full bg-gradient-to-t from-brand-500 to-neon-cyan"
          animate={{ height: ['10%', `${20 + Math.random() * 80}%`, '10%'] }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

export default function Sedes() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSede, setEditingSede] = useState<Sede | null>(null);
  const [selectedSedeDetalle, setSelectedSedeDetalle] = useState<Sede | null>(null);

  const fetchSedes = async () => {
    try {
      const res = await api.get('/sedes');
      if (res.data.success) {
        setSedes(res.data.data);
      }
    } catch (error) {
      console.error('Error al cargar sedes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const handleDelete = async (id: number, nombre: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar sede?',
      html: `<span style="color:#94a3b8">Se eliminará permanentemente la sede <strong style="color:white">${nombre}</strong>.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0f0f1a',
      color: '#f1f5f9',
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#334155',
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/sedes/${id}`);
        if (res.data.success) {
          setSedes((prev) => prev.filter((s) => s.id !== id));
          Swal.fire({
            title: '✅ Eliminada',
            text: 'La sede fue removida correctamente.',
            icon: 'success',
            timer: 1800,
            showConfirmButton: false,
            background: '#0f0f1a',
            color: '#f1f5f9',
          });
        }
      } catch (error: any) {
        console.error('Error al eliminar sede:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se puede eliminar la sede porque tiene estudiantes o personal asociados.',
          background: '#0f0f1a',
          color: '#f1f5f9',
        });
      }
    }
  };

  const openForm = (sedeOpt?: Sede) => {
    setEditingSede(sedeOpt || null);
    setSelectedSedeDetalle(null);
    setIsModalOpen(true);
  };

  const closeFormAndReload = (shouldReload = false) => {
    setIsModalOpen(false);
    setEditingSede(null);
    if (shouldReload) fetchSedes();
  };

  const openSedeDetalle = (sedeOpt: Sede) => setSelectedSedeDetalle(sedeOpt);
  const closeSedeDetalle = () => setSelectedSedeDetalle(null);

  const filtered = sedes.filter((s) => {
    const matchSearch =
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.direccion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Music2 size={14} className="text-brand-400" />
            <span className="text-xs font-bold text-brand-400/70 uppercase tracking-widest">DNA Music Academy</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Sedes de Formación</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {sedes.length} sedes físicas en la red de la academia
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => openForm()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-brand-600 to-neon-purple shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all"
        >
          <Building size={18} />
          Registrar Sede
        </motion.button>
      </div>

      {/* Main Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-surface/50 border border-white/8 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Map size={12} className="text-slate-600" />
            <span>
              Mostrando <span className="text-slate-300 font-bold">{filtered.length}</span> de <span className="text-slate-300 font-bold">{sedes.length}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="flex items-end gap-1.5 h-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 rounded-full bg-brand-500/70"
                    animate={{ height: ['20%', '100%', '20%'] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                    style={{ minHeight: 4 }}
                  />
                ))}
              </div>
              <p className="text-brand-300/80 text-sm font-medium tracking-widest uppercase">
                Cargando sedes de la academia...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <MapPin size={32} className="text-slate-600" />
              </div>
              <div>
                <p className="text-slate-400 font-bold text-lg">No se encontraron sedes</p>
                <p className="text-slate-600 text-sm mt-1">Intenta ajustando el filtro de búsqueda</p>
              </div>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((s, index) => {
                return (
                  <motion.div
                    layout
                    key={s.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative rounded-2xl bg-dark-surface/40 border border-white/10 overflow-hidden backdrop-blur-md hover:border-brand-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col cursor-pointer"
                    onClick={() => openSedeDetalle(s)}
                  >
                    <HoverEqualizer />

                    {/* Card Header */}
                    <div className="p-5 flex items-start justify-between relative z-10 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600/80 to-neon-purple/60 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                          <MapPin size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base leading-snug group-hover:text-brand-300 transition-colors line-clamp-1" title={s.nombre}>
                            {s.nombre}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">{s.ciudad}</p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ESTADO_STYLE[s.estado as keyof typeof ESTADO_STYLE] || ESTADO_STYLE.ACTIVA}`}>
                        <span className={`w-1 h-1 rounded-full ${ESTADO_DOT[s.estado as keyof typeof ESTADO_DOT] || ESTADO_DOT.ACTIVA}`} />
                        {s.estado}
                      </span>
                    </div>

                    {/* Card Info */}
                    <div className="p-5 flex-1 relative z-10 space-y-3">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                          Dirección Física
                        </p>
                        <p className="text-sm font-medium text-slate-200">{s.direccion}</p>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 py-3 border-t border-white/5 bg-black/20 flex items-center justify-end gap-2 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(ev) => { ev.stopPropagation(); openForm(s); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 hover:border-brand-500/60 transition-all text-xs font-bold"
                      >
                        <Edit2 size={12} /> Editar
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(ev) => { ev.stopPropagation(); handleDelete(s.id, s.nombre); }}
                        className="w-8 h-8 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/60 transition-all flex items-center justify-center"
                        title="Eliminar"
                      >
                        <Trash2 size={12} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Slide-over Form */}
      {isModalOpen && createPortal(
        <AnimatePresence>
          <SedeForm
            sede={editingSede}
            onClose={() => closeFormAndReload()}
            onSuccess={() => closeFormAndReload(true)}
          />
        </AnimatePresence>,
        document.body
      )}

      {/* Slide-over Detalle */}
      {selectedSedeDetalle && (
        <SedeDetalle
          sedeId={selectedSedeDetalle.id}
          onClose={closeSedeDetalle}
        />
      )}
    </div>
  );
}

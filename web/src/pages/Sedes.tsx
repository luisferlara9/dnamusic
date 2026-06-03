import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import api from '../lib/api';

interface Sede {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string;
  estado: string;
}

export default function Sedes() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchSedes();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Sedes</h1>
        <p className="text-slate-500 dark:text-slate-400">Administración de Sedes (Solo Administradores)</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-40 animate-pulse bg-slate-200/50 dark:bg-slate-700/50"></div>
          ))
        ) : (
          <AnimatePresence>
            {sedes.map((sede, index) => (
              <motion.div
                key={sede.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 border-t-4 border-t-brand-500 hover:border-t-purple-500 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-brand-500 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{sede.nombre}</h3>
                    <p className="text-sm text-slate-500">{sede.ciudad}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Dirección:</span> {sede.direccion}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium mr-2">Estado:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      sede.estado === 'ACTIVA' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {sede.estado}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin, Building, Home } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';

export interface Sede {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string;
  estado: string;
}

interface SedeFormProps {
  sede: Sede | null;
  onClose: () => void;
  onSuccess: () => void;
}

/* ─────────────────────────────────────────────
   Input neón reutilizable
   ───────────────────────────────────────────── */
interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
}

function NeonInput({ label, icon, error, className, ...props }: NeonInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className={`relative rounded-xl border transition-all duration-300 ${
        focused
          ? 'border-brand-500 shadow-[0_0_16px_rgba(99,102,241,0.35)]'
          : 'border-white/10 hover:border-white/20'
      } bg-dark-surface/60 backdrop-blur-sm overflow-hidden`}>
        <AnimatePresence>
          {focused && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent"
            />
          )}
        </AnimatePresence>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className={`flex-shrink-0 transition-colors duration-300 ${focused ? 'text-brand-400' : 'text-slate-500'}`}>
            {icon}
          </span>
          <input
            {...props}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            className={`flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none text-sm font-medium ${className || ''}`}
          />
        </div>
      </div>
      {error && <p className="text-xs text-pink-400 mt-1 pl-1">{error}</p>}
    </div>
  );
}

export default function SedeForm({ sede, onClose, onSuccess }: SedeFormProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!sede;

  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    direccion: '',
    estado: 'ACTIVA',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (sede) {
      setFormData({
        nombre: sede.nombre,
        ciudad: sede.ciudad,
        direccion: sede.direccion,
        estado: sede.estado,
      });
    }
  }, [sede]);

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    set(name, value);
  };

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!formData.nombre.trim()) tempErrors.nombre = 'El nombre de la sede es obligatorio';
    if (!formData.ciudad.trim()) tempErrors.ciudad = 'La ciudad es obligatoria';
    if (!formData.direccion.trim()) {
      tempErrors.direccion = 'La dirección es obligatoria';
    } else if (formData.direccion.trim().length < 5) {
      tempErrors.direccion = 'La dirección debe tener al menos 5 caracteres';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/sedes/${sede!.id}`, formData);
        Swal.fire({
          icon: 'success',
          title: '✅ Actualizada',
          text: 'La sede fue actualizada correctamente.',
          timer: 2000,
          showConfirmButton: false,
          background: '#0f0f1a',
          color: '#f1f5f9',
        });
      } else {
        await api.post('/sedes', formData);
        Swal.fire({
          icon: 'success',
          title: '🏢 ¡Sede Registrada!',
          text: `La sede ${formData.nombre} fue agregada al sistema.`,
          timer: 2000,
          showConfirmButton: false,
          background: '#0f0f1a',
          color: '#f1f5f9',
        });
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Hubo un error al procesar la sede.',
        background: '#0f0f1a',
        color: '#f1f5f9',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-50"
      />

      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col"
        style={{ background: 'linear-gradient(160deg, #0d0d1f 0%, #111128 60%, #0f0f23 100%)' }}
      >
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-brand-500/60 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {isEdit ? 'Editar Sede' : 'Registrar Sede'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isEdit ? `Modificando detalles de ${sede?.nombre}` : 'Agrega una nueva sede física al sistema'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all z-20 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="sede-form" onSubmit={handleSubmit} className="space-y-5">
            <NeonInput
              label="Nombre de la Sede"
              icon={<Building size={16} />}
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Sede Bogotá"
              required
              error={errors.nombre}
            />

            <NeonInput
              label="Ciudad"
              icon={<MapPin size={16} />}
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Ej. Bogotá"
              required
              error={errors.ciudad}
            />

            <NeonInput
              label="Dirección Física"
              icon={<Home size={16} />}
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej. Calle 100 # 15-20"
              required
              error={errors.direccion}
            />

            {/* Estado Selector - Only visible during editing */}
            {isEdit && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Estado de la Sede
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'ACTIVA', label: 'Activa', desc: 'Permite asociar estudiantes y personal', cls: 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' },
                    { value: 'INACTIVA', label: 'Inactiva', desc: 'Bloquea nuevas asociaciones', cls: 'border-pink-500/50 text-pink-400 bg-pink-500/10' },
                  ].map((statusOpt) => {
                    const isSelected = formData.estado === statusOpt.value;
                    return (
                      <button
                        key={statusOpt.value}
                        type="button"
                        onClick={() => set('estado', statusOpt.value)}
                        className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                          isSelected
                            ? `${statusOpt.cls} shadow-[0_0_12px_rgba(6,182,212,0.2)]`
                            : 'border-white/10 hover:border-white/20 bg-dark-surface/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${statusOpt.value === 'ACTIVA' ? 'bg-neon-cyan animate-pulse' : 'bg-pink-500'}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            {statusOpt.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          {statusOpt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-6 border-t border-white/5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-wider"
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            form="sede-form"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="flex-[2] py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-brand-600 to-neon-purple text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                {isEdit ? 'Guardar Cambios' : 'Registrar'}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

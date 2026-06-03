import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Mail, Lock, Shield, MapPin, Search, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';

interface Sede {
  id: number;
  nombre: string;
  ciudad: string;
}

export interface Operador {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'OPERADOR';
  sedeId: number | null;
  sede?: {
    nombre: string;
    ciudad: string;
  } | null;
}

interface OperadorFormProps {
  operador: Operador | null;
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

function NeonInput({ label, icon, error, className, type, ...props }: NeonInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
            type={inputType}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            className={`flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none text-sm font-medium ${className || ''}`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-white transition-colors focus:outline-none flex-shrink-0"
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-pink-400 mt-1 pl-1">{error}</p>}
    </div>
  );
}

export default function OperadorForm({ operador, onClose, onSuccess }: OperadorFormProps) {
  const [loading, setLoading] = useState(false);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedesFocused, setSedesFocused] = useState(false);
  const [sedeSearch, setSedeSearch] = useState('');
  const [isSedeDropdownOpen, setIsSedeDropdownOpen] = useState(false);
  const isEdit = !!operador;

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'OPERADOR' as 'ADMIN' | 'OPERADOR',
    sedeId: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Cargar sedes del backend
    api.get('/sedes')
      .then(res => {
        if (res.data.success) {
          setSedes(res.data.data);
        }
      })
      .catch(err => console.error('Error cargando sedes:', err));

    if (operador) {
      setFormData({
        nombre: operador.nombre,
        email: operador.email,
        password: '', // siempre vacía al editar a menos que deseen cambiarla
        rol: operador.rol,
        sedeId: operador.sedeId ? operador.sedeId.toString() : '',
      });
    }
  }, [operador]);

  const set = (field: string, value: any) => {
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
    if (!formData.nombre.trim()) tempErrors.nombre = 'El nombre es obligatorio';
    if (!formData.email.trim()) {
      tempErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'El correo electrónico no es válido';
    }

    if (!isEdit && !formData.password) {
      tempErrors.password = 'La contraseña es obligatoria para nuevos operadores';
    } else if (formData.password && formData.password.length < 8) {
      tempErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)) {
      tempErrors.password = 'Debe incluir mayúscula, minúscula, número y carácter especial';
    }

    if (formData.rol === 'OPERADOR' && !formData.sedeId) {
      tempErrors.sedeId = 'Debes asignar una sede a un operador';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: any = {
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
        sedeId: formData.rol === 'OPERADOR' ? parseInt(formData.sedeId, 10) : null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEdit) {
        await api.put(`/operadores/${operador!.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: '✅ Actualizado',
          text: 'El perfil del operador fue actualizado correctamente.',
          timer: 2000,
          showConfirmButton: false,
          background: '#0f0f1a',
          color: '#f1f5f9',
        });
      } else {
        await api.post('/operadores', payload);
        Swal.fire({
          icon: 'success',
          title: '⚡ ¡Operador Creado!',
          text: `El operador ${formData.nombre} fue registrado con éxito.`,
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
        text: err.response?.data?.message || 'Hubo un error al procesar el formulario.',
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
              {isEdit ? 'Editar Operador' : 'Registrar Operador'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isEdit ? `Modificando credenciales de ${operador?.nombre}` : 'Agrega un nuevo operador de sede o administrador'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="operador-form" onSubmit={handleSubmit} className="space-y-5">
            <NeonInput
              label="Nombre Completo"
              icon={<User size={16} />}
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Luis Fernando"
              required
              error={errors.nombre}
            />

            <NeonInput
              label="Correo Electrónico"
              icon={<Mail size={16} />}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@dnamusic.com"
              required
              error={errors.email}
            />

            <NeonInput
              label={isEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
              icon={<Lock size={16} />}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEdit ? 'Dejar en blanco para mantener' : '••••••••••••'}
              required={!isEdit}
              error={errors.password}
            />
            {!isEdit && (
              <p className="text-[10px] text-slate-500 mt-[-8px] pl-1 leading-normal">
                Debe tener 8+ caracteres e incluir mayúscula, minúscula, número y símbolo.
              </p>
            )}

            {/* Rol Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Rol del Usuario
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'OPERADOR', label: 'Operador', desc: 'Gestiona una sede' },
                  { value: 'ADMIN', label: 'Admin', desc: 'Acceso global total' },
                ].map((roleOpt) => {
                  const isSelected = formData.rol === roleOpt.value;
                  return (
                    <button
                      key={roleOpt.value}
                      type="button"
                      onClick={() => {
                        set('rol', roleOpt.value);
                        if (roleOpt.value === 'ADMIN') set('sedeId', '');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/10 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                          : 'border-white/10 hover:border-white/20 bg-dark-surface/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Shield size={14} className={isSelected ? 'text-brand-400' : 'text-slate-500'} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                          {roleOpt.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        {roleOpt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sede Selector - conditional on Rol === 'OPERADOR' */}
            {formData.rol === 'OPERADOR' && (
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Sede Asignada
                </label>
                <div className={`relative rounded-xl border transition-all duration-300 ${
                  sedesFocused
                    ? 'border-neon-purple/70 shadow-[0_0_16px_rgba(168,85,247,0.3)]'
                    : 'border-white/10 hover:border-white/20'
                } bg-dark-surface/60 overflow-hidden`}>
                  {sedesFocused && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple to-transparent"
                    />
                  )}
                  <div className="flex items-center gap-3 px-4 py-3" onClick={() => setIsSedeDropdownOpen(true)}>
                    <MapPin size={16} className={`flex-shrink-0 transition-colors ${sedesFocused ? 'text-neon-purple' : 'text-slate-500'}`} />
                    {formData.sedeId && !isSedeDropdownOpen ? (
                      <div
                        className="flex-1 cursor-pointer text-white text-sm font-medium"
                        onClick={() => { setIsSedeDropdownOpen(true); setSedeSearch(''); }}
                      >
                        {sedes.find(s => s.id.toString() === formData.sedeId)?.nombre || 'Selecciona una sede'}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={sedeSearch}
                        onChange={(e) => setSedeSearch(e.target.value)}
                        onFocus={() => { setSedesFocused(true); setIsSedeDropdownOpen(true); }}
                        onBlur={() => { setSedesFocused(false); setTimeout(() => setIsSedeDropdownOpen(false), 200); }}
                        placeholder="Buscar sede..."
                        className="flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none text-sm font-medium"
                        autoFocus={isSedeDropdownOpen}
                      />
                    )}
                    <Search size={14} className="text-slate-600" />
                  </div>
                </div>
                {errors.sedeId && <p className="text-xs text-pink-400 mt-1 pl-1">{errors.sedeId}</p>}

                <AnimatePresence>
                  {isSedeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-2 rounded-xl bg-[#13131f] border border-white/10 shadow-2xl overflow-hidden max-h-48 overflow-y-auto"
                    >
                      {sedes.filter(s => s.nombre.toLowerCase().includes(sedeSearch.toLowerCase())).length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">No se encontraron sedes</div>
                      ) : (
                        sedes.filter(s => s.nombre.toLowerCase().includes(sedeSearch.toLowerCase())).map(s => (
                          <div
                            key={s.id}
                            onClick={() => { set('sedeId', s.id.toString()); setIsSedeDropdownOpen(false); }}
                            className={`px-4 py-3 cursor-pointer text-sm transition-colors hover:bg-neon-purple/20 hover:text-white ${
                              formData.sedeId === s.id.toString() ? 'bg-neon-purple/10 text-neon-purple font-bold' : 'text-slate-300'
                            }`}
                          >
                            {s.nombre} ({s.ciudad})
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
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
            form="operador-form"
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

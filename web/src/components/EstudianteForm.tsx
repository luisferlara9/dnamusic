import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, User, Mail, Phone, CreditCard,
  MapPin, Music2, CheckCircle2, ChevronRight, ChevronLeft, Search, UploadCloud, Image as ImageIcon
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';
import type { Estudiante } from '../pages/Estudiantes';

/* ─────────────────────────────────────────────
   Tipos y constantes
───────────────────────────────────────────── */
interface EstudianteFormProps {
  estudiante: Estudiante | null;
  onClose: () => void;
  onSuccess: () => void;
  isAdmin: boolean;
}

const ESTADO_CONFIG = {
  ACTIVO:   { color: 'border-neon-cyan text-neon-cyan bg-neon-cyan/10',   dot: 'bg-neon-cyan',   label: 'Activo' },
  INACTIVO: { color: 'border-brand-500 text-brand-400 bg-brand-500/10',    dot: 'bg-brand-400',   label: 'Inactivo' },
  RETIRADO: { color: 'border-pink-500 text-pink-400 bg-pink-500/10',       dot: 'bg-pink-500',    label: 'Retirado' },
};

/* ─────────────────────────────────────────────
   Animador de barras tipo ecualizador (decorativo)
───────────────────────────────────────────── */
function MusicBars({ count = 12 }: { count?: number }) {
  return (
    <div className="flex items-end gap-[3px] h-10 opacity-30">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-brand-500 to-neon-cyan"
          animate={{ height: ['20%', `${30 + Math.random() * 70}%`, '20%'] }}
          transition={{
            duration: 0.6 + Math.random() * 0.8,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            delay: i * 0.07,
          }}
        />
      ))}
    </div>
  );
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

/* ─────────────────────────────────────────────
   Selector de Programa — Autocomplete Combobox
   Escala a cientos de programas sin problema
───────────────────────────────────────────── */
function ProgramaSelector({ value, onChange, programas }: { value: string; onChange: (v: string) => void; programas: string[] }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value → input
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtered suggestions: match query, max 8 shown
  const suggestions = programas
    .filter(p => p.toLowerCase().includes(query.toLowerCase().trim()))
    .slice(0, 8);

  const isNew = query.trim() && !programas.some(p => p.toLowerCase() === query.toLowerCase().trim());
  const isSelected = value && value === query;

  const select = (p: string) => {
    onChange(p);
    setQuery(p);
    setOpen(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value); // save as-is (new program if not in list)
    setOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
        Programa Musical
      </label>

      {/* Input */}
      <div className={`relative flex items-center gap-2 px-3 py-3 rounded-xl border transition-all duration-200 ${
        focused
          ? 'border-brand-500/70 shadow-[0_0_12px_rgba(99,102,241,0.2)] bg-dark-surface/60'
          : 'border-white/10 bg-dark-surface/40'
      }`}>
        <Music2 size={15} className={`flex-shrink-0 transition-colors ${focused ? 'text-brand-400' : 'text-slate-500'}`} />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder="Buscar o escribir un programa..."
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
          autoComplete="off"
        />
        {isSelected && !isNew && (
          <CheckCircle2 size={15} className="text-brand-400 flex-shrink-0" />
        )}
        {isNew && query.trim() && (
          <span className="text-[10px] font-bold text-neon-cyan px-2 py-0.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 flex-shrink-0">
            NUEVO
          </span>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (suggestions.length > 0 || isNew) && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-[#13131f] border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {suggestions.length > 0 && (
              <div className="py-1">
                {suggestions.map(p => (
                  <button
                    key={p}
                    type="button"
                    onMouseDown={() => select(p)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      value === p
                        ? 'bg-brand-500/15 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Music2 size={13} className={value === p ? 'text-brand-400' : 'text-slate-500'} />
                    <span className="flex-1">{p}</span>
                    {value === p && <CheckCircle2 size={13} className="text-brand-400" />}
                  </button>
                ))}
              </div>
            )}

            {isNew && (
              <>
                {suggestions.length > 0 && <div className="h-px bg-white/5 mx-3" />}
                <button
                  type="button"
                  onMouseDown={() => select(query.trim())}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-neon-cyan/5 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full border border-neon-cyan/50 bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-[10px] font-black flex-shrink-0">+</span>
                  <span className="flex-1 text-slate-300">Crear <strong className="text-white">"{query.trim()}"</strong></span>
                  <span className="text-[9px] font-bold text-neon-cyan uppercase tracking-widest">Nuevo</span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <p className="text-[10px] text-slate-600 mt-1.5 ml-1">
        {programas.length > 0
          ? `${programas.length} programa${programas.length !== 1 ? 's' : ''} disponible${programas.length !== 1 ? 's' : ''}. Escribe para filtrar o crea uno nuevo.`
          : 'Escribe el nombre del programa para crearlo.'}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Selector de Estado (pills)
───────────────────────────────────────────── */
function EstadoSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Estado del Estudiante</label>
      <div className="flex gap-3 flex-wrap">
        {(Object.keys(ESTADO_CONFIG) as Array<keyof typeof ESTADO_CONFIG>).map((estado) => {
          const cfg = ESTADO_CONFIG[estado];
          const isSelected = value === estado;
          return (
            <motion.button
              key={estado}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(estado)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all duration-200 ${cfg.color} ${
                isSelected ? 'shadow-lg' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot} ${isSelected ? 'animate-pulse' : ''}`} />
              {cfg.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Componente Principal del Formulario
───────────────────────────────────────────── */
export default function EstudianteForm({ estudiante, onClose, onSuccess, isAdmin }: EstudianteFormProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [sedes, setSedes] = useState<{ id: number; nombre: string }[]>([]);
  const [programasDb, setProgramasDb] = useState<string[]>([]);
  const [sedesFocused, setSedesFocused] = useState(false);
  const [sedeSearch, setSedeSearch] = useState('');
  const [isSedeDropdownOpen, setIsSedeDropdownOpen] = useState(false);
  const isEdit = !!estudiante;

  // Foto states
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(estudiante?.fotoPerfil ? `http://localhost:3000${estudiante.fotoPerfil}` : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    documentoIdentidad: '',
    sedeId: '',
    programa: '',
    estado: 'ACTIVO',
  });

  const step0Complete =
    formData.nombreCompleto.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.telefono.trim() !== '' &&
    formData.documentoIdentidad.trim() !== '';

  useEffect(() => {
    if (estudiante) {
      setFormData({
        nombreCompleto: estudiante.nombreCompleto,
        email: estudiante.email,
        telefono: estudiante.telefono,
        documentoIdentidad: estudiante.documentoIdentidad,
        sedeId: estudiante.sedeId.toString(),
        programa: estudiante.programa,
        estado: estudiante.estado,
      });
    }
    
    // Cargar sedes (si admin) y programas
    if (isAdmin) {
      api.get('/sedes').then(res => { if (res.data.success) setSedes(res.data.data); }).catch(console.error);
    }
    api.get('/estudiantes/programas').then(res => { if (res.data.success) setProgramasDb(res.data.data); }).catch(console.error);
  }, [estudiante, isAdmin]);

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === 'nombreCompleto') value = value.replace(/[^a-zA-Z\sñÑáéíóúÁÉÍÓÚ]/g, '');
    else if (name === 'documentoIdentidad' || name === 'telefono') value = value.replace(/\D/g, '');
    set(name, value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'La imagen no puede pesar más de 2MB', background: '#0f0f1a', color: '#f1f5f9' });
        return;
      }
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (fotoFile) {
        data.append('foto', fotoFile);
      }

      if (isEdit) {
        await api.put(`/estudiantes/${estudiante!.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
      } else {
        await api.post('/estudiantes', data, { headers: { 'Content-Type': 'multipart/form-data' }});
      }

      Swal.fire({
        icon: 'success',
        title: isEdit ? '✅ Actualizado' : '🎵 ¡Registrado!',
        text: isEdit
          ? 'El perfil del estudiante fue actualizado.'
          : `${formData.nombreCompleto} ya forma parte de la red DNA Music. Se envió el correo.`,
        timer: 2000,
        showConfirmButton: false,
        background: '#0f0f1a',
        color: '#f1f5f9',
      });
      
      if (!isEdit && formData.telefono) {
        const waText = `¡Hola ${formData.nombreCompleto}! Bienvenido a DNA Music. Tus credenciales de acceso a la plataforma estudiantil son:\n\nEmail: ${formData.email}\nClave: ${formData.documentoIdentidad}\n\n¡Que la música te acompañe! 🎵`;
        const waUrl = `https://wa.me/${formData.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`;
        window.open(waUrl, '_blank');
      }

      onSuccess();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Hubo un error al procesar la solicitud.',
        background: '#0f0f1a',
        color: '#f1f5f9',
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Perfil & Datos', 'Datos Académicos'];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
      />

      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg flex flex-col"
        style={{ background: 'linear-gradient(160deg, #0d0d1f 0%, #111128 60%, #0f0f23 100%)' }}
      >
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-brand-500/60 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Music2 size={16} className="text-brand-400" />
                <span className="text-xs font-bold text-brand-400/80 uppercase tracking-widest">
                  DNA Music Academy
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isEdit ? 'Editar Perfil' : 'Nuevo Estudiante'}
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {isEdit ? `Modificando registro de ${estudiante?.nombreCompleto?.split(' ')[0]}` : 'Registra un nuevo talento en el sistema'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MusicBars count={8} />
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => i === 0 || step0Complete ? setStep(i) : null}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                    step === i
                      ? 'bg-brand-500/20 border border-brand-500/50 text-brand-300'
                      : i < step
                      ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan cursor-pointer'
                      : 'bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                    i < step ? 'bg-neon-cyan text-dark-bg' : step === i ? 'bg-brand-500 text-white' : 'bg-white/10 text-slate-500'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  {s}
                </button>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <form id="estudiante-form" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5 pt-2"
                >
                  {/* Foto Upload */}
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl border border-white/10 bg-dark-surface/60 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:border-brand-500 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        {fotoPreview ? (
                          <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={24} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg hover:bg-brand-400 transition-colors border-2 border-dark-bg"
                      >
                        <UploadCloud size={14} />
                      </button>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-1">Foto de Perfil</h4>
                      <p className="text-xs text-slate-500">
                        Opcional. Máx 2MB. Formatos recomendados: JPG, PNG.
                      </p>
                    </div>
                  </div>

                  <NeonInput
                    label="Nombre Completo"
                    icon={<User size={16} />}
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    placeholder="Ej. Juan Andrés Pérez"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <NeonInput
                      label="Nº Documento"
                      icon={<CreditCard size={16} />}
                      name="documentoIdentidad"
                      value={formData.documentoIdentidad}
                      onChange={handleChange}
                      placeholder="CC / TI"
                      required
                    />
                    <NeonInput
                      label="Teléfono"
                      icon={<Phone size={16} />}
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="3000000000"
                      required
                    />
                  </div>

                  <NeonInput
                    label="Correo Electrónico"
                    icon={<Mail size={16} />}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juan@correo.com"
                    required
                  />
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 pt-2"
                >
                  <ProgramaSelector value={formData.programa} onChange={(v) => set('programa', v)} programas={programasDb} />

                  {isAdmin && (
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
                              placeholder="Buscar sede por nombre..."
                              className="flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none text-sm font-medium"
                              autoFocus={isSedeDropdownOpen}
                            />
                          )}
                          <Search size={14} className="text-slate-600" />
                        </div>
                      </div>

                      <AnimatePresence>
                        {isSedeDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-2 rounded-xl bg-dark-bg/95 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden max-h-48 overflow-y-auto"
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
                                  {s.nombre}
                                </div>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {isEdit && (
                    <EstadoSelector value={formData.estado} onChange={(v) => set('estado', v)} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-white/5">
          <div className="flex gap-3">
            {step === 0 ? (
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-wider">
                Cancelar
              </button>
            ) : (
              <button type="button" onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                <ChevronLeft size={16} /> Atrás
              </button>
            )}

            {step === 0 ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={!step0Complete}
                onClick={() => setStep(1)}
                className="flex-[2] py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-brand-600 to-neon-purple text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
              >
                Continuar <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                form="estudiante-form"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading || !formData.programa || (isAdmin && !formData.sedeId)}
                className="flex-[2] py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-neon-cyan/80 to-brand-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)]"
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
            )}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: step === i ? 24 : 8 }}
                className={`h-1.5 rounded-full transition-colors duration-300 ${step === i ? 'bg-brand-500' : i < step ? 'bg-neon-cyan' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

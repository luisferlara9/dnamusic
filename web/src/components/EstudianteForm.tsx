import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../lib/api';
import { Estudiante } from '../pages/Estudiantes';

const MySwal = withReactContent(Swal);

interface EstudianteFormProps {
  estudiante: Estudiante | null;
  onClose: () => void;
  onSuccess: () => void;
  isAdmin: boolean;
}

export default function EstudianteForm({ estudiante, onClose, onSuccess, isAdmin }: EstudianteFormProps) {
  const [loading, setLoading] = useState(false);
  const [sedes, setSedes] = useState<{ id: number; nombre: string }[]>([]);
  
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    documentoIdentidad: '',
    sedeId: '',
    programa: '',
    estado: 'ACTIVO',
  });

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

    if (isAdmin) {
      // Solo cargamos sedes si es Admin (para poder elegir en qué sede crear el estudiante)
      api.get('/sedes').then(res => {
        if (res.data.success) setSedes(res.data.data);
      }).catch(err => console.error(err));
    }
  }, [estudiante, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        sedeId: formData.sedeId ? parseInt(formData.sedeId, 10) : undefined
      };

      if (estudiante) {
        await api.put(`/estudiantes/${estudiante.id}`, payload);
        MySwal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El estudiante fue actualizado correctamente.',
          timer: 1500,
          showConfirmButton: false,
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        });
      } else {
        await api.post('/estudiantes', payload);
        MySwal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'El estudiante fue registrado correctamente.',
          timer: 1500,
          showConfirmButton: false,
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        });
      }
      onSuccess();
    } catch (error: any) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Hubo un error al procesar la solicitud',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
      />

      {/* Slide-over Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-dark-surface shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-dark-border"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-border">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {estudiante ? 'Editar Estudiante' : 'Registrar Estudiante'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="estudiante-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
              <input required name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} className="input-field" placeholder="Ej. Juan Pérez" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Documento</label>
                <input required name="documentoIdentidad" value={formData.documentoIdentidad} onChange={handleChange} className="input-field" placeholder="CC o TI" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                <input required name="telefono" value={formData.telefono} onChange={handleChange} className="input-field" placeholder="300 000 0000" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="juan@correo.com" />
            </div>

            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sede de Asignación</label>
                <select required name="sedeId" value={formData.sedeId} onChange={handleChange} className="input-field">
                  <option value="" disabled>Seleccione una sede...</option>
                  {sedes.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
                <p className="text-xs text-brand-500 mt-1">Como ADMIN, debes asignar una sede obligatoriamente.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Programa Musical</label>
              <input required name="programa" value={formData.programa} onChange={handleChange} className="input-field" placeholder="Ej. Producción Musical, DJ..." />
            </div>

            {estudiante && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                <select required name="estado" value={formData.estado} onChange={handleChange} className="input-field">
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                  <option value="RETIRADO">RETIRADO</option>
                </select>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50">
          <button 
            type="submit" 
            form="estudiante-form" 
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={18} />
                Guardar Estudiante
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Edit2, Trash2, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import EstudianteForm from '../components/EstudianteForm';

const MySwal = withReactContent(Swal);

export interface Estudiante {
  id: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  documentoIdentidad: string;
  sedeId: number;
  programa: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO';
  fechaInscripcion: string;
  sede?: { nombre: string; ciudad: string };
}

export default function Estudiantes() {
  const { user } = useAuth();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState<Estudiante | null>(null);

  const fetchEstudiantes = async () => {
    try {
      const res = await api.get('/estudiantes');
      if (res.data.success) {
        setEstudiantes(res.data.data);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const handleDelete = async (id: number, nombre: string) => {
    MySwal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás al estudiante ${nombre}. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/estudiantes/${id}`);
          setEstudiantes(estudiantes.filter(e => e.id !== id));
          MySwal.fire({
            title: 'Eliminado!',
            text: 'El estudiante ha sido eliminado correctamente.',
            icon: 'success',
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
          });
        } catch (error: any) {
          MySwal.fire('Error', error.response?.data?.message || 'Hubo un problema', 'error');
        }
      }
    });
  };

  const openForm = (estudiante?: Estudiante) => {
    setEditingEstudiante(estudiante || null);
    setIsModalOpen(true);
  };

  const closeFormAndReload = (shouldReload = false) => {
    setIsModalOpen(false);
    setEditingEstudiante(null);
    if (shouldReload) fetchEstudiantes();
  };

  const filtered = estudiantes.filter(e => 
    e.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.documentoIdentidad.includes(searchTerm) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Estudiantes</h1>
          <p className="text-slate-500 dark:text-slate-400">Gestión del alumnado de DNA Music</p>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openForm()}
          className="btn-primary"
        >
          <UserPlus size={20} />
          <span>Registrar Nuevo</span>
        </motion.button>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nombre, correo o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !py-2 pl-10"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-dark-border">
                  <th className="px-6 py-4 font-semibold">Estudiante</th>
                  <th className="px-6 py-4 font-semibold">Documento</th>
                  <th className="px-6 py-4 font-semibold">Sede</th>
                  <th className="px-6 py-4 font-semibold">Programa</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No se encontraron estudiantes
                      </td>
                    </tr>
                  ) : (
                    filtered.map((est, index) => (
                      <motion.tr
                        key={est.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800 dark:text-white">{est.nombreCompleto}</p>
                          <p className="text-sm text-slate-500">{est.email}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {est.documentoIdentidad}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            {est.sede?.nombre || 'Desconocida'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                          {est.programa}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            est.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                            est.estado === 'RETIRADO' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}>
                            {est.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openForm(est)}
                              className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg dark:text-brand-400 dark:hover:bg-brand-900/20 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(est.id, est.nombreCompleto)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <EstudianteForm 
            estudiante={editingEstudiante} 
            onClose={() => closeFormAndReload()} 
            onSuccess={() => closeFormAndReload(true)}
            isAdmin={user?.rol === 'ADMIN'}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

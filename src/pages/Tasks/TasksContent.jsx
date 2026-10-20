/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './TasksContent.css';

export default function TasksContent() {
  const [tasks, setTasks] = useState([]);
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [selectedDate, setSelectedDate] = useState(""); 
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false); 
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date()); 
  
  const [showModal, setShowModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Lista de categorías almacenada en localStorage o con valores por defecto
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('task_categories');
    return saved ? JSON.parse(saved) : ["General", "Proyecto", "Urgente"];
  });

  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'Media',
    categoria: categories[0] || 'General',
    fechaVencimiento: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('userAuth');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch (err) {
        console.error("Error al cargar usuario de localStorage", err);
      }
    }
  }, []);

  // Guardar categorías en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem('task_categories', JSON.stringify(categories));
  }, [categories]);

  const fetchTasks = async () => {
    if (!currentUser) return;
    const userId = currentUser.id || currentUser._id;
    try {
      const res = await axios.get(`http://localhost:3000/api/tasks/user/${userId}`);
      setTasks(res.data);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser]);

  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setFormData({
      titulo: '',
      descripcion: '',
      prioridad: 'Media',
      categoria: categories[0] || 'General',
      fechaVencimiento: ''
    });
    setShowCategoryManager(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTaskId(task._id);
    setFormData({
      titulo: task.titulo || '',
      descripcion: task.descripcion || '',
      prioridad: task.prioridad || 'Media',
      categoria: task.categoria || (categories[0] || 'General'),
      fechaVencimiento: task.fechaVencimiento ? getLocalDateString(task.fechaVencimiento) : ''
    });
    setShowCategoryManager(false);
    setShowModal(true);
  };

  // Funciones para gestionar Categorías
  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      toast.error("Esta categoría ya existe");
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    setNewCategoryInput("");
    toast.success("Categoría agregada");
  };

  const handleDeleteCategory = (catToDelete) => {
    if (categories.length <= 1) {
      toast.error("Debe existir al menos una categoría");
      return;
    }
    const updated = categories.filter(c => c !== catToDelete);
    setCategories(updated);
    if (formData.categoria === catToDelete) {
      setFormData({ ...formData, categoria: updated[0] });
    }
    toast.success("Categoría eliminada");
  };

  // Manejo de Creación o Actualización de Tareas (Validando Fecha obligatoria)
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validación estricta de fecha obligatoria
    if (!formData.fechaVencimiento) {
      toast.error("La fecha límite es obligatoria para crear o actualizar la tarea");
      return;
    }

    const userId = currentUser.id || currentUser._id;

    try {
      if (editingTaskId) {
        await axios.put(`http://localhost:3000/api/tasks/${editingTaskId}`, formData);
        toast.success("Tarea actualizada exitosamente");
      } else {
        await axios.post('http://localhost:3000/api/tasks', {
          ...formData,
          userId
        });
        toast.success("Tarea creada exitosamente");
      }

      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: 'Media',
        categoria: categories[0] || 'General',
        fechaVencimiento: ''
      });
      setEditingTaskId(null);
      setShowModal(false);
      fetchTasks();
    } catch (error) {
      toast.error(editingTaskId ? "Error al actualizar la tarea" : "Error al crear la tarea");
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/tasks/${taskId}`, {
        completada: !currentStatus
      });
      fetchTasks();
    } catch (error) {
      toast.error("Error al actualizar la tarea");
    }
  };

  // Eliminar tarea usando SweetAlert2
  const deleteTask = (taskId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la tarea de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EB464B',
      cancelButtonColor: '#00094B',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/tasks/${taskId}`);
          toast.success("Tarea eliminada correctamente");
          fetchTasks();
        } catch (error) {
          toast.error("Error al eliminar la tarea");
        }
      }
    });
  };

  const getLocalDateString = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateInput) => {
    if (!dateInput) return 'Sin fecha';
    const date = new Date(dateInput);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const taskDatesSet = new Set(
    tasks
      .filter(t => t.fechaVencimiento)
      .map(t => getLocalDateString(t.fechaVencimiento))
  );

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); 

  const firstDayIndex = new Date(year, month, 1).getDay(); 
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate(); 

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dayNum) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const dateString = `${year}-${formattedMonth}-${formattedDay}`;
    setSelectedDate(dateString);
    setShowCalendarDropdown(false);
  };

  const totalTareas = tasks.length;
  const completadas = tasks.filter(t => t.completada).length;
  const pendientes = tasks.filter(t => !t.completada).length;
  const prioridadAlta = tasks.filter(t => !t.completada && t.prioridad === 'Alta').length;

  const getPercentage = (count) => totalTareas === 0 ? 0 : Math.round((count / totalTareas) * 100);

  const filteredTasks = tasks.filter(task => {
    if (selectedDate) {
      if (!task.fechaVencimiento) return false;
      const taskDateOnly = getLocalDateString(task.fechaVencimiento);
      if (taskDateOnly !== selectedDate) return false;
    }

    if (filterCategory === "Todas") return true;
    if (filterCategory === "Pendientes") return !task.completada;
    if (filterCategory === "Completadas") return task.completada;
    return task.categoria === filterCategory;
  });

  return (
    <div className="tasks-wrapper">
      <div className="tasks-main-container">

        {/* Cabecera Hero */}
        <div className="tasks-hero-banner">
          <div className="hero-text">
            <h2>Mi Panel Privado de Tareas</h2>
            <p>
              Gestión personal para {currentUser ? `${currentUser.nombres} ${currentUser.apellidos}` : 'Usuario'}. Espacio 100% aislado.
            </p>
          </div>
          <div className="hero-badge-container">
            <button className="btn-add-task" onClick={handleOpenCreateModal}>
              + Nueva Tarea
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas */}
        <div className="tasks-cards-grid">
          <div className="tasks-card card-total">
            <div className="card-top">
              <h3>Total Tareas</h3>
              <span className="card-number">{totalTareas}</span>
            </div>
            <div className="card-progress-bar">
              <div className="progress-fill fill-total" style={{ width: '100%' }}></div>
            </div>
            <span className="card-subtext">Registradas en tu cuenta</span>
          </div>

          <div className="tasks-card card-pending">
            <div className="card-top">
              <h3>Pendientes</h3>
              <span className="card-number">{pendientes}</span>
            </div>
            <div className="card-progress-bar">
              <div className="progress-fill fill-pending" style={{ width: `${getPercentage(pendientes)}%` }}></div>
            </div>
            <span className="card-subtext">{getPercentage(pendientes)}% de tus tareas</span>
          </div>

          <div className="tasks-card card-completed">
            <div className="card-top">
              <h3>Completadas</h3>
              <span className="card-number">{completadas}</span>
            </div>
            <div className="card-progress-bar">
              <div className="progress-fill fill-completed" style={{ width: `${getPercentage(completadas)}%` }}></div>
            </div>
            <span className="card-subtext">{getPercentage(completadas)}% de avance</span>
          </div>

          <div className="tasks-card card-high">
            <div className="card-top">
              <h3>Alta Prioridad</h3>
              <span className="card-number">{prioridadAlta}</span>
            </div>
            <div className="card-progress-bar">
              <div className="progress-fill fill-high" style={{ width: `${getPercentage(prioridadAlta)}%` }}></div>
            </div>
            <span className="card-subtext">Pendientes urgentes</span>
          </div>
        </div>

        {/* Sección de Tabla y Controles */}
        <div className="tasks-section">
          <div className="tasks-section-header">
            <h3>Lista Personal de Pendientes</h3>
            
            <div className="tasks-controls-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              
              {/* Mini-Calendar Interactivo */}
              <div className="custom-calendar-wrapper" style={{ position: 'relative' }}>
                <div 
                  className={`calendar-trigger-btn ${selectedDate ? 'active-filter-date' : ''}`}
                  onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                  title="Seleccionar fecha para filtrar"
                >
                  <span>📅 {selectedDate ? selectedDate.split('-').reverse().join('/') : 'Filtrar por fecha'}</span>
                </div>

                {selectedDate && (
                  <button 
                    className="btn-clear-date" 
                    onClick={() => setSelectedDate("")}
                    title="Limpiar filtro de fecha"
                  >
                    ✕
                  </button>
                )}

                {showCalendarDropdown && (
                  <div className="calendar-dropdown-card">
                    <div className="calendar-header-nav">
                      <button type="button" onClick={handlePrevMonth}>◀</button>
                      <span className="calendar-month-title">{monthNames[month]} {year}</span>
                      <button type="button" onClick={handleNextMonth}>▶</button>
                    </div>

                    <div className="calendar-weekdays">
                      <span>Do</span><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span>
                    </div>

                    <div className="calendar-grid-days">
                      {Array.from({ length: firstDayIndex }).map((_, index) => (
                        <div key={`empty-${index}`} className="calendar-day empty"></div>
                      ))}

                      {Array.from({ length: totalDaysInMonth }).map((_, index) => {
                        const dayNum = index + 1;
                        const formattedMonth = String(month + 1).padStart(2, '0');
                        const formattedDay = String(dayNum).padStart(2, '0');
                        const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
                        
                        const hasTask = taskDatesSet.has(dateStr);
                        const isSelected = selectedDate === dateStr;

                        return (
                          <div
                            key={`day-${dayNum}`}
                            className={`calendar-day ${hasTask ? 'has-task-day' : ''} ${isSelected ? 'selected-day' : ''}`}
                            onClick={() => handleSelectDay(dayNum)}
                          >
                            {dayNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Filtro dinámicos */}
              <div className="tasks-filter-bar">
                {["Todas", "Pendientes", "Completadas", ...categories].map((cat) => (
                  <button
                    key={cat}
                    className={`filter-node ${filterCategory === cat ? 'active-node' : ''}`}
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla de Tareas */}
          <div className="tasks-table-container">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Estado</th>
                  <th>Título / Descripción</th>
                  <th>Prioridad</th>
                  <th>Categoría</th>
                  <th>Fecha Límite</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <tr key={task._id} className={task.completada ? 'row-completed-green' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={task.completada}
                          onChange={() => toggleTaskStatus(task._id, task.completada)}
                          className="task-checkbox"
                        />
                      </td>
                      <td className="task-info-cell">
                        <span className={`task-title ${task.completada ? 'text-strikethrough' : ''}`}>
                          {task.titulo}
                        </span>
                        {task.descripcion && <p className="task-desc">{task.descripcion}</p>}
                      </td>
                      <td>
                        <span className={`badge-priority priority-${task.prioridad.toLowerCase()}`}>
                          {task.prioridad}
                        </span>
                      </td>
                      <td>
                        <span className="badge-category">{task.categoria}</span>
                      </td>
                      <td className="task-date-cell">
                        {formatDisplayDate(task.fechaVencimiento)}
                      </td>
                      <td style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className="btn-edit" onClick={() => handleOpenEditModal(task)} title="Editar tarea">
                          ✏️
                        </button>
                        <button className="btn-delete" onClick={() => deleteTask(task._id)} title="Eliminar tarea">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data-row">
                      No hay tareas registradas en este filtro o fecha.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal para Crear o Editar Tarea */}
      {showModal && (
        <div className="tasks-modal-overlay">
          <div className="tasks-modal-content">
            <h3>{editingTaskId ? "Editar Tarea Privada" : "Nueva Tarea Privada"}</h3>
            <form onSubmit={handleSubmitTask}>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Revisar reportes del turno"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prioridad</label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ margin: 0 }}>Categoría</label>
                    <button 
                      type="button" 
                      onClick={() => setShowCategoryManager(!showCategoryManager)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {showCategoryManager ? "Ocultar administrador" : "⚙️ Administrar categorías"}
                    </button>
                  </div>

                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Panel desplegable para agregar/eliminar categorías */}
                  {showCategoryManager && (
                    <div style={{ marginTop: '8px', padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        <input
                          type="text"
                          placeholder="Nueva categoría..."
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <button 
                          type="button" 
                          onClick={handleAddCategory}
                          style={{ background: '#00094B', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          + Agregar
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '70px', overflowY: 'auto' }}>
                        {categories.map((cat) => (
                          <span key={cat} style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {cat}
                            {categories.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => handleDeleteCategory(cat)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                                title="Eliminar categoría"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Fecha Vencimiento (Obligatoria)</label>
                <input
                  type="date"
                  required
                  value={formData.fechaVencimiento}
                  onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingTaskId ? "Actualizar Tarea" : "Guardar Tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
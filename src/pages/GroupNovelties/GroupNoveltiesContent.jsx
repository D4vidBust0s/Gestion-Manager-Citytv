/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './GroupNoveltiesContent.css';

export default function GroupNoveltiesContent() {
  const { id: grupoId } = useParams();

  const [nombreGrupo, setNombreGrupo] = useState("Cargando grupo...");
  const [novelties, setNovelties] = useState([]);
  const [groupPersonnel, setGroupPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del Formulario de Nueva Novedad
  const [tipoAfectacion, setTipoAfectacion] = useState("colaborador");
  const [selectedColaborador, setSelectedColaborador] = useState("");
  const [tipoNovedad, setTipoNovedad] = useState("Permiso");
  const [otroMotivo, setOtroMotivo] = useState("");
  const [descripcionNovedad, setDescripcionNovedad] = useState("");

  // Estados independientes para soluciones por tarjeta
  const [solucionesInput, setSolucionesInput] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Obtener el nombre del grupo actual desde la API de grupos
        const groupsRes = await axios.get("http://localhost:3000/api/groups");
        const grupoActual = groupsRes.data.find(g => g._id === grupoId);
        if (grupoActual) {
          setNombreGrupo(grupoActual.nombre || grupoActual.name || "Grupo Operativo");
        } else {
          setNombreGrupo("Grupo Operativo");
        }

        // 2. Cargar el personal del grupo
        const payrollRes = await axios.get("http://localhost:3000/api/payroll");
        const filteredStaff = payrollRes.data.filter(p => p.grupoID === grupoId || p.grupo === grupoId);
        setGroupPersonnel(filteredStaff);

        // 3. Cargar las novedades reales desde el backend para este grupo
        const noveltiesRes = await axios.get(`http://localhost:3000/api/novelties?grupoID=${grupoId}`);
        setNovelties(noveltiesRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos desde la API:", error);
        setNombreGrupo("Grupo Operativo");
        setLoading(false);
      }
    };

    fetchData();
  }, [grupoId]);

  // Manejar creación de nueva novedad (Guardar en MongoDB)
  const handleCreateNovelty = async (e) => {
    e.preventDefault();
    if (!descripcionNovedad.trim()) return;
    if (tipoAfectacion === "colaborador" && !selectedColaborador) return;

    let nombreAfectado = "Novedad General del Grupo";
    let cargoAfectado = "Área / Equipos del Grupo";

    if (tipoAfectacion === "colaborador") {
      const person = groupPersonnel.find(p => p._id === selectedColaborador);
      if (person) {
        nombreAfectado = `${person.nombres} ${person.apellidos}`;
        cargoAfectado = person.cargo || "Operador";
      }
    }

    const motivoFinal = tipoNovedad === "Otro" ? `Otro: ${otroMotivo.trim()}` : tipoNovedad;

    const now = new Date();
    const fechaHora = `${now.toLocaleDateString()} - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const nuevaNovedadData = {
      grupoID: grupoId,
      esGeneralGrupo: tipoAfectacion === "grupo",
      colaboradorNombre: nombreAfectado,
      cargo: cargoAfectado,
      tipo: motivoFinal,
      descripcion: descripcionNovedad,
      administradorReporto: "Ana Brenda Contreras",
      fechaHoraReporte: fechaHora
    };

    try {
      const response = await axios.post("http://localhost:3000/api/novelties", nuevaNovedadData);
      setNovelties([response.data, ...novelties]);

      // Limpiar formulario
      setTipoAfectacion("colaborador");
      setSelectedColaborador("");
      setTipoNovedad("Permiso");
      setOtroMotivo("");
      setDescripcionNovedad("");

      // 🔔 Notificar al footer que cambió el estado de las novedades
      window.dispatchEvent(new Event('noveltyStatusChanged'));

      Swal.fire({
        icon: 'success',
        title: '¡Registrada!',
        text: 'La novedad se ha guardado correctamente.',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error al registrar la novedad en la base de datos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar la novedad.',
        confirmButtonColor: '#00094B'
      });
    }
  };

  const handleSolucionChange = (noveltyId, value) => {
    setSolucionesInput(prev => ({ ...prev, [noveltyId]: value }));
  };

  // Guardar Solución (Actualizar en MongoDB)
  const handleSaveSolution = async (noveltyId) => {
    const textoSolucion = solucionesInput[noveltyId];
    if (!textoSolucion || !textoSolucion.trim()) return;

    const now = new Date();
    const fechaHoraSolucion = `${now.toLocaleDateString()} - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const datosSolucion = {
      texto: textoSolucion,
      administradorSolucion: "Ana Brenda Contreras",
      fechaHoraSolucion: fechaHoraSolucion
    };

    try {
      const response = await axios.put(`http://localhost:3000/api/novelties/${noveltyId}/resolve`, {
        solucion: datosSolucion
      });

      setNovelties(prev => prev.map(item => {
        const currentId = item._id || item.id;
        if (currentId === noveltyId) {
          return response.data.updatedNovelty || {
            ...item,
            estado: "Solucionado",
            solucion: datosSolucion
          };
        }
        return item;
      }));

      setSolucionesInput(prev => ({ ...prev, [noveltyId]: "" }));

      // 🔔 Notificar al footer para actualizar el botón flotante inmediatamente
      window.dispatchEvent(new Event('noveltyStatusChanged'));

      Swal.fire({
        icon: 'success',
        title: '¡Solucionado!',
        text: 'La novedad ha sido marcada como solucionada.',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error al guardar la solución en la base de datos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la solución.',
        confirmButtonColor: '#00094B'
      });
    }
  };

  // 🗑️ ELIMINAR NOVEDAD CON SWEETALERT2
  const handleDeleteNovelty = (noveltyId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la novedad de forma permanente en la base de datos.',
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
          await axios.delete(`http://localhost:3000/api/novelties/${noveltyId}`);
          
          setNovelties(prev => prev.filter(item => (item._id || item.id) !== noveltyId));

          // 🔔 Notificar al footer para actualizar el botón flotante inmediatamente
          window.dispatchEvent(new Event('noveltyStatusChanged'));

          Swal.fire({
            title: '¡Eliminada!',
            text: 'La novedad ha sido eliminada correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (error) {
          console.error("Error al eliminar la novedad:", error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar la novedad. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonColor: '#00094B'
          });
        }
      }
    });
  };

  return (
    <div className="novelties-wrapper">
      <div className="novelties-container">

        {/* 1. FORMULARIO SUPERIOR */}
        <div className="novelties-header-section">
          <div className="novelties-title-box">
            <span className="group-subtitle-tag">Grupo Operativo</span>
            <h3>{nombreGrupo}</h3>
            <p>Centro de control de novedades e incidencias operativas del día actual.</p>
          </div>

          <form onSubmit={handleCreateNovelty} className="quick-novelty-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Tipo de Afectación:</label>
                <select
                  className="form-control"
                  value={tipoAfectacion}
                  onChange={(e) => setTipoAfectacion(e.target.value)}
                >
                  <option value="colaborador">Colaborador Específico</option>
                  <option value="grupo">General del Grupo (Infraestructura / Equipos)</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Motivo de Novedad:</label>
                <select
                  className="form-control"
                  value={tipoNovedad}
                  onChange={(e) => setTipoNovedad(e.target.value)}
                >
                  <option value="Permiso">Permiso</option>
                  <option value="Descanso">Descanso</option>
                  <option value="Incapacidad">Incapacidad</option>
                  <option value="Ausencia">Ausencia</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {tipoNovedad === "Otro" && (
              <div className="form-group">
                <label>Especifique el Motivo:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Calamidad doméstica, retraso de ruta, falla técnica..."
                  value={otroMotivo}
                  onChange={(e) => setOtroMotivo(e.target.value)}
                  required={tipoNovedad === "Otro"}
                />
              </div>
            )}

            {tipoAfectacion === "colaborador" && (
              <div className="form-group">
                <label>Seleccionar Trabajador:</label>
                <select
                  className="form-control"
                  value={selectedColaborador}
                  onChange={(e) => setSelectedColaborador(e.target.value)}
                  required={tipoAfectacion === "colaborador"}
                >
                  <option value="">-- Seleccionar Trabajador del Grupo --</option>
                  {groupPersonnel.map((person) => (
                    <option key={person._id} value={person._id}>
                      {person.nombres} {person.apellidos} ({person.cargo || "Sin Cargo"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Descripción de la Novedad:</label>
              <textarea
                className="form-control textarea-control"
                rows="2"
                placeholder="Detalla lo sucedido..."
                value={descripcionNovedad}
                onChange={(e) => setDescripcionNovedad(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-actions-right">
              <button type="submit" className="btn-create-novelty">
                + Registrar Novedad
              </button>
            </div>
          </form>
        </div>

        {/* 2. TARJETAS DE NOVEDADES */}
        <div className="novelties-grid">
          {loading ? (
            <p className="loading-text">Cargando novedades...</p>
          ) : novelties.length > 0 ? (
            novelties.map((item) => {
              const cardKey = item._id || item.id;
              return (
                <div key={cardKey} className={`novelty-card ${item.estado === 'Solucionado' ? 'card-resolved-border' : ''}`}>
                  
                  <div className="novelty-card-top">
                    <span className={`novelty-badge badge-${item.tipo.startsWith('Otro') ? 'otro' : item.tipo.toLowerCase()}`}>
                      {item.tipo}
                    </span>
                    <div className="card-tags-right">
                      {item.esGeneralGrupo && <span className="general-badge">General Grupo</span>}
                      <span className={`status-tag status-${item.estado.toLowerCase()}`}>
                        {item.estado}
                      </span>
                      {/* Botón de Eliminar con SweetAlert2 */}
                      <button 
                        className="btn-delete-card" 
                        title="Eliminar Novedad"
                        onClick={() => handleDeleteNovelty(cardKey)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="novelty-person-info">
                    <h4>{item.colaboradorNombre}</h4>
                    <p className="person-role">{item.cargo}</p>
                  </div>

                  <div className="novelty-description-box">
                    <p><strong>Incidencia:</strong> {item.descripcion}</p>
                    <span className="report-meta">Reportado por: <strong>{item.administradorReporto}</strong> • {item.fechaHoraReporte}</span>
                  </div>

                  {item.estado === "Pendiente" ? (
                    <div className="solution-input-box">
                      <label>Escribir Solución / Toma de Decisión:</label>
                      <textarea
                        className="form-control solution-textarea"
                        rows="2"
                        placeholder="Indica la resolución aplicada..."
                        value={solucionesInput[cardKey] || ""}
                        onChange={(e) => handleSolucionChange(cardKey, e.target.value)}
                      ></textarea>
                      <button
                        className="action-resolve-btn"
                        onClick={() => handleSaveSolution(cardKey)}
                      >
                        Dar Solución a Novedad
                      </button>
                    </div>
                  ) : (
                    <div className="solution-recorded-box">
                      <div className="solution-recorded-header">
                        <span>✔️ Solución Aplicada</span>
                      </div>
                      <p className="solution-text">{item.solucion?.texto}</p>
                      <div className="solution-meta">
                        <span>Resuelto por: <strong>{item.solucion?.administradorSolucion}</strong></span>
                        <span>🕒 {item.solucion?.fechaHoraSolucion}</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="no-novelties">
              <p>✨ No hay novedades registradas para este grupo el día de hoy.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
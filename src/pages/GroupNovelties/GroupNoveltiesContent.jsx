import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import './GroupNoveltiesContent.css';

/* SERVICIOS */
import { groupsApi } from '../../api/groups';
import { payrollApi } from '../../api/payroll';
import { noveltiesApi } from '../../api/novelties';

/* UTILIDADES */
import { getCurrentUserName } from '../../utils/currentUser';
import { useNoveltyRealtime } from '../../Custom_Hooks/useNoveltyRealtime';

/** Clave estable de una novedad (Mongo usa _id; algunos endpoints devuelven id). */
const getNoveltyId = (item) => String(item?._id || item?.id || '');

/** Fecha y hora local con el mismo formato histórico de la pantalla. */
const formatFechaHora = (date = new Date()) =>
  `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

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

  // Tarjetas recién recibidas por socket (resaltado temporal)
  const [recentIds, setRecentIds] = useState(() => new Set());
  const recentTimers = useRef(new Map());

  const markRecent = useCallback((noveltyId) => {
    const key = String(noveltyId || '');
    if (!key) return;

    setRecentIds(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    const previousTimer = recentTimers.current.get(key);
    if (previousTimer) clearTimeout(previousTimer);

    const timer = setTimeout(() => {
      setRecentIds(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      recentTimers.current.delete(key);
    }, 4000);

    recentTimers.current.set(key, timer);
  }, []);

  // Limpiar los temporizadores de resaltado al desmontar
  useEffect(() => {
    const timers = recentTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  // Recarga la lista del grupo (usada al reconectar y al volver a la pestaña)
  const loadNovelties = useCallback(async () => {
    if (!grupoId) return;
    try {
      const data = await noveltiesApi.getByGroup(grupoId);
      setNovelties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al recargar las novedades del grupo:", error);
    }
  }, [grupoId]);

  // Carga inicial: grupo, personal y novedades
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Nombre del grupo actual
        const groups = await groupsApi.getAll();
        const grupoActual = (Array.isArray(groups) ? groups : [])
          .find(g => String(g._id || g.id) === String(grupoId));

        if (!cancelled) {
          setNombreGrupo(grupoActual?.nombre || grupoActual?.name || "Grupo Operativo");
        }

        // 2. Personal del grupo
        const payroll = await payrollApi.getAll();
        const filteredStaff = (Array.isArray(payroll) ? payroll : [])
          .filter(p => String(p.grupoID) === String(grupoId) || String(p.grupo) === String(grupoId));

        if (!cancelled) setGroupPersonnel(filteredStaff);

        // 3. Novedades del grupo
        const data = await noveltiesApi.getByGroup(grupoId);
        if (!cancelled) setNovelties(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar datos desde la API:", error);
        if (!cancelled) setNombreGrupo("Grupo Operativo");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [grupoId]);

  // Resincronizar al recuperar el foco de la pestaña (por si se perdió un evento)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadNovelties();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [loadNovelties]);

  // Tiempo real: cambios hechos desde cualquier sesión
  useNoveltyRealtime({
    onCreated: (novedad) => {
      const noveltyId = getNoveltyId(novedad);
      if (!noveltyId) return;
      if (String(novedad.grupoID) !== String(grupoId)) return;

      setNovelties(prev => {
        const exists = prev.some(item => getNoveltyId(item) === noveltyId);
        return exists ? prev : [novedad, ...prev];
      });
      markRecent(noveltyId);
    },
    onResolved: (updated) => {
      const noveltyId = getNoveltyId(updated);
      if (!noveltyId) return;
      if (String(updated.grupoID) !== String(grupoId)) return;

      setNovelties(prev =>
        prev.map(item => (getNoveltyId(item) === noveltyId ? updated : item))
      );
    },
    onDeleted: (payload) => {
      const noveltyId = String(payload?.id || payload?._id || '');
      if (!noveltyId) return;
      if (payload?.grupoID && String(payload.grupoID) !== String(grupoId)) return;

      setNovelties(prev => prev.filter(item => getNoveltyId(item) !== noveltyId));
    },
    onResync: loadNovelties,
  });

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

    const nuevaNovedadData = {
      grupoID: grupoId,
      esGeneralGrupo: tipoAfectacion === "grupo",
      colaboradorNombre: nombreAfectado,
      cargo: cargoAfectado,
      tipo: motivoFinal,
      descripcion: descripcionNovedad,
      // Autor real: el usuario que inició sesión y registra la novedad
      administradorReporto: getCurrentUserName(),
      fechaHoraReporte: formatFechaHora()
    };

    try {
      const created = await noveltiesApi.create(nuevaNovedadData);
      const createdId = getNoveltyId(created);

      setNovelties(prev => {
        if (!createdId) return prev;
        const exists = prev.some(item => getNoveltyId(item) === createdId);
        return exists ? prev : [created, ...prev];
      });

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
        text: error.message || 'No se pudo registrar la novedad.',
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

    const datosSolucion = {
      texto: textoSolucion,
      // Autor real de la solución: el usuario que inició sesión
      administradorSolucion: getCurrentUserName(),
      fechaHoraSolucion: formatFechaHora()
    };

    try {
      const response = await noveltiesApi.resolve(noveltyId, { solucion: datosSolucion });
      const updatedNovelty = response?.updatedNovelty;

      setNovelties(prev => prev.map(item => {
        if (getNoveltyId(item) !== String(noveltyId)) return item;

        return updatedNovelty || {
          ...item,
          estado: "Solucionado",
          solucion: datosSolucion
        };
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
        text: error.message || 'No se pudo guardar la solución.',
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
          await noveltiesApi.remove(noveltyId);

          setNovelties(prev => prev.filter(item => getNoveltyId(item) !== String(noveltyId)));

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
            text: error.message || 'No se pudo eliminar la novedad. Inténtalo de nuevo.',
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
              const cardKey = getNoveltyId(item);
              const tipo = item.tipo || 'Otro';
              const estado = item.estado || 'Pendiente';
              const isRecent = recentIds.has(cardKey);
              const tipoClass = tipo.startsWith('Otro') ? 'otro' : tipo.toLowerCase().replace(/\s+/g, '-');

              return (
                <div
                  key={cardKey}
                  className={[
                    'novelty-card',
                    estado === 'Solucionado' ? 'card-resolved-border' : '',
                    isRecent ? 'card-new' : ''
                  ].filter(Boolean).join(' ')}
                >

                  <div className="novelty-card-top">
                    <span className={`novelty-badge badge-${tipoClass}`}>
                      {tipo}
                    </span>
                    <div className="card-tags-right">
                      {item.esGeneralGrupo && <span className="general-badge">General Grupo</span>}
                      <span className={`status-tag status-${estado.toLowerCase()}`}>
                        {estado}
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
                    <span className="report-meta">
                      Reportado por: <strong>{item.administradorReporto || 'No registrado'}</strong> • {item.fechaHoraReporte}
                    </span>
                  </div>

                  {estado === "Pendiente" ? (
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
                        <span>Resuelto por: <strong>{item.solucion?.administradorSolucion || 'No registrado'}</strong></span>
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

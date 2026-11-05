import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './RoutesContent.css';

export default function RoutesContent() {
  // 1. ESTADOS DE CONFIGURACIÓN Y FILTROS
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [horaCorteManana, setHoraCorteManana] = useState('05:00');
  const [horaCorteNoche, setHoraCorteNoche] = useState('23:00');
  
  // Soporte para múltiples destinatarios
  const [correosDestino, setCorreosDestino] = useState('');

  // 2. ESTADOS DE LISTADOS DE TRABAJADORES
  const [personalSugerido, setPersonalSugerido] = useState([]);
  const [personalAprobado, setPersonalAprobado] = useState([]);

  // Estados auxiliares para catálogos (necesarios para calcular horas según el tipo de turno)
  const [programasData, setProgramasData] = useState([]);
  const [programmersData, setProgrammersData] = useState([]);
  const [stacksData, setStacksData] = useState([]);

  // 3. ESTADOS PARA EL MODAL DE ADICIÓN MANUAL POR ÁREAS
  const [mostrarModalManual, setMostrarModalManual] = useState(false);
  const [gruposSistema, setGruposSistema] = useState([]);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState('');
  const [usuariosDelGrupo, setUsuariosDelGrupo] = useState([]);
  
  const [usuarioParaAgregar, setUsuarioParaAgregar] = useState(null);
  const [tipoRutaManual, setTipoRutaManual] = useState('Recogida (Mañana)');
  const [horaManualPersonalizada, setHoraManualPersonalizada] = useState('03:30');

  // 4. ESTADO PARA EL NOMBRE DEL USUARIO LOGUEADO
  const [nombreUsuarioSesion, setNombreUsuarioSesion] = useState('Gestión Manager');

  // 5. ESTADO PARA EL CUERPO DEL MENSAJE EDITABLE
  const [cuerpoCorreo, setCuerpoCorreo] = useState('');

  // Cargar usuario autenticado desde el localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('userAuth');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const fullName = `${parsed.nombres || parsed.nombre || ''} ${parsed.apellidos || ''}`.trim();
        if (fullName) {
          setNombreUsuarioSesion(fullName);
        }
      } catch (err) {
        console.error("Error al parsear usuario de localStorage:", err);
      }
    }
  }, []);

  // Cargar catálogos de apoyo (Programas, Programmers, Stacks) para resolver horas según el tipo
  useEffect(() => {
    axios.get('http://localhost:3000/api/groups')
      .then(res => setGruposSistema(res.data))
      .catch(err => console.error("Error al obtener grupos:", err));

    axios.get('http://localhost:3000/api/programs')
      .then(res => setProgramasData(res.data))
      .catch(err => console.error("Error al obtener programas:", err));

    axios.get('http://localhost:3000/api/programmer')
      .then(res => setProgrammersData(res.data))
      .catch(err => console.error("Error al obtener programmers:", err));

    axios.get('http://localhost:3000/api/stacks')
      .then(res => setStacksData(res.data))
      .catch(err => console.error("Error al obtener stacks:", err));
  }, []);

  // Cargar usuarios del grupo seleccionado en el modal
  useEffect(() => {
    if (!grupoSeleccionadoId) {
      setUsuariosDelGrupo([]);
      return;
    }
    axios.get(`http://localhost:3000/api/payroll/idGroup/${grupoSeleccionadoId}`)
      .then(res => setUsuariosDelGrupo(res.data || []))
      .catch(err => console.error("Error al obtener usuarios del grupo:", err));
  }, [grupoSeleccionadoId]);

  // Cargar turnos desde la BD al cambiar la fecha o las horas límite (y asegurando catálogos listos)
  useEffect(() => {
    obtenerSugeridosPorRuta();
    // Dependencias intencionales: se recalcula al cambiar fecha/horas/catalogos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaSeleccionada, horaCorteManana, horaCorteNoche, programasData, programmersData, stacksData]);

  // Autogenerar plantilla por defecto al cambiar aprobados, fecha o usuario
  useEffect(() => {
    let textoPorDefecto = `Estimado equipo,\n\nA continuación se detalla el listado oficial del personal aprobado para el servicio de ruta de transporte correspondiente al día ${fechaSeleccionada}:\n\n`;
    
    personalAprobado.forEach((item, index) => {
      textoPorDefecto += `${index + 1}. Colaborador: ${item.nombres}\n   - Turno/Evento: ${item.evento}\n   - Horario (In/Out): In: ${item.inicio} | Out: ${item.salida}\n   - Tipo de Servicio: ${item.tipoRuta}\n\n`;
    });

    textoPorDefecto += `Total de pasajeros aprobados: ${personalAprobado.length}\n\nAtentamente,\n${nombreUsuarioSesion}\nGestión Manager Citytv`;
    
    setCuerpoCorreo(textoPorDefecto);
  }, [personalAprobado, fechaSeleccionada, nombreUsuarioSesion]);

  // -----------------------------------------------------------------------------------------
  // FUNCIONES AUXILIARES PARA RESOLVER HORAS SEGÚN EL TIPO DE TURNO (Inspirado en Listado.jsx)
  // -----------------------------------------------------------------------------------------
  const formatearFechaAHoraStr = (fechaInput) => {
    if (!fechaInput) return null;
    try {
      const fechaObj = new Date(fechaInput);
      if (isNaN(fechaObj.getTime())) return null;
      const h = String(fechaObj.getUTCHours()).padStart(2, '0');
      const m = String(fechaObj.getUTCMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    } catch (e) {
      return null;
    }
  };

  const convertirHoraAMinutos = (horaStr) => {
    if (!horaStr || !horaStr.includes(':')) return -1;
    const [h, m] = horaStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Extrae la hora de inicio efectiva dependiendo del tipo de turno (Programa, Programmer, Custom, etc.)
  const resolverHoraInicioTurno = (turno) => {
    const tipo = turno.Type;
    let fechaInicioBase = turno.Inicio_main;

    if (tipo === "Programa" && turno.Event_name) {
      const prog = programasData.find(p => p._id === turno.Event_name);
      if (prog && prog.Start) fechaInicioBase = prog.Start;
    } else if (tipo === "Programmer" && turno.Event_name) {
      const progm = programmersData.find(pr => pr._id === turno.Event_name);
      if (progm && progm.Start) fechaInicioBase = progm.Start;
    } else if (tipo === "Secondary" && turno.Event_name) {
      const prog = programasData.find(p => p._id === turno.Event_name);
      if (prog && prog.Start) fechaInicioBase = prog.Start;
    }

    return formatearFechaAHoraStr(fechaInicioBase);
  };

  // Extrae la hora de salida efectiva dependiendo del tipo de turno y su Out / Stacks
  const resolverHoraSalidaTurno = (turno) => {
    const tipo = turno.Type;
    let fechaSalidaBase = turno.Out;

    if (tipo === "Programa" && turno.Event_name) {
      const prog = programasData.find(p => p._id === turno.Event_name);
      if (prog && prog.End) fechaSalidaBase = prog.End;
    } else if (tipo === "Programmer" && turno.Event_name) {
      const progm = programmersData.find(pr => pr._id === turno.Event_name);
      if (progm && progm.End) fechaSalidaBase = progm.End;
    } else if (tipo === "Secondary" && turno.Event_name) {
      const prog = programasData.find(p => p._id === turno.Event_name);
      if (prog && prog.End) fechaSalidaBase = prog.End;
    }

    if (!fechaSalidaBase || fechaSalidaBase === "------") return null;
    return formatearFechaAHoraStr(fechaSalidaBase);
  };

  // -----------------------------------------------------------------------------------------
  // LÓGICA PRINCIPAL DE OBTENCIÓN Y EVALUACIÓN DE SUGERIDOS
  // -----------------------------------------------------------------------------------------
  const obtenerSugeridosPorRuta = () => {
    axios.get(`http://localhost:3000/api/shifts/routes/by-date?fecha=${fechaSeleccionada}`)
      .then(res => {
        const turnosDelDia = res.data || [];
        
        const corteMananaMin = convertirHoraAMinutos(horaCorteManana);
        const corteNocheMin = convertirHoraAMinutos(horaCorteNoche);
        
        const registrosPorUsuario = {};

        turnosDelDia.forEach((turno) => {
          const userId = turno.ID_user;
          if (!userId) return;

          if (!registrosPorUsuario[userId]) {
            registrosPorUsuario[userId] = {
              idUser: userId,
              nombres: turno.Nombres || "Colaborador",
              eventos: [],
              horasValidas: []
            };
          }

          registrosPorUsuario[userId].eventos.push(turno.Event_name || "Turno");

          // Resolver hora de inicio aplicando la lógica por tipo de turno
          const horaInicioStr = resolverHoraInicioTurno(turno);
          const minInicio = convertirHoraAMinutos(horaInicioStr);
          if (minInicio !== -1) {
            registrosPorUsuario[userId].horasValidas.push({
              str: horaInicioStr,
              min: minInicio,
              origen: 'inicio'
            });
          }

          // Resolver hora de salida aplicando la lógica por tipo de turno
          const horaSalidaStr = resolverHoraSalidaTurno(turno);
          const minSalida = convertirHoraAMinutos(horaSalidaStr);
          if (minSalida !== -1) {
            registrosPorUsuario[userId].horasValidas.push({
              str: horaSalidaStr,
              min: minSalida,
              origen: 'salida'
            });
          }
        });

        const mapaElegibles = new Map();

        Object.values(registrosPorUsuario).forEach(userObj => {
          if (userObj.horasValidas.length === 0) return;

          // Ordenar cronológicamente todas las horas del día de menor a mayor
          userObj.horasValidas.sort((a, b) => a.min - b.min);

          const menorHora = userObj.horasValidas[0]; // Primer ingreso del día
          const mayorHora = userObj.horasValidas[userObj.horasValidas.length - 1]; // Última salida del día

          let tipoRutaAsignada = "";
          let horaFinalMostrar = "";

          if (menorHora.min <= corteMananaMin) {
            tipoRutaAsignada = 'Recogida (Mañana)';
            horaFinalMostrar = menorHora.str;
          } else if (mayorHora.min >= corteNocheMin) {
            tipoRutaAsignada = 'Llevada (Noche)';
            horaFinalMostrar = mayorHora.str;
          }

          if (tipoRutaAsignada) {
            mapaElegibles.set(userObj.idUser, {
              idUser: userObj.idUser,
              nombres: userObj.nombres,
              evento: [...new Set(userObj.eventos)].join(', '),
              inicio: tipoRutaAsignada.includes('Mañana') ? horaFinalMostrar : (menorHora.str || '--:--'),
              salida: tipoRutaAsignada.includes('Noche') ? horaFinalMostrar : (mayorHora.str || '------'),
              tipoRuta: tipoRutaAsignada,
              esManual: false
            });
          }
        });

        setPersonalSugerido(Array.from(mapaElegibles.values()));
      })
      .catch(err => {
        console.error("Error al consultar turnos para ruta:", err);
        toast.error("Error al consultar los turnos del día seleccionado", { id: 'error-turnos' });
      });
  };

  const transferirAAprobados = (trabajador) => {
    if (personalAprobado.some(p => String(p.idUser) === String(trabajador.idUser))) {
      toast.error(`${trabajador.nombres} ya está en el listado de aprobados.`, { id: 'error-duplicado' });
      return;
    }

    setPersonalAprobado(prev => [...prev, trabajador]);
    setPersonalSugerido(prev => prev.filter(p => String(p.idUser) !== String(trabajador.idUser)));
    toast.success(`${trabajador.nombres} agregado a la ruta.`, { id: 'success-add' });
  };

  const removerDeAprobados = (trabajador) => {
    setPersonalAprobado(prev => prev.filter(p => String(p.idUser) !== String(trabajador.idUser)));
    if (!trabajador.esManual) {
      setPersonalSugerido(prev => [...prev, trabajador]);
    }
    toast.success(`${trabajador.nombres} removido de la lista de ruta.`, { id: 'info-remove' });
  };

  const handleConfirmarAdicionManual = (e) => {
    e.preventDefault();
    if (!usuarioParaAgregar) return;

    const uId = String(usuarioParaAgregar._id || usuarioParaAgregar.id);
    if (personalAprobado.some(p => String(p.idUser) === uId)) {
      toast.error("El usuario ya se encuentra en la lista de aprobados.", { id: 'error-manual-dup' });
      return;
    }

    const nuevoItem = {
      idUser: uId,
      nombres: `${usuarioParaAgregar.nombres} ${usuarioParaAgregar.apellidos || ''}`.trim(),
      evento: "Asignación Manual con Hora Fix",
      inicio: tipoRutaManual.includes('Mañana') ? horaManualPersonalizada : '--:--',
      salida: tipoRutaManual.includes('Noche') ? horaManualPersonalizada : '--:--',
      tipoRuta: tipoRutaManual,
      esManual: true
    };

    setPersonalAprobado(prev => [...prev, nuevoItem]);
    toast.success(`${nuevoItem.nombres} agregado manualmente con hora de ruta fijada.`, { id: 'success-manual' });
    setUsuarioParaAgregar(null);
  };

  const handleGenerarPDF = () => {
    if (personalAprobado.length === 0) {
      toast.error("No hay personal en el listado final para generar el PDF.", { id: 'error-pdf-empty' });
      return;
    }
    
    toast.loading("Generando documento PDF de rutas...", { id: 'loading-pdf' });
    axios.post('http://localhost:3000/api/routes/pdf', {
      fecha: fechaSeleccionada,
      personal: personalAprobado
    }, { responseType: 'blob' })
    .then(res => {
      toast.dismiss('loading-pdf');
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ruta_Personal_${fechaSeleccionada}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("PDF descargado correctamente.", { id: 'success-pdf' });
    })
    .catch(err => {
      toast.dismiss('loading-pdf');
      console.error("Error al generar PDF:", err);
      toast.error("No se pudo generar el PDF.", { id: 'error-pdf' });
    });
  };

  const handleAbrirGestorCorreo = (e) => {
    e.preventDefault();
    
    if (!correosDestino.trim()) {
      toast.error("Por favor ingresa al menos un correo electrónico de destino.", { id: 'error-email-empty' });
      return;
    }

    if (personalAprobado.length === 0) {
      toast.error("No hay personal aprobado en el listado para enviar.", { id: 'error-aprobados-empty' });
      return;
    }

    const destinatariosLimpios = correosDestino
      .split(/[,;]/)
      .map(email => email.trim())
      .filter(email => email !== '')
      .join(',');

    const asunto = encodeURIComponent(`Programación de Rutas de Transporte - Fecha: ${fechaSeleccionada}`);
    const cuerpo = encodeURIComponent(cuerpoCorreo);

    window.location.href = `mailto:${destinatariosLimpios}?subject=${asunto}&body=${cuerpo}`;
    toast.success("Abriendo gestor de correo con tu mensaje personalizado...", { id: 'success-email' });
  };

  return (
    <div className="routes-wrapper">
      <div className="routes-main-container">

        {/* 1. HERO BANNER DE CONFIGURACIÓN */}
        <div className="routes-hero-banner">
          <div className="hero-text">
            <h2>Gestión de Rutas de Transporte</h2>
            <p>Control y asignación de servicios de recogida y llevada para el personal corporativo.</p>
          </div>
          
          <div className="routes-config-controls">
            <div className="config-group">
              <label>📅 Fecha</label>
              <input 
                type="date" 
                value={fechaSeleccionada} 
                onChange={(e) => setFechaSeleccionada(e.target.value)} 
              />
            </div>
            <div className="config-group">
              <label>⏰ Límite Mañana (≤)</label>
              <input 
                type="time" 
                value={horaCorteManana} 
                onChange={(e) => setHoraCorteManana(e.target.value)} 
              />
            </div>
            <div className="config-group">
              <label>⏰ Límite Noche (≥)</label>
              <input 
                type="time" 
                value={horaCorteNoche} 
                onChange={(e) => setHoraCorteNoche(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* 2. TARJETAS DE IMPACTO (MÉTRICAS) */}
        <div className="routes-cards-grid">
          <div className="routes-metric-card">
            <div className="card-top">
              <h3>Personal Sugerido</h3>
              <span className="card-number">{personalSugerido.length}</span>
            </div>
            <div className="card-subtext">Cumplen con turno de ruta</div>
          </div>

          <div className="routes-metric-card">
            <div className="card-top">
              <h3>Personal Aprobado</h3>
              <span className="card-number text-green">{personalAprobado.length}</span>
            </div>
            <div className="card-subtext">Listos para generación y envío</div>
          </div>
        </div>

        {/* 3. PANEL PRINCIPAL DE TRANSFERENCIA (DOS LISTADOS) */}
        <div className="routes-dual-section">
          
          {/* LISTADO 1: SUGERIDOS */}
          <div className="routes-panel-box">
            <div className="panel-box-header">
              <h3>Personal Sugerido por Horario</h3>
              <span className="badge-count">{personalSugerido.length}</span>
            </div>
            <div className="panel-instruction">
              💡 Haz <strong>doble clic</strong> sobre un colaborador para pasarlo al listado final.
            </div>

            <div className="routes-list-container">
              {personalSugerido.length === 0 ? (
                <div className="empty-state">No hay turnos que califiquen para ruta en esta fecha.</div>
              ) : (
                personalSugerido.map((item) => (
                  <div 
                    key={item.idUser} 
                    className="worker-row-item"
                    onDoubleClick={() => transferirAAprobados(item)}
                    title="Doble clic para aprobar"
                  >
                    <div className="worker-details">
                      <span className="w-name">{item.nombres}</span>
                      <span className="w-event">{item.evento}</span>
                    </div>
                    <div className="worker-meta">
                      <span className="w-time">In: {item.inicio} | Out: {item.salida}</span>
                      <span className={`w-badge ${item.tipoRuta.includes('Mañana') ? 'badge-morning' : 'badge-night'}`}>
                        {item.tipoRuta}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LISTADO 2: PERSONAL APROBADO */}
          <div className="routes-panel-box">
            <div className="panel-box-header">
              <h3>Personal que Aplica (Aprobados)</h3>
              <button className="btn-add-manual" onClick={() => { setUsuarioParaAgregar(null); setMostrarModalManual(true); }}>
                + Agregar Manual
              </button>
            </div>
            <div className="panel-instruction">
              💡 Listado final oficial. Doble clic o ✕ para remover.
            </div>

            <div className="routes-list-container">
              {personalAprobado.length === 0 ? (
                <div className="empty-state">El listado final está vacío.</div>
              ) : (
                personalAprobado.map((item) => (
                  <div 
                    key={item.idUser} 
                    className="worker-row-item approved-row"
                    onDoubleClick={() => removerDeAprobados(item)}
                    title="Doble clic para quitar"
                  >
                    <div className="worker-details">
                      <span className="w-name">{item.nombres}</span>
                      <span className="w-event">{item.evento}</span>
                    </div>
                    <div className="worker-meta">
                      <span className="w-time">In: {item.inicio} | Out: {item.salida}</span>
                      <span className="w-badge badge-approved">{item.tipoRuta}</span>
                      <button className="btn-remove-item" onClick={() => removerDeAprobados(item)}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* 4. SECCIÓN INFERIOR DE ACCIONES (CORREOS MÚLTIPLES + TEXTAREA EDITABLE + PDF) */}
        <div className="routes-actions-footer">
          <form className="footer-email-form" onSubmit={handleAbrirGestorCorreo} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.8rem', width: '100%' }}>
              <input 
                type="text" 
                placeholder="Destinatarios (ej: correo1@empresa.com, correo2@empresa.com)..." 
                value={correosDestino}
                onChange={(e) => setCorreosDestino(e.target.value)}
                style={{ flex: 1 }}
                title="Puedes separar varios correos con comas (,) o punto y coma (;)"
              />
              <button type="submit" className="btn-action-primary">
                ✉️ Abrir Gestor y Enviar
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
                ✏️ Cuerpo del mensaje (Editable con firma automática de sesión):
              </label>
              <textarea 
                value={cuerpoCorreo}
                onChange={(e) => setCuerpoCorreo(e.target.value)}
                rows={7}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  background: '#f8fafc',
                  color: '#1e293b',
                  resize: 'vertical'
                }}
              />
            </div>
          </form>

          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '0.5rem' }}>
            <button type="button" className="btn-action-secondary" onClick={handleGenerarPDF}>
              📄 Generar PDF de Rutas
            </button>
          </div>
        </div>

      </div>

      {/* MODAL DE ADICIÓN MANUAL FILTRADO POR ÁREA CON HORA FIJADA */}
      {mostrarModalManual && (
        <div className="routes-modal-overlay">
          <div className="routes-modal-box" style={{ width: '550px' }}>
            <h3>Agregar Colaborador Manualmente por Área</h3>
            
            {!usuarioParaAgregar ? (
              <>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Seleccione el Grupo o Área</label>
                  <select 
                    value={grupoSeleccionadoId} 
                    onChange={(e) => setGrupoSeleccionadoId(e.target.value)}
                    className="modal-search-input"
                  >
                    <option value="">----- Seleccione un área -----</option>
                    {gruposSistema.map(g => (
                      <option key={g._id || g.id} value={g._id || g.id}>
                        {g.nombre || g.name || g.grupo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-users-scroll">
                  {usuariosDelGrupo.length === 0 ? (
                    <div className="empty-state">Seleccione un área para ver sus colaboradores.</div>
                  ) : (
                    usuariosDelGrupo.map(user => (
                      <div key={user._id || user.id} className="modal-user-row">
                        <span>{user.nombres} {user.apellidos}</span>
                        <button 
                          type="button" 
                          onClick={() => setUsuarioParaAgregar(user)}
                        >
                          Seleccionar Hora ➔
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <form onSubmit={handleConfirmarAdicionManual}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Colaborador seleccionado:</p>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{usuarioParaAgregar.nombres} {usuarioParaAgregar.apellidos}</strong>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Tipo de Ruta Manual</label>
                  <select 
                    value={tipoRutaManual} 
                    onChange={(e) => setTipoRutaManual(e.target.value)}
                    className="modal-search-input"
                  >
                    <option value="Recogida (Mañana)">Recogida (Mañana)</option>
                    <option value="Llevada (Noche)">Llevada (Noche)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Fijar Hora de Ruta Manualmente</label>
                  <input 
                    type="time" 
                    value={horaManualPersonalizada} 
                    onChange={(e) => setHoraManualPersonalizada(e.target.value)}
                    className="modal-search-input"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => setUsuarioParaAgregar(null)}
                  >
                    Volver a la lista
                  </button>
                  <button 
                    type="submit" 
                    className="btn-add-manual"
                  >
                    Confirmar y Agregar
                  </button>
                </div>
              </form>
            )}

            <div className="modal-footer-actions" style={{ marginTop: '1rem' }}>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => { setMostrarModalManual(false); setUsuarioParaAgregar(null); }}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
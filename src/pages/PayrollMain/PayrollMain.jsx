/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import './PayrollMain.css';

export default function PayrollMain() {
  const [payrollData, setPayrollData] = useState([]);
  const [groupsData, setGroupsData] = useState([]);
  const [permissionsData, setPermissionsData] = useState([]);
  const [breaksData, setBreaksData] = useState([]);
  const [incapacityData, setIncapacityData] = useState([]);
  const [recessData, setRecessData] = useState([]);
  const [licensesData, setLicensesData] = useState([]);
  const [selectedHour, setSelectedHour] = useState("08:00"); // Hora seleccionada para la línea de tiempo

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payroll, groups, permissions, breaks, incapacity, recess, licenses] = await Promise.all([
          axios.get("http://localhost:3000/api/payroll"),
          axios.get("http://localhost:3000/api/groups"),
          axios.get("http://localhost:3000/api/permissions/"),
          axios.get("http://localhost:3000/api/breaks/"),
          axios.get("http://localhost:3000/api/incapacitys"),
          axios.get("http://localhost:3000/api/recess"),
          axios.get("http://localhost:3000/api/licenses")
        ]);

        setPayrollData(payroll.data);
        setGroupsData(groups.data);
        setPermissionsData(permissions.data);
        setBreaksData(breaks.data);
        setIncapacityData(incapacity.data);
        setRecessData(recess.data);
        setLicensesData(licenses.data);
      } catch (error) {
        console.error("Error al cargar los datos del dashboard de payroll:", error);
      }
    };

    fetchData();
  }, []);

  const totalPersonal = payrollData.length || 1;
  const totalActivos = payrollData.filter(p => p.activo === true).length;
  const totalInactivos = payrollData.filter(p => p.activo === false).length;

  const getPercentage = (count) => Math.round((count / totalPersonal) * 100);

  // Filtrar solo personal activo y buscar la información de su grupo asociado
  const activePersonnel = payrollData.filter(p => p.activo === true);

  const getGroupInfo = (groupId) => {
    return groupsData.find(g => g._id === groupId) || { nombre: "Sin Grupo", logo: "/src/assets/Default.svg" };
  };

  return (
    <div className="payroll-wrapper">
      <div className="payroll-main-container">
        
        {/* Cabecera Hero */}
        <div className="payroll-hero-banner">
          <div className="hero-text">
            <h2>Centro de Control de Personal</h2>
            <p>Monitoreo en tiempo real de asistencia, novedades y turnos activos.</p>
          </div>
          <div className="hero-badge">
            <span>Total Colaboradores: <strong>{payrollData.length}</strong></span>
          </div>
        </div>

        {/* Tarjetas de Contadores de Alto Impacto */}
        <div className="payroll-cards-grid">
          <div className="payroll-card card-active">
            <div className="card-top">
              <h3>Activos</h3>
              <span className="card-number">{totalActivos}</span>
            </div>
            <div className="card-progress-bar">
              <div className="progress-fill fill-active" style={{ width: `${getPercentage(totalActivos)}%` }}></div>
            </div>
            <span className="card-subtext">{getPercentage(totalActivos)}% del total general</span>
          </div>

          <div className="payroll-card card-inactive">
            <div className="card-top">
              <h3>Inactivos</h3>
              <span className="card-number">{totalInactivos}</span>
            </div>
            <div className="card-progress-bar">
              <div className="progress-fill fill-inactive" style={{ width: `${getPercentage(totalInactivos)}%` }}></div>
            </div>
            <span className="card-subtext">{getPercentage(totalInactivos)}% del total general</span>
          </div>

          <div className="payroll-card card-vacation">
            <div className="card-top">
              <h3>Vacaciones</h3>
              <span className="card-number">{recessData.length}</span>
            </div>
            <div className="card-progress-bar">
              <div className="progress-fill fill-vacation" style={{ width: `${getPercentage(recessData.length)}%` }}></div>
            </div>
            <span className="card-subtext">Ausencias programadas</span>
          </div>

          <div className="payroll-card card-break">
            <div className="card-top">
              <h3>Descensos / Breaks</h3>
              <span className="card-number">{breaksData.length}</span>
            </div>
            <div className="card-progress-bar">
              <div className="progress-fill fill-break" style={{ width: `${getPercentage(breaksData.length)}%` }}></div>
            </div>
            <span className="card-subtext">En descanso actual</span>
          </div>

          <div className="payroll-card card-permission">
            <div className="card-top">
              <h3>Permisos</h3>
              <span className="card-number">{permissionsData.length}</span>
            </div>
            <div className="card-progress-bar">
              <div className="progress-fill fill-permission" style={{ width: `${getPercentage(permissionsData.length)}%` }}></div>
            </div>
            <span className="card-subtext">Autorizados</span>
          </div>

          <div className="payroll-card card-license">
            <div className="card-top">
              <h3>Licencias</h3>
              <span className="card-number">{licensesData.length}</span>
            </div>
            <div className="card-progress-bar">
              <div className="progress-fill fill-license" style={{ width: `${getPercentage(licensesData.length)}%` }}></div>
            </div>
            <span className="card-subtext">Registradas en sistema</span>
          </div>
        </div>

        {/* Sección Interactiva: Personal en Turno por Hora del Día */}
        <div className="payroll-shift-section">
          <div className="shift-section-header">
            <h3>Personal en Turno por Hora del Día</h3>
            <div className="hour-selector-preview">
              <span>Hora activa: <strong>{selectedHour}</strong></span>
            </div>
          </div>

          {/* Línea de tiempo / Selector de horas */}
          <div className="shift-timeline-bar">
            {["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"].map((hour) => (
              <button 
                key={hour} 
                className={`time-node ${selectedHour === hour ? 'active-node' : ''}`}
                onClick={() => setSelectedHour(hour)}
              >
                {hour}
              </button>
            ))}
          </div>

          <div className="shift-live-indicator">
            <span className="pulsing-dot"></span>
            <span>Mostrando personal activo y asignaciones para las <strong>{selectedHour}</strong></span>
          </div>

          {/* Tabla estilizada de personal en turno */}
          <div className="shift-table-container">
            <table className="shift-table">
              <thead>
                <tr>
                  <th>Grupo / Área</th>
                  <th>Colaborador</th>
                  <th>Cargo</th>
                  <th>Programa / Turno (Provisional)</th>
                  <th>Estado a las {selectedHour}</th>
                </tr>
              </thead>
              <tbody>
                {activePersonnel.length > 0 ? (
                  activePersonnel.map((person) => {
                    const group = getGroupInfo(person.grupoID);
                    return (
                      <tr key={person._id}>
                        <td className="group-cell">
                          <img src={group.logo} alt={group.nombre} className="table-group-logo" />
                          <span>{group.nombre}</span>
                        </td>
                        <td className="person-name-cell">
                          {person.nombres} {person.apellidos}
                        </td>
                        <td>
                          <span className="cargo-badge">{person.cargo || "N/A"}</span>
                        </td>
                        <td className="program-provisional">
                          Nombre del programa <em>(Pendiente de tabla)</em>
                        </td>
                        <td>
                          <span className="status-pill active-pill">En Turno</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data-row">No hay personal activo registrado para mostrar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
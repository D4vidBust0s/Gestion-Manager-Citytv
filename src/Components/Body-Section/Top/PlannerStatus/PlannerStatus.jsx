import { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiX,
} from 'react-icons/fi';
import { FechaBarraContext } from '../../../../context/FechaBarraProvider';
import { AuxSustitutions } from '../../../../context/AuxSustitutionsProvider';
import { PronosticoContext } from '../../../../context/PronosticoTurnosProvider';
import { usePlannerCoverage } from '../../../../Custom_Hooks/usePlannerCoverage';
import './PlannerStatus.css';

const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return 'Fecha no disponible';

  return valor.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatearHora = (fecha) => {
  if (!fecha) return 'Sin actualizar';

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return 'Sin actualizar';

  return valor.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const estadoDelPorcentaje = (porcentaje) => {
  if (porcentaje === null || porcentaje === undefined) return 'sin-datos';
  if (porcentaje >= 100) return 'completo';
  if (porcentaje >= 80) return 'parcial';

  return 'critico';
};

const textoPorcentaje = (porcentaje) =>
  porcentaje === null || porcentaje === undefined ? '—' : `${porcentaje}%`;

export default function PlannerStatus() {
  const [abierto, setAbierto] = useState(false);
  const [fechaContexto] = useContext(FechaBarraContext) ?? [];
  const [auxSustituciones] = useContext(AuxSustitutions) ?? [];
  const [auxiliar] = useContext(PronosticoContext) ?? [];
  const cerrarRef = useRef(null);
  const auxiliaresRef = useRef({
    sustituciones: auxSustituciones,
    descansos: auxiliar,
  });

  const fechaSeleccionada = fechaContexto
    ? new Date(fechaContexto)
    : new Date();

  const { resumen, cargando, error, actualizadoEn, recargar } =
    usePlannerCoverage({ fecha: fechaSeleccionada });

  const totales = resumen?.totales;
  const porcentaje = totales?.porcentaje ?? null;
  const pendientes = totales?.pendientes ?? 0;
  const estado = estadoDelPorcentaje(porcentaje);
  const estadoBadge = !resumen && error ? 'critico' : estado;
  const valorBadge =
    !resumen && cargando ? '…' : !resumen && error ? '!' : textoPorcentaje(porcentaje);
  const textoBadge =
    !resumen && cargando
      ? 'Evaluando…'
      : !resumen && error
        ? 'Sin evaluar'
        : `${pendientes} pendientes`;

  const gruposConPersonal = resumen
    ? resumen.porGrupo.filter((grupo) => grupo.personal > 0)
    : [];
  const gruposVacios = resumen
    ? resumen.porGrupo.length - gruposConPersonal.length
    : 0;

  useEffect(() => {
    if (!abierto) return undefined;

    const anterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    if (cerrarRef.current) cerrarRef.current.focus();

    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') setAbierto(false);
    };

    document.addEventListener('keydown', alPresionarTecla);

    return () => {
      document.removeEventListener('keydown', alPresionarTecla);
      document.body.style.overflow = overflowAnterior;
      if (anterior instanceof HTMLElement) anterior.focus();
    };
  }, [abierto]);

  // Las sustituciones y los descansos avisan al resto del sistema; el control
  // aprovecha esos mismos avisos para refrescar su evaluación.
  useEffect(() => {
    const anterior = auxiliaresRef.current;
    const actual = {
      sustituciones: auxSustituciones,
      descansos: auxiliar,
    };

    auxiliaresRef.current = actual;

    if (
      anterior.sustituciones !== actual.sustituciones ||
      anterior.descansos !== actual.descansos
    ) {
      recargar();
    }
  }, [auxSustituciones, auxiliar, recargar]);

  const cerrar = () => setAbierto(false);

  const abrirPanel = () => {
    setAbierto(true);
    recargar();
  };

  const alHacerClicEnFondo = (evento) => {
    if (evento.target === evento.currentTarget) cerrar();
  };

  const portal = document.getElementById('portal') ?? document.body;
  const fechaMostrada = resumen?.fecha ?? fechaSeleccionada;

  return (
    <>
      <button
        type="button"
        className={`planner-status planner-status--${estadoBadge}${
          cargando ? ' planner-status--cargando' : ''
        }`}
        onClick={abrirPanel}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-busy={cargando}
        aria-label={`Estado del MainPlanner: ${
          porcentaje === null ? 'sin datos completos' : `${porcentaje}% de cobertura`
        }, ${pendientes} pendientes. Abrir detalle.`}
        title="Estado del MainPlanner"
        style={{ '--progreso': `${porcentaje ?? 0}%` }}
      >
        <span className="planner-status__ring" aria-hidden="true">
          <span className="planner-status__ring-value">{valorBadge}</span>
        </span>

        <span className="planner-status__copy">
          <span className="planner-status__title">MainPlanner</span>
          <span className="planner-status__pending" aria-live="polite">
            {textoBadge}
          </span>
        </span>
      </button>

      {abierto &&
        createPortal(
          <div className="planner-status-overlay" onMouseDown={alHacerClicEnFondo}>
            <section
              className="planner-status-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="planner-status-title"
              aria-busy={cargando}
            >
              <header className="planner-status-panel__header">
                <div>
                  <span className="planner-status-panel__eyebrow">
                    MainPlanner · control de cobertura
                  </span>
                  <h2 id="planner-status-title">Estado del MainPlanner</h2>
                  <p className="planner-status-panel__date">
                    {formatearFecha(fechaMostrada)}
                  </p>
                </div>

                <button
                  type="button"
                  className="planner-status-panel__close"
                  onClick={cerrar}
                  ref={cerrarRef}
                  aria-label="Cerrar estado del MainPlanner"
                >
                  <FiX aria-hidden="true" />
                </button>
              </header>

              <div className="planner-status-panel__body">
                {error && (
                  <div className="planner-status-error" role="alert">
                    <FiAlertTriangle aria-hidden="true" />
                    <div>
                      <strong>
                        {resumen
                          ? 'No se pudo actualizar la evaluación'
                          : 'No se pudo evaluar el MainPlanner'}
                      </strong>
                      <span>{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={recargar}
                      disabled={cargando}
                    >
                      Reintentar
                    </button>
                  </div>
                )}

                {!resumen && cargando && (
                  <div className="planner-status-loading" role="status">
                    <span className="planner-status-spinner" aria-hidden="true" />
                    Calculando la cobertura de la fecha…
                  </div>
                )}

                {!resumen && !cargando && !error && (
                  <div className="planner-status-empty">
                    No hay datos disponibles para evaluar esta fecha.
                  </div>
                )}

                {resumen && (
                  <>
                    <div className="planner-status-summary">
                      <article className="planner-status-card">
                        <span className="planner-status-card__label">
                          Personal activo
                        </span>
                        <strong className="planner-status-card__value">
                          {totales.personal}
                        </strong>
                        <span className="planner-status-card__hint">
                          Reales + UserBalancers
                        </span>
                      </article>

                      <article className="planner-status-card">
                        <span className="planner-status-card__label">
                          Programados
                        </span>
                        <strong className="planner-status-card__value">
                          {totales.programados}
                        </strong>
                        <span className="planner-status-card__hint">
                          Con turno asignado
                        </span>
                      </article>

                      <article className="planner-status-card planner-status-card--ausencia">
                        <span className="planner-status-card__label">
                          Ausencias
                        </span>
                        <strong className="planner-status-card__value">
                          {totales.ausencias}
                        </strong>
                        <span className="planner-status-card__hint">
                          {totales.ausenciasCubiertas} cubiertas ·{' '}
                          {totales.ausenciasPendientes} pendientes
                        </span>
                      </article>

                      <article className="planner-status-card planner-status-card--balancer">
                        <span className="planner-status-card__label">
                          UserBalancers
                        </span>
                        <strong className="planner-status-card__value">
                          {totales.balancers}
                        </strong>
                        <span className="planner-status-card__hint">
                          {totales.balancersCubiertos} cubiertos ·{' '}
                          {totales.balancersPendientes} pendientes
                        </span>
                      </article>

                      <article className="planner-status-card planner-status-card--pendiente">
                        <span className="planner-status-card__label">
                          Pendientes
                        </span>
                        <strong className="planner-status-card__value">
                          {totales.pendientes}
                        </strong>
                        <span className="planner-status-card__hint">
                          Requieren gestión
                        </span>
                      </article>

                      <article className="planner-status-card planner-status-card--cobertura">
                        <span className="planner-status-card__label">
                          Cobertura
                        </span>
                        <strong className="planner-status-card__value">
                          {textoPorcentaje(totales.porcentaje)}
                        </strong>
                        <span className="planner-status-card__hint">
                          Del personal activo
                        </span>
                      </article>
                    </div>

                    <section
                      className="planner-status-types"
                      aria-label="Ausencias por tipo"
                    >
                      {resumen.porTipo.map((tipo) => (
                        <div
                          className="planner-status-type"
                          key={tipo.key}
                          style={{ '--tipo-color': tipo.color }}
                        >
                          <span
                            className="planner-status-type__dot"
                            aria-hidden="true"
                          />
                          <span className="planner-status-type__label">
                            {tipo.label}
                          </span>
                          <strong className="planner-status-type__count">
                            {tipo.cubiertas}/{tipo.total}
                          </strong>
                          {tipo.pendientes > 0 && (
                            <span className="planner-status-type__pending">
                              {tipo.pendientes} pend.
                            </span>
                          )}
                        </div>
                      ))}
                    </section>

                    <section className="planner-status-section">
                      <div className="planner-status-section__heading">
                        <h3>Detalle por grupo</h3>
                        <span>
                          {totales.gruposConPersonal} de {totales.grupos} grupos
                          con personal activo
                        </span>
                      </div>

                      <div className="planner-status-table-wrap">
                        <table className="planner-status-table">
                          <caption className="planner-status-sr">
                            Cobertura del MainPlanner por grupo
                          </caption>
                          <thead>
                            <tr>
                              <th scope="col">Grupo</th>
                              <th scope="col">Personal</th>
                              <th scope="col">Programados</th>
                              <th scope="col">Ausencias (cub./tot.)</th>
                              <th scope="col">Balancers (cub./tot.)</th>
                              <th scope="col">Pendientes</th>
                              <th scope="col">Cobertura</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gruposConPersonal.length === 0 ? (
                              <tr>
                                <td className="planner-status-table__empty" colSpan="7">
                                  No hay personal activo en los grupos
                                  MainPlanner.
                                </td>
                              </tr>
                            ) : (
                              gruposConPersonal.map((grupo) => (
                                <tr key={grupo.id}>
                                  <th scope="row">{grupo.nombre}</th>
                                  <td>{grupo.personal}</td>
                                  <td>{grupo.programados}</td>
                                  <td>
                                    {grupo.ausenciasCubiertas}/{grupo.ausencias}
                                  </td>
                                  <td>
                                    {grupo.balancersCubiertos}/{grupo.balancers}
                                  </td>
                                  <td>
                                    <span
                                      className={
                                        grupo.pendientes > 0
                                          ? 'planner-status-table__pending'
                                          : 'planner-status-table__pending planner-status-table__pending--ok'
                                      }
                                    >
                                      {grupo.pendientes}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      className={`planner-status-table__pct planner-status-table__pct--${estadoDelPorcentaje(
                                        grupo.porcentaje
                                      )}`}
                                    >
                                      {textoPorcentaje(grupo.porcentaje)}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {gruposVacios > 0 && (
                        <p className="planner-status-footnote">
                          {gruposVacios}{' '}
                          {gruposVacios === 1
                            ? 'grupo MainPlanner no tiene'
                            : 'grupos MainPlanner no tienen'}{' '}
                          personal activo y no se listan.
                        </p>
                      )}
                    </section>

                    <section className="planner-status-section">
                      <div className="planner-status-section__heading">
                        <h3>Pendientes ({resumen.pendientes.length})</h3>
                        <span>Lo que falta para llegar al 100%</span>
                      </div>

                      {resumen.pendientes.length === 0 ? (
                        <div className="planner-status-ok">
                          <FiCheckCircle aria-hidden="true" />
                          <div>
                            <strong>Todo el personal está cubierto</strong>
                            <span>
                              No hay turnos, ausencias ni UserBalancers pendientes
                              para esta fecha.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <ul className="planner-status-pending">
                          {resumen.pendientes.map((persona) => (
                            <li
                              className="planner-status-pending__item"
                              key={`${persona.categoria}-${persona.id}`}
                              title={persona.detalle}
                            >
                              <span className="planner-status-pending__name">
                                {persona.nombre}
                              </span>
                              <span className="planner-status-pending__group">
                                {persona.grupoNombre}
                              </span>
                              <span className="planner-status-pending__reason">
                                {persona.motivo}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    {resumen.alertas.length > 0 && (
                      <aside className="planner-status-alert">
                        <FiAlertTriangle aria-hidden="true" />
                        <div>
                          <strong>Alertas</strong>
                          <ul>
                            {resumen.alertas.map((alerta) => (
                              <li key={alerta}>{alerta}</li>
                            ))}
                          </ul>
                        </div>
                      </aside>
                    )}

                    {(totales.inactivos > 0 || totales.excluidos > 0) && (
                      <p className="planner-status-footnote">
                        No evaluados: {totales.inactivos} inactivos ·{' '}
                        {totales.excluidos} fuera de los grupos MainPlanner.
                      </p>
                    )}
                  </>
                )}
              </div>

              <footer className="planner-status-panel__footer">
                <span>
                  {actualizadoEn
                    ? `Actualizado ${formatearHora(actualizadoEn)}`
                    : 'Sin actualizar'}
                  {error && resumen ? ' · con error de actualización' : ''}
                </span>
                <button
                  type="button"
                  className="planner-status-refresh"
                  onClick={recargar}
                  disabled={cargando}
                  title="Volver a evaluar la fecha seleccionada"
                >
                  <FiRefreshCw
                    aria-hidden="true"
                    className={
                      cargando
                        ? 'planner-status-refresh__icon planner-status-refresh__icon--spin'
                        : 'planner-status-refresh__icon'
                    }
                  />
                  {cargando ? 'Actualizando…' : 'Actualizar'}
                </button>
              </footer>
            </section>
          </div>,
          portal
        )}
    </>
  );
}

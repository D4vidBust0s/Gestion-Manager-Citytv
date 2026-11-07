import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiRepeat, FiX } from 'react-icons/fi';
import { isBalancerName, isBalancerUser } from '../../api/payroll';
import { obtenerDetalleAusencia } from '../../utils/absenceStatus';
import './ModalSustitucion.css';

const formatearFecha = (fecha) => {
  if (!fecha) return '—';

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return '—';

  return valor.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatearRango = (registro) => {
  if (!registro) return '';

  const inicio = formatearFecha(registro.FechaInicio ?? registro.fechainicio);
  const fin = formatearFecha(registro.FechaFinal ?? registro.fechafinal);

  if (inicio === '—' && fin === '—') return '';
  if (inicio === fin) return inicio;

  return `${inicio} — ${fin}`;
};

const nombrePersona = (persona) =>
  `${persona?.nombres ?? persona?.Nombres ?? ''} ${
    persona?.apellidos ?? persona?.Apellidos ?? ''
  }`.trim();

const cargoPersona = (persona) => persona?.cargo ?? persona?.Cargo ?? '—';

const buscarGrupo = (grupos, idGrupo) =>
  (Array.isArray(grupos) ? grupos : []).find(
    (grupo) => String(grupo?._id) === String(idGrupo)
  );

export default function ModalSustitucion({
  estado,
  cambiarEstado,
  sustituciones = [],
  grupos = [],
  payroll = [],
  ausencias = {},
  fecha,
}) {
  const cerrarRef = useRef(null);
  const lista = Array.isArray(sustituciones) ? sustituciones : [];

  useEffect(() => {
    if (!estado) return undefined;

    const anterior = document.activeElement;
    if (cerrarRef.current) cerrarRef.current.focus();

    const alPresionarTecla = (evento) => {
      if (evento.key !== 'Escape') return;

      // Evita que el Escape cierre también el ModalPlanner1 que está detrás.
      evento.stopImmediatePropagation();
      cambiarEstado(false);
    };

    document.addEventListener('keydown', alPresionarTecla, true);

    return () => {
      document.removeEventListener('keydown', alPresionarTecla, true);
      if (anterior instanceof HTMLElement) anterior.focus();
    };
  }, [estado, cambiarEstado]);

  if (!estado || lista.length === 0) return null;

  const alHacerClicEnFondo = (evento) => {
    if (evento.target === evento.currentTarget) cambiarEstado(false);
  };

  return (
    <div className="modal-sustitucion-overlay" onMouseDown={alHacerClicEnFondo}>
      <section
        className="modal-sustitucion"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-sustitucion-title"
      >
        <header className="modal-sustitucion__header">
          <div>
            <span className="modal-sustitucion__eyebrow">
              <FiRepeat aria-hidden="true" />
              Sustitución temporal
            </span>
            <h2 id="modal-sustitucion-title">Aviso de sustitución</h2>
            <p className="modal-sustitucion__date">{formatearFecha(fecha)}</p>
          </div>

          <button
            type="button"
            className="modal-sustitucion__close"
            onClick={() => cambiarEstado(false)}
            ref={cerrarRef}
            aria-label="Cerrar aviso de sustitución"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="modal-sustitucion__body">
          {lista.map((sustitucion, indice) => {
            const personaSustituto = payroll.find(
              (persona) =>
                String(persona?._id ?? persona?.id) ===
                String(sustitucion.ID_user_sustituto)
            );
            const personaSustituido = payroll.find(
              (persona) =>
                String(persona?._id ?? persona?.id) ===
                String(sustitucion.ID_user_main)
            );
            const grupoSustituto = buscarGrupo(
              grupos,
              sustitucion.ID_grupo_iz
            );
            const grupoSustituido = buscarGrupo(
              grupos,
              sustitucion.ID_grupo_der
            );
            const detalle = obtenerDetalleAusencia({
              id: sustitucion.ID_user_main,
              fecha: sustitucion.Fecha_dia ?? fecha,
              ausencias,
            });
            const esBalancer =
              isBalancerName(sustitucion.NombreRight) ||
              isBalancerUser(personaSustituido);
            const color = esBalancer
              ? '#641212'
              : detalle?.estado?.color ?? '#DADADA';
            const motivo = esBalancer
              ? 'UserBalancer'
              : detalle?.estado?.label ?? 'Sin ausencia registrada';
            const rango = formatearRango(detalle?.registro);

            const nombreSustituto =
              sustitucion.NombreLeft ||
              nombrePersona(personaSustituto) ||
              '—';
            const nombreSustituido =
              sustitucion.NombreRight ||
              nombrePersona(personaSustituido) ||
              '—';

            return (
              <article
                className="modal-sustitucion__card"
                key={sustitucion._id ?? indice}
                style={{ '--sustitucion-color': color }}
              >
                <div className="modal-sustitucion__card-header">
                  <span
                    className="modal-sustitucion__badge"
                    style={{ color }}
                    aria-hidden="true"
                  >
                    <FiRepeat />
                  </span>
                  <div>
                    <h3>
                      {nombreSustituto} está cubriendo a {nombreSustituido}
                    </h3>
                    <span className="modal-sustitucion__status">
                      Sustitución activa
                    </span>
                  </div>
                </div>

                <div className="modal-sustitucion__grid">
                  <div className="modal-sustitucion__field">
                    <span>Sustituto</span>
                    <strong>{nombreSustituto}</strong>
                    <small>
                      {cargoPersona(personaSustituto)} ·{' '}
                      {grupoSustituto?.nombre ?? '—'}
                    </small>
                  </div>

                  <div className="modal-sustitucion__field">
                    <span>Trabajador sustituido</span>
                    <strong>{nombreSustituido}</strong>
                    <small>
                      {cargoPersona(personaSustituido)} ·{' '}
                      {grupoSustituido?.nombre ?? '—'}
                    </small>
                  </div>

                  <div className="modal-sustitucion__field">
                    <span>Motivo</span>
                    <strong>{motivo}</strong>
                    {rango && <small>{rango}</small>}
                  </div>

                  <div className="modal-sustitucion__field">
                    <span>Fecha de la sustitución</span>
                    <strong>
                      {formatearFecha(
                        sustitucion.Fecha_dia ?? fecha
                      )}
                    </strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="modal-sustitucion__footer">
          <button
            type="button"
            className="modal-sustitucion__btn"
            onClick={() => cambiarEstado(false)}
          >
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}

ModalSustitucion.propTypes = {
  estado: PropTypes.bool,
  cambiarEstado: PropTypes.func.isRequired,
  sustituciones: PropTypes.array,
  grupos: PropTypes.array,
  payroll: PropTypes.array,
  ausencias: PropTypes.object,
  fecha: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
};
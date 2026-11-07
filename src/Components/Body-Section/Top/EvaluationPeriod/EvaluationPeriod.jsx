import { useEvaluationPeriod } from '../../../../Custom_Hooks/useEvaluationPeriod';
import { ESTADOS_PERIODO } from '../../../../utils/evaluationPeriod';
import './EvaluationPeriod.css';

const formatearCorta = (fecha) => {
  if (!fecha) return '—';

  return fecha
    .toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
    .replace(/\s+de\s+/i, ' ')
    .replace('.', '')
    .toUpperCase();
};

const formatearLarga = (fecha) => {
  if (!fecha) return 'fecha no disponible';

  return fecha.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const textoEstado = (periodo, error) => {
  const { estado, inicio, totalDias, diaActual, porcentaje } = periodo;

  switch (estado) {
    case ESTADOS_PERIODO.PROXIMO:
      return `0% · inicia el ${formatearLarga(inicio)}`;
    case ESTADOS_PERIODO.EN_CURSO:
      return `${porcentaje}% · día ${diaActual} de ${totalDias}`;
    case ESTADOS_PERIODO.FINALIZADO:
      return '100% · periodo finalizado';
    default:
      return error
        ? `sin periodo disponible: ${error}`
        : 'sin periodo configurado';
  }
};

const tituloPeriodo = (periodo, error) => {
  const { estado, inicio, fin } = periodo;

  if (estado === ESTADOS_PERIODO.SIN_CONFIGURACION) {
    return `Periodo de evaluación: ${textoEstado(periodo, error)}`;
  }

  return `Periodo de evaluación: ${formatearLarga(
    inicio
  )} — ${formatearLarga(fin)} · ${textoEstado(periodo, error)}${
    error ? ' · sin actualizar' : ''
  }`;
};

export default function EvaluationPeriod() {
  const { periodo, cargando, error } = useEvaluationPeriod();
  const {
    estado,
    inicio,
    fin,
    totalDias,
    diaActual,
    porcentaje,
  } = periodo;

  const sinConfiguracion = estado === ESTADOS_PERIODO.SIN_CONFIGURACION;
  const avance = sinConfiguracion ? 0 : porcentaje;
  const cargandoInicial = cargando && !inicio;
  const valorPorcentaje = cargandoInicial
    ? '…'
    : sinConfiguracion
      ? '—'
      : `${avance}%`;
  const valorAria = cargandoInicial
    ? 'Cargando periodo de evaluación'
    : sinConfiguracion
      ? 'Sin periodo configurado'
      : estado === ESTADOS_PERIODO.PROXIMO
        ? `0%, inicia el ${formatearLarga(inicio)}`
        : estado === ESTADOS_PERIODO.FINALIZADO
          ? '100%, periodo finalizado'
          : `${avance}%, día ${diaActual} de ${totalDias}`;

  return (
    <span
      className={`evaluation-period evaluation-period--${estado}${
        cargandoInicial ? ' evaluation-period--cargando' : ''
      }`}
      role="progressbar"
      aria-label="Periodo de evaluación"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={avance}
      aria-valuetext={valorAria}
      aria-busy={cargando}
      title={
        cargandoInicial
          ? 'Cargando periodo de evaluación…'
          : tituloPeriodo(periodo, error)
      }
    >
      <span className="evaluation-period__head">
        <span className="evaluation-period__label">Periodo de evaluación</span>
        <span className="evaluation-period__pct">{valorPorcentaje}</span>
      </span>

      <span className="evaluation-period__line">
        <span className="evaluation-period__date">
          {formatearCorta(inicio)}
        </span>

        <span className="evaluation-period__track" aria-hidden="true">
          <span
            className="evaluation-period__fill"
            style={{ width: `${avance}%` }}
          />
          <span
            className="evaluation-period__marker"
            style={{ left: `${avance}%` }}
          />
        </span>

        <span className="evaluation-period__date">{formatearCorta(fin)}</span>
      </span>
    </span>
  );
}

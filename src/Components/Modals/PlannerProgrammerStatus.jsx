import PropTypes from "prop-types";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";

/**
 * Estado de personal del Programmer seleccionado en ModalPlanner1.
 * Es una tarjeta compacta que no modifica el layout del resto del modal.
 */
export default function PlannerProgrammerStatus({ programmer }) {
  const personal = Array.isArray(programmer?.personal)
    ? programmer.personal
    : [];
  const resumen = programmer?.personalResumen ?? {
    total: 0,
    asignados: 0,
    pendientes: 0,
    completo: false,
  };
  const estado = programmer?.estado ?? "Aprobada";
  const aprobado = estado === "Aprobada" || estado === "Agendado";
  const agendado = estado === "Agendado";
  const sinPersonal = resumen.total === 0;

  return (
    <section
      className="planner-programmer-status"
      aria-label={`Estado de personal de ${programmer?.nombreVisible ?? "Programmer"}`}
    >
      <div className="planner-programmer-status__head">
        <span className="planner-programmer-status__eyebrow">
          <FiUsers aria-hidden="true" />
          Personal del programador
        </span>
        <span className="planner-programmer-status__badges">
          <span
            className={`planner-programmer-status__badge ${
              aprobado ? "is-ok" : "is-off"
            }`}
          >
            Aprobada
          </span>
          <span
            className={`planner-programmer-status__badge ${
              agendado ? "is-ok" : "is-off"
            }`}
          >
            Agendado
          </span>
        </span>
      </div>

      {sinPersonal ? (
        <p className="planner-programmer-status__notice is-neutral">
          Sin personal requerido. El programador permanece Aprobada.
        </p>
      ) : agendado ? (
        <p className="planner-programmer-status__notice is-ok">
          <FiCheckCircle aria-hidden="true" />
          Personal completo: agendado.
        </p>
      ) : resumen.completo ? (
        <p className="planner-programmer-status__notice is-neutral">
          Personal completo; pendiente de agendar.
        </p>
      ) : (
        <p className="planner-programmer-status__notice is-pending">
          <FiAlertTriangle aria-hidden="true" />
          Aún no agendado. Faltan {resumen.pendientes} de {resumen.total}{" "}
          personas.
        </p>
      )}

      {personal.length > 0 ? (
        <ul className="planner-programmer-status__list">
          {personal.map((linea, indice) => {
            const cantidad = Number(linea?.cantidad) || 0;
            const asignados = Array.isArray(linea?.asignados)
              ? linea.asignados.length
              : 0;
            const completo = asignados >= cantidad;

            return (
              <li
                key={`${linea?.rolId ?? "rol"}-${indice}`}
                className={completo ? "is-ok" : "is-pending"}
              >
                <span>{linea?.rol || linea?.rolId || "Personal"}</span>
                <strong>
                  {asignados}/{cantidad}
                </strong>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

PlannerProgrammerStatus.propTypes = {
  programmer: PropTypes.object,
};

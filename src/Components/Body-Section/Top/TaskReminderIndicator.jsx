import { useNavigate } from "react-router-dom";
import { useTaskReminders } from "../../../context/TaskReminderContext";

/**
 * Aviso sutil y persistente en la barra superior. Aparece despues del toast de
 * un recordatorio y permanece hasta que el usuario entra a sus tareas.
 */
export default function TaskReminderIndicator() {
  const { pendientes, total, limpiarPendientes } = useTaskReminders();
  const navigate = useNavigate();

  if (total === 0) return null;

  const ultimo = pendientes[0];
  const texto =
    total === 1 ? "Recordatorio pendiente" : `${total} recordatorios pendientes`;
  const detalle = ultimo
    ? `${ultimo.titulo}${ultimo.horario ? ` · ${ultimo.horario}` : ""}`
    : "";

  const handleClick = () => {
    limpiarPendientes();
    navigate("/tasks");
  };

  return (
    <button
      type="button"
      className="top-reminder-indicator"
      onClick={handleClick}
      title={`${texto}. Ir a mis tareas`}
      aria-label={`${texto}. Ir a mis tareas`}
    >
      <span className="top-reminder-icon" aria-hidden="true">
        🔔
      </span>
      <span className="top-reminder-text">
        <strong>{texto}</strong>
        {detalle && <span className="top-reminder-detail">{detalle}</span>}
      </span>
      <span className="top-reminder-count">{total}</span>
    </button>
  );
}

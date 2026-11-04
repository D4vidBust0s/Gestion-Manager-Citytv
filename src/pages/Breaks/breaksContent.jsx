/* ESTILOS */
import "../Rotations/RotationsContent.css";

/* COMPONENTS */
import EmployeePeriodsScreen from "../../Components/EmployeePeriods/EmployeePeriodsScreen";

/* SERVICIOS */
import { breaksApi } from "../../api/breaks";

/**
 * Pantalla de Descansos.
 * Única de la familia que usa RotationsContent.css en lugar de
 * PermissionsContent.css; el resto de la lógica es la compartida.
 */
const CONFIG = {
  api: breaksApi,
  avatarAlt: "Permissions",

  texts: {
    listTitle: (year) => `Registro de descansos durante el año ${year}`,
    fieldLabel: "Nombre descriptivo del descanso",
    observationLabel: "Observaciones o anotaciones",

    loadGroupsError: "Error al cargar los grupos",
    loadPeopleError: "Error al cargar el personal",

    addNoEmployee:
      "Para agregar un registro de descanso al trabajador, primero selecciónelo de la lista",
    addNoName:
      "Debe especificar un nombre que describa el motivo o descanso que toma el trabajador",
    addNoObservation:
      "Debe especificar una observación o descripción para el descanso",
    addSuccess: "Registro agregado correctamente",
    addError: "Error al agregar el registro",

    editNoEmployee:
      "Para actualizar la información de un trabajador, primero selecciónelo de la lista",
    editNoName:
      "El campo nombre del descanso no puede estar vacío, selecciónelo de la lista de registros",
    editNoObservation:
      "Debe especificar una observación o descripción para el descanso",
    editSuccess: "Registro actualizado correctamente",
    editError: "Error al actualizar el registro",

    deleteTitle: (employeeName) =>
      `¿Realmente desea eliminar el registro de descanso para ${employeeName}?`,
    deleteNoRecord: "No se ha seleccionado un registro para eliminar",
    deleteSuccess: "Registro eliminado correctamente",
    deleteError: "Error al eliminar el registro",
  },
};

export default function BreaksContent() {
  return <EmployeePeriodsScreen config={CONFIG} />;
}

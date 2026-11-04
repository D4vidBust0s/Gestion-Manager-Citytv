/* ESTILOS */
import '../Permissions/PermissionsContent.css';

/* COMPONENTS */
import EmployeePeriodsScreen from '../../Components/EmployeePeriods/EmployeePeriodsScreen';

/* SERVICIOS */
import { recessApi } from '../../api/recess';

/**
 * Pantalla de Vacaciones.
 * Toda la lógica vive en useEmployeePeriods; aquí solo los textos.
 */
const CONFIG = {
  api: recessApi,
  avatarAlt: 'Recess',

  texts: {
    listTitle: (year) => `Registro de vacaciones durante el año ${year}`,
    fieldLabel: 'Nombre del periodo de vacaciones',
    observationLabel: 'Observaciones o anotaciones',

    loadGroupsError: 'Error al cargar los grupos',
    loadPeopleError: 'Error al cargar el personal',

    addNoEmployee:
      'Para agregar un registro de vacaciones al trabajador, primero selecciónelo de la lista',
    addNoName:
      'Debe especificar un nombre que describa el periodo de vacaciones que toma el trabajador',
    addNoObservation:
      'Debe especificar una observación o descripción del periodo de vacaciones',
    addSuccess: 'Registro agregado correctamente',
    addError: 'Error al registrar el periodo de vacaciones',

    editNoEmployee:
      'Para actualizar la información de un trabajador, primero selecciónelo de la lista',
    editNoName:
      'El campo nombre del periodo de vacaciones no puede estar vacío, selecciónelo de la lista de registros',
    editNoObservation:
      'Debe especificar una observación o descripción para el periodo de vacaciones',
    editSuccess: 'Registro actualizado correctamente',
    editError: 'Error al actualizar el registro',

    deleteTitle: (employeeName) =>
      `¿Realmente desea eliminar el registro de vacaciones para ${employeeName}?`,
    deleteNoRecord: 'No se ha seleccionado un registro para eliminar',
    deleteSuccess: 'Registro eliminado correctamente',
    deleteError: 'Error al eliminar el registro',
  },
};

export default function RecessContent() {
  return <EmployeePeriodsScreen config={CONFIG} />;
}

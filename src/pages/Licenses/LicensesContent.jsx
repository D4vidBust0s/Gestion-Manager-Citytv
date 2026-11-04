/* ESTILOS */
import '../Permissions/PermissionsContent.css';

/* COMPONENTS */
import EmployeePeriodsScreen from '../../Components/EmployeePeriods/EmployeePeriodsScreen';

/* SERVICIOS */
import { licensesApi } from '../../api/licenses';

/**
 * Pantalla de Licencias.
 * Toda la lógica vive en useEmployeePeriods; aquí solo los textos.
 */
const CONFIG = {
  api: licensesApi,
  avatarAlt: 'Permissions',

  texts: {
    listTitle: (year) => `Registro de licencias en el año ${year}`,
    fieldLabel: 'Nombre del periodo de licencia',
    observationLabel: 'Observaciones o anotaciones',

    loadGroupsError: 'Error al cargar los grupos',
    loadPeopleError: 'Error al cargar el personal',

    addNoEmployee:
      'Para registrar una licencia a un trabajador, primero selecciónelo de la lista',
    addNoName: 'Debe especificar un nombre que describa el motivo de la licencia',
    addNoObservation:
      'Debe especificar una observación o descripción del periodo de licencia',
    addSuccess: 'Registro agregado correctamente',
    addError: 'Error al agregar el registro',

    editNoEmployee:
      'Para actualizar la información de un trabajador, primero selecciónelo de la lista',
    editNoName:
      'El campo nombre del registro no puede estar vacío, selecciónelo de la lista de registros',
    editNoObservation:
      'Debe especificar una observación o descripción del periodo de licencia',
    editSuccess: 'Registro actualizado correctamente',
    editError: 'Error al actualizar el registro',

    deleteTitle: (employeeName) =>
      `¿Realmente desea eliminar el registro de licencia para ${employeeName}?`,
    deleteNoRecord:
      'No se ha seleccionado ningún registro de licencia para eliminar',
    deleteSuccess: 'Registro eliminado correctamente',
    deleteError: 'Error al eliminar el registro',
  },
};

export default function LicensesContent() {
  return <EmployeePeriodsScreen config={CONFIG} />;
}

/* ESTILOS */
import '../Permissions/PermissionsContent.css';

/* COMPONENTS */
import EmployeePeriodsScreen from '../../Components/EmployeePeriods/EmployeePeriodsScreen';

/* SERVICIOS */
import { compensatoriesApi } from '../../api/compensatories';

/**
 * Pantalla de Compensatorios.
 * Toda la lógica vive en useEmployeePeriods; aquí solo los textos.
 */
const CONFIG = {
  api: compensatoriesApi,
  avatarAlt: 'Compensatory',

  texts: {
    listTitle: (year) => `Registro de compensatorios durante el año ${year}`,
    fieldLabel: 'Nombre del compensatorio',
    observationLabel: 'Observaciones o anotaciones',

    loadGroupsError: 'Error al cargar los grupos',
    loadPeopleError: 'Error al cargar el personal',

    addNoEmployee:
      'Para agregar un compensatorio a un trabajador, primero selecciónelo de la lista',
    addNoName: 'Debe especificar un nombre que describa el compensatorio',
    addNoObservation:
      'Debe especificar una observación o descripción del compensatorio',
    addSuccess: 'Registro agregado correctamente',
    addError: 'Error al registrar el compensatorio',

    editNoEmployee:
      'Para actualizar la información de un trabajador, primero selecciónelo de la lista',
    editNoName:
      'El campo nombre del compensatorio no puede estar vacío, selecciónelo de la lista de registros',
    editNoObservation:
      'Debe especificar una observación o descripción del compensatorio',
    editSuccess: 'Registro actualizado correctamente',
    editError: 'Error al actualizar el registro',

    deleteTitle: (employeeName) =>
      `¿Realmente desea eliminar el registro de compensatorio para ${employeeName}?`,
    deleteNoRecord: 'No se ha seleccionado un registro para eliminar',
    deleteSuccess: 'Registro eliminado correctamente',
    deleteError: 'Error al eliminar el registro',
  },
};

export default function CompensatoryContent() {
  return <EmployeePeriodsScreen config={CONFIG} />;
}

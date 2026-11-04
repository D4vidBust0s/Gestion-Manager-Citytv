/* ESTILOS */
import '../Permissions/PermissionsContent.css';

/* COMPONENTS */
import EmployeePeriodsScreen from '../../Components/EmployeePeriods/EmployeePeriodsScreen';

/* SERVICIOS */
import { incapacityApi } from '../../api/incapacity';

/**
 * Pantalla de Incapacidades.
 * Toda la lógica vive en useEmployeePeriods; aquí solo los textos.
 */
const CONFIG = {
  api: incapacityApi,
  avatarAlt: 'Incapacity',

  texts: {
    listTitle: (year) => `Registro de incapacidades durante el año ${year}`,
    fieldLabel: 'Nombre de la incapacidad',
    observationLabel: 'Observaciones o anotaciones',

    loadGroupsError: 'Error al cargar los grupos',
    loadPeopleError: 'Error al cargar el personal',

    addNoEmployee:
      'Para agregar una incapacidad a un trabajador, primero selecciónelo de la lista',
    addNoName: 'Debe especificar un nombre que describa la incapacidad',
    addNoObservation:
      'Debe especificar una observación o descripción de la incapacidad',
    addSuccess: 'Registro agregado correctamente',
    addError: 'Error al registrar la incapacidad',

    editNoEmployee:
      'Para actualizar la información de un trabajador, primero selecciónelo de la lista',
    editNoName:
      'El campo nombre de la incapacidad no puede estar vacío, selecciónelo de la lista de registros',
    editNoObservation:
      'Debe especificar una observación o descripción de la incapacidad',
    editSuccess: 'Registro actualizado correctamente',
    editError: 'Error al actualizar el registro',

    deleteTitle: (employeeName) =>
      `¿Realmente desea eliminar el registro de incapacidad para ${employeeName}?`,
    deleteNoRecord: 'No se ha seleccionado un registro para eliminar',
    deleteSuccess: 'Registro eliminado correctamente',
    deleteError: 'Error al eliminar el registro',
  },
};

export default function IncapacityContent() {
  return <EmployeePeriodsScreen config={CONFIG} />;
}

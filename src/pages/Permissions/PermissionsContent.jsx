/* ESTILOS */
import './PermissionsContent.css';

/* COMPONENTS */
import EmployeePeriodsScreen from '../../Components/EmployeePeriods/EmployeePeriodsScreen';

/* SERVICIOS */
import { payrollApi } from '../../api/payroll';
import { permissionsApi } from '../../api/permissions';

/**
 * Pantalla de Permisos.
 * Toda la lógica (grupos, personal, año, CRUD, validaciones) vive en
 * useEmployeePeriods; aquí solo se declaran los textos y el servicio.
 */
const CONFIG = {
  api: permissionsApi,
  avatarAlt: 'Permissions',
  // Permisos consulta el personal con /payroll/idGroup/:id
  // (las demás pantallas usan /payroll/people/:id)
  loadPeople: (groupId) => payrollApi.getByGroup(groupId),

  texts: {
    listTitle: (year) => `Registro de permisos en el año ${year}`,
    fieldLabel: 'Nombre del permiso',
    observationLabel: 'Observaciones o anotaciones',

    loadGroupsError: 'Error al cargar los grupos',
    loadPeopleError: 'Error al cargar el personal',

    addNoEmployee:
      'Para agregar un permiso a un trabajador, primero selecciónelo de la lista',
    addNoName: 'Debe especificar un nombre que describa el permiso',
    addNoObservation: 'Debe especificar una observación o descripción del permiso',
    addSuccess: 'Registro agregado correctamente',
    addError: 'Error al agregar el registro',

    editNoEmployee:
      'Para actualizar la información de un trabajador, primero selecciónelo de la lista',
    editNoName:
      'El campo nombre del permiso no puede estar vacío, selecciónelo de la lista de registros',
    editNoObservation: 'Debe especificar una observación o descripción del permiso',
    editSuccess: 'Registro actualizado correctamente',
    editError: 'Error al actualizar el registro',

    deleteTitle: (employeeName) =>
      `¿Realmente desea eliminar el permiso para ${employeeName}?`,
    deleteNoRecord: 'No se ha seleccionado un registro para eliminar',
    deleteSuccess: 'Registro eliminado correctamente',
    deleteError: 'Error al eliminar el registro',
  },
};

export default function PermissionsContent() {
  return <EmployeePeriodsScreen config={CONFIG} />;
}

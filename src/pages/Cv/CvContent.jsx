/* ESTILOS */
import '../Permissions/PermissionsContent.css';

/* COMPONENTS */
import EmployeePeriodsScreen from '../../Components/EmployeePeriods/EmployeePeriodsScreen';

/* SERVICIOS */
import { cvApi } from '../../api/cv';

/**
 * Pantalla de CV / Novedades.
 *
 * Es la única de la familia con tres diferencias:
 *   - nombreempleado se toma del trabajador seleccionado, no del usuario en sesión
 *   - para editar hay que seleccionar antes un registro de la lista
 *   - cada ítem de la lista muestra también la fecha de inicio
 */
const CONFIG = {
  api: cvApi,
  avatarAlt: 'CV',
  employeeNameFromSelection: true,
  requireRecordToEdit: true,
  formatRecordLabel: (record) =>
    `- ${record.Nombre} (${new Date(record.FechaInicio).toLocaleDateString()})`,

  texts: {
    listTitle: (year) => `Historial de CV / Novedades - Año ${year}`,
    fieldLabel: 'Tipo de Novedad / Sanción / Reconocimiento',
    namePlaceholder: 'Ej: Llegada tarde / Reconocimiento / Observación',
    datesLabel: 'Fechas del Evento',
    observationLabel: 'Observaciones o detalles del suceso',
    observationPlaceholder:
      'Describa el motivo, llamados de atención o felicitación...',

    loadGroupsError: 'Error al cargar los grupos',
    loadPeopleError: 'Error al cargar el personal',

    addNoEmployee:
      'Para registrar una novedad en el CV, primero seleccione un trabajador de la lista',
    addNoName:
      'Debe especificar el título de la novedad (Ej: Llegada tarde, Sanción, Reconocimiento)',
    addNoObservation: 'Debe especificar una observación o detalle de la novedad',
    addSuccess: 'Novedad agregada correctamente',
    addError: 'Error al registrar la novedad',

    editNoEmployee:
      'Para actualizar la información, primero seleccione un trabajador de la lista',
    editNoRecord: 'Seleccione un registro del historial para editar',
    editNoName: 'El título de la novedad no puede estar vacío',
    editNoObservation: 'Debe especificar las observaciones de la novedad',
    editSuccess: 'Registro actualizado correctamente',
    editError: 'Error al actualizar el registro',

    deleteTitle: (employeeName) =>
      `¿Realmente desea eliminar este registro del historial para ${employeeName}?`,
    deleteNoRecord: 'No se ha seleccionado un registro para eliminar',
    deleteSuccess: 'Registro eliminado correctamente',
    deleteError: 'Error al eliminar el registro',
  },
};

export default function CvContent() {
  return <EmployeePeriodsScreen config={CONFIG} />;
}

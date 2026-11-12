import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

import { groupsApi } from "../api/groups";
import { filterBalancerUsers, payrollApi } from "../api/payroll";
import { buildConflictsHtml, findPeriodOverlaps, startOfDay } from "../api/periods";

/**
 * Lógica compartida por las pantallas de "periodos por empleado":
 *   Permisos, Licencias, Incapacidades, Compensatorios, Descansos, Vacaciones y CV.
 *
 * Todas tienen el mismo flujo:
 *   1. Elegir grupo      -> GET /groups y GET /payroll/people/:groupId
 *   2. Elegir trabajador -> GET /<recurso>/:empleadoId?año=YYYY
 *   3. Elegir año        -> vuelve a consultar el paso 2
 *   4. Crear / editar / eliminar un registro con el formulario inferior
 *
 * Lo único que cambia entre pantallas son los textos y el servicio de API,
 * así que ambos entran por configuración.
 */

export const EMPTY_EMPLOYEE = "-----------------------";
export const NO_GROUP = "none";

/** Usuario autenticado que quedó guardado al iniciar sesión. */
export const getLoggedUserName = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("userAuth") || "{}");
    if (storedUser.nombres && storedUser.apellidos) {
      return `${storedUser.nombres} ${storedUser.apellidos}`;
    }
    return storedUser.nombre || "Usuario";
  } catch {
    return "Usuario";
  }
};

/** Convierte lo que devuelve la API en Date, sin romper si viene vacío o inválido. */
const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const useEmployeePeriods = ({
  api,
  texts = {},
  /** Cómo traer el personal del grupo. Por defecto /payroll/people/:groupId */
  loadPeople,
  /** true  -> nombreempleado se toma del trabajador seleccionado (CV)
   *  false -> nombreempleado se toma del usuario en sesión (resto de pantallas) */
  employeeNameFromSelection = false,
  /** true  -> para editar hay que seleccionar antes un registro de la lista (CV) */
  requireRecordToEdit = false,
  /** true  -> no se descartan los usuarios virtuales (UserBalancer) del personal */
  includeVirtualUsers = false,
}) => {
  const loadPeopleFn =
    loadPeople ?? ((groupId) => payrollApi.getPeopleByGroup(groupId));

  // Se guarda en una ref para que los callbacks no dependan de la identidad
  // de la función (que cambia en cada render si se define en línea).
  const loadPeopleRef = useRef(loadPeopleFn);
  loadPeopleRef.current = loadPeopleFn;

  const { loadGroupsError, loadPeopleError, loadRecordsError } = texts;

  /* ESTADOS */
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState(NO_GROUP);
  const [people, setPeople] = useState([]);
  const [records, setRecords] = useState([]);
  const [yearDate, setYearDate] = useState(() => new Date());
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState(EMPTY_EMPLOYEE);
  const [selectedId, setSelectedId] = useState(null);
  const [rangeStart, setRangeStart] = useState(() => new Date());
  const [rangeEnd, setRangeEnd] = useState(() => new Date());
  const [isSaving, setIsSaving] = useState(false);

  /* REFERENCIAS */
  const nameRef = useRef();
  const observationRef = useRef();
  // Identifican la última petición para descartar respuestas que llegan tarde
  const recordsRequestRef = useRef(0);
  const peopleRequestRef = useRef(0);
  const savingRef = useRef(false);

  /* CARGA DE DATOS */

  const loadGroups = useCallback(async () => {
    try {
      const data = await groupsApi.getAll();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar los grupos:", error);
      if (loadGroupsError) toast.error(loadGroupsError);
    }
  }, [loadGroupsError]);

  const loadGroupPeople = useCallback(async (nextGroupId) => {
    if (!nextGroupId || nextGroupId === NO_GROUP) {
      setPeople([]);
      return;
    }

    const requestId = ++peopleRequestRef.current;
    try {
      const data = await loadPeopleRef.current(nextGroupId);
      if (requestId !== peopleRequestRef.current) return;
      // Los UserBalancer son usuarios virtuales de balanceo: no son personas
      // a las que se les registren permisos, licencias, etc.
      setPeople(
        includeVirtualUsers
          ? Array.isArray(data)
            ? data
            : []
          : filterBalancerUsers(data)
      );
    } catch (error) {
      if (requestId !== peopleRequestRef.current) return;
      console.error("Error al cargar el personal del grupo:", error);
      if (loadPeopleError) toast.error(loadPeopleError);
    }
  }, [includeVirtualUsers, loadPeopleError]);

  const loadRecords = useCallback(
    async (userId, date) => {
      if (!userId) {
        setRecords([]);
        return;
      }

      const requestId = ++recordsRequestRef.current;
      try {
        const data = await api.getByUser(userId, date?.getFullYear());
        if (requestId !== recordsRequestRef.current) return;
        setRecords(Array.isArray(data) ? data : []);
      } catch (error) {
        if (requestId !== recordsRequestRef.current) return;
        console.error("Error al cargar los registros:", error);
        if (loadRecordsError) toast.error(loadRecordsError);
      }
    },
    [api, loadRecordsError]
  );

  /* FORMULARIO */

  const resetForm = useCallback((focusName = false) => {
    if (nameRef.current) {
      nameRef.current.value = "";
      if (focusName) nameRef.current.focus();
    }
    if (observationRef.current) observationRef.current.value = "";
    setRangeStart(new Date());
    setRangeEnd(new Date());
    setSelectedId(null);
  }, []);

  /* SELECCIONES */

  const selectGroup = (nextGroupId) => {
    // Invalida cualquier respuesta de registros que esté en vuelo
    recordsRequestRef.current += 1;

    setGroupId(nextGroupId);
    setEmployeeId(null);
    setEmployeeName(EMPTY_EMPLOYEE);
    setRecords([]);
    resetForm();
    loadGroupPeople(nextGroupId);
  };

  const selectEmployee = (person) => {
    if (!person?._id) return;

    setEmployeeId(person._id);
    setEmployeeName(`${person.nombres} ${person.apellidos}`);
    setRecords([]);
    resetForm();
    loadRecords(person._id, yearDate);
  };

  const changeYear = (date) => {
    if (!date) return;

    setYearDate(date);
    resetForm();
    loadRecords(employeeId, date);
  };

  const selectRecord = (record) => {
    if (!record?._id) return;

    if (nameRef.current) {
      nameRef.current.value = record.Nombre ?? record.nombre ?? "";
    }
    if (observationRef.current) {
      observationRef.current.value =
        record.Observacion ?? record.observacion ?? "";
    }

    setRangeStart(toDate(record.FechaInicio ?? record.fechainicio) ?? new Date());
    setRangeEnd(toDate(record.FechaFinal ?? record.fechafinal) ?? new Date());
    setSelectedId(record._id);
  };

  /* VALIDACIÓN Y PAYLOAD */

  const buildPayload = (employeeKey) => ({
    nombre: nameRef.current?.value ?? "",
    año: rangeStart.getFullYear().toString(),
    fechainicio: rangeStart,
    fechafinal: rangeEnd,
    observacion: observationRef.current?.value ?? "",
    estado: true,
    nombreempleado: employeeNameFromSelection
      ? employeeName
      : getLoggedUserName(),
    // El POST y el PUT no usan la misma llave para el empleado:
    // POST -> idempleado / PUT -> id_empleado
    [employeeKey]: employeeId,
  });

  const validate = async (mode) => {
    const isEdit = mode === "edit";

    if (!employeeId) {
      toast.error(
        isEdit
          ? texts.editNoEmployee ?? "Primero seleccione un trabajador de la lista"
          : texts.addNoEmployee ?? "Primero seleccione un trabajador de la lista"
      );
      return false;
    }

    if (isEdit && requireRecordToEdit && !selectedId) {
      toast.error(
        texts.editNoRecord ?? "Seleccione un registro de la lista para editar"
      );
      return false;
    }

    if (!nameRef.current || nameRef.current.value.trim() === "") {
      nameRef.current?.focus();
      toast.error(
        isEdit
          ? texts.editNoName ?? "El campo nombre no puede estar vacío"
          : texts.addNoName ?? "Debe especificar un nombre"
      );
      return false;
    }

    if (!observationRef.current || observationRef.current.value.trim() === "") {
      observationRef.current?.focus();
      toast.error(
        isEdit
          ? texts.editNoObservation ?? "Debe especificar una observación"
          : texts.addNoObservation ?? "Debe especificar una observación"
      );
      return false;
    }

    const startDay = startOfDay(rangeStart);
    const endDay = startOfDay(rangeEnd);

    if (startDay && endDay && endDay < startDay) {
      await Swal.fire({
        icon: "warning",
        title: "Rango de fechas inválido",
        text: "La fecha final no puede ser anterior a la fecha inicial.",
        confirmButtonText: "Entendido",
        footer: "<h6>Gestión Manager Citytv</h6>",
      });
      return false;
    }

    return true;
  };

  /**
   * Comprueba que el rango del formulario no se cruce con otro registro del
   * mismo trabajador (permisos, licencias, incapacidades, compensatorios,
   * descansos y vacaciones). Bloquea el guardado avisando con SweetAlert2.
   */
  const verifyOverlaps = async (excludeId) => {
    const { conflicts, failed, skipped } = await findPeriodOverlaps({
      api,
      userId: employeeId,
      rangeStart,
      rangeEnd,
      localRecords: records,
      localYear: yearDate.getFullYear(),
      excludeId,
    });

    if (skipped) return true;

    if (conflicts.length > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Las fechas se cruzan con otro registro",
        html: buildConflictsHtml(conflicts),
        confirmButtonText: "Corregir fechas",
        allowOutsideClick: false,
        allowEscapeKey: false,
        footer: "<h6>Gestión Manager Citytv</h6>",
      });
      return false;
    }

    if (failed) {
      await Swal.fire({
        icon: "info",
        title: "No se pudo verificar",
        text: "No fue posible comprobar si las fechas se cruzan con otros registros. Se guardará el registro.",
        confirmButtonText: "Continuar",
        footer: "<h6>Gestión Manager Citytv</h6>",
      });
    }

    return true;
  };

  /* OPERACIONES CONTRA LA API */

  const add = async () => {
    if (savingRef.current) return;

    savingRef.current = true;
    setIsSaving(true);
    try {
      if (!(await validate("add"))) return;
      if (!(await verifyOverlaps(null))) return;

      await api.create(buildPayload("idempleado"));

      resetForm();
      await loadRecords(employeeId, yearDate);

      toast.success(texts.addSuccess ?? "Registro agregado correctamente");
    } catch (error) {
      console.error("Error al agregar el registro:", error);
      toast.error(texts.addError ?? "Error al agregar el registro");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const edit = async () => {
    if (savingRef.current) return;

    savingRef.current = true;
    setIsSaving(true);
    try {
      if (!(await validate("edit"))) return;
      if (!(await verifyOverlaps(selectedId))) return;

      await api.update(selectedId, buildPayload("id_empleado"));

      await loadRecords(employeeId, yearDate);

      toast.success(texts.editSuccess ?? "Registro actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el registro:", error);
      toast.error(texts.editError ?? "Error al actualizar el registro");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const remove = async () => {
    if (savingRef.current || !selectedId) return;

    savingRef.current = true;
    setIsSaving(true);
    try {
      await api.remove(selectedId);

      resetForm();
      await loadRecords(employeeId, yearDate);

      toast.success(texts.deleteSuccess ?? "Registro eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
      toast.error(texts.deleteError ?? "Error al eliminar el registro");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  /** Pide confirmación (SweetAlert2) y, si acepta, elimina el registro. */
  const requestRemove = () => {
    if (!selectedId) {
      toast.error(
        texts.deleteNoRecord ?? "No se ha seleccionado un registro para eliminar"
      );
      return;
    }

    Swal.fire({
      title:
        typeof texts.deleteTitle === "function"
          ? texts.deleteTitle(employeeName)
          : texts.deleteTitle ?? "¿Realmente desea eliminar este registro?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "No",
      denyButtonText: "Confirmar",
      footer: "<h6>Gestión Manager Citytv</h6>",
    }).then((result) => {
      if (result.isDenied) remove();
    });
  };

  /* EFECTOS */
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return {
    // Datos
    groups,
    groupId,
    people,
    records,
    yearDate,
    employeeId,
    employeeName,
    selectedId,
    rangeStart,
    rangeEnd,
    isSaving,
    // Referencias para los campos del formulario
    nameRef,
    observationRef,
    // Acciones
    setRangeStart,
    setRangeEnd,
    selectGroup,
    selectEmployee,
    changeYear,
    selectRecord,
    resetForm,
    add,
    edit,
    requestRemove,
    refresh: () => loadRecords(employeeId, yearDate),
  };
};

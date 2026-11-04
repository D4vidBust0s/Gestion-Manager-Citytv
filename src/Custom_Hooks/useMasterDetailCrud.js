import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

/**
 * Lógica compartida por las pantallas de tipo "maestro - detalle":
 *   - Lista a la izquierda / formulario a la derecha (Grupos, Programas)
 *   - Clic en un ítem  -> GET /<recurso>/:id y se hidrata el formulario
 *   - Botones          -> POST / PUT / DELETE con confirmación previa
 *
 * El hook se queda con la lista, el ítem seleccionado y los avisos;
 * cada pantalla aporta su formulario mediante onLoaded/onCleared,
 * su validación y su payload.
 */
export const useMasterDetailCrud = ({
  api,
  /** Nombre del recurso en singular, para los mensajes por defecto: "grupo" */
  entityName = "registro",
  /** (item) => void  -- vuelca el ítem recibido en los campos del formulario */
  onLoaded,
  /** () => void  -- limpia el formulario después de agregar/actualizar/eliminar */
  onCleared,
  /** (mode) => boolean  -- valida y muestra sus propios toasts */
  validate,
  /** () => object  -- body del POST / PUT */
  buildPayload,
  /** (a, b) => number  -- orden de la lista (opcional) */
  sortItems,
  /** string | (item) => string */
  deleteTitle,
  success = {},
  errors = {},
}) => {
  const {
    load: loadError,
    loadOne: loadOneError,
    add: addError,
    update: updateError,
    remove: removeError,
  } = errors;

  // Ref para no depender de la identidad de una función definida en línea
  const sortItemsRef = useRef(sortItems);
  sortItemsRef.current = sortItems;

  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const savingRef = useRef(false);

  /* LISTA */

  const reload = useCallback(async () => {
    try {
      const data = await api.getAll();
      const list = Array.isArray(data) ? data : [];
      setItems(sortItemsRef.current ? [...list].sort(sortItemsRef.current) : list);
    } catch (error) {
      console.error("Error al cargar el listado:", error);
      if (loadError) toast.error(loadError);
    }
  }, [api, loadError]);

  /* SELECCIÓN */

  const select = async (id) => {
    try {
      const item = await api.getById(id);
      setSelectedId(id);
      onLoaded?.(item);
    } catch (error) {
      console.error("Error al cargar el registro:", error);
      toast.error(loadOneError ?? "Error al cargar los datos");
    }
  };

  /* CRUD */

  const create = async () => {
    if (savingRef.current || (validate && !validate("add"))) return;

    savingRef.current = true;
    setIsSaving(true);
    try {
      await api.create(buildPayload());

      await reload();
      setSelectedId(null);
      onCleared?.();

      toast.success(success.add ?? `${entityName} agregado`);
    } catch (error) {
      console.error("Error al agregar:", error);
      toast.error(addError ?? "Error al agregar el registro");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const update = async () => {
    if (savingRef.current) return;

    if (!selectedId) {
      toast.error(`No ha seleccionado ningún ${entityName} para actualizar`);
      return;
    }
    if (validate && !validate("edit")) return;

    savingRef.current = true;
    setIsSaving(true);
    try {
      await api.update(selectedId, buildPayload());

      await reload();
      setSelectedId(null);
      onCleared?.();

      toast.success(success.update ?? `${entityName} actualizado`);
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast.error(updateError ?? "Error al actualizar el registro");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const performRemove = async () => {
    if (savingRef.current) return;

    savingRef.current = true;
    setIsSaving(true);
    try {
      await api.remove(selectedId);

      await reload();
      setSelectedId(null);
      onCleared?.();

      toast.success(success.remove ?? `${entityName} eliminado`);
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error(removeError ?? "Error al eliminar el registro");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  /** Pide confirmación (SweetAlert2) y, si acepta, elimina el seleccionado. */
  const remove = () => {
    if (!selectedId) {
      toast.error(`No ha seleccionado ningún ${entityName} para eliminar`);
      return;
    }

    Swal.fire({
      title:
        typeof deleteTitle === "function"
          ? deleteTitle()
          : deleteTitle ?? `¿Realmente desea eliminar este ${entityName}?`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "No",
      denyButtonText: "Confirmar",
      footer: "<h6>Gestión Manager Citytv</h6>",
    }).then((result) => {
      if (result.isDenied) performRemove();
    });
  };

  /* EFECTOS */
  useEffect(() => {
    reload();
  }, [reload]);

  return {
    items,
    selectedId,
    isSaving,
    reload,
    select,
    create,
    update,
    remove,
  };
};

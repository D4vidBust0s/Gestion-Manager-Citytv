import { breaksApi } from "./breaks";
import { compensatoriesApi } from "./compensatories";
import { incapacityApi } from "./incapacity";
import { licensesApi } from "./licenses";
import { permissionsApi } from "./permissions";
import { recessApi } from "./recess";

/**
 * Recursos que representan ausencias de un trabajador y que, por tanto, no
 * pueden solaparse entre sí en el tiempo.
 *
 * CV (historial de novedades) queda fuera a propósito: registra eventos como
 * reconocimientos o llegadas tarde, no ausencias.
 */
export const PERIOD_RESOURCES = [
  { api: permissionsApi, label: "permiso", plural: "permisos" },
  { api: licensesApi, label: "licencia", plural: "licencias" },
  { api: incapacityApi, label: "incapacidad", plural: "incapacidades" },
  { api: compensatoriesApi, label: "compensatorio", plural: "compensatorios" },
  { api: breaksApi, label: "descanso", plural: "descansos" },
  { api: recessApi, label: "vacaciones", plural: "vacaciones" },
];

/**
 * Lleva una fecha a la medianoche local.
 * Se usa setHours (no toISOString) para no correrse de día por la zona horaria.
 * Devuelve null si el valor no es una fecha válida.
 */
export const startOfDay = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);
  return date;
};

/** Dos rangos inclusivos se cruzan si cada inicio cae antes del fin del otro. */
export const rangesOverlap = (startA, endA, startB, endB) =>
  startA <= endB && startB <= endA;

/** Escapa texto escrito por el usuario antes de inyectarlo como HTML en Swal. */
export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (date) => date.toLocaleDateString();

/** Arma la lista de conflictos que Swal muestra como html. */
export const buildConflictsHtml = (conflicts) =>
  `<ul style="text-align:left; margin:0; padding-left:1.2rem">${conflicts
    .map(
      (conflict) =>
        `<li><b>${escapeHtml(conflict.label)}</b>: ` +
        `${formatDate(conflict.start)} - ${formatDate(conflict.end)}` +
        `${conflict.name ? ` — ${escapeHtml(conflict.name)}` : ""}</li>`
    )
    .join("")}</ul>`;

/** Años que toca un rango (uno solo salvo que cruce el 31 de diciembre). */
const yearsOf = (start, end) => [...new Set([start.getFullYear(), end.getFullYear()])];

/**
 * Busca registros del mismo trabajador que se crucen con el rango indicado.
 *
 * Devuelve:
 *   conflicts -> choques encontrados (tipo, nombre y rango)
 *   failed    -> true si alguna consulta falló (el llamador decide qué hacer)
 *   skipped   -> true si el recurso actual no participa (CV) o faltan datos
 */
export const findPeriodOverlaps = async ({
  api,
  userId,
  rangeStart,
  rangeEnd,
  localRecords = [],
  localYear,
  excludeId = null,
}) => {
  const start = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd) ?? start;

  if (!userId || !start) return { conflicts: [], failed: false, skipped: true };

  const current = PERIOD_RESOURCES.find((resource) => resource.api === api);
  // El recurso actual no está en el registro (por ejemplo CV): no se valida
  if (!current) return { conflicts: [], failed: false, skipped: true };

  const years = yearsOf(start, end);
  const others = PERIOD_RESOURCES.filter((resource) => resource !== current);

  const requests = [];
  others.forEach((resource) => {
    years.forEach((year) => {
      requests.push(
        resource.api
          .getByUser(userId, year)
          .then((items) => ({ resource, items: Array.isArray(items) ? items : [] }))
      );
    });
  });

  // Del propio recurso ya tenemos en memoria el año del filtro de la pantalla;
  // solo se piden los años que no cubre ese listado.
  years
    .filter((year) => year !== localYear)
    .forEach((year) => {
      requests.push(
        current.api
          .getByUser(userId, year)
          .then((items) => ({ resource: current, items: Array.isArray(items) ? items : [] }))
      );
    });

  const settled = await Promise.allSettled(requests);
  const failed = settled.some((result) => result.status === "rejected");

  const groups = settled
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  const coveredByLocal = Boolean(localYear) && years.includes(localYear);
  if (coveredByLocal) {
    groups.push({ resource: current, items: localRecords });
  }

  const seen = new Set();
  const conflicts = [];

  groups.forEach(({ resource, items }) => {
    items.forEach((item) => {
      if (!item) return;

      const id = item._id;
      if (id && excludeId && id === excludeId) return;
      if (id) {
        if (seen.has(id)) return;
        seen.add(id);
      }

      const rawStart = startOfDay(item.FechaInicio ?? item.fechainicio);
      if (!rawStart) return;

      const rawEnd =
        startOfDay(item.FechaFinal ?? item.fechafinal) ?? rawStart;
      // Datos antiguos con la fecha final antes de la inicial: se ordenan
      const itemStart = rawEnd < rawStart ? rawEnd : rawStart;
      const itemEnd = rawEnd < rawStart ? rawStart : rawEnd;

      if (!rangesOverlap(start, end, itemStart, itemEnd)) return;

      conflicts.push({
        label: resource.label,
        plural: resource.plural,
        name: item.Nombre ?? item.nombre ?? "",
        start: itemStart,
        end: itemEnd,
      });
    });
  });

  conflicts.sort((a, b) => a.start - b.start);

  return { conflicts, failed: failed && conflicts.length === 0, skipped: false };
};

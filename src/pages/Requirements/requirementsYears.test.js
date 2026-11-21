import assert from "node:assert/strict";
import test from "node:test";

import {
  anioDeFecha,
  esSolicitudVigente,
  filtrarSolicitudesPorPeriodo,
  obtenerAniosArchivo,
} from "./requirementsYears.js";

const solicitud = (id, fecha) => ({ id, evento: { fecha } });

const solicitudes = [
  solicitud("2024", "2024-05-10"),
  solicitud("2025", "2025-11-20"),
  solicitud("2026", "2026-01-15"),
  solicitud("2027", "2027-03-01"),
  solicitud("sin-fecha", ""),
];

test("extrae el año de una fecha válida", () => {
  assert.equal(anioDeFecha("2025-05-10"), 2025);
  assert.equal(anioDeFecha("2026-12-31"), 2026);
  assert.equal(anioDeFecha(""), null);
  assert.equal(anioDeFecha("sin-fecha"), null);
  assert.equal(anioDeFecha("2025-13-01"), null);
});

test("Vigentes incluye año actual y años futuros", () => {
  const vigentes = filtrarSolicitudesPorPeriodo(solicitudes, {
    periodo: "vigentes",
    anioActual: 2026,
  });

  assert.deepEqual(
    vigentes.map((item) => item.id),
    ["2026", "2027"]
  );
});

test("Archivo incluye solo el año seleccionado", () => {
  const archivo = filtrarSolicitudesPorPeriodo(solicitudes, {
    periodo: "archivo",
    anioArchivo: 2025,
    anioActual: 2026,
  });

  assert.deepEqual(
    archivo.map((item) => item.id),
    ["2025"]
  );
});

test("las solicitudes sin fecha quedan fuera de ambos periodos", () => {
  const vigentes = filtrarSolicitudesPorPeriodo(solicitudes, {
    periodo: "vigentes",
    anioActual: 2026,
  });
  const archivo = filtrarSolicitudesPorPeriodo(solicitudes, {
    periodo: "archivo",
    anioArchivo: 2024,
    anioActual: 2026,
  });

  assert.equal(vigentes.some((item) => item.id === "sin-fecha"), false);
  assert.equal(archivo.some((item) => item.id === "sin-fecha"), false);
});

test("lista los años anteriores con datos en orden descendente", () => {
  assert.deepEqual(obtenerAniosArchivo(solicitudes, 2026), [2025, 2024]);
  assert.deepEqual(obtenerAniosArchivo([], 2026), []);
});

test("esSolicitudVigente considera el año actual y los futuros", () => {
  assert.equal(esSolicitudVigente(solicitud("actual", "2026-01-01"), 2026), true);
  assert.equal(esSolicitudVigente(solicitud("futura", "2027-01-01"), 2026), true);
  assert.equal(esSolicitudVigente(solicitud("vieja", "2025-12-31"), 2026), false);
  assert.equal(esSolicitudVigente(solicitud("sin-fecha", ""), 2026), false);
});

import test from "node:test";
import assert from "node:assert/strict";

import {
  claseEstado,
  esEnMantenimiento,
  etiquetaEstado,
  filtrarEquipos,
  filtrarSeguimientos,
  normalizarProgreso,
  ordenarMantenimientos,
  promedioProgreso,
  resumenDesdeEquipos,
} from "./activosView.js";

const equipos = [
  {
    id: "1",
    placa: "CAM-001",
    descripcion: "Cámara principal",
    estado: "Activo",
    subEstado: "Disponible",
    categoria: { id: "cat1", nombre: "Cámaras" },
    subcategoria: { id: "sub1", nombre: "Estudio" },
    ubicacion: { id: "ubi1", nombre: "Estudio 1" },
  },
  {
    id: "2",
    placa: "MIC-002",
    descripcion: "Micrófono de mano",
    estado: "Inactivo",
    motivoInactivo: "Mantenimiento",
    subEstado: "Mantenimiento",
    categoria: { id: "cat2", nombre: "Audio" },
    subcategoria: { id: "sub2", nombre: "Inalámbrico" },
    ubicacion: { id: "ubi2", nombre: "Bodega" },
    progresoMantenimiento: 45,
  },
  {
    id: "3",
    placa: "TRI-003",
    descripcion: "Trípode",
    estado: "Inactivo",
    motivoInactivo: "Protegido",
    subEstado: "Protegido",
    categoria: { id: "cat1", nombre: "Cámaras" },
    subcategoria: { id: "sub1", nombre: "Estudio" },
    ubicacion: { id: "ubi1", nombre: "Estudio 1" },
  },
];

test("etiqueta y clase de estado usan el subEstado visible", () => {
  assert.equal(etiquetaEstado(equipos[0]), "Disponible");
  assert.equal(etiquetaEstado(equipos[1]), "Mantenimiento");
  assert.equal(claseEstado(equipos[1]), "activos-status--mantenimiento");
  assert.equal(claseEstado({ estado: "Inactivo" }), "activos-status--baja");
});

test("reconoce el estado Novedad de un caso especial", () => {
  const novedad = {
    estado: "Inactivo",
    motivoInactivo: "Novedad",
    estadoOperativo: "Novedad",
  };
  assert.equal(etiquetaEstado(novedad), "Novedad");
  assert.equal(claseEstado(novedad), "activos-status--novedad");
});

test("esEnMantenimiento solo acepta inactivos por mantenimiento", () => {
  assert.equal(esEnMantenimiento(equipos[1]), true);
  assert.equal(esEnMantenimiento(equipos[2]), false);
  assert.equal(esEnMantenimiento(equipos[0]), false);
});

test("filtrarEquipos combina búsqueda libre y catálogos", () => {
  assert.deepEqual(
    filtrarEquipos(equipos, { q: "micrófono" }).map((equipo) => equipo.id),
    ["2"]
  );
  assert.deepEqual(
    filtrarEquipos(equipos, { categoriaId: "cat1" }).map((equipo) => equipo.id),
    ["1", "3"]
  );
  assert.deepEqual(
    filtrarEquipos(equipos, { subcategoriaId: "sub2" }).map(
      (equipo) => equipo.id
    ),
    ["2"]
  );
  assert.deepEqual(
    filtrarEquipos(equipos, { estado: "Inactivo", motivoInactivo: "Protegido" })
      .map((equipo) => equipo.id),
    ["3"]
  );
  assert.equal(filtrarEquipos(equipos, { q: "inexistente" }).length, 0);
});

test("resumenDesdeEquipos clasifica activos e inactivos", () => {
  assert.deepEqual(resumenDesdeEquipos(equipos), {
    total: 3,
    activos: 1,
    inactivos: 2,
    disponibles: 1,
    asignados: 0,
    mantenimiento: 1,
    protegidos: 1,
    baja: 0,
    novedades: 0,
  });
  assert.equal(resumenDesdeEquipos(null).total, 0);
});

test("normalizarProgreso acota y descarta valores inválidos", () => {
  assert.equal(normalizarProgreso(45.6), 46);
  assert.equal(normalizarProgreso(140), 100);
  assert.equal(normalizarProgreso(-8), 0);
  assert.equal(normalizarProgreso(null), null);
  assert.equal(normalizarProgreso("sin dato"), null);
});

test("promedioProgreso ignora equipos sin progreso", () => {
  assert.equal(promedioProgreso(equipos), 45);
  assert.equal(promedioProgreso([equipos[0], equipos[2]]), null);
});

test("ordenarMantenimientos deja primero el más reciente", () => {
  const ordenados = ordenarMantenimientos([
    { id: "a", iniciadoEn: "2026-01-01T10:00:00.000Z" },
    { id: "b", iniciadoEn: "2026-03-01T10:00:00.000Z" },
    { id: "c", iniciadoEn: null },
  ]);

  assert.deepEqual(ordenados.map((item) => item.id), ["b", "a", "c"]);
});

test("filtrarSeguimientos busca por placa y ubicación", () => {
  const seguimientos = [
    { mantenimientoId: "m1", placa: "CAM-001", ubicacion: { nombre: "Estudio 1" } },
    { mantenimientoId: "m2", placa: "MIC-002", ubicacion: { nombre: "Bodega" } },
  ];

  assert.deepEqual(
    filtrarSeguimientos(seguimientos, "bodega").map((item) => item.mantenimientoId),
    ["m2"]
  );
  assert.equal(filtrarSeguimientos(seguimientos, "").length, 2);
});

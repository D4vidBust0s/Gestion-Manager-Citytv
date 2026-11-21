import assert from "node:assert/strict";
import test from "node:test";

import {
  categoriasDisponibles,
  filtrarEquipos,
  idsEquiposSeleccionados,
  subcategoriasDisponibles,
} from "./equipmentCatalogFilters.js";

const equipos = [
  {
    id: "eq-cam-01",
    placa: "CAM-01",
    descripcion: "Cámara principal de estudio",
    categoria: { id: "cat-cam", nombre: "Cámaras" },
    subcategoria: { id: "sub-est", nombre: "Estudio" },
    imagen: { miniaturaUrl: "/equipment/eq-cam-01/imagen?size=thumb" },
  },
  {
    id: "eq-cam-02",
    placa: "CAM-02",
    descripcion: "Cámara de reportería",
    categoria: { id: "cat-cam", nombre: "Cámaras" },
    subcategoria: { id: "sub-rep", nombre: "Reportería" },
    imagen: null,
  },
  {
    id: "eq-luz-01",
    placa: "LUZ-01",
    descripcion: "Panel LED bicolor",
    categoria: { id: "cat-luz", nombre: "Iluminación" },
    subcategoria: null,
    imagen: null,
  },
];

const categorias = [
  {
    _id: "cat-luz",
    nombre: "Iluminación",
    orden: 2,
    activo: true,
    imagen: { miniaturaUrl: "/equipment-categories/cat-luz/imagen?size=thumb" },
  },
  {
    _id: "cat-cam",
    nombre: "Cámaras",
    orden: 1,
    activo: true,
    imagen: { miniaturaUrl: "/equipment-categories/cat-cam/imagen?size=thumb" },
  },
  {
    _id: "cat-audio",
    nombre: "Audio",
    orden: 3,
    activo: true,
    imagen: null,
  },
];

const subcategorias = [
  {
    _id: "sub-rep",
    categoria: { id: "cat-cam", nombre: "Cámaras" },
    nombre: "Reportería",
    orden: 2,
    activo: true,
    imagen: null,
  },
  {
    _id: "sub-est",
    categoria: { id: "cat-cam", nombre: "Cámaras" },
    nombre: "Estudio",
    orden: 1,
    activo: true,
    imagen: { miniaturaUrl: "/equipment-subcategories/sub-est/imagen?size=thumb" },
  },
];

test("categoriasDisponibles cuenta equipos, ordena y omite categorías vacías", () => {
  const resultado = categoriasDisponibles(equipos, categorias);

  assert.deepEqual(
    resultado.map((categoria) => categoria.id),
    ["cat-cam", "cat-luz"]
  );
  assert.equal(resultado[0].nombre, "Cámaras");
  assert.equal(resultado[0].cantidad, 2);
  assert.equal(resultado[1].cantidad, 1);
  assert.match(resultado[0].imagen.miniaturaUrl, /cat-cam/);
});

test("categoriasDisponibles tolera un catálogo vacío usando los equipos", () => {
  const resultado = categoriasDisponibles(equipos, []);

  assert.equal(resultado.length, 2);
  assert.equal(resultado[0].nombre, "Cámaras");
  assert.equal(resultado[0].imagen, null);
  assert.match(resultado[0].imagenEquipo.miniaturaUrl, /eq-cam-01/);
});

test("subcategoriasDisponibles filtra por categoría y ordena", () => {
  const resultado = subcategoriasDisponibles(equipos, subcategorias, "cat-cam");

  assert.deepEqual(
    resultado.map((subcategoria) => subcategoria.id),
    ["sub-est", "sub-rep"]
  );
  assert.equal(resultado[0].cantidad, 1);
  assert.match(resultado[0].imagen.miniaturaUrl, /sub-est/);
});

test("subcategoriasDisponibles no inventa tarjetas para equipos sin subcategoría", () => {
  const resultado = subcategoriasDisponibles(equipos, subcategorias, "cat-luz");

  assert.deepEqual(resultado, []);
});

test("filtrarEquipos combina categoría, subcategoría y búsqueda sin tildes", () => {
  assert.deepEqual(
    filtrarEquipos(equipos, { categoriaId: "cat-cam" }).map((e) => e.placa),
    ["CAM-01", "CAM-02"]
  );

  assert.deepEqual(
    filtrarEquipos(equipos, {
      categoriaId: "cat-cam",
      subcategoriaId: "sub-est",
    }).map((e) => e.placa),
    ["CAM-01"]
  );

  assert.deepEqual(
    filtrarEquipos(equipos, { busqueda: "camara" }).map((e) => e.placa),
    ["CAM-01", "CAM-02"]
  );

  assert.deepEqual(
    filtrarEquipos(equipos, { busqueda: "iluminacion" }).map((e) => e.placa),
    ["LUZ-01"]
  );
});

test("filtrarEquipos devuelve lista vacía si no hay coincidencias", () => {
  assert.deepEqual(filtrarEquipos(equipos, { busqueda: "dron" }), []);
});

test("idsEquiposSeleccionados reconoce inventarioId y equipoId", () => {
  const ids = idsEquiposSeleccionados([
    { inventarioId: "eq-cam-01" },
    { equipoId: "eq-luz-01" },
    { inventarioId: "" },
    {},
  ]);

  assert.equal(ids.has("eq-cam-01"), true);
  assert.equal(ids.has("eq-luz-01"), true);
  assert.equal(ids.size, 2);
});

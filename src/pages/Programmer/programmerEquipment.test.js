import assert from "node:assert/strict";
import test from "node:test";

import {
  equipoDisponibilidadALinea,
  evaluarEquiposProgrammer,
  lineasEquipoAPayload,
  reemplazarLineaEquipo,
} from "./programmerEquipment.js";

const DISPONIBLE = {
  id: "equipo-a",
  placa: "CAM-01",
  descripcion: "Cámara principal",
  categoria: { nombre: "Cámaras" },
  subcategoria: { nombre: "Estudio" },
  disponible: true,
  restricciones: [{ texto: "No exponer al sol" }],
};

const RESERVADO = {
  id: "equipo-b",
  placa: "CAM-02",
  descripcion: "Cámara secundaria",
  disponible: false,
  motivoNoDisponible: "Reservado en esta franja",
};

const INACTIVO = {
  id: "equipo-c",
  placa: "LUZ-01",
  descripcion: "Luz de relleno",
  disponible: false,
  motivoNoDisponible: "Mantenimiento",
};

test("marca como bloqueada una placa reservada en la franja", () => {
  const resultado = evaluarEquiposProgrammer(
    [{ inventarioId: "equipo-b", placa: "CAM-02" }],
    [RESERVADO]
  );

  assert.equal(resultado.bloqueado, true);
  assert.equal(resultado.lineas[0].estado, "no-disponible");
  assert.equal(resultado.lineas[0].motivo, "Reservado en esta franja");
});

test("marca como bloqueado un equipo inactivo con su motivo", () => {
  const resultado = evaluarEquiposProgrammer(
    [{ inventarioId: "equipo-c", placa: "LUZ-01" }],
    [INACTIVO]
  );

  assert.equal(resultado.bloqueado, true);
  assert.equal(resultado.lineas[0].motivo, "Mantenimiento");
});

test("no bloquea cuando todos los equipos están disponibles", () => {
  const resultado = evaluarEquiposProgrammer(
    [{ inventarioId: "equipo-a", placa: "CAM-01" }],
    [DISPONIBLE]
  );

  assert.equal(resultado.bloqueado, false);
  assert.equal(resultado.lineas[0].estado, "ok");
  assert.equal(resultado.lineas[0].disponible, true);
});

test("bloquea líneas sin placa real y equipos que ya no existen", () => {
  const sinPlaca = evaluarEquiposProgrammer(
    [{ equipoId: "", placa: "LEGADO" }],
    []
  );
  const inexistente = evaluarEquiposProgrammer(
    [{ inventarioId: "equipo-z", placa: "CAM-99" }],
    [DISPONIBLE]
  );

  assert.equal(sinPlaca.lineas[0].estado, "sin-inventario");
  assert.equal(inexistente.lineas[0].estado, "no-encontrado");
  assert.equal(sinPlaca.bloqueado, true);
  assert.equal(inexistente.bloqueado, true);
});

test("bloquea placas repetidas dentro de la misma solicitud", () => {
  const resultado = evaluarEquiposProgrammer(
    [
      { inventarioId: "equipo-a", placa: "CAM-01" },
      { inventarioId: "equipo-a", placa: "CAM-01" },
    ],
    [DISPONIBLE]
  );

  assert.equal(resultado.bloqueado, true);
  assert.equal(resultado.lineas[0].estado, "duplicado");
  assert.equal(resultado.lineas[1].estado, "duplicado");
});

test("una solicitud sin equipos no bloquea la aprobación", () => {
  const resultado = evaluarEquiposProgrammer([], []);

  assert.equal(resultado.bloqueado, false);
  assert.deepEqual(resultado.lineas, []);
});

test("convierte un equipo de disponibilidad en línea guardable", () => {
  const linea = equipoDisponibilidadALinea(DISPONIBLE);

  assert.equal(linea.inventarioId, "equipo-a");
  assert.equal(linea.placa, "CAM-01");
  assert.equal(linea.categoria, "Cámaras");
  assert.deepEqual(linea.restricciones, ["No exponer al sol"]);
  assert.equal(linea.cantidad, 1);
});

test("reemplaza solo la línea indicada y conserva sus notas", () => {
  const originales = [
    {
      inventarioId: "equipo-b",
      placa: "CAM-02",
      notas: "Llevar cable extra",
      restriccionesAceptadasPor: "Ana",
    },
    { inventarioId: "equipo-c", placa: "LUZ-01", notas: "Sin notas" },
  ];

  const nuevas = reemplazarLineaEquipo(originales, 0, DISPONIBLE);

  assert.equal(nuevas[0].inventarioId, "equipo-a");
  assert.equal(nuevas[0].notas, "Llevar cable extra");
  assert.equal(nuevas[0].restriccionesAceptadasPor, "");
  assert.equal(nuevas[1].inventarioId, "equipo-c");
});

test("el payload conserva aceptaciones de restricciones de otras líneas", () => {
  const payload = lineasEquipoAPayload([
    {
      inventarioId: "equipo-c",
      placa: "LUZ-01",
      restricciones: ["No mojar"],
      restriccionesAceptadasPor: "Ana",
      restriccionesAceptadasPorId: "usuario-1",
      restriccionesAceptadasEl: "2026-11-18T12:00:00.000Z",
    },
  ]);

  assert.equal(payload[0].equipoId, "equipo-c");
  assert.equal(payload[0].restriccionesAceptadasPor, "Ana");
  assert.equal(payload[0].restriccionesAceptadasPorId, "usuario-1");
  assert.deepEqual(payload[0].restricciones, ["No mojar"]);
});

import assert from "node:assert/strict";
import test from "node:test";

import { ESTADOS } from "../Requirements/requirementsData.js";
import {
  estadoProgrammerUI,
  resumenPersonalProgrammer,
} from "./programmerStatus.js";
import { idProgrammerDeTurno } from "../../utils/programmerTurno.js";

test("Agendado es un estado válido y se puede asignar personal", () => {
  assert.equal(ESTADOS.includes("Agendado"), true);

  const estado = estadoProgrammerUI("Agendado");

  assert.equal(estado.puedeAsignar, true);
  assert.equal(estado.puedeDecidir, false);
  assert.equal(estado.esFinal, true);
  assert.equal(estado.aprobado, true);
});

test("Aprobada también permite asignar personal después de decidir", () => {
  const estado = estadoProgrammerUI("Aprobada");

  assert.equal(estado.puedeAsignar, true);
  assert.equal(estado.puedeDecidir, false);
  assert.equal(estado.aprobado, true);
});

test("Pendiente permite decidir y asignar, pero no está aprobado", () => {
  const estado = estadoProgrammerUI("Pendiente");

  assert.equal(estado.puedeAsignar, true);
  assert.equal(estado.puedeDecidir, true);
  assert.equal(estado.esFinal, false);
  assert.equal(estado.aprobado, false);
});

test("Rechazada no permite asignar personal", () => {
  const estado = estadoProgrammerUI("Rechazada");

  assert.equal(estado.puedeAsignar, false);
  assert.equal(estado.puedeDecidir, false);
  assert.equal(estado.esFinal, true);
});

test("el id del Programmer ignora el placeholder ID_event del borrador", () => {
  assert.equal(
    idProgrammerDeTurno({
      Event_name: "6afd1b1561c4e5a2fd4a8850",
      ID_event: "------",
    }),
    "6afd1b1561c4e5a2fd4a8850"
  );
  assert.equal(
    idProgrammerDeTurno({ Event_name: "", ID_event: "------", ID_programa: "" }),
    ""
  );
});

test("el resumen de personal calcula cupos completos y pendientes", () => {
  const parcial = resumenPersonalProgrammer([
    { cantidad: 1, asignados: [{ nombre: "Felipe" }] },
    { cantidad: 1, asignados: [] },
  ]);
  const completo = resumenPersonalProgrammer([
    { cantidad: 1, asignados: [{ nombre: "Felipe" }] },
    { cantidad: 1, asignados: [{ nombre: "Ana" }] },
  ]);
  const vacio = resumenPersonalProgrammer([]);

  assert.equal(parcial.total, 2);
  assert.equal(parcial.asignados, 1);
  assert.equal(parcial.pendientes, 1);
  assert.equal(parcial.completo, false);
  assert.equal(completo.completo, true);
  assert.equal(completo.pendientes, 0);
  assert.equal(vacio.completo, false);
  assert.equal(vacio.total, 0);
});

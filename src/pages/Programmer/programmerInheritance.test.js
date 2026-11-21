import assert from "node:assert/strict";
import test from "node:test";

import {
  departamentoHeredado,
  programaHeredado,
  tipoEventoHeredado,
} from "./programmerInheritance.js";

test("el programa heredado es el nombre del programador, sin espacios sobrantes", () => {
  assert.equal(programaHeredado("  Café Colombia  "), "Café Colombia");
  assert.equal(programaHeredado(undefined), "");
});

test("el tipo de evento heredado es el departamento", () => {
  assert.equal(tipoEventoHeredado("  Comercial  "), "Comercial");
});

test("el tipo de evento queda vacío sin departamento", () => {
  assert.equal(tipoEventoHeredado(""), "");
  assert.equal(tipoEventoHeredado("Sin departamento"), "");
  assert.equal(tipoEventoHeredado(null), "");
});

test("el departamento vacío se normaliza como Sin departamento", () => {
  assert.equal(departamentoHeredado(""), "Sin departamento");
  assert.equal(departamentoHeredado("  "), "Sin departamento");
  assert.equal(departamentoHeredado("Comercial"), "Comercial");
});

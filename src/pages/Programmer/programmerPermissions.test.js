import assert from "node:assert/strict";
import test from "node:test";

import { puedeGestionarProgrammer } from "./programmerPermissions.js";

test("permite los roles gestores definidos", () => {
  assert.equal(puedeGestionarProgrammer({ rol: "Ingeniero" }), true);
  assert.equal(puedeGestionarProgrammer({ rol: "Administrador" }), true);
  assert.equal(puedeGestionarProgrammer({ rol: "Coordinador" }), true);
});

test("bloquea roles sin permiso o sin sesión", () => {
  assert.equal(puedeGestionarProgrammer({ rol: "Operador" }), false);
  assert.equal(puedeGestionarProgrammer({ rol: "" }), false);
  assert.equal(puedeGestionarProgrammer(null), false);
});

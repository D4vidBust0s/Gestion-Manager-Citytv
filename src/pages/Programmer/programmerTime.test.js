import assert from "node:assert/strict";
import test from "node:test";

import { horasEntreHoras, minutosEntreHoras } from "./programmerTime.js";

test("calcula las horas entre la hora de inicio y fin", () => {
  assert.equal(horasEntreHoras("08:00", "09:30"), 1.5);
});

test("redondea las horas a dos decimales", () => {
  assert.equal(horasEntreHoras("08:00", "08:20"), 0.33);
});

test("suma un día cuando el evento cruza medianoche", () => {
  assert.equal(minutosEntreHoras("22:00", "00:30"), 150);
  assert.equal(horasEntreHoras("22:00", "00:30"), 2.5);
});

test("devuelve cero con horas inválidas o vacías", () => {
  assert.equal(horasEntreHoras("", "09:00"), 0);
  assert.equal(horasEntreHoras("08:00", ""), 0);
});

test("devuelve cero cuando inicio y fin son iguales", () => {
  assert.equal(horasEntreHoras("08:00", "08:00"), 0);
});

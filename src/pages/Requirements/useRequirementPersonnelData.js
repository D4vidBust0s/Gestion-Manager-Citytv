import { useCallback, useEffect, useState } from "react";

import { groupsApi } from "../../api/groups";
import { payrollApi } from "../../api/payroll";
import { rotationsManagerApi, rotationsManagerFsApi } from "../../api/rotationsManager";
import { rotationsApi } from "../../api/rotations";
import { rulesApi } from "../../api/rules";
import { shiftsApi } from "../../api/shifts";
import { stacksApi } from "../../api/stacks";
import { programsApi } from "../../api/programs";
import { substitutionsApi } from "../../api/substitutions";
import { permissionsApi } from "../../api/permissions";
import { incapacityApi } from "../../api/incapacity";
import { recessApi } from "../../api/recess";
import { licensesApi } from "../../api/licenses";
import { breaksApi } from "../../api/breaks";
import { compensatoriesApi } from "../../api/compensatories";
import { isCanceled } from "../../api/client";

import { calcularRango } from "../../utils/balancer";
import { isoInicioDiaLocal } from "../../utils/plannerCoverage";
import { buscarGrupoParaRol, obtenerIdGrupo } from "../../utils/requirementPersonnel";
import { ROLES_TECNICOS } from "./requirementsData";

const lista = (valor) => (Array.isArray(valor) ? valor : []);

/**
 * Carga en paralelo los datos reales necesarios para la ventana de personal:
 * grupos, personal, rotaciones, ausencias, turnos del día/periodo y catálogos
 * de duración. La asignación NO escribe en el backend.
 */
export const useRequirementPersonnelData = (fechaISO, rolId, rolNombreLinea = "") => {
  const [datos, setDatos] = useState({
    groups: [],
    payroll: [],
    rotationsManager: [],
    rotationsManagerFs: [],
    rotations: [],
    rules: [],
    shiftsDia: [],
    shiftsPeriodo: [],
    stacks: [],
    programs: [],
    substitutions: [],
    ausencias: {
      permissions: [],
      incapacitys: [],
      recess: [],
      licenses: [],
      breaks: [],
      compensatories: [],
    },
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const recargar = useCallback(() => setVersion((actual) => actual + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const config = { signal: controller.signal };
    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setError(null);

      try {
        const fecha = fechaISO
          ? new Date(`${fechaISO}T12:00:00`)
          : new Date();
        const daykey = isoInicioDiaLocal(fecha);

        const [
          groups,
          payroll,
          rotationsManager,
          rotationsManagerFs,
          rotations,
          rules,
          shiftsDia,
          stacks,
          programs,
          substitutions,
          permissions,
          incapacitys,
          recess,
          licenses,
          breaks,
          compensatories,
        ] = await Promise.all([
          groupsApi.getAll(config),
          payrollApi.getAll(config),
          rotationsManagerApi.getAll(config),
          rotationsManagerFsApi.getAll(config),
          rotationsApi.getAll(config),
          rulesApi.getAll(config),
          daykey
            ? shiftsApi.getDayKey({ ...config, params: { daykey } })
            : Promise.resolve([]),
          stacksApi.getAll(config),
          programsApi.getAll(config),
          substitutionsApi.getAll(config),
          permissionsApi.getAll(config),
          incapacityApi.getAll(config),
          recessApi.getAll(config),
          licensesApi.getAll(config),
          breaksApi.getAll(config),
          compensatoriesApi.getAll(config),
        ]);

        if (!activo) return;

        const rango = calcularRango(lista(rules));
        let shiftsPeriodo = [];

        if (rango?.in && rango?.out) {
          shiftsPeriodo = lista(
            await shiftsApi.getDay({
              ...config,
              params: { in: rango.in, out: rango.out },
            })
          );
        }

        if (!activo) return;

        setDatos({
          groups: lista(groups),
          payroll: lista(payroll),
          rotationsManager: lista(rotationsManager),
          rotationsManagerFs: lista(rotationsManagerFs),
          rotations: lista(rotations),
          rules: lista(rules),
          shiftsDia: lista(shiftsDia),
          shiftsPeriodo,
          stacks: lista(stacks),
          programs: lista(programs),
          substitutions: lista(substitutions),
          ausencias: {
            permissions: lista(permissions),
            incapacitys: lista(incapacitys),
            recess: lista(recess),
            licenses: lista(licenses),
            breaks: lista(breaks),
            compensatories: lista(compensatories),
          },
        });
      } catch (err) {
        if (!activo || isCanceled(err) || controller.signal.aborted) return;
        setError(
          err?.message ||
            "No se pudo cargar el personal del grupo. Intenta de nuevo."
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
      controller.abort();
    };
  }, [fechaISO, version]);

  const rolNombre =
    ROLES_TECNICOS.find((rol) => rol.id === rolId)?.nombre ??
    rolNombreLinea ??
    rolId;

  const coincidencia = buscarGrupoParaRol(
    datos.groups,
    rolId,
    rolNombre
  );

  return {
    datos,
    cargando,
    error,
    recargar,
    rolNombre,
    coincidencia,
    grupoInicialId: coincidencia.grupo
      ? obtenerIdGrupo(coincidencia.grupo)
      : "",
  };
};

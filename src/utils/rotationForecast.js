import { aFecha } from "./plannerStack";

const idDe = (registro) =>
  registro?._id ?? registro?.id ?? registro?.userId ?? "";

const idUsuarioDe = (registro) =>
  registro?.userId ?? registro?.ID_user ?? registro?.idUser ?? "";

const esFijo = (valor) =>
  valor === true || valor === "true" || valor === 1;

const tieneSchemaValido = (registro) => {
  const schemaId = String(registro?.schemaId ?? "").trim();
  const nombre = String(registro?.SchemaName ?? "").trim();

  return Boolean(schemaId) && schemaId !== "------------" && nombre !== "------------";
};

const esFinDeSemana = (fecha) => [0, 6].includes(fecha.getDay());

const mismoGrupo = (registro, grupoId) =>
  String(
    registro?.groupId ?? registro?.groupID ?? registro?.Grupo_ID ?? ""
  ) === String(grupoId ?? "");

const grupoDeEsquema = (rotation) =>
  rotation?.Grupo_ID ?? rotation?.grupoId ?? rotation?.groupId ?? "";

const ordenDeEsquema = (rotation) => rotation?.Order ?? rotation?.order;

const tipoDeEsquema = (rotation) => rotation?.Tipo ?? rotation?.tipo ?? "";

const nombreDeEsquema = (rotation) => rotation?.Nombre ?? rotation?.nombre;

const inicioDelDia = (fecha) => {
  const valor = aFecha(fecha);
  if (!valor) return null;

  const dia = new Date(valor.getTime());
  dia.setHours(0, 0, 0, 0);
  return dia;
};

/** Semanas completas entre el dayKey y la fecha objetivo. */
const semanasCompletas = (desde, hasta) => {
  const inicio = inicioDelDia(desde);
  const fin = inicioDelDia(hasta);
  if (!inicio || !fin || fin < inicio) return 0;

  const dias = Math.floor(
    (Date.UTC(fin.getFullYear(), fin.getMonth(), fin.getDate()) -
      Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())) /
      (1000 * 60 * 60 * 24)
  );

  return dias > 0 ? Math.floor(dias / 7) : 0;
};

const buscarRegistro = (registros, userId, grupoId) =>
  (Array.isArray(registros) ? registros : []).find(
    (registro) =>
      String(idUsuarioDe(registro)) === String(userId) &&
      mismoGrupo(registro, grupoId)
  );

const buscarEsquema = ({ rotations, grupoId, indice, finDeSemana }) => {
  const delGrupo = (Array.isArray(rotations) ? rotations : []).filter(
    (rotation) =>
      String(grupoDeEsquema(rotation)) === String(grupoId)
  );

  const porOrden = delGrupo.filter(
    (rotation) => Number(ordenDeEsquema(rotation)) === Number(indice)
  );

  const tipoBuscado = finDeSemana ? "fin" : "entre";
  const delTipo = porOrden.find((rotation) =>
    String(tipoDeEsquema(rotation))
      .toLowerCase()
      .includes(tipoBuscado)
  );

  return delTipo ?? porOrden[0] ?? null;
};

const inicioDeEsquema = (esquema) =>
  esquema?.HoraInicio ?? esquema?.horaInicio ?? esquema?.Start ?? null;

const finDeEsquema = (esquema) =>
  esquema?.HoraFinal ?? esquema?.horaFin ?? esquema?.End ?? null;

/**
 * Proyección del turno de un trabajador para una fecha.
 *
 * Replica el criterio de ModalPlanner1 (Pronostico/ciclo/despues):
 * - Fijo: conserva su esquema.
 * - Variable: avanza por la secuencia única de índices del grupo según las
 *   semanas completas transcurridas desde el dayKey.
 * - En fin de semana se prefieren los registros de rotationsmanager-fs.
 */
export const proyectarRotacion = ({
  persona,
  rotationsManager = [],
  rotationsManagerFs = [],
  rotations = [],
  fecha,
  grupoId,
}) => {
  const userId = idDe(persona);
  const objetivo = aFecha(fecha);
  const grupo = grupoId ?? persona?.grupoID ?? persona?.GrupoID ?? persona?.grupo;

  if (!userId || !objetivo) {
    return { estado: "sin-rotacion" };
  }

  const finDeSemana = esFinDeSemana(objetivo);
  const registroFs = finDeSemana
    ? buscarRegistro(rotationsManagerFs, userId, grupo)
    : null;
  const registroRegular = buscarRegistro(rotationsManager, userId, grupo);
  const usarFinDeSemana = tieneSchemaValido(registroFs);

  // Solo se usa la rotación de fin de semana cuando tiene un esquema real.
  // Si la tabla FS está vacía, se replica el criterio de ModalPlanner1 y se
  // cae a la rotación entre semana.
  const registro = usarFinDeSemana ? registroFs : registroRegular;

  if (!registro || !tieneSchemaValido(registro)) {
    return { estado: "sin-rotacion" };
  }

  const dayKey = aFecha(registro?.dayKey);
  const fijo = esFijo(registro?.fijo);
  const esquemaBase = (Array.isArray(rotations) ? rotations : []).find(
    (rotation) => String(idDe(rotation)) === String(registro?.schemaId)
  );
  const base = {
    esFijo: fijo,
    dayKey,
    schemaId: registro?.schemaId ?? "",
    nombreTurno: registro?.SchemaName ?? "Sin esquema",
    horaInicio: inicioDeEsquema(esquemaBase),
    horaFin: finDeEsquema(esquemaBase),
  };

  const diaObjetivo = inicioDelDia(objetivo);
  const diaClave = inicioDelDia(dayKey);

  if (diaClave && diaObjetivo < diaClave) {
    return {
      ...base,
      estado: "antes",
      semanas: 0,
    };
  }

  if (fijo) {
    return {
      ...base,
      estado: "ok",
      semanas: diaClave ? semanasCompletas(diaClave, diaObjetivo) : 0,
    };
  }

  const semanas = diaClave ? semanasCompletas(diaClave, diaObjetivo) : 0;
  const actual = Number(registro?.actual);

  const secuencia = [
    ...new Set(
      (Array.isArray(rotationsManager) ? rotationsManager : [])
        .filter(
          (item) =>
            mismoGrupo(item, grupo) &&
            !esFijo(item?.fijo) &&
            Number(item?.actual) !== 0
        )
        .map((item) => Number(item?.actual))
        .filter((valor) => Number.isFinite(valor))
    ),
  ].sort((a, b) => a - b);

  const posicion = secuencia.indexOf(actual);

  if (posicion !== -1 && secuencia.length > 0) {
    const indice = secuencia[(posicion + semanas) % secuencia.length];
    const esquema = buscarEsquema({
      rotations,
      grupoId: grupo,
      indice,
      finDeSemana: usarFinDeSemana,
    });

    if (esquema) {
      return {
        estado: "ok",
        esFijo: false,
        dayKey,
        semanas,
        schemaId: idDe(esquema),
        nombreTurno: nombreDeEsquema(esquema) ?? base.nombreTurno,
        horaInicio: inicioDeEsquema(esquema),
        horaFin: finDeEsquema(esquema),
      };
    }
  }

  return {
    ...base,
    estado: "ok",
    semanas,
  };
};

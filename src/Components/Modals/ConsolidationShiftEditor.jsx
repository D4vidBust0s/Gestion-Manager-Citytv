import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import { FiSave, FiTrash2 } from "react-icons/fi";

import {
  aFecha,
} from "../../utils/plannerStack";
import {
  formatearHoraCorta,
  horarioEfectivoTurno,
} from "../../utils/consolidation";
import "./ConsolidationShiftEditor.css";

const TIPOS = ["Programa", "Secondary", "Programmer", "Custom", "TimeOut", "Null"];

const ETIQUETA_TIPO = {
  Programa: "Programa",
  Secondary: "Secondary",
  Programmer: "Programmer",
  Custom: "Custom",
  TimeOut: "TimeOut",
  Null: "Null-30",
};

const conHora = (fechaBase, valorHora) => {
  if (!valorHora || !String(valorHora).includes(":")) return null;

  const [horas, minutos] = String(valorHora).split(":").map(Number);
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return null;

  const fecha = new Date(fechaBase ?? new Date());
  fecha.setHours(horas, minutos, 0, 0);
  return fecha;
};

const horaTexto = (fecha) => formatearHoraCorta(fecha) ?? "";

const mismoDia = (a, b) => {
  if (!a || !b) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const minutosEntre = (inicio, fin) => {
  if (!inicio || !fin) return 0;
  return Math.max(0, Math.round((fin.getTime() - inicio.getTime()) / 60000));
};

const crearFormulario = (turno, fecha, catalogs) => {
  const horario = horarioEfectivoTurno(turno, catalogs);
  const tipo = TIPOS.includes(turno?.Type) ? turno.Type : "Custom";
  const inicio = horario.inicio ?? aFecha(turno?.Inicio_main) ?? null;
  const fin = horario.fin ?? aFecha(turno?.Out) ?? null;
  const idPrograma = turno?.Event_name ?? "";

  return {
    tipo,
    idPrograma,
    inicio,
    fin,
    observacion: turno?.Observacion ?? "",
    original: {
      tipo,
      idPrograma,
      inicio: inicio?.getTime() ?? null,
      fin: fin?.getTime() ?? null,
      observacion: turno?.Observacion ?? "",
    },
  };
};

const programasDeTipo = (programs, tipo) =>
  (Array.isArray(programs) ? programs : []).filter((programa) => {
    const tipoPrograma = String(programa?.Type ?? "").trim();
    if (tipo === "Secondary") return tipoPrograma === "Secondary";
    return tipoPrograma === "Main" || tipoPrograma === "";
  });

const etiquetaPrograma = (programa) =>
  programa?.nombre ?? programa?.Nombre ?? programa?._id ?? "Programa";

export default function ConsolidationShiftEditor({
  turno,
  programs = [],
  programmers = [],
  stacks = [],
  fecha,
  guardando = false,
  onActualizar,
  onEliminar,
}) {
  const catalogs = useMemo(
    () => ({ programs, programmers, stacks }),
    [programs, programmers, stacks]
  );

  const turnoIdRef = useRef(null);
  const [form, setForm] = useState(() =>
    turno ? crearFormulario(turno, fecha, catalogs) : null
  );
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    const id = turno?._id ?? null;
    if (id === turnoIdRef.current) return;

    turnoIdRef.current = id;
    setForm(turno ? crearFormulario(turno, fecha, catalogs) : null);
    setError("");
  }, [turno, fecha, catalogs]);

  if (!turno || !form) {
    return (
      <section className="consolidation-editor consolidation-editor--empty">
        <h4>Turno programado</h4>
        <p>
          Seleccione un turno de la lista central o del panel derecho para
          validarlo o modificarlo.
        </p>
        <span className="consolidation-editor__hint">
          Los cambios se guardan sobre el mismo registro; no se crea un turno
          nuevo.
        </span>
      </section>
    );
  }

  const opcionesPrograma =
    form.tipo === "Programa" || form.tipo === "Secondary"
      ? programasDeTipo(programs, form.tipo)
      : [];

  const programaActual = opcionesPrograma.find(
    (programa) => String(programa?._id) === String(form.idPrograma)
  );

  if (
    (form.tipo === "Programa" || form.tipo === "Secondary") &&
    !programaActual &&
    form.idPrograma
  ) {
    opcionesPrograma.unshift({
      _id: form.idPrograma,
      nombre: form.idPrograma,
    });
  }

  const cambios =
    form.tipo !== form.original.tipo ||
    form.idPrograma !== form.original.idPrograma ||
    (form.inicio?.getTime() ?? null) !== form.original.inicio ||
    (form.fin?.getTime() ?? null) !== form.original.fin ||
    form.observacion !== form.original.observacion;

  const cruza = !mismoDia(form.inicio, form.fin);
  const minutos = minutosEntre(form.inicio, form.fin);

  const actualizarCampo = (cambiosCampo) => {
    setForm((prev) => ({ ...prev, ...cambiosCampo }));
    setError("");
  };

  const handleTipo = (tipo) => {
    let idPrograma = form.idPrograma;

    if (tipo === "Null") idPrograma = "Null-30";
    else if (tipo === "TimeOut") idPrograma = "TimeOut";
    else if (tipo === "Custom") idPrograma = "";
    else if (tipo === "Programa" || tipo === "Secondary") {
      const opciones = programasDeTipo(programs, tipo);
      const existe = opciones.some(
        (programa) => String(programa?._id) === String(form.idPrograma)
      );
      idPrograma = existe ? form.idPrograma : "";
    } else if (tipo === "Programmer") {
      const existe = (Array.isArray(programmers) ? programmers : []).some(
        (programmer) => String(programmer?._id) === String(form.idPrograma)
      );
      idPrograma = existe ? form.idPrograma : "";
    }

    actualizarCampo({ tipo, idPrograma });
  };

  const handleInicio = (valor) => {
    const base = form.inicio ?? fecha ?? new Date();
    const nuevoInicio = conHora(base, valor);
    if (!nuevoInicio) return;

    let nuevoFin = form.fin;

    if (nuevoFin) {
      const finAjustado = new Date(nuevoInicio);
      finAjustado.setHours(
        nuevoFin.getHours(),
        nuevoFin.getMinutes(),
        0,
        0
      );

      if (finAjustado.getTime() <= nuevoInicio.getTime()) {
        finAjustado.setDate(finAjustado.getDate() + 1);
      }

      nuevoFin = finAjustado;
    }

    actualizarCampo({ inicio: nuevoInicio, fin: nuevoFin });
  };

  const handleFin = (valor) => {
    const base = form.inicio ?? fecha ?? new Date();
    const nuevoFin = conHora(base, valor);
    if (!nuevoFin) return;

    if (form.inicio && nuevoFin.getTime() <= form.inicio.getTime()) {
      nuevoFin.setDate(nuevoFin.getDate() + 1);
    }

    actualizarCampo({ fin: nuevoFin });
  };

  const construirPayload = () => {
    const tipo = form.tipo;
    const idPrograma =
      tipo === "Null"
        ? "Null-30"
        : tipo === "TimeOut"
          ? "TimeOut"
          : form.idPrograma;

    const cambioEvento =
      tipo !== form.original.tipo ||
      String(idPrograma) !== String(form.original.idPrograma);

    let color = turno.Color ?? "red";
    let idSchema = turno.Id_Schema ?? "------";

    if (cambioEvento) {
      if (tipo === "Programa" || tipo === "Secondary") {
        const programa = opcionesPrograma.find(
          (registro) => String(registro?._id) === String(idPrograma)
        );
        color = programa?.Color || "Brown";
      } else {
        color = "red";
      }
      idSchema = "------";
    }

    return {
      index: turno.Index,
      idPrograma,
      eventId: turno.ID_event ?? "------",
      tipo,
      color,
      observacion: form.observacion.trim(),
      idSchema,
      inicioMain: form.inicio ? form.inicio.toISOString() : undefined,
      out: form.fin ? form.fin.toISOString() : "------",
      estadoConsolidacion: "Pendiente",
      observacionConsolidacion: "",
    };
  };

  const handleGuardar = async () => {
    if (guardando || actualizando) return;

    if (
      ["Programa", "Secondary", "Programmer", "Custom"].includes(form.tipo) &&
      !String(form.idPrograma ?? "").trim()
    ) {
      setError("Seleccione o escriba el evento del turno.");
      return;
    }

    if (!form.inicio || !form.fin) {
      setError("Indique la hora de inicio y de fin.");
      return;
    }

    if (form.fin.getTime() <= form.inicio.getTime()) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    if (!cambios) {
      toast.info("Sin cambios en el turno programado.");
      return;
    }

    setActualizando(true);

    try {
      const exito = await onActualizar(turno._id, construirPayload());

      if (exito) {
        setForm((prev) =>
          prev
            ? {
                ...prev,
                original: {
                  tipo: prev.tipo,
                  idPrograma: prev.idPrograma,
                  inicio: prev.inicio?.getTime() ?? null,
                  fin: prev.fin?.getTime() ?? null,
                  observacion: prev.observacion,
                },
              }
            : prev
        );
        toast.success("Turno programado actualizado");
      }
    } finally {
      setActualizando(false);
    }
  };

  const handleEliminar = async () => {
    if (guardando || actualizando) return;
    await onEliminar(turno._id);
  };

  const bloqueado = guardando || actualizando;

  const requiereEvento = ["Programa", "Secondary", "Programmer", "Custom"].includes(
    form.tipo
  );

  return (
    <section className="consolidation-editor">
      <header className="consolidation-editor__header">
        <div>
          <h4>Turno programado #{turno.Index ?? "—"}</h4>
          <p>
            {ETIQUETA_TIPO[form.tipo] ?? form.tipo} ·{" "}
            {form.inicio ? formatearHoraCorta(form.inicio) : "--:--"} –{" "}
            {form.fin ? formatearHoraCorta(form.fin) : "--:--"}
            {cruza ? " (+1 día)" : ""} · {minutos} min
          </p>
        </div>
        <span className="consolidation-editor__same">Mismo registro</span>
      </header>

      {error && (
        <p className="consolidation-editor__error" role="alert">
          {error}
        </p>
      )}

      <div className="consolidation-editor__grid">
        <label>
          <span>Tipo</span>
          <select
            value={form.tipo}
            onChange={(evento) => handleTipo(evento.target.value)}
          >
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {ETIQUETA_TIPO[tipo]}
              </option>
            ))}
          </select>
        </label>

        {(form.tipo === "Programa" || form.tipo === "Secondary") && (
          <label>
            <span>Evento</span>
            <select
              value={form.idPrograma}
              onChange={(evento) =>
                actualizarCampo({ idPrograma: evento.target.value })
              }
            >
              <option value="">Seleccione un evento</option>
              {opcionesPrograma.map((programa) => (
                <option key={programa._id} value={programa._id}>
                  {etiquetaPrograma(programa)}
                </option>
              ))}
            </select>
          </label>
        )}

        {form.tipo === "Programmer" && (
          <label>
            <span>Programmer</span>
            <select
              value={form.idPrograma}
              onChange={(evento) =>
                actualizarCampo({ idPrograma: evento.target.value })
              }
            >
              <option value="">Seleccione un evento</option>
              {(Array.isArray(programmers) ? programmers : []).map(
                (programmer) => (
                  <option key={programmer._id} value={programmer._id}>
                    {programmer.Nombre ?? programmer._id}
                  </option>
                )
              )}
            </select>
          </label>
        )}

        {form.tipo === "Custom" && (
          <label>
            <span>Nombre del evento</span>
            <input
              type="text"
              value={form.idPrograma}
              onChange={(evento) =>
                actualizarCampo({ idPrograma: evento.target.value })
              }
              placeholder="Ej.: Cubrimiento especial"
            />
          </label>
        )}

        {(form.tipo === "Null" || form.tipo === "TimeOut") && (
          <label>
            <span>Evento</span>
            <input
              type="text"
              value={form.tipo === "Null" ? "Null-30" : "TimeOut"}
              readOnly
            />
          </label>
        )}

        <label>
          <span>Inicio</span>
          <input
            type="time"
            value={horaTexto(form.inicio)}
            onChange={(evento) => handleInicio(evento.target.value)}
          />
        </label>

        <label>
          <span>Fin</span>
          <input
            type="time"
            value={horaTexto(form.fin)}
            onChange={(evento) => handleFin(evento.target.value)}
          />
        </label>
      </div>

      <label className="consolidation-editor__observation">
        <span>Observación del turno</span>
        <textarea
          rows={2}
          value={form.observacion}
          onChange={(evento) =>
            actualizarCampo({ observacion: evento.target.value })
          }
          placeholder="Ej.: el trabajador cumplió el turno de la tarde..."
        />
      </label>

      <div className="consolidation-editor__actions">
        <button
          type="button"
          className="consolidation-editor__btn consolidation-editor__btn--danger"
          onClick={handleEliminar}
          disabled={bloqueado}
        >
          <FiTrash2 aria-hidden="true" />
          Eliminar
        </button>

        <button
          type="button"
          className="consolidation-editor__btn consolidation-editor__btn--save"
          onClick={handleGuardar}
          disabled={
            bloqueado || !cambios || (requiereEvento && !form.idPrograma)
          }
        >
          <FiSave aria-hidden="true" />
          {actualizando ? "Guardando..." : "Actualizar turno"}
        </button>
      </div>

      <p className="consolidation-editor__hint">
        Actualiza este mismo turno. No se crea otro registro.
      </p>
    </section>
  );
}

ConsolidationShiftEditor.propTypes = {
  turno: PropTypes.object,
  programs: PropTypes.array,
  programmers: PropTypes.array,
  stacks: PropTypes.array,
  fecha: PropTypes.instanceOf(Date),
  guardando: PropTypes.bool,
  onActualizar: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
};

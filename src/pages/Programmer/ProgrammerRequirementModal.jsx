import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { PRIORIDADES } from "../Requirements/requirementsData";
import { imagenEquipoPorId } from "../../api/equipment";
import EquipmentCatalogPicker from "../../Components/Equipment/EquipmentCatalogPicker";
import {
  categoriaLinea,
  idsEquiposSeleccionados,
  nombreEquipoLinea,
} from "../../Components/Equipment/equipmentCatalogFilters";
import { useEquipmentAvailability } from "../../Custom_Hooks/useEquipmentAvailability";
import { useEquipmentCatalogs } from "../../Custom_Hooks/useEquipmentCatalogs";
import {
  checklistPlanner,
  construirFechaHora,
  formatearDuracion,
  parseFechaLocal,
  requerimientoAFormulario,
  validarRequerimiento,
} from "./programmerView";
import { horasEntreHoras, minutosEntreHoras } from "./programmerTime";
import "../Requirements/RequirementsContent.css";
import "./ProgrammerContent.css";

const CAMPOS_HEREDADOS = {
  nombre: "programa",
  departamento: "tipoEvento",
};

const TIPOS_PERSONAL_VACIO = {
  rolId: "",
  rol: "",
  cantidad: 1,
  horas: 0,
  notas: "",
};
const TIPOS_EQUIPO_VACIO = {
  equipoId: "",
  inventarioId: "",
  equipo: "",
  placa: "",
  categoria: "",
  subcategoria: "",
  descripcion: "",
  imagenActualizadaEn: null,
  restricciones: [],
  restriccionesAceptadasPor: "",
  restriccionesAceptadasPorId: "",
  restriccionesAceptadasEl: null,
  cantidad: 1,
  notas: "",
};

const idGrupo = (grupo) => String(grupo?._id ?? grupo?.id ?? "");

/**
 * Alta y edición de un requerimiento manual.
 *
 * Los campos del bloque "Evento" son los que ModalPlanner1 necesita para
 * agregar el turno Type: "Programmer"; el resto queda como documentación del
 * requerimiento.
 */
export default function ProgrammerRequirementModal({
  requerimiento,
  fechaInicial,
  onSubmit,
  onClose,
  guardando = false,
  grupos = [],
  gruposCargando = false,
  gruposError = null,
  onRecargarGrupos,
  departamentos = [],
  departamentosError = null,
}) {
  const esEdicion = Boolean(requerimiento);
  const [formulario, setFormulario] = useState(() =>
    requerimientoAFormulario(requerimiento, fechaInicial)
  );
  const [errores, setErrores] = useState({});
  const esReapertura =
    esEdicion &&
    ["Aprobada", "Agendado", "Rechazada"].includes(String(formulario.estado));

  const disponibilidad = useEquipmentAvailability({
    fechaClave: parseFechaLocal(formulario.fechaClave),
    timeIn: construirFechaHora(formulario.fechaClave, formulario.horaInicio),
    timeOut: construirFechaHora(formulario.fechaClave, formulario.horaFin),
    excluirOrigenTipo: requerimiento ? "Programmer" : "",
    excluirOrigenId: requerimiento?.id ?? "",
  });
  const catalogos = useEquipmentCatalogs();
  const [filaEquipoAbierta, setFilaEquipoAbierta] = useState(null);
  const equiposDisponibles = disponibilidad.equipos;
  const resumenEquipos = disponibilidad.resumen;
  const cargandoEquipos = disponibilidad.cargando;
  const errorEquipos = disponibilidad.error;
  const franjaLista = Boolean(
    parseFechaLocal(formulario.fechaClave) &&
      formulario.horaInicio &&
      formulario.horaFin
  );

  useEffect(() => {
    const alPresionarTecla = (evento) => {
      if (evento.key === "Escape" && !guardando) onClose();
    };

    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [guardando, onClose]);

  const actualizar = (campo, valor) => {
    setFormulario((previo) => {
      const siguiente = { ...previo, [campo]: valor };
      const heredado = CAMPOS_HEREDADOS[campo];
      if (heredado) siguiente[heredado] = valor;

      if (campo === "horaInicio" || campo === "horaFin") {
        const horas = horasEntreHoras(
          campo === "horaInicio" ? valor : siguiente.horaInicio,
          campo === "horaFin" ? valor : siguiente.horaFin
        );
        siguiente.personal = (Array.isArray(previo.personal)
          ? previo.personal
          : []
        ).map((item) => ({ ...item, horas }));
      }

      return siguiente;
    });
    setErrores((previos) => {
      if (!previos[campo]) return previos;
      const siguientes = { ...previos };
      delete siguientes[campo];
      return siguientes;
    });
  };

  const actualizarSolicitante = (campo, valor) => {
    setFormulario((previo) => ({
      ...previo,
      solicitante: { ...previo.solicitante, [campo]: valor },
    }));
    setErrores((previos) => {
      if (campo !== "correo" || !previos.correo) return previos;
      const siguientes = { ...previos };
      delete siguientes.correo;
      return siguientes;
    });
  };

  const actualizarFila = (coleccion, indice, campo, valor, extra = {}) => {
    setFormulario((previo) => ({
      ...previo,
      [coleccion]: previo[coleccion].map((item, posicion) =>
        posicion === indice ? { ...item, [campo]: valor, ...extra } : item
      ),
    }));

    setErrores((previos) => {
      const clave =
        coleccion === "personal" ? `personal_${indice}` : `equipo_${indice}`;
      const claveCantidad = `${clave}_cantidad`;
      if (!previos[clave] && !previos[claveCantidad]) return previos;

      const siguientes = { ...previos };
      delete siguientes[clave];
      delete siguientes[claveCantidad];
      return siguientes;
    });
  };

  const agregarFila = (coleccion, valorInicial) => {
    setFormulario((previo) => ({
      ...previo,
      [coleccion]: [...previo[coleccion], { ...valorInicial }],
    }));
  };

  const quitarFila = (coleccion, indice) => {
    setFormulario((previo) => ({
      ...previo,
      [coleccion]: previo[coleccion].filter(
        (_, posicion) => posicion !== indice
      ),
    }));
  };

  const agregarPersonal = () => {
    agregarFila("personal", {
      ...TIPOS_PERSONAL_VACIO,
      horas: horasEntreHoras(formulario.horaInicio, formulario.horaFin),
    });
  };

  const agregarEquipo = () => {
    setFilaEquipoAbierta(formulario.equipos.length);
    agregarFila("equipos", TIPOS_EQUIPO_VACIO);
  };

  const quitarEquipo = (indice) => {
    quitarFila("equipos", indice);
    setFilaEquipoAbierta(null);
  };

  const seleccionarEquipo = (indice, id) => {
    const equipo = equiposDisponibles.find(
      (item) => String(item.id) === String(id)
    );

    if (!equipo) {
      actualizarFila("equipos", indice, {
        ...TIPOS_EQUIPO_VACIO,
        equipoId: id,
        inventarioId: id,
      });
      return;
    }

    const restricciones = (Array.isArray(equipo.restricciones)
      ? equipo.restricciones
      : []
    )
      .map((item) => String(item?.texto ?? item))
      .filter(Boolean);

    actualizarFila("equipos", indice, "equipoId", String(equipo.id), {
      inventarioId: String(equipo.id),
      equipo:
        equipo.descripcion ||
        `${equipo.categoria?.nombre ?? "Equipo"} ${equipo.placa ?? ""}`.trim(),
      placa: equipo.placa ?? "",
      categoria: equipo.categoria?.nombre ?? "",
      subcategoria: equipo.subcategoria?.nombre ?? "",
      descripcion: equipo.descripcion ?? "",
      imagenActualizadaEn: equipo.imagen?.actualizadaEn ?? null,
      restricciones,
      restriccionesAceptadasPor: "",
      restriccionesAceptadasPorId: "",
      restriccionesAceptadasEl: null,
      cantidad: 1,
    });
  };

  const seleccionarEquipoYcerrar = (indice, equipo) => {
    seleccionarEquipo(indice, String(equipo?.id ?? ""));
    setFilaEquipoAbierta(null);
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();

    const resultado = validarRequerimiento(formulario);
    setErrores(resultado.errores);

    if (!resultado.valido) {
      toast.error("Revisa los campos marcados");
      return;
    }

    onSubmit(formulario);
  };

  const minutos = minutosEntreHoras(
    formulario.horaInicio,
    formulario.horaFin
  );
  const cruzaMedianoche = Boolean(
    formulario.horaInicio &&
      formulario.horaFin &&
      formulario.horaFin < formulario.horaInicio
  );
  const checklist = checklistPlanner({
    ...formulario,
    id: esEdicion ? requerimiento.id : "nuevo",
  });

  return createPortal(
    <div
      className="requirements-modal-overlay"
      role="presentation"
      onClick={() => {
        if (!guardando) onClose();
      }}
    >
      <div
        className="requirements-modal requirements-modal--detail programmer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="programmer-modal-title"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="requirements-modal__header requirements-modal__header--detail">
          <div className="requirements-modal__heading">
            <span className="requirements-modal__eyebrow">
              {esEdicion ? "Editar programador" : "Alta manual de programador"}
            </span>
            <h2 id="programmer-modal-title">
              {esEdicion
                ? formulario.nombre || "Programador"
                : "Nuevo programador"}
            </h2>
            <p>
              Los datos del evento alimentan Programador de Turnos; el resto
              documenta al programador.
            </p>
          </div>

          <button
            type="button"
            className="requirements-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario de programador"
            disabled={guardando}
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <form className="programmer-form" onSubmit={manejarEnvio} noValidate>
          <div className="requirements-modal__body">
            <section className="requirements-block programmer-preview">
              <h4>
                <FiAlertTriangle aria-hidden="true" />
                Resumen para Programador de Turnos
              </h4>

              <div className="programmer-preview__grid">
                <div>
                  <span>Código</span>
                  <strong>{formulario.codigo || "Automático"}</strong>
                </div>
                <div>
                  <span>Horario</span>
                  <strong>
                    {formulario.horaInicio || "--:--"} a{" "}
                    {formulario.horaFin || "--:--"}
                    {cruzaMedianoche ? " (+1 día)" : ""}
                  </strong>
                </div>
                <div>
                  <span>Duración</span>
                  <strong>{formatearDuracion(minutos)}</strong>
                </div>
              </div>

              <ul className="programmer-checks">
                {checklist.map((item) => (
                  <li
                    key={item.clave}
                    className={item.ok ? "is-ok" : "is-warn"}
                  >
                    {item.ok ? (
                      <FiCheckCircle aria-hidden="true" />
                    ) : (
                      <FiAlertTriangle aria-hidden="true" />
                    )}
                    {item.label}
                  </li>
                ))}
              </ul>
            </section>

            <section className="requirements-block">
              <h4>Datos del programador</h4>

              <div className="programmer-form-grid">
                <label className="programmer-field">
                  <span>Nombre del programador *</span>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(evento) =>
                      actualizar("nombre", evento.target.value)
                    }
                    placeholder="Ej.: Comercial Café Colombia"
                    autoFocus
                    aria-invalid={Boolean(errores.nombre)}
                  />
                  {errores.nombre ? (
                    <small className="programmer-field__error">
                      {errores.nombre}
                    </small>
                  ) : null}
                </label>

                <label className="programmer-field">
                  <span>Código</span>
                  <input
                    type="text"
                    value={formulario.codigo}
                    onChange={(evento) =>
                      actualizar("codigo", evento.target.value)
                    }
                    placeholder="Automático si se deja vacío"
                  />
                  <small className="programmer-field__hint">
                    {esEdicion
                      ? "Si lo dejas vacío se conserva el código actual."
                      : "Se genera como REQ-AAAA-XXXXXX si no lo escribes."}
                  </small>
                </label>

                <label className="programmer-field">
                  <span>Departamento</span>
                  <input
                    type="text"
                    list="programmer-departamentos"
                    value={formulario.departamento}
                    onChange={(evento) =>
                      actualizar("departamento", evento.target.value)
                    }
                    placeholder="Ej.: Comercial"
                  />
                  <datalist id="programmer-departamentos">
                    {departamentos.map((departamento) => (
                      <option
                        key={departamento.id ?? departamento.nombre}
                        value={departamento.nombre}
                      />
                    ))}
                  </datalist>
                  {departamentosError ? (
                    <small className="programmer-field__error">
                      No se pudieron cargar los departamentos; escribe el
                      nombre manualmente.
                    </small>
                  ) : null}
                </label>

                <label className="programmer-field">
                  <span>Prioridad</span>
                  <select
                    value={formulario.prioridad}
                    onChange={(evento) =>
                      actualizar("prioridad", evento.target.value)
                    }
                  >
                    {PRIORIDADES.map((prioridad) => (
                      <option key={prioridad} value={prioridad}>
                        {prioridad}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="programmer-field">
                  <span>Estado</span>
                  <div className="programmer-state-readonly">
                    {formulario.estado}
                  </div>
                  <small className="programmer-field__hint">
                    El estado se gestiona con las acciones de aprobación en el
                    panel del programador.
                  </small>
                </div>

                {esReapertura ? (
                  <div className="programmer-reopen-warning" role="alert">
                    <FiAlertTriangle aria-hidden="true" />
                    <span>
                      Al guardar, este programador volverá a Pendiente y
                      deberá aprobarse de nuevo. Si cambian fecha, horas o
                      grupos, se limpiarán las asignaciones de personal.
                    </span>
                  </div>
                ) : null}

                <label className="programmer-field programmer-field--wide">
                  <span>Descripción del programador</span>
                  <textarea
                    rows={3}
                    value={formulario.descripcion}
                    onChange={(evento) =>
                      actualizar("descripcion", evento.target.value)
                    }
                    placeholder="Qué se necesita, para qué y cualquier detalle del correo o solicitud."
                  />
                </label>
              </div>
            </section>

            <section className="requirements-block">
              <h4>Datos del evento para Programador de Turnos</h4>

              <div className="programmer-form-grid">
                <label className="programmer-field programmer-field--derived">
                  <span>Programa / evento</span>
                  <input
                    type="text"
                    value={formulario.nombre}
                    readOnly
                    aria-readonly="true"
                    placeholder="Se completa con el nombre del programador"
                  />
                  <small className="programmer-field__hint">
                    Se hereda automáticamente de «Nombre del programador».
                  </small>
                </label>

                <label className="programmer-field programmer-field--derived">
                  <span>Tipo de evento</span>
                  <input
                    type="text"
                    value={formulario.departamento}
                    readOnly
                    aria-readonly="true"
                    placeholder="Se completa con el departamento"
                  />
                  <small className="programmer-field__hint">
                    Se hereda automáticamente de «Departamento».
                  </small>
                </label>

                <label className="programmer-field">
                  <span>Fecha del evento *</span>
                  <input
                    type="date"
                    value={formulario.fechaClave}
                    onChange={(evento) =>
                      actualizar("fechaClave", evento.target.value)
                    }
                    aria-invalid={Boolean(errores.fechaClave)}
                  />
                  {errores.fechaClave ? (
                    <small className="programmer-field__error">
                      {errores.fechaClave}
                    </small>
                  ) : null}
                </label>

                <label className="programmer-field">
                  <span>Vigente hasta</span>
                  <input
                    type="date"
                    value={formulario.fechaEnd}
                    onChange={(evento) =>
                      actualizar("fechaEnd", evento.target.value)
                    }
                    aria-invalid={Boolean(errores.fechaEnd)}
                  />
                  {errores.fechaEnd ? (
                    <small className="programmer-field__error">
                      {errores.fechaEnd}
                    </small>
                  ) : null}
                </label>

                <label className="programmer-field">
                  <span>Hora de inicio *</span>
                  <input
                    type="time"
                    step="60"
                    value={formulario.horaInicio}
                    onChange={(evento) =>
                      actualizar("horaInicio", evento.target.value)
                    }
                    aria-invalid={Boolean(errores.horaInicio)}
                  />
                  {errores.horaInicio ? (
                    <small className="programmer-field__error">
                      {errores.horaInicio}
                    </small>
                  ) : null}
                </label>

                <label className="programmer-field">
                  <span>Hora de fin *</span>
                  <input
                    type="time"
                    step="60"
                    value={formulario.horaFin}
                    onChange={(evento) =>
                      actualizar("horaFin", evento.target.value)
                    }
                    aria-invalid={Boolean(errores.horaFin)}
                  />
                  {errores.horaFin ? (
                    <small className="programmer-field__error">
                      {errores.horaFin}
                    </small>
                  ) : (
                    <small className="programmer-field__hint">
                      Si es menor que la hora de inicio, se entiende que cruza
                      medianoche.
                    </small>
                  )}
                </label>

                <label className="programmer-field">
                  <span>Locación</span>
                  <input
                    type="text"
                    value={formulario.locacion}
                    onChange={(evento) =>
                      actualizar("locacion", evento.target.value)
                    }
                    placeholder="Ej.: Estudio 3 - Citytv"
                  />
                </label>

                <label className="programmer-field">
                  <span>Color del evento</span>
                  <span className="programmer-color-field">
                    <input
                      type="color"
                      value={formulario.color}
                      onChange={(evento) =>
                        actualizar("color", evento.target.value)
                      }
                      aria-invalid={Boolean(errores.color)}
                    />
                    <code>{formulario.color}</code>
                  </span>
                  {errores.color ? (
                    <small className="programmer-field__error">
                      {errores.color}
                    </small>
                  ) : null}
                </label>
              </div>
            </section>

            <section className="requirements-block">
              <h4>Solicitante</h4>

              <div className="programmer-form-grid">
                <label className="programmer-field">
                  <span>Nombre</span>
                  <input
                    type="text"
                    value={formulario.solicitante.nombre}
                    onChange={(evento) =>
                      actualizarSolicitante("nombre", evento.target.value)
                    }
                    placeholder="Quién solicita"
                  />
                </label>

                <label className="programmer-field">
                  <span>Cargo</span>
                  <input
                    type="text"
                    value={formulario.solicitante.cargo}
                    onChange={(evento) =>
                      actualizarSolicitante("cargo", evento.target.value)
                    }
                    placeholder="Ej.: Productor"
                  />
                </label>

                <label className="programmer-field">
                  <span>Correo</span>
                  <input
                    type="email"
                    value={formulario.solicitante.correo}
                    onChange={(evento) =>
                      actualizarSolicitante("correo", evento.target.value)
                    }
                    placeholder="correo@citytv.com.co"
                    aria-invalid={Boolean(errores.correo)}
                  />
                  {errores.correo ? (
                    <small className="programmer-field__error">
                      {errores.correo}
                    </small>
                  ) : null}
                </label>

                <label className="programmer-field">
                  <span>Teléfono</span>
                  <input
                    type="tel"
                    value={formulario.solicitante.telefono}
                    onChange={(evento) =>
                      actualizarSolicitante("telefono", evento.target.value)
                    }
                    placeholder="310 000 0000"
                  />
                </label>
              </div>
            </section>

            <section className="requirements-block">
              <h4>Personal requerido</h4>

              <p className="programmer-groups-hint">
                Los roles se toman de los grupos definidos en Sistema →
                Groups.
              </p>

              <p className="programmer-groups-hint">
                Las horas se calculan automáticamente con la hora de inicio y
                fin del evento.
              </p>

              {gruposError ? (
                <div className="programmer-groups-error" role="alert">
                  <FiAlertTriangle aria-hidden="true" />
                  <span>{gruposError}</span>
                  {onRecargarGrupos ? (
                    <button
                      type="button"
                      className="requirements-btn requirements-btn--outline requirements-btn--sm"
                      onClick={onRecargarGrupos}
                    >
                      <FiRefreshCw aria-hidden="true" />
                      Reintentar
                    </button>
                  ) : null}
                </div>
              ) : null}

              {!gruposCargando && !gruposError && grupos.length === 0 ? (
                <p className="requirements-empty-text">
                  No hay grupos definidos en el sistema. Créalos en Sistema →
                  Groups antes de agregar personal.
                </p>
              ) : null}

              <div className="programmer-rows">
                <div className="programmer-rows__head" aria-hidden="true">
                  <span>Grupo</span>
                  <span>Cantidad</span>
                  <span>Horas</span>
                  <span>Notas</span>
                  <span />
                </div>

                {formulario.personal.map((item, indice) => (
                  <div
                    className="programmer-rows__row"
                    key={`personal-${indice}`}
                  >
                    <select
                      value={item.rolId}
                      disabled={gruposCargando}
                      onChange={(evento) => {
                        const idSeleccionado = evento.target.value;
                        const grupo = grupos.find(
                          (opcion) => idGrupo(opcion) === idSeleccionado
                        );

                        actualizarFila(
                          "personal",
                          indice,
                          "rolId",
                          idSeleccionado,
                          { rol: grupo?.nombre ?? "" }
                        );
                      }}
                      aria-label={`Grupo de la fila ${indice + 1}`}
                    >
                      <option value="">
                        {gruposCargando
                          ? "Cargando grupos…"
                          : "Selecciona un grupo"}
                      </option>
                      {grupos.map((grupo) => (
                        <option key={idGrupo(grupo)} value={idGrupo(grupo)}>
                          {grupo.nombre}
                        </option>
                      ))}
                      {item.rolId &&
                      !grupos.some(
                        (grupo) => idGrupo(grupo) === String(item.rolId)
                      ) ? (
                        <option value={item.rolId}>
                          {item.rol || "Rol anterior"} (registro anterior)
                        </option>
                      ) : null}
                    </select>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.cantidad}
                      onChange={(evento) =>
                        actualizarFila(
                          "personal",
                          indice,
                          "cantidad",
                          evento.target.value
                        )
                      }
                      aria-label={`Cantidad de la fila ${indice + 1}`}
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.horas}
                      readOnly
                      aria-readonly="true"
                      title="Se calcula con la hora de inicio y fin del evento"
                      className="programmer-rows__input--derived"
                      aria-label={`Horas de la fila ${indice + 1}`}
                    />

                    <input
                      type="text"
                      value={item.notas}
                      onChange={(evento) =>
                        actualizarFila(
                          "personal",
                          indice,
                          "notas",
                          evento.target.value
                        )
                      }
                      placeholder="Notas"
                      aria-label={`Notas de la fila ${indice + 1}`}
                    />

                    <button
                      type="button"
                      className="requirements-icon-btn requirements-icon-btn--danger"
                      onClick={() => quitarFila("personal", indice)}
                      title="Quitar este grupo"
                      aria-label={`Quitar el grupo de la fila ${indice + 1}`}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>

                    {errores[`personal_${indice}`] ||
                    errores[`personal_${indice}_cantidad`] ? (
                      <span className="programmer-rows__error">
                        {errores[`personal_${indice}`] ||
                          errores[`personal_${indice}_cantidad`]}
                      </span>
                    ) : null}
                  </div>
                ))}

                <button
                  type="button"
                  className="requirements-btn requirements-btn--outline requirements-btn--sm"
                  onClick={agregarPersonal}
                >
                  <FiPlus aria-hidden="true" />
                  Agregar personal
                </button>
              </div>
            </section>

            <section className="requirements-block">
              <h4>Equipos requeridos</h4>

              <div className="programmer-equipment-summary">
                <strong>
                  {resumenEquipos
                    ? `${resumenEquipos.total} equipos totales · ${resumenEquipos.inactivos} inactivos · ${resumenEquipos.disponibles} disponibles`
                    : "Consultando disponibilidad…"}
                </strong>
                {resumenEquipos?.reservadosEnFranja > 0 && (
                  <span>
                    {resumenEquipos.reservadosEnFranja} reservado(s) en esta franja
                  </span>
                )}
                <span>Solo se muestran los equipos disponibles para esta fecha y hora.</span>
              </div>

              {errorEquipos && <p className="programmer-rows__error">{errorEquipos}</p>}
              {cargandoEquipos && (
                <p className="programmer-equipment-hint">Cargando equipos disponibles…</p>
              )}

              <div className="programmer-rows">
                <div
                  className="programmer-rows__head programmer-rows__head--equipos"
                  aria-hidden="true"
                >
                  <span>Imagen</span>
                  <span>Equipo</span>
                  <span>Notas</span>
                  <span />
                </div>

                {formulario.equipos.map((item, indice) => {
                  const idSeleccionado = item.equipoId || item.inventarioId;
                  const disponible = equiposDisponibles.some(
                    (equipo) => String(equipo.id) === String(idSeleccionado)
                  );
                  const imagen = idSeleccionado
                    ? imagenEquipoPorId(
                        item.inventarioId || item.equipoId,
                        item.imagenActualizadaEn
                      )
                    : "";
                  const idsOcupadosFila = Array.from(
                    idsEquiposSeleccionados(
                      formulario.equipos.filter(
                        (_, posicion) => posicion !== indice
                      )
                    )
                  );

                  return (
                    <div
                      className={`programmer-rows__row programmer-rows__row--equipos ${
                        idSeleccionado && !disponible
                          ? "programmer-rows__row--unavailable"
                          : ""
                      }`}
                      key={`equipo-${indice}`}
                    >
                      <div className="programmer-equipment-thumb">
                        {imagen ? (
                          <a
                            href={imagenEquipoPorId(
                              item.inventarioId || item.equipoId,
                              item.imagenActualizadaEn,
                              "full"
                            )}
                            target="_blank"
                            rel="noreferrer"
                            title="Ver imagen del equipo"
                          >
                            <img src={imagen} alt={item.placa || "Equipo"} />
                          </a>
                        ) : (
                          <span aria-hidden="true">📷</span>
                        )}
                      </div>

                      <div className="programmer-equipment-selected">
                        {idSeleccionado ? (
                          <>
                            <div className="programmer-equipment-selected__top">
                              <strong>{nombreEquipoLinea(item)}</strong>
                              {!disponible ? (
                                <span className="programmer-equipment-badge programmer-equipment-badge--warning">
                                  No disponible
                                </span>
                              ) : (
                                <span className="programmer-equipment-badge">
                                  ×1 placa
                                </span>
                              )}
                            </div>
                            <small className="programmer-equipment-detail">
                              {categoriaLinea(item) || "Sin categoría"}
                            </small>
                            {item.descripcion ? (
                              <small className="programmer-equipment-detail">
                                {item.descripcion}
                              </small>
                            ) : null}
                            <button
                              type="button"
                              className="programmer-equipment-change"
                              onClick={() => setFilaEquipoAbierta(indice)}
                            >
                              Cambiar equipo
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="programmer-equipment-open"
                            onClick={() => setFilaEquipoAbierta(indice)}
                          >
                            <span aria-hidden="true">▦</span>
                            <span>
                              <strong>Seleccionar equipo</strong>
                              <small>
                                Filtra por categoría y subcategoría
                              </small>
                            </span>
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.notas}
                        onChange={(evento) =>
                          actualizarFila(
                            "equipos",
                            indice,
                            "notas",
                            evento.target.value
                          )
                        }
                        placeholder="Notas"
                        aria-label={`Notas de la fila ${indice + 1}`}
                      />

                      <button
                        type="button"
                        className="requirements-icon-btn requirements-icon-btn--danger"
                        onClick={() => quitarEquipo(indice)}
                        title="Quitar este equipo"
                        aria-label={`Quitar el equipo de la fila ${indice + 1}`}
                      >
                        <FiTrash2 aria-hidden="true" />
                      </button>

                      {filaEquipoAbierta === indice && (
                        <EquipmentCatalogPicker
                          equipos={equiposDisponibles}
                          cargando={cargandoEquipos}
                          error={errorEquipos}
                          franjaLista={franjaLista}
                          categorias={catalogos.categorias}
                          subcategorias={catalogos.subcategorias}
                          catalogosCargando={catalogos.cargando}
                          catalogosError={catalogos.error}
                          seleccionActual={item}
                          idsOcupados={idsOcupadosFila}
                          onSelect={(equipo) =>
                            seleccionarEquipoYcerrar(indice, equipo)
                          }
                          onClose={() => setFilaEquipoAbierta(null)}
                          onRecargar={disponibilidad.recargar}
                          onRecargarCatalogos={catalogos.recargar}
                        />
                      )}

                      {idSeleccionado && !disponible && (
                        <span className="programmer-rows__error">
                          Este equipo no está disponible para la franja. Quítalo o
                          elige otro.
                        </span>
                      )}

                      {Array.isArray(item.restricciones) &&
                        item.restricciones.length > 0 && (
                          <div className="programmer-restriction-warning">
                            <strong>⚠ Restricciones de este equipo</strong>
                            <ul>
                              {item.restricciones.map((restriccion) => (
                                <li key={restriccion}>{restriccion}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {errores[`equipo_${indice}`] ||
                      errores[`equipo_${indice}_cantidad`] ? (
                        <span className="programmer-rows__error">
                          {errores[`equipo_${indice}`] ||
                            errores[`equipo_${indice}_cantidad`]}
                        </span>
                      ) : null}
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="requirements-btn requirements-btn--outline requirements-btn--sm"
                  onClick={agregarEquipo}
                >
                  <FiPlus aria-hidden="true" />
                  Agregar equipo
                </button>
              </div>

              <label className="programmer-restriction-accept">
                <input
                  type="checkbox"
                  checked={Boolean(formulario.aceptaRestricciones)}
                  onChange={(evento) =>
                    actualizar("aceptaRestricciones", evento.target.checked)
                  }
                />
                <span>
                  He leído y acepto las restricciones de los equipos seleccionados.
                  Las restricciones se muestran en cada fila y quedan registradas en
                  la hoja de vida.
                </span>
              </label>
              {errores.aceptaRestricciones && (
                <span className="programmer-rows__error">
                  {errores.aceptaRestricciones}
                </span>
              )}
            </section>

            <section className="requirements-block">
              <h4>Observaciones</h4>

              <div className="programmer-form-grid">
                <label className="programmer-field programmer-field--wide">
                  <span>Observaciones generales</span>
                  <textarea
                    rows={3}
                    value={formulario.observacion}
                    onChange={(evento) =>
                      actualizar("observacion", evento.target.value)
                    }
                    placeholder="Notas internas del programador."
                  />
                </label>

                {esEdicion ? (
                  <label className="programmer-field programmer-field--wide">
                    <span>Nota de la actualización</span>
                    <textarea
                      rows={2}
                      value={formulario.notaCambio}
                      onChange={(evento) =>
                        actualizar("notaCambio", evento.target.value)
                      }
                      placeholder="Opcional: qué cambió y por qué."
                    />
                    <small className="programmer-field__hint">
                      Se guarda en el historial del programador.
                    </small>
                  </label>
                ) : null}
              </div>
            </section>
          </div>

          <footer className="requirements-modal__footer">
            <p className="requirements-modal__footer-text">
              {esEdicion
                ? "Los cambios se guardan en el programador y actualizan el evento de Programador de Turnos."
                : "Al guardar, el programador queda disponible en Programador de Turnos para su fecha."}
            </p>

            <div className="requirements-modal__footer-actions">
              <button
                type="button"
                className="requirements-btn requirements-btn--outline"
                onClick={onClose}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="requirements-btn requirements-btn--primary"
                disabled={guardando}
              >
                <FiSave aria-hidden="true" />
                {guardando
                  ? "Guardando…"
                  : esEdicion
                    ? esReapertura
                      ? "Guardar y reabrir"
                      : "Guardar cambios"
                    : "Crear programador"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>,
    document.body
  );
}

ProgrammerRequirementModal.propTypes = {
  requerimiento: PropTypes.object,
  fechaInicial: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  guardando: PropTypes.bool,
  grupos: PropTypes.array,
  gruposCargando: PropTypes.bool,
  gruposError: PropTypes.string,
  onRecargarGrupos: PropTypes.func,
  departamentos: PropTypes.array,
  departamentosError: PropTypes.string,
};

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import { FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";

import { useProgrammerGroups } from "../../Custom_Hooks/useProgrammerGroups";
import { useEquipmentAvailability } from "../../Custom_Hooks/useEquipmentAvailability";
import { useEquipmentCatalogs } from "../../Custom_Hooks/useEquipmentCatalogs";
import { imagenEquipoPorId } from "../../api/equipment";
import EquipmentCatalogPicker from "../../Components/Equipment/EquipmentCatalogPicker";
import {
  categoriaLinea,
  idsEquiposSeleccionados,
  nombreEquipoLinea,
} from "../../Components/Equipment/equipmentCatalogFilters";
import {
  construirFechaHora,
  parseFechaLocal,
} from "../Programmer/programmerView";
import "../Requirements/RequirementsContent.css";
import "../Programmer/ProgrammerContent.css";

const PRIORIDADES = ["Alta", "Media", "Baja"];

const PERSONAL_VACIO = {
  rolId: "",
  rol: "",
  cantidad: 1,
  horas: 0,
  notas: "",
  asignados: [],
};

const EQUIPO_VACIO = {
  equipoId: "",
  inventarioId: "",
  placa: "",
  categoria: "",
  subcategoria: "",
  descripcion: "",
  imagenActualizadaEn: null,
  restricciones: [],
  cantidad: 1,
  notas: "",
};

const fechaSoloDia = (valor) => {
  if (!valor) return "";
  const fecha =
    valor instanceof Date ? valor : new Date(`${valor}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) return "";
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(fecha.getDate()).padStart(2, "0")}`;
};

const estadoInicialFormulario = (solicitud) => ({
  nombre: solicitud?.nombre ?? "",
  departamentoId: solicitud?.departamentoId ?? "",
  prioridad: solicitud?.prioridad ?? "Media",
  programa: solicitud?.evento?.programa ?? "",
  tipoEvento: solicitud?.evento?.tipoEvento ?? "",
  fecha: solicitud?.evento?.fecha ?? fechaSoloDia(new Date()),
  horaInicio: solicitud?.evento?.horaInicio ?? "08:00",
  horaFin: solicitud?.evento?.horaFin ?? "09:00",
  locacion: solicitud?.evento?.locacion ?? "",
  descripcion: solicitud?.descripcion ?? "",
  observacion: solicitud?.observacion ?? "",
  solicitante: {
    nombre: solicitud?.solicitante?.nombre ?? "",
    cargo: solicitud?.solicitante?.cargo ?? "",
    correo: solicitud?.solicitante?.correo ?? "",
    telefono: solicitud?.solicitante?.telefono ?? "",
  },
  personal:
    solicitud?.personal?.length > 0
      ? solicitud.personal.map((linea) => ({
          ...PERSONAL_VACIO,
          ...linea,
          asignados: [],
        }))
      : [{ ...PERSONAL_VACIO }],
  equipos:
    solicitud?.equipos?.length > 0
      ? solicitud.equipos.map((equipo) => ({ ...EQUIPO_VACIO, ...equipo }))
      : [],
  aceptaRestricciones: false,
});

/** Alta y edición de una solicitud de Requirements. */
export default function RequirementFormModal({
  solicitud = null,
  departamentos = [],
  onSubmit,
  onClose,
  guardando = false,
}) {
  const esEdicion = Boolean(solicitud);
  const [formulario, setFormulario] = useState(() =>
    estadoInicialFormulario(solicitud)
  );
  const [filaEquipoAbierta, setFilaEquipoAbierta] = useState(null);
  const { grupos } = useProgrammerGroups();
  const catalogos = useEquipmentCatalogs();

  const fechaDisponibilidad = parseFechaLocal(formulario.fecha);
  const disponibilidad = useEquipmentAvailability({
    fechaClave: fechaDisponibilidad,
    timeIn: construirFechaHora(formulario.fecha, formulario.horaInicio),
    timeOut: construirFechaHora(formulario.fecha, formulario.horaFin),
    excluirOrigenTipo: solicitud ? "Requirement" : "",
    excluirOrigenId: solicitud?.id ?? "",
  });

  const equiposDisponibles = disponibilidad.equipos;
  const resumenEquipos = disponibilidad.resumen;
  const franjaLista = Boolean(
    fechaDisponibilidad && formulario.horaInicio && formulario.horaFin
  );

  const hayRestricciones = useMemo(
    () =>
      formulario.equipos.some(
        (equipo) => Array.isArray(equipo.restricciones) && equipo.restricciones.length > 0
      ),
    [formulario.equipos]
  );

  const actualizar = (campo, valor) =>
    setFormulario((previo) => ({ ...previo, [campo]: valor }));

  const actualizarSolicitante = (campo, valor) =>
    setFormulario((previo) => ({
      ...previo,
      solicitante: { ...previo.solicitante, [campo]: valor },
    }));

  const actualizarFila = (coleccion, indice, cambios) =>
    setFormulario((previo) => ({
      ...previo,
      [coleccion]: previo[coleccion].map((item, posicion) =>
        posicion === indice ? { ...item, ...cambios } : item
      ),
    }));

  const agregarPersonal = () =>
    setFormulario((previo) => ({
      ...previo,
      personal: [...previo.personal, { ...PERSONAL_VACIO }],
    }));

  const quitarPersonal = (indice) =>
    setFormulario((previo) => ({
      ...previo,
      personal: previo.personal.filter((_, posicion) => posicion !== indice),
    }));

  const agregarEquipo = () => {
    setFilaEquipoAbierta(formulario.equipos.length);
    setFormulario((previo) => ({
      ...previo,
      equipos: [...previo.equipos, { ...EQUIPO_VACIO }],
    }));
  };

  const quitarEquipo = (indice) => {
    setFormulario((previo) => ({
      ...previo,
      equipos: previo.equipos.filter((_, posicion) => posicion !== indice),
    }));
    setFilaEquipoAbierta(null);
  };

  const seleccionarEquipo = (indice, id) => {
    const equipo = equiposDisponibles.find(
      (item) => String(item.id) === String(id)
    );

    if (!equipo) {
      actualizarFila("equipos", indice, {
        ...EQUIPO_VACIO,
        equipoId: id,
        inventarioId: id,
      });
      return;
    }

    actualizarFila("equipos", indice, {
      equipoId: String(equipo.id),
      inventarioId: String(equipo.id),
      placa: equipo.placa ?? "",
      categoria: equipo.categoria?.nombre ?? "",
      subcategoria: equipo.subcategoria?.nombre ?? "",
      descripcion: equipo.descripcion ?? "",
      imagenActualizadaEn: equipo.imagen?.actualizadaEn ?? null,
      restricciones: (Array.isArray(equipo.restricciones)
        ? equipo.restricciones
        : []
      )
        .map((restriccion) => String(restriccion?.texto ?? restriccion))
        .filter(Boolean),
      cantidad: 1,
    });
  };

  const seleccionarEquipoYcerrar = (indice, equipo) => {
    seleccionarEquipo(indice, String(equipo?.id ?? ""));
    setFilaEquipoAbierta(null);
  };

  const enviar = (evento) => {
    evento.preventDefault();

    if (!formulario.nombre.trim()) {
      toast.error("El nombre de la solicitud es obligatorio");
      return;
    }
    if (!formulario.departamentoId) {
      toast.error("Selecciona el área/departamento");
      return;
    }
    if (!formulario.fecha) {
      toast.error("Selecciona la fecha del evento");
      return;
    }
    if (hayRestricciones && !formulario.aceptaRestricciones) {
      toast.error("Debes aceptar las restricciones de los equipos seleccionados");
      return;
    }

    const personal = formulario.personal
      .filter((linea) => linea.rolId)
      .map((linea) => ({
        rolId: linea.rolId,
        rol: linea.rol || grupos.find((grupo) => String(grupo._id) === linea.rolId)?.nombre || "",
        cantidad: Number(linea.cantidad) || 0,
        horas: Number(linea.horas) || 0,
        notas: linea.notas ?? "",
      }));

    const equipos = formulario.equipos
      .filter((equipo) => equipo.inventarioId || equipo.equipoId)
      .map((equipo) => ({
        inventarioId: equipo.inventarioId || equipo.equipoId,
        placa: equipo.placa,
        categoria: equipo.categoria,
        descripcion: equipo.descripcion,
        imagenActualizadaEn: equipo.imagenActualizadaEn,
        restricciones: equipo.restricciones,
        cantidad: 1,
        notas: equipo.notas ?? "",
      }));

    onSubmit({
      nombre: formulario.nombre.trim(),
      departamentoId: formulario.departamentoId,
      prioridad: formulario.prioridad,
      evento: {
        programa: formulario.programa.trim(),
        tipoEvento: formulario.tipoEvento.trim(),
        fecha: formulario.fecha,
        horaInicio: formulario.horaInicio,
        horaFin: formulario.horaFin,
        locacion: formulario.locacion.trim(),
      },
      solicitante: formulario.solicitante,
      descripcion: formulario.descripcion.trim(),
      observacion: formulario.observacion.trim(),
      personal,
      equipos,
      aceptaRestricciones: Boolean(formulario.aceptaRestricciones),
      timeIn: construirFechaHora(formulario.fecha, formulario.horaInicio),
      timeOut: construirFechaHora(formulario.fecha, formulario.horaFin),
      revision: solicitud?.revision,
    });
  };

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
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="requirements-modal__header requirements-modal__header--detail">
          <div className="requirements-modal__heading">
            <span className="requirements-modal__eyebrow">
              {esEdicion ? "Editar solicitud" : "Nueva solicitud por área"}
            </span>
            <h2>{esEdicion ? formulario.nombre || "Solicitud" : "Nueva solicitud"}</h2>
            <p>
              Requirements gestiona las solicitudes de Comercial, Noticias y las
              demás áreas. Los equipos se reservan al aprobar.
            </p>
          </div>

          <button
            type="button"
            className="requirements-modal__close"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar formulario"
          >
            <FiX />
          </button>
        </header>

        <form className="programmer-form" onSubmit={enviar}>
          <div className="requirements-modal__body">
            <section className="requirements-block">
              <h4>Evento y área</h4>

              <div className="programmer-form-grid">
                <label className="programmer-field programmer-field--wide">
                  <span>Nombre de la solicitud *</span>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(evento) => actualizar("nombre", evento.target.value)}
                    placeholder="Ej. Comercial Café Colombia"
                  />
                </label>

                <label className="programmer-field">
                  <span>Área / departamento *</span>
                  <select
                    value={formulario.departamentoId}
                    onChange={(evento) =>
                      actualizar("departamentoId", evento.target.value)
                    }
                  >
                    <option value="">Selecciona el área</option>
                    {departamentos.map((departamento) => (
                      <option key={departamento.id} value={departamento.id}>
                        {departamento.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="programmer-field">
                  <span>Prioridad</span>
                  <select
                    value={formulario.prioridad}
                    onChange={(evento) => actualizar("prioridad", evento.target.value)}
                  >
                    {PRIORIDADES.map((prioridad) => (
                      <option key={prioridad} value={prioridad}>
                        {prioridad}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="programmer-field">
                  <span>Programa</span>
                  <input
                    type="text"
                    value={formulario.programa}
                    onChange={(evento) => actualizar("programa", evento.target.value)}
                  />
                </label>

                <label className="programmer-field">
                  <span>Tipo de evento</span>
                  <input
                    type="text"
                    value={formulario.tipoEvento}
                    onChange={(evento) => actualizar("tipoEvento", evento.target.value)}
                  />
                </label>

                <label className="programmer-field">
                  <span>Fecha *</span>
                  <input
                    type="date"
                    value={formulario.fecha}
                    onChange={(evento) => actualizar("fecha", evento.target.value)}
                  />
                </label>

                <label className="programmer-field">
                  <span>Hora inicio</span>
                  <input
                    type="time"
                    value={formulario.horaInicio}
                    onChange={(evento) => actualizar("horaInicio", evento.target.value)}
                  />
                </label>

                <label className="programmer-field">
                  <span>Hora fin</span>
                  <input
                    type="time"
                    value={formulario.horaFin}
                    onChange={(evento) => actualizar("horaFin", evento.target.value)}
                  />
                </label>

                <label className="programmer-field">
                  <span>Locación</span>
                  <input
                    type="text"
                    value={formulario.locacion}
                    onChange={(evento) => actualizar("locacion", evento.target.value)}
                  />
                </label>

                <label className="programmer-field programmer-field--wide">
                  <span>Descripción</span>
                  <textarea
                    rows={2}
                    value={formulario.descripcion}
                    onChange={(evento) => actualizar("descripcion", evento.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="requirements-block">
              <h4>Solicitante</h4>
              <div className="programmer-form-grid">
                {[
                  ["nombre", "Nombre"],
                  ["cargo", "Cargo"],
                  ["correo", "Correo"],
                  ["telefono", "Teléfono"],
                ].map(([campo, etiqueta]) => (
                  <label className="programmer-field" key={campo}>
                    <span>{etiqueta}</span>
                    <input
                      type="text"
                      value={formulario.solicitante[campo]}
                      onChange={(evento) =>
                        actualizarSolicitante(campo, evento.target.value)
                      }
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="requirements-block">
              <h4>Personal requerido</h4>

              <div className="programmer-rows">
                {formulario.personal.map((linea, indice) => (
                  <div className="programmer-rows__row" key={`personal-${indice}`}>
                    <select
                      value={linea.rolId}
                      onChange={(evento) => {
                        const grupo = grupos.find(
                          (item) => String(item._id) === evento.target.value
                        );
                        actualizarFila("personal", indice, {
                          rolId: evento.target.value,
                          rol: grupo?.nombre ?? "",
                        });
                      }}
                    >
                      <option value="">Selecciona un grupo</option>
                      {grupos.map((grupo) => (
                        <option key={grupo._id} value={String(grupo._id)}>
                          {grupo.nombre}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={linea.cantidad}
                      onChange={(evento) =>
                        actualizarFila("personal", indice, {
                          cantidad: Number(evento.target.value) || 0,
                        })
                      }
                      aria-label="Cantidad"
                    />

                    <input
                      type="number"
                      min="0"
                      value={linea.horas}
                      onChange={(evento) =>
                        actualizarFila("personal", indice, {
                          horas: Number(evento.target.value) || 0,
                        })
                      }
                      aria-label="Horas"
                    />

                    <input
                      type="text"
                      value={linea.notas}
                      onChange={(evento) =>
                        actualizarFila("personal", indice, {
                          notas: evento.target.value,
                        })
                      }
                      placeholder="Notas"
                    />

                    <button
                      type="button"
                      className="requirements-icon-btn requirements-icon-btn--danger"
                      onClick={() => quitarPersonal(indice)}
                      title="Quitar grupo"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="requirements-btn requirements-btn--outline requirements-btn--sm"
                  onClick={agregarPersonal}
                >
                  <FiPlus /> Agregar personal
                </button>
              </div>
            </section>

            <section className="requirements-block">
              <h4>Equipos requeridos</h4>

              <div className="programmer-equipment-summary">
                <strong>
                  {resumenEquipos.total} equipos totales ·{" "}
                  {resumenEquipos.inactivos} inactivos ·{" "}
                  {resumenEquipos.disponibles} disponibles
                </strong>
                <span>
                  Solo se muestran equipos disponibles para la fecha y hora del
                  evento.
                </span>
              </div>

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

                {formulario.equipos.map((equipo, indice) => {
                  const id = equipo.inventarioId || equipo.equipoId;
                  const disponible = equiposDisponibles.some(
                    (item) => String(item.id) === String(id)
                  );
                  const imagen = id
                    ? imagenEquipoPorId(id, equipo.imagenActualizadaEn)
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
                        id && !disponible ? "programmer-rows__row--unavailable" : ""
                      }`}
                      key={`equipo-${indice}`}
                    >
                      <div className="programmer-equipment-thumb">
                        {imagen ? (
                          <a
                            href={imagenEquipoPorId(
                              id,
                              equipo.imagenActualizadaEn,
                              "full"
                            )}
                            target="_blank"
                            rel="noreferrer"
                            title="Ver imagen del equipo"
                          >
                            <img src={imagen} alt={equipo.placa || "Equipo"} />
                          </a>
                        ) : (
                          <span aria-hidden="true">📷</span>
                        )}
                      </div>

                      <div className="programmer-equipment-selected">
                        {id ? (
                          <>
                            <div className="programmer-equipment-selected__top">
                              <strong>{nombreEquipoLinea(equipo)}</strong>
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
                              {categoriaLinea(equipo) || "Sin categoría"}
                            </small>
                            {equipo.descripcion ? (
                              <small className="programmer-equipment-detail">
                                {equipo.descripcion}
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
                        value={equipo.notas}
                        onChange={(evento) =>
                          actualizarFila("equipos", indice, {
                            notas: evento.target.value,
                          })
                        }
                        placeholder="Notas"
                        aria-label={`Notas de la fila ${indice + 1}`}
                      />

                      <button
                        type="button"
                        className="requirements-icon-btn requirements-icon-btn--danger"
                        onClick={() => quitarEquipo(indice)}
                        title="Quitar equipo"
                      >
                        <FiTrash2 />
                      </button>

                      {filaEquipoAbierta === indice && (
                        <EquipmentCatalogPicker
                          equipos={equiposDisponibles}
                          cargando={disponibilidad.cargando}
                          error={disponibilidad.error}
                          franjaLista={franjaLista}
                          categorias={catalogos.categorias}
                          subcategorias={catalogos.subcategorias}
                          catalogosCargando={catalogos.cargando}
                          catalogosError={catalogos.error}
                          seleccionActual={equipo}
                          idsOcupados={idsOcupadosFila}
                          onSelect={(equipoSeleccionado) =>
                            seleccionarEquipoYcerrar(
                              indice,
                              equipoSeleccionado
                            )
                          }
                          onClose={() => setFilaEquipoAbierta(null)}
                          onRecargar={disponibilidad.recargar}
                          onRecargarCatalogos={catalogos.recargar}
                        />
                      )}

                      {id && !disponible && (
                        <span className="programmer-rows__error">
                          Este equipo no está disponible para la franja.
                        </span>
                      )}

                      {equipo.restricciones?.length > 0 && (
                        <div className="programmer-restriction-warning">
                          <strong>⚠ Restricciones de este equipo</strong>
                          <ul>
                            {equipo.restricciones.map((restriccion) => (
                              <li key={restriccion}>{restriccion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="requirements-btn requirements-btn--outline requirements-btn--sm"
                  onClick={agregarEquipo}
                >
                  <FiPlus /> Agregar equipo
                </button>
              </div>

              <label className="programmer-restriction-accept">
                <input
                  type="checkbox"
                  checked={formulario.aceptaRestricciones}
                  onChange={(evento) =>
                    actualizar("aceptaRestricciones", evento.target.checked)
                  }
                />
                <span>
                  He leído y acepto las restricciones de los equipos seleccionados.
                </span>
              </label>
            </section>

            <section className="requirements-block">
              <h4>Observaciones</h4>
              <label className="programmer-field programmer-field--wide">
                <span>Observaciones internas</span>
                <textarea
                  rows={3}
                  value={formulario.observacion}
                  onChange={(evento) =>
                    actualizar("observacion", evento.target.value)
                  }
                />
              </label>
            </section>
          </div>

          <footer className="requirements-modal__footer">
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
              <FiSave /> {guardando ? "Guardando…" : "Guardar solicitud"}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body
  );
}

RequirementFormModal.propTypes = {
  solicitud: PropTypes.object,
  departamentos: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  guardando: PropTypes.bool,
};

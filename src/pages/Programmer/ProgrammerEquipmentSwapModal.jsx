import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import { imagenEquipoPorId, imagenEquipoSrc } from "../../api/equipment";
import { programmerApi } from "../../api/programmer";
import EquipmentCatalogPicker from "../../Components/Equipment/EquipmentCatalogPicker";
import { idsEquiposSeleccionados } from "../../Components/Equipment/equipmentCatalogFilters";
import { useEquipmentCatalogs } from "../../Custom_Hooks/useEquipmentCatalogs";
import {
  lineasEquipoAPayload,
  nombreEquipo,
  reemplazarLineaEquipo,
} from "./programmerEquipment";
import "./ProgrammerContent.css";

const restriccionesDe = (item) =>
  (Array.isArray(item?.restricciones) ? item.restricciones : [])
    .map((restriccion) => String(restriccion?.texto ?? restriccion).trim())
    .filter(Boolean);

/**
 * Reemplazo puntual de una placa que dejó de estar disponible antes de aprobar
 * el programador. Guarda el cambio con PUT /programmer/:id y devuelve el
 * registro actualizado al padre.
 */
export default function ProgrammerEquipmentSwapModal({
  requerimiento,
  indice,
  motivo = "",
  equipos = [],
  cargando = false,
  error = null,
  onRecargar,
  onClose,
  onGuardado,
}) {
  const catalogos = useEquipmentCatalogs();
  const [seleccion, setSeleccion] = useState(null);
  const [aceptaRestricciones, setAceptaRestricciones] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");

  const lineaActual = requerimiento?.equipos?.[indice] ?? null;
  const imagenActual = lineaActual
    ? imagenEquipoPorId(
        lineaActual.inventarioId || lineaActual.equipoId,
        lineaActual.imagenActualizadaEn
      )
    : "";
  const imagenSeleccion = seleccion ? imagenEquipoSrc(seleccion, "thumb") : "";
  const restriccionesSeleccion = restriccionesDe(seleccion);
  const requiereAceptacion = restriccionesSeleccion.length > 0;

  const idsOcupados = useMemo(
    () =>
      Array.from(
        idsEquiposSeleccionados(
          (requerimiento?.equipos ?? []).filter(
            (_, posicion) => posicion !== indice
          )
        )
      ),
    [requerimiento, indice]
  );

  useEffect(() => {
    const alPresionarTecla = (evento) => {
      if (evento.key === "Escape" && !guardando) onClose();
    };

    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [guardando, onClose]);

  const elegirEquipo = (equipo) => {
    setSeleccion(equipo);
    setAceptaRestricciones(false);
    setErrorGuardado("");
  };

  const guardar = async () => {
    if (!seleccion || guardando) return;

    if (requiereAceptacion && !aceptaRestricciones) {
      setErrorGuardado(
        "Debes aceptar las restricciones del equipo para reemplazarlo."
      );
      return;
    }

    setGuardando(true);
    setErrorGuardado("");

    try {
      const nuevasLineas = reemplazarLineaEquipo(
        requerimiento?.equipos ?? [],
        indice,
        seleccion
      );
      const actualizado = await programmerApi.update(requerimiento.id, {
        equipos: lineasEquipoAPayload(nuevasLineas),
        revision: requerimiento.revision,
        omitirValidacionEquipos: true,
        aceptaRestricciones: requiereAceptacion
          ? aceptaRestricciones
          : false,
        notaCambio: `Equipo ${nombreEquipo(
          lineaActual
        )} reemplazado por ${nombreEquipo(seleccion)}.`,
      });

      toast.success("Equipo reemplazado");
      await onGuardado(actualizado);
    } catch (err) {
      const mensaje =
        err?.message || "No se pudo reemplazar el equipo del programador";
      setErrorGuardado(mensaje);
      toast.error(mensaje);

      if (err?.status === 409) {
        setSeleccion(null);
        onRecargar?.();
      }
    } finally {
      setGuardando(false);
    }
  };

  if (!requerimiento || !lineaActual) return null;

  return createPortal(
    <div
      className="requirements-modal-overlay"
      role="presentation"
      onClick={() => {
        if (!guardando) onClose();
      }}
    >
      <div
        className="requirements-modal requirements-modal--detail programmer-swap-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="programmer-swap-title"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="requirements-modal__header requirements-modal__header--detail">
          <div className="requirements-modal__heading">
            <span className="requirements-modal__eyebrow">
              Mantenimiento de equipos
            </span>
            <h2 id="programmer-swap-title">Cambiar equipo</h2>
            <p>
              Elige una placa disponible para la franja del programador. El
              cambio se guarda antes de aprobar.
            </p>
          </div>

          <button
            type="button"
            className="requirements-modal__close"
            onClick={onClose}
            aria-label="Cerrar cambio de equipo"
            disabled={guardando}
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="requirements-modal__body">
          <section className="requirements-block programmer-swap__current">
            <h4>
              <FiAlertTriangle aria-hidden="true" />
              Equipo que se reemplaza
            </h4>

            <div className="programmer-swap__current-row">
              <span className="programmer-swap__media">
                {imagenActual ? (
                  <img
                    src={imagenActual}
                    alt={nombreEquipo(lineaActual)}
                    loading="lazy"
                  />
                ) : (
                  <span aria-hidden="true">📷</span>
                )}
              </span>

              <div>
                <strong>{nombreEquipo(lineaActual)}</strong>
                <small>
                  {[lineaActual.categoria, lineaActual.subcategoria]
                    .filter(Boolean)
                    .join(" · ") || "Sin categoría"}
                </small>
                <p>{motivo || "Este equipo ya no está disponible."}</p>
              </div>
            </div>
          </section>

          {seleccion ? (
            <section className="requirements-block programmer-swap__confirm">
              <h4>
                <FiCheckCircle aria-hidden="true" />
                Equipo seleccionado
              </h4>

              <div className="programmer-swap__selected">
                <span className="programmer-swap__media">
                  {imagenSeleccion ? (
                    <img
                      src={imagenSeleccion}
                      alt={nombreEquipo(seleccion)}
                      loading="lazy"
                    />
                  ) : (
                    <span aria-hidden="true">📷</span>
                  )}
                </span>

                <div>
                  <strong>{nombreEquipo(seleccion)}</strong>
                  <small>
                    {[seleccion.categoria?.nombre, seleccion.subcategoria?.nombre]
                      .filter(Boolean)
                      .join(" · ") || "Sin categoría"}
                  </small>
                  <p>{seleccion.descripcion || "Sin descripción"}</p>
                </div>
              </div>

              {restriccionesSeleccion.length > 0 ? (
                <>
                  <div className="programmer-restriction-warning">
                    <strong>⚠ Restricciones de este equipo</strong>
                    <ul>
                      {restriccionesSeleccion.map((restriccion) => (
                        <li key={restriccion}>{restriccion}</li>
                      ))}
                    </ul>
                  </div>

                  <label className="programmer-restriction-accept">
                    <input
                      type="checkbox"
                      checked={aceptaRestricciones}
                      onChange={(evento) =>
                        setAceptaRestricciones(evento.target.checked)
                      }
                      disabled={guardando}
                    />
                    <span>
                      He leído y acepto las restricciones del equipo
                      seleccionado.
                    </span>
                  </label>
                </>
              ) : null}

              <button
                type="button"
                className="requirements-btn requirements-btn--outline requirements-btn--sm programmer-swap__again"
                onClick={() => {
                  setSeleccion(null);
                  setAceptaRestricciones(false);
                  setErrorGuardado("");
                }}
                disabled={guardando}
              >
                <FiRefreshCw aria-hidden="true" />
                Elegir otro equipo
              </button>
            </section>
          ) : (
            <section className="requirements-block programmer-swap__picker">
              <EquipmentCatalogPicker
                equipos={equipos}
                cargando={cargando}
                error={error}
                franjaLista={Boolean(
                  requerimiento.fechaClave &&
                    requerimiento.timeIn &&
                    requerimiento.timeOut
                )}
                categorias={catalogos.categorias}
                subcategorias={catalogos.subcategorias}
                catalogosCargando={catalogos.cargando}
                catalogosError={catalogos.error}
                seleccionActual={null}
                idsOcupados={idsOcupados}
                onSelect={elegirEquipo}
                onClose={onClose}
                onRecargar={onRecargar}
                onRecargarCatalogos={catalogos.recargar}
              />
            </section>
          )}

          {errorGuardado ? (
            <p className="programmer-swap__error" role="alert">
              <FiAlertTriangle aria-hidden="true" />
              <span>{errorGuardado}</span>
            </p>
          ) : null}
        </div>

        <footer className="requirements-modal__footer">
          <p className="requirements-modal__footer-text">
            El reemplazo solo cambia la placa de esta línea; el resto del
            programador, su personal y sus notas se conservan.
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

            {seleccion ? (
              <button
                type="button"
                className="requirements-btn requirements-btn--primary"
                onClick={guardar}
                disabled={
                  guardando || (requiereAceptacion && !aceptaRestricciones)
                }
              >
                <FiCheckCircle aria-hidden="true" />
                {guardando ? "Guardando…" : "Reemplazar equipo"}
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}

ProgrammerEquipmentSwapModal.propTypes = {
  requerimiento: PropTypes.object.isRequired,
  indice: PropTypes.number.isRequired,
  motivo: PropTypes.string,
  equipos: PropTypes.array,
  cargando: PropTypes.bool,
  error: PropTypes.string,
  onRecargar: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onGuardado: PropTypes.func.isRequired,
};

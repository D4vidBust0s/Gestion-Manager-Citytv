import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCheckCircle,
  FiPlus,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

import {
  equipmentApi,
  imagenCategoriaSrc,
  imagenSubcategoriaSrc,
} from "../../api/equipment";
import { useEquipmentCatalogs } from "../../Custom_Hooks/useEquipmentCatalogs";
import "./Activos.css";

const FORMULARIO_INICIAL = {
  placa: "",
  categoriaId: "",
  subcategoriaId: "",
  ubicacionId: "",
  descripcion: "",
};

export default function ActivosNuevoEquipo() {
  const {
    categorias,
    subcategorias,
    ubicaciones,
    cargando: cargandoCatalogos,
    error: errorCatalogos,
    errorUbicaciones,
    recargar: recargarCatalogos,
  } = useEquipmentCatalogs();

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [placaEstado, setPlacaEstado] = useState({ estado: "idle", mensaje: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [creado, setCreado] = useState(null);

  const actualizar = (campo, valor) =>
    setFormulario((previo) => ({ ...previo, [campo]: valor }));

  // Verificación diferida de placa: evita una petición por cada tecla.
  useEffect(() => {
    const placa = formulario.placa.trim();

    if (placa.length < 2) {
      setPlacaEstado({ estado: "idle", mensaje: "" });
      return undefined;
    }

    let vigente = true;
    setPlacaEstado({ estado: "verificando", mensaje: "Verificando placa…" });

    const temporizador = setTimeout(async () => {
      try {
        const resultado = await equipmentApi.checkPlate({ placa });
        if (!vigente) return;

        setPlacaEstado(
          resultado?.disponible
            ? { estado: "disponible", mensaje: "Placa disponible" }
            : {
                estado: "duplicada",
                mensaje: `La placa "${
                  resultado?.equipo?.placa ?? placa
                }" ya está registrada.`,
              }
        );
      } catch (err) {
        if (!vigente) return;
        setPlacaEstado({
          estado: "error",
          mensaje: err?.message || "No se pudo verificar la placa.",
        });
      }
    }, 450);

    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [formulario.placa]);

  const subcategoriasDeCategoria = useMemo(
    () =>
      subcategorias.filter(
        (subcategoria) =>
          String(subcategoria.categoria?.id ?? subcategoria.categoriaId) ===
          String(formulario.categoriaId)
      ),
    [subcategorias, formulario.categoriaId]
  );

  const subcategoriasActivas = subcategoriasDeCategoria.filter(
    (subcategoria) => subcategoria.activo !== false
  );

  const categoriaSeleccionada = categorias.find(
    (categoria) =>
      String(categoria._id ?? categoria.id) === String(formulario.categoriaId)
  );

  const subcategoriaSeleccionada = subcategoriasDeCategoria.find(
    (subcategoria) =>
      String(subcategoria._id ?? subcategoria.id) ===
      String(formulario.subcategoriaId)
  );

  const imagenHeredada = subcategoriaSeleccionada?.imagen
    ? imagenSubcategoriaSrc(subcategoriaSeleccionada, "full")
    : categoriaSeleccionada?.imagen
      ? imagenCategoriaSrc(categoriaSeleccionada, "full")
      : "";

  const origenImagen = subcategoriaSeleccionada?.imagen
    ? "subcategoría"
    : categoriaSeleccionada?.imagen
      ? "categoría"
      : "";

  const validar = () => {
    if (!formulario.placa.trim()) return "La placa es obligatoria.";
    if (placaEstado.estado === "verificando") {
      return "Espera a que termine la verificación de la placa.";
    }
    if (placaEstado.estado === "duplicada") {
      return "Esa placa ya está registrada. Usa una placa diferente.";
    }
    if (!formulario.categoriaId) return "Selecciona una categoría.";
    if (subcategoriasActivas.length > 0 && !formulario.subcategoriaId) {
      return "Selecciona una subcategoría para esta categoría.";
    }
    if (!formulario.ubicacionId) return "Selecciona una ubicación.";
    if (!formulario.descripcion.trim()) {
      return "La descripción técnica es obligatoria.";
    }
    return null;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setError(null);

    const mensajeValidacion = validar();
    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    setGuardando(true);

    try {
      const nuevo = await equipmentApi.create({
        placa: formulario.placa.trim(),
        categoriaId: formulario.categoriaId,
        subcategoriaId: formulario.subcategoriaId || null,
        ubicacionId: formulario.ubicacionId,
        descripcion: formulario.descripcion.trim(),
        // Los usuarios de gestión no cambian estados: el alta nace protegida.
        estado: "Inactivo",
        motivoInactivo: "Protegido",
        observaciones: [],
        restricciones: [],
      });

      setCreado(nuevo);
      setFormulario(FORMULARIO_INICIAL);
      setPlacaEstado({ estado: "idle", mensaje: "" });
    } catch (err) {
      setError(err?.message || "No se pudo registrar el equipo.");
    } finally {
      setGuardando(false);
    }
  };

  if (creado) {
    return (
      <div className="activos-page">
        <div className="activos-success">
          <FiCheckCircle aria-hidden="true" />
          <h2>Equipo registrado</h2>
          <p>
            La placa <strong>{creado.placa}</strong> se agregó al inventario en
            estado <strong>Protegido</strong>. El almacén de GM-Activos puede
            habilitarla cuando esté lista para operar.
          </p>
          <div className="activos-success__actions">
            <Link to="/activos" className="activos-btn">
              Ver inventario
            </Link>
            <button
              type="button"
              className="activos-btn activos-btn--ghost"
              onClick={() => setCreado(null)}
            >
              <FiPlus /> Registrar otro equipo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activos-page">
      <div className="activos-page__head">
        <div>
          <h2>Nuevo equipo</h2>
          <p>
            El alta crea el activo en estado <strong>Protegido</strong>. No es
            posible cambiar estados ni iniciar mantenimientos desde GM Citytv.
          </p>
        </div>

        <div className="activos-page__actions">
          <Link to="/activos" className="activos-btn activos-btn--ghost">
            <FiArrowLeft /> Volver al inventario
          </Link>
          <button
            type="button"
            className="activos-btn activos-btn--ghost"
            onClick={recargarCatalogos}
            disabled={cargandoCatalogos}
          >
            <FiRefreshCw /> Recargar catálogos
          </button>
        </div>
      </div>

      {(errorCatalogos || errorUbicaciones) && (
        <div className="activos-alert activos-alert--warn">
          <FiAlertTriangle aria-hidden="true" />
          <span>{errorCatalogos || errorUbicaciones}</span>
          <button
            type="button"
            className="activos-link-btn"
            onClick={recargarCatalogos}
          >
            Reintentar
          </button>
        </div>
      )}

      {error && (
        <div className="activos-alert activos-alert--error">
          <FiAlertTriangle aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="activos-form" onSubmit={enviar}>
        <div className="activos-form__grid">
          <label className="activos-field">
            <span>Placa *</span>
            <input
              type="text"
              value={formulario.placa}
              onChange={(evento) =>
                actualizar("placa", evento.target.value.toUpperCase())
              }
              placeholder="Ej. CAM-014"
              autoComplete="off"
              className={
                placaEstado.estado === "duplicada"
                  ? "activos-input--invalid"
                  : placaEstado.estado === "disponible"
                    ? "activos-input--valid"
                    : ""
              }
            />
            {placaEstado.mensaje && (
              <small
                className={`activos-plate-status activos-plate-status--${placaEstado.estado}`}
              >
                {placaEstado.mensaje}
              </small>
            )}
          </label>

          <label className="activos-field">
            <span>Categoría *</span>
            <select
              value={formulario.categoriaId}
              onChange={(evento) => {
                actualizar("categoriaId", evento.target.value);
                actualizar("subcategoriaId", "");
              }}
              disabled={cargandoCatalogos}
            >
              <option value="">
                {cargandoCatalogos ? "Cargando…" : "Selecciona una categoría"}
              </option>
              {categorias.map((categoria) => (
                <option
                  key={categoria._id ?? categoria.id}
                  value={categoria._id ?? categoria.id}
                >
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="activos-field">
            <span>Subcategoría *</span>
            <select
              value={formulario.subcategoriaId}
              onChange={(evento) =>
                actualizar("subcategoriaId", evento.target.value)
              }
              disabled={
                !formulario.categoriaId || subcategoriasActivas.length === 0
              }
            >
              <option value="">
                {!formulario.categoriaId
                  ? "Selecciona primero una categoría"
                  : subcategoriasActivas.length === 0
                    ? "Esta categoría no tiene subcategorías activas"
                    : "Selecciona una subcategoría"}
              </option>
              {subcategoriasActivas.map((subcategoria) => (
                <option
                  key={subcategoria._id ?? subcategoria.id}
                  value={subcategoria._id ?? subcategoria.id}
                >
                  {subcategoria.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="activos-field">
            <span>Ubicación *</span>
            <select
              value={formulario.ubicacionId}
              onChange={(evento) =>
                actualizar("ubicacionId", evento.target.value)
              }
              disabled={cargandoCatalogos}
            >
              <option value="">
                {cargandoCatalogos
                  ? "Cargando…"
                  : ubicaciones.length === 0
                    ? "No hay ubicaciones registradas"
                    : "Selecciona una ubicación"}
              </option>
              {ubicaciones.map((ubicacion) => (
                <option
                  key={ubicacion._id ?? ubicacion.id}
                  value={ubicacion._id ?? ubicacion.id}
                >
                  {ubicacion.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="activos-field activos-field--wide">
            <span>Descripción técnica *</span>
            <textarea
              rows={3}
              value={formulario.descripcion}
              onChange={(evento) =>
                actualizar("descripcion", evento.target.value)
              }
              placeholder="Marca, modelo, accesorios y cualquier detalle útil para el almacén."
            />
          </label>

          <div className="activos-field activos-field--wide">
            <span>Estado inicial</span>
            <div className="activos-readonly-state">
              <FiShield aria-hidden="true" />
              <div>
                <strong>Protegido</strong>
                <small>
                  El activo queda disponible para que GM-Activos lo habilite.
                  Los usuarios de gestión no pueden cambiar estados.
                </small>
              </div>
            </div>
          </div>

          <div className="activos-preview">
            {imagenHeredada ? (
              <img
                src={imagenHeredada}
                alt={`Imagen genérica de la ${
                  origenImagen || "categoría"
                }`}
              />
            ) : (
              <span className="activos-preview__empty">
                <FiShield aria-hidden="true" />
                Sin imagen
              </span>
            )}
            <small>
              {imagenHeredada
                ? `Imagen heredada de la ${origenImagen}.`
                : "La imagen se hereda de la subcategoría o de la categoría."}
            </small>
          </div>

          <div className="activos-form__footer">
            <button
              type="submit"
              className="activos-btn"
              disabled={
                guardando ||
                cargandoCatalogos ||
                placaEstado.estado === "verificando" ||
                placaEstado.estado === "duplicada"
              }
            >
              <FiPlus /> {guardando ? "Registrando…" : "Registrar equipo"}
            </button>
            <Link to="/activos" className="activos-btn activos-btn--ghost">
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

import { useRef } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";

import {
  MAX_ADJUNTOS,
  EXTENSIONES_ACEPTADAS,
  validarAdjunto,
  leerAdjunto,
  formatearPeso,
  esImagen,
} from "../../utils/taskAttachments";

/**
 * Selector y previsualización de adjuntos de una nota.
 * Recibe la lista actual y devuelve la nueva lista por `onChange`.
 */
export default function TaskAttachments({ adjuntos, onChange }) {
  const inputRef = useRef(null);

  const agregarArchivos = async (evento) => {
    const archivos = Array.from(evento.target.files || []);
    evento.target.value = "";

    if (archivos.length === 0) return;

    const nuevos = [...adjuntos];

    for (const archivo of archivos) {
      const error = validarAdjunto(archivo, nuevos.length);

      if (error) {
        toast.error(error);
        continue;
      }

      try {
        nuevos.push(await leerAdjunto(archivo));
      } catch {
        toast.error(`No se pudo leer "${archivo.name}"`);
      }
    }

    if (nuevos.length !== adjuntos.length) onChange(nuevos);
  };

  const quitar = (indice) => {
    onChange(adjuntos.filter((_, posicion) => posicion !== indice));
  };

  return (
    <div className="form-group">
      <label>
        Adjuntos ({adjuntos.length}/{MAX_ADJUNTOS})
      </label>

      <div className="adjuntos-acciones">
        <button
          type="button"
          className="btn-adjuntar"
          onClick={() => inputRef.current?.click()}
        >
          📎 Adjuntar imagen o documento
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={`image/*,${EXTENSIONES_ACEPTADAS}`}
          onChange={agregarArchivos}
          hidden
        />
      </div>

      {adjuntos.length > 0 && (
        <div className="adjuntos-grid">
          {adjuntos.map((adjunto, indice) => (
            <div className="adjunto-chip" key={`${adjunto.nombre}-${indice}`}>
              {esImagen(adjunto.tipo) ? (
                <img
                  src={adjunto.url}
                  alt={adjunto.nombre}
                  className="adjunto-thumb"
                />
              ) : (
                <span className="adjunto-icono" aria-hidden="true">
                  📄
                </span>
              )}

              <span className="adjunto-nombre" title={adjunto.nombre}>
                {adjunto.nombre}
              </span>

              <span className="adjunto-peso">{formatearPeso(adjunto.tamano)}</span>

              <button
                type="button"
                className="adjunto-quitar"
                onClick={() => quitar(indice)}
                title="Quitar adjunto"
                aria-label={`Quitar ${adjunto.nombre}`}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

TaskAttachments.propTypes = {
  adjuntos: PropTypes.arrayOf(
    PropTypes.shape({
      nombre: PropTypes.string,
      tipo: PropTypes.string,
      url: PropTypes.string,
      tamano: PropTypes.number,
    })
  ),
  onChange: PropTypes.func.isRequired,
};

TaskAttachments.defaultProps = {
  adjuntos: [],
};

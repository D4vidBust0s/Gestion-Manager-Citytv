import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { esImagen } from "../../utils/taskAttachments";

const esPdf = (adjunto) =>
  adjunto?.tipo === "application/pdf" || /\.pdf$/i.test(adjunto?.nombre || "");

const esTexto = (adjunto) => {
  const tipo = String(adjunto?.tipo || "");
  return tipo.startsWith("text/") || tipo === "application/csv";
};

/**
 * Vista previa de un adjunto de la nota.
 *
 * - Imágenes: se muestran a tamaño grande.
 * - PDF: se abre dentro de la app con un visor embebido.
 * - Texto/CSV: se muestran como texto.
 * - Otros formatos (docx, xlsx, zip…): aviso y botón de descarga.
 *
 * El data URL se convierte a blob para que el visor del navegador lo trate
 * como un archivo normal y no como una navegación a `data:`.
 */
export default function TaskAttachmentPreview({ adjunto, onClose }) {
  const [blobUrl, setBlobUrl] = useState("");
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!adjunto) return undefined;

    let vivo = true;
    let urlCreada = "";

    setBlobUrl("");
    setTexto("");
    setError("");

    const cargar = async () => {
      try {
        const respuesta = await fetch(adjunto.url);
        const blob = await respuesta.blob();

        if (!vivo) return;

        if (esTexto(adjunto)) {
          setTexto(await blob.text());
          return;
        }

        urlCreada = URL.createObjectURL(blob);
        setBlobUrl(urlCreada);
      } catch {
        if (vivo) setError("No se pudo cargar el adjunto.");
      }
    };

    cargar();

    return () => {
      vivo = false;
      if (urlCreada) URL.revokeObjectURL(urlCreada);
    };
  }, [adjunto]);

  // Cerrar con Escape
  useEffect(() => {
    if (!adjunto) return undefined;

    const alPresionar = (evento) => {
      if (evento.key === "Escape") onClose();
    };

    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [adjunto, onClose]);

  if (!adjunto) return null;

  const descarga = blobUrl || adjunto.url;
  const puedePrevisualizar = esImagen(adjunto.tipo) || esPdf(adjunto) || esTexto(adjunto);

  return (
    <div
      className="task-preview-overlay"
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <div className="task-preview-content" role="dialog" aria-modal="true" aria-label={`Vista previa de ${adjunto.nombre}`}>
        <header className="task-preview-head">
          <strong title={adjunto.nombre}>{adjunto.nombre}</strong>
          <button type="button" className="task-preview-cerrar" onClick={onClose} aria-label="Cerrar vista previa">
            ✕
          </button>
        </header>

        <div className="task-preview-body">
          {error && <p className="task-preview-aviso">{error}</p>}

          {!error && esImagen(adjunto.tipo) && blobUrl && (
            <img src={blobUrl} alt={adjunto.nombre} className="task-preview-img" />
          )}

          {!error && esPdf(adjunto) && blobUrl && (
            <iframe src={blobUrl} title={adjunto.nombre} className="task-preview-pdf" />
          )}

          {!error && esTexto(adjunto) && texto && (
            <pre className="task-preview-texto">{texto}</pre>
          )}

          {!error && !puedePrevisualizar && (
            <p className="task-preview-aviso">
              Este formato no se puede previsualizar. Puedes descargarlo y abrirlo con su programa.
            </p>
          )}
        </div>

        <footer className="task-preview-acciones">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>

          <a className="btn-submit" href={descarga} download={adjunto.nombre}>
            Descargar
          </a>
        </footer>
      </div>
    </div>
  );
}

TaskAttachmentPreview.propTypes = {
  adjunto: PropTypes.shape({
    nombre: PropTypes.string,
    tipo: PropTypes.string,
    url: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

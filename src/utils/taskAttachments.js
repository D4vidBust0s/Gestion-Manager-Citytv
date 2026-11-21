/**
 * Reglas de los adjuntos de una nota (tarea personal).
 *
 * Los archivos viajan dentro del documento como data URL, igual que los
 * adjuntos del chat: no hay servicio de archivos ni carpeta en disco.
 * Aquí viven los límites y las funciones puras para validarlos y leerlos.
 */

export const MAX_ADJUNTOS = 3;
export const MAX_BYTES = 4 * 1024 * 1024; // 4 MB por archivo

/** Extensiones que ofrece el selector de archivos. */
export const EXTENSIONES_ACEPTADAS =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip";

const TIPOS_DOCUMENTO = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
];

const EXTENSIONES_DOCUMENTO = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".zip",
];

/** ¿El MIME corresponde a una imagen? */
export const esImagen = (tipo) => String(tipo ?? "").startsWith("image/");

/** ¿El archivo es una imagen o un documento permitido? */
export const tipoPermitido = (file) => {
  if (esImagen(file.type)) return true;
  if (TIPOS_DOCUMENTO.includes(file.type)) return true;

  // Algunos sistemas no informan el MIME: se valida por extensión.
  const nombre = String(file.name ?? "").toLowerCase();
  return EXTENSIONES_DOCUMENTO.some((ext) => nombre.endsWith(ext));
};

/** Peso legible: "820 KB", "1.4 MB". */
export const formatearPeso = (bytes) => {
  const numero = Number(bytes);
  if (!Number.isFinite(numero) || numero <= 0) return "—";
  if (numero < 1024) return `${numero} B`;
  if (numero < 1024 * 1024) return `${Math.round(numero / 1024)} KB`;
  return `${(numero / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Devuelve el mensaje de error del archivo o null si se puede adjuntar.
 * `cantidadActual` es cuántos adjuntos hay ya en la nota.
 */
export const validarAdjunto = (file, cantidadActual = 0) => {
  if (!file) return "Archivo no válido";

  if (cantidadActual >= MAX_ADJUNTOS) {
    return `Máximo ${MAX_ADJUNTOS} adjuntos por nota`;
  }

  if (file.size > MAX_BYTES) {
    return `"${file.name}" supera los 4 MB`;
  }

  if (!tipoPermitido(file)) {
    return `"${file.name}" no es una imagen o documento permitido`;
  }

  return null;
};

/** Lee un archivo y lo devuelve listo para guardar en la nota. */
export const leerAdjunto = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve({
        nombre: file.name,
        tipo: file.type || "",
        url: String(reader.result ?? ""),
        tamano: file.size || 0,
      });

    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));

    reader.readAsDataURL(file);
  });

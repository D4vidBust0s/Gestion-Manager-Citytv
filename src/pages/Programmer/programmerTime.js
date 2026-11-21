const TEXTO = (valor) => String(valor ?? "").trim();

const minutosDeHora = (hora) => {
  const coincidencia = /^(\d{2}):(\d{2})$/.exec(TEXTO(hora));
  if (!coincidencia) return null;

  const horas = Number(coincidencia[1]);
  const minutos = Number(coincidencia[2]);

  if (horas > 23 || minutos > 59) return null;

  return horas * 60 + minutos;
};

/** Minutos entre dos horas HH:mm; si el fin es menor, cruza medianoche. */
export const minutosEntreHoras = (inicio, fin) => {
  const desde = minutosDeHora(inicio);
  const hasta = minutosDeHora(fin);

  if (desde === null || hasta === null) return 0;

  const diferencia = hasta - desde;
  return diferencia < 0 ? diferencia + 24 * 60 : diferencia;
};

/** Horas decimales entre dos horas HH:mm, redondeadas a 2 decimales. */
export const horasEntreHoras = (inicio, fin) =>
  Math.round((minutosEntreHoras(inicio, fin) / 60) * 100) / 100;

export { minutosDeHora };

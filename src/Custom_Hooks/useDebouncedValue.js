import { useEffect, useState } from "react";

export const useDebouncedValue = (valor, espera = 300) => {
  const [debounced, setDebounced] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setDebounced(valor), espera);
    return () => clearTimeout(temporizador);
  }, [valor, espera]);

  return debounced;
};

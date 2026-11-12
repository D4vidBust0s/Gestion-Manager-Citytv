import { createContext, useContext } from "react";

/**
 * Contexto compartido entre el vigilante de recordatorios y el indicador
 * superior. El proveedor vive en TaskReminderProvider.
 */
export const TaskReminderContext = createContext(null);

const VALOR_POR_DEFECTO = {
  pendientes: [],
  total: 0,
  limpiarPendientes: () => {},
};

export const useTaskReminders = () =>
  useContext(TaskReminderContext) ?? VALOR_POR_DEFECTO;

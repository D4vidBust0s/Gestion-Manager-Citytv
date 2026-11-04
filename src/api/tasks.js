import { api } from "./client";
import { createCrudApi } from "./crud";

/**
 * Tareas: /tasks
 * El listado por usuario usa /tasks/user/:userId, no /tasks/:id.
 */
export const tasksApi = {
  ...createCrudApi("tasks"),

  /** Tareas de un usuario: /tasks/user/:userId */
  getByUser: (userId, config) =>
    api.get(`/tasks/user/${userId}`, config).then((r) => r.data),
};

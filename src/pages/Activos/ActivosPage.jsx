import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import BaseOperations2 from "../../Components/Body-Section/Bases/BaseOperations2";
import ActivosInventario from "./ActivosInventario";
import ActivosMantenimientos from "./ActivosMantenimientos";
import ActivosMonitoreo from "./ActivosMonitoreo";
import ActivosNuevoEquipo from "./ActivosNuevoEquipo";
import "./Activos.css";

const TITULOS = {
  "/activos": "Activos",
  "/activos/nuevo": "Nuevo equipo",
  "/activos/mantenimientos": "Mantenimientos",
  "/activos/monitoreo": "Monitoreo",
};

/**
 * Módulo Activos de GM Citytv.
 *
 * Solo lectura sobre el inventario de GM-Activos, con una única escritura
 * permitida: dar de alta un equipo nuevo en estado Protegido.
 */
export default function ActivosPage() {
  const location = useLocation();
  const titulo = TITULOS[location.pathname] ?? "Activos";

  return (
    <div className="mainContainer">
      <BaseOperations2
        titulo={titulo}
        content={
          <div className="activos-shell">
            <Routes>
              <Route index element={<ActivosInventario />} />
              <Route path="nuevo" element={<ActivosNuevoEquipo />} />
              <Route
                path="mantenimientos"
                element={<ActivosMantenimientos />}
              />
              <Route path="monitoreo" element={<ActivosMonitoreo />} />
              <Route path="*" element={<Navigate to="/activos" replace />} />
            </Routes>
          </div>
        }
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Login from "./pages/Login/Login"; 
import MainPage from "./pages/MainPage/MainPage"; 
import TaskReminderProvider from "./context/TaskReminderProvider";
import { leerSesionPermitida } from "./config/access";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Al cargar la aplicación, solo restauramos una sesión con rol de gestión.
  // Una sesión del almacén (GM-Activos) no sirve en GM Citytv.
  useEffect(() => {
    const usuario = leerSesionPermitida();

    if (usuario) {
      setIsLoggedIn(true);
      return;
    }

    const habiaSesion = Boolean(localStorage.getItem("userAuth"));
    localStorage.removeItem("userAuth");

    if (habiaSesion) {
      Swal.fire({
        icon: "warning",
        title: "Sesión cerrada",
        text: "La sesión guardada no tiene acceso a GM Citytv. El rol Almacenista trabaja en GM-Activos.",
        confirmButtonColor: "#890000",
      });
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("userAuth");
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? (
        // El proveedor conserva los recordatorios pendientes y alimenta el aviso superior
        <TaskReminderProvider>
          <MainPage onLogout={handleLogout} />
        </TaskReminderProvider>
      ) : (
        // Pantalla de Login si no hay sesión activa
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}

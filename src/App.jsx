import { useState, useEffect } from "react";
import Login from "./pages/Login/Login"; 
import MainPage from "./pages/MainPage/MainPage"; 

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Al cargar la aplicación, verificamos si ya hay una sesión guardada en el navegador
  useEffect(() => {
    const savedUser = localStorage.getItem("userAuth");
    if (savedUser) {
      setIsLoggedIn(true);
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
        // Renderizamos el componente MainPage y le pasamos la función para cerrar sesión
        <MainPage onLogout={handleLogout} />
      ) : (
        // Pantalla de Login si no hay sesión activa
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}
import { useState, useRef } from "react";
import PropTypes from "prop-types";
import "./Login.css";
import axios from "axios";
import Swal from "sweetalert2";
import GM from "../../assets/GM.png"
import logoGM from "../../assets/Final.png"
import { usuarioPermitido } from "../../config/access";

export default function Login({ onLoginSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const userRef = useRef();
  const passwordRef = useRef();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const usuario = userRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    if (!usuario || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos",
        confirmButtonColor: "#890000",
      });
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        usuario,
        password,
      });

      const user = response.data?.user;

      // Puerta de GM Citytv: el almacén trabaja en GM-Activos, no aquí.
      if (!usuarioPermitido(user)) {
        await Swal.fire({
          icon: "error",
          title: "Acceso restringido",
          text: `El rol ${user?.rol || "de esta cuenta"} no tiene acceso a GM Citytv. El almacén trabaja en GM-Activos.`,
          confirmButtonColor: "#890000",
        });
        return;
      }

      localStorage.setItem("userAuth", JSON.stringify(user));

      const nombre = [user?.nombres, user?.apellidos].filter(Boolean).join(" ");

      await Swal.fire({
        icon: "success",
        title: "¡Bienvenido a GM Citytv!",
        text: nombre ? `Hola, ${nombre}` : undefined,
        timer: 1600,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // Llamamos a la función que cambia el estado global en App.jsx
      onLoginSuccess();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "No se pudo iniciar sesión",
        text: error.response?.data?.message || "Credenciales inválidas",
        confirmButtonColor: "#890000",
      });
    }
  };

  return (
    <div className="login-container">
      {/* SECCIÓN SUPERIOR: BIENVENIDA */}
      <div className={`welcome-section ${showForm ? "hidden" : "visible"}`}>
        <div className="welcome-logo-box">
          {/* Aquí puedes colocar la estructura de tus logos de Citytv */}
         <img src={logoGM} className="logo"/>
        </div>
        <button className="btn-login-main" onClick={() => setShowForm(true)}>
          LOGIN
        </button>
      </div>

      {/* SECCIÓN INFERIOR: FORMULARIO (Se revela al hacer clic) */}
      <div className={`form-card-section ${showForm ? "show" : ""}`}>
        <div className="login-card">
          <div className="card-header-logo">
           <img src={GM} />
          </div>

          <form onSubmit={handleLoginSubmit} className="formMain">
            <div className="input-group-login">
              <label>User</label>
              <input type="text" ref={userRef} className="input-login-field" />
            </div>

            <div className="input-group-login">
              <label>Password</label>
              <input type="password" ref={passwordRef} className="input-login-field" />
            </div>

            <div className="card-footer-icons">
              <span className="icon-info">ℹ️</span>
              <span className="icon-lock">🔒</span>
            </div>

            <button type="submit" className="btn-login-submit">
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
Login.propTypes = {
  onLoginSuccess: PropTypes.func,
};

import { useState, useRef } from "react";
import "./Login.css";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import GM from "../../assets/GM.png"
import logoGM from "../../assets/Final.jpg"

export default function Login({ onLoginSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const userRef = useRef();
  const passwordRef = useRef();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const usuario = userRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    if (!usuario || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        usuario,
        password,
      });

      toast.success("¡Bienvenido al sistema!");
      localStorage.setItem("userAuth", JSON.stringify(response.data.user));
      
      // Llamamos a la función que cambia el estado global en App.jsx
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Credenciales inválidas");
    }
  };

  return (
    <div className="login-container">
      <Toaster />
      
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
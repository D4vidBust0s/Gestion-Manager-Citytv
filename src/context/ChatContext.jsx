import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

import { REALTIME_URL } from '../api/client';

const ChatContext = createContext();

// La URL del socket sale de VITE_REALTIME_URL (o del host de VITE_API_URL sin /api)
const socket = io(REALTIME_URL);

export function ChatProvider({ children }) {
  const [userId, setUserId] = useState("");
  const [totalNoLeidos, setTotalNoLeidos] = useState(0);
  const [usuariosEnLineaObj, setUsuariosEnLineaObj] = useState({});

  // Desbloqueo universal del contexto de audio del navegador al primer clic o toque
  useEffect(() => {
    const handleUserGesture = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
      } catch (e) {
        // Ignorar
      }
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
    };

    window.addEventListener('click', handleUserGesture);
    window.addEventListener('keydown', handleUserGesture);
    window.addEventListener('touchstart', handleUserGesture);

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
    };
  }, []);

  // Función infalible de síntesis de audio nativa (Beep corporativo limpio)
  const reproducirSonido = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Tono sinusoidal agradable y armónico
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Nota D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08); // Sube a A5

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.log("Audio sintetizado omitido:", e);
    }
  };

  // Cargar usuario autenticado desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("userAuth");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const currentId = parsedUser.id || parsedUser._id || parsedUser.uid || "";
        if (currentId) setUserId(String(currentId));
      } catch (error) {
        console.error("Error al parsear userAuth:", error);
      }
    }
  }, []);

  // Registra la presencia del usuario y pide el mapa actual de conectados.
  // Se invoca al montar, en cada reconexión y al recuperar el foco de la pestaña.
  const registrarPresencia = useCallback(() => {
    if (!userId || !socket.connected) return;
    socket.emit("usuario_conectado", userId);
    socket.emit("solicitar_usuarios_en_linea");
  }, [userId]);

  // Motor de Sockets Global
  useEffect(() => {
    if (!userId) return;

    const handleActualizarUsuarios = (usuariosObj) => {
      setUsuariosEnLineaObj({ ...(usuariosObj || {}) });
    };

    const handleNuevoMensaje = (nuevoMsg) => {
      if (!nuevoMsg) return;

      let rId = "";
      if (nuevoMsg.remitente) {
        if (typeof nuevoMsg.remitente === "object") {
          rId = String(nuevoMsg.remitente._id || nuevoMsg.remitente.id || "");
        } else {
          rId = String(nuevoMsg.remitente);
        }
      }

      const esMio = rId === String(userId);

      // Si el mensaje NO es mío, reproducimos el beep sintético de forma garantizada
      if (!esMio) {
        reproducirSonido();
        setTotalNoLeidos(prev => prev + 1);
      }
    };

    const handleVolverALaPestana = () => {
      if (document.visibilityState === 'visible') {
        registrarPresencia();
      }
    };

    socket.on("actualizar_usuarios_en_linea", handleActualizarUsuarios);
    socket.on("recibir_mensaje", handleNuevoMensaje);
    socket.on("connect", registrarPresencia);

    // Al recuperar el foco (o salir de suspensión) el socket puede seguir
    // conectado sin que el servidor tenga la presencia registrada.
    document.addEventListener('visibilitychange', handleVolverALaPestana);
    window.addEventListener('focus', handleVolverALaPestana);

    registrarPresencia();

    return () => {
      socket.off("actualizar_usuarios_en_linea", handleActualizarUsuarios);
      socket.off("recibir_mensaje", handleNuevoMensaje);
      socket.off("connect", registrarPresencia);
      document.removeEventListener('visibilitychange', handleVolverALaPestana);
      window.removeEventListener('focus', handleVolverALaPestana);
    };
  }, [userId, registrarPresencia]);

  const limpiarContadorGlobal = () => {
    setTotalNoLeidos(0);
  };

  const cerrarSesionSocket = () => {
    if (userId) {
      socket.emit("usuario_desconectado", userId);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      socket, 
      totalNoLeidos, 
      limpiarContadorGlobal, 
      userId, 
      usuariosEnLineaObj, 
      cerrarSesionSocket 
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
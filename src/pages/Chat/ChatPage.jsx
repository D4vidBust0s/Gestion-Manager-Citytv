import { useState, useEffect, useRef, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { Toaster, toast } from "react-hot-toast";
import axios from 'axios';
import { useChat } from '../../context/ChatContext';
import LogoCity from '../../assets/LogoCity.png';

// ICONOS SVG INCRUSTADOS
const SendSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const ClipSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

const UserSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#888">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const FileSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);

const DownloadSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export default function ChatPage() {

  const [mensajeActual, setMensajeActual] = useState("");
  const [chatActivo, setChatActivo] = useState({ id: 'gen', nombre: "Chat General Corporativo", tipo: "general" });
  const [mensajes, setMensajes] = useState([]);
  const [usuariosSistema, setUsuariosSistema] = useState([]);
  
  const { socket, limpiarContadorGlobal, userId, usuariosEnLineaObj } = useChat(); 
  
  const [estaEscribiendo, setEstaEscribiendo] = useState(false);
  const [archivoAdjunto, setArchivoAdjunto] = useState(null); 
  const [noLeidos, setNoLeidos] = useState({});

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatActivoRef = useRef(chatActivo);

  useEffect(() => {
    chatActivoRef.current = chatActivo;
  }, [chatActivo]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Limpiamos el contador global al montar la vista de chat
  useEffect(() => {
    limpiarContadorGlobal();
    // Solo al montar: limpiarContadorGlobal es estable y no debe re-dispararse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listado de usuarios del sistema: se recarga cuando cambia un perfil
  const cargarUsuarios = useCallback(() => {
    if (!userId) return;

    axios.get("http://localhost:3000/api/auth/users")
      .then(response => {
        const otrosUsuarios = response.data.filter(u => String(u._id || u.id) !== String(userId));
        setUsuariosSistema(otrosUsuarios);
      })
      .catch(err => {
        console.error("Error al cargar usuarios del sistema:", err);
      });
  }, [userId]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // Al guardar el perfil (Top), las fotos del chat se actualizan al instante.
  // Se vuelve a consultar la lista: el servidor es la única fuente de verdad.
  useEffect(() => {
    const alActualizarPerfil = () => cargarUsuarios();

    window.addEventListener("userProfileUpdated", alActualizarPerfil);
    return () => window.removeEventListener("userProfileUpdated", alActualizarPerfil);
  }, [cargarUsuarios]);

  // Cambios de perfil hechos desde OTRA sesión (socket compartido del chat)
  useEffect(() => {
    if (!socket) return undefined;

    const alActualizarUsuario = (usuario) => {
      if (!usuario?.id) return;

      setUsuariosSistema(prev => prev.map(u =>
        String(u._id || u.id) === String(usuario.id) ? { ...u, ...usuario } : u
      ));
    };

    socket.on("usuario_actualizado", alActualizarUsuario);
    return () => socket.off("usuario_actualizado", alActualizarUsuario);
  }, [socket]);

  const obtenerNombreRemitente = (remitenteObj, currentUserId) => {
    if (!remitenteObj) return "Compañero";
    const rId = remitenteObj._id ? remitenteObj._id.toString() : remitenteObj;
    if (String(rId) === String(currentUserId)) return "Tú";
    
    if (typeof remitenteObj === "object" && remitenteObj.nombres) {
      return `${remitenteObj.nombres} ${remitenteObj.apellidos || ''}`.trim();
    }
    return "Compañero";
  };

  const seleccionarChat = (chatInfo) => {
    setChatActivo(chatInfo);
    // Reiniciamos tanto el contador individual como el global al abrir la conversación específica
    setNoLeidos(prev => ({
      ...prev,
      [chatInfo.id]: 0
    }));
    limpiarContadorGlobal(); 
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo es demasiado pesado. Máximo 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setArchivoAdjunto({
        nombre: file.name,
        tipo: file.type,
        url: reader.result 
      });
      toast.success(`Archivo adjunto: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!userId) return;

    const destinatarioId = chatActivo.id;
    axios.get(`http://localhost:3000/api/messages?userId=${userId}&destinatarioId=${destinatarioId}`)
      .then(response => {
        const mensajesFormateados = response.data.map(msg => {
          const rId = msg.remitente && msg.remitente._id ? msg.remitente._id.toString() : msg.remitente;
          return {
            id: msg._id,
            remitente: obtenerNombreRemitente(msg.remitente, userId),
            texto: msg.texto,
            archivoUrl: msg.archivoUrl || "",
            hora: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            propio: String(rId) === String(userId)
          };
        });
        setMensajes(mensajesFormateados);
      })
      .catch(err => {
        console.error("Error al obtener el historial de mensajes:", err);
      });

    const handleRecibirMensaje = (nuevoMsg) => {
      // 1. Extraer ID del remitente de forma segura
      const rId = nuevoMsg.remitente && (nuevoMsg.remitente._id || nuevoMsg.remitente.id)
        ? String(nuevoMsg.remitente._id || nuevoMsg.remitente.id) 
        : String(nuevoMsg.remitente || "");
      
      const esMio = rId === String(userId);
      
      // 2. Extraer ID del destinatario de forma segura
      let dId = "";
      if (nuevoMsg.destinatario) {
        if (typeof nuevoMsg.destinatario === "object") {
          dId = String(nuevoMsg.destinatario._id || nuevoMsg.destinatario.id || "");
        } else {
          dId = String(nuevoMsg.destinatario);
        }
      }

      // 3. Determinar si el mensaje es del Canal General o Privado
      const esCanalGeneral = !dId || dId === 'null' || dId === 'undefined' || dId === 'gen';

      // 4. Identificar a qué chat pertenece este mensaje exactamente
      let idDelChatDelMensaje = 'gen';
      if (!esCanalGeneral) {
        idDelChatDelMensaje = esMio ? dId : rId;
      }

      // 5. Obtener el chat que el usuario tiene abierto en pantalla AHORA MISMO
      const chatActualId = chatActivoRef.current.id;
      const chatActualTipo = chatActivoRef.current.tipo;

      // 6. VALIDACIÓN CRUZADA ESTRICTA: 
      // El mensaje se pinta en pantalla SOLAMENTE si la bandeja actual coincide de forma exacta con la del mensaje
      let estoyEnEseChat = false;
      if (esCanalGeneral && chatActualTipo === 'general') {
        estoyEnEseChat = true;
      } else if (!esCanalGeneral && chatActualTipo === 'privado' && String(chatActualId) === String(idDelChatDelMensaje)) {
        estoyEnEseChat = true;
      }

      if (estoyEnEseChat) {
        // Si estamos viendo la ventana correcta, pintamos el mensaje y ya
        setMensajes(prev => [
          ...prev,
          {
            id: nuevoMsg._id || Date.now(),
            remitente: obtenerNombreRemitente(nuevoMsg.remitente, userId),
            texto: nuevoMsg.texto,
            archivoUrl: nuevoMsg.archivoUrl || "",
            hora: new Date(nuevoMsg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            propio: esMio
          }
        ]);
        setEstaEscribiendo(false);
      } else {
        // Si NO estamos viendo esta bandeja, incrementamos el contador de no leídos correspondiente
        if (!esMio) {
          setNoLeidos(prev => ({
            ...prev,
            [idDelChatDelMensaje]: (prev[idDelChatDelMensaje] || 0) + 1
          }));
        }
      }
    };

    const handleUsuarioEscribiendo = ({ remitenteId }) => {
      if (String(remitenteId) === String(chatActivoRef.current.id)) {
        setEstaEscribiendo(true);
        setTimeout(() => {
          setEstaEscribiendo(false);
        }, 3000);
      }
    };

    socket.on("recibir_mensaje", handleRecibirMensaje);
    socket.on("usuario_escribiendo", handleUsuarioEscribiendo);

    return () => {
      socket.off("recibir_mensaje", handleRecibirMensaje);
      socket.off("usuario_escribiendo", handleUsuarioEscribiendo);
    };
    // Dependencia intencional: reconectar solo al cambiar de chat o usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatActivo.id, userId]);

  const handleInputChange = (e) => {
    setMensajeActual(e.target.value);

    if (chatActivo.tipo === "privado" && chatActivo.id !== 'gen') {
      socket.emit("escribiendo", {
        destinatarioId: chatActivo.id,
        remitenteId: userId
      });
    }
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!mensajeActual.trim() && !archivoAdjunto) return;

    if (!userId) {
      toast.error("Error de sesión: Esperando identificación del usuario");
      return;
    }

    const datosMensaje = {
      remitente: userId,
      destinatarioId: chatActivo.id,
      texto: mensajeActual,
      archivoUrl: archivoAdjunto ? archivoAdjunto.url : ""
    };

    socket.emit("enviar_mensaje", datosMensaje);
    setMensajeActual("");
    setArchivoAdjunto(null); 
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const esGeneral = chatActivo.tipo === "general";
  const contadorGeneral = noLeidos['gen'] || 0;

  return (
    <>
      <Toaster />
      <ChatContainer>
        
        {/* PANEL IZQUIERDO */}
        <SidebarChat>
          <SidebarHeader>
            <h3>Mensajería</h3>
            <span>Corporativo</span>
          </SidebarHeader>

          <CanalGeneralItem 
            $activo={esGeneral}
            onClick={() => seleccionarChat({ id: 'gen', nombre: "Chat General Corporativo", tipo: "general" })}
          >
            <span>📢 Chat General</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {contadorGeneral > 0 && <UnreadBadge>{contadorGeneral}</UnreadBadge>}
              <Badge>Activo</Badge>
            </div>
          </CanalGeneralItem>

          <SectionTitle>Usuarios del Sistema</SectionTitle>
          
          <UserList>
            {usuariosSistema.map((user) => {
              const uId = String(user._id || user.id);
              const estaEnLinea = !!usuariosEnLineaObj[uId];
              const cantNoLeidos = noLeidos[uId] || 0;

              return (
                <UserItem 
                  key={uId}
                  $activo={String(chatActivo.id) === uId}
                  onClick={() => seleccionarChat({ id: uId, nombre: `${user.nombres} ${user.apellidos}`, tipo: "privado" })}
                >
                  <AvatarWrapper>
                    {user.imagen && user.imagen.trim() !== "" ? (
                      <AvatarImg src={user.imagen} alt="Avatar" />
                    ) : (
                      <UserSvg />
                    )}
                    <StatusDot $enLinea={estaEnLinea} />
                  </AvatarWrapper>
                  <UserInfo>
                    <UserName>{user.nombres} {user.apellidos}</UserName>
                    <UserRole>{user.rol}</UserRole>
                  </UserInfo>
                  {cantNoLeidos > 0 && <UnreadBadge>{cantNoLeidos}</UnreadBadge>}
                </UserItem>
              );
            })}
          </UserList>
        </SidebarChat>

        {/* PANEL DERECHO */}
        <ChatArea $esGeneral={esGeneral}>
          
          <ChatHeader $esGeneral={esGeneral}>
            <ChatTitleInfo $esGeneral={esGeneral}>
              <h4>{chatActivo.nombre}</h4>
              <span>
                {estaEscribiendo 
                  ? "Escribiendo..." 
                  : (esGeneral ? "Canal abierto para todo el personal" : "Conversación privada cifrada")}
              </span>
            </ChatTitleInfo>
          </ChatHeader>

          <MessageListContainer>
            {mensajes.map((msg) => (
              <MessageBubble key={msg.id} $propio={msg.propio} $esGeneral={esGeneral}>
                {!msg.propio && <SenderName $esGeneral={esGeneral}>{msg.remitente}</SenderName>}
                
                {msg.texto && <MessageText $esGeneral={esGeneral}>{msg.texto}</MessageText>}

                {msg.archivoUrl && (
                  <AttachmentContainer>
                    {msg.archivoUrl.startsWith("data:image/") ? (
                      <ImageWrapper>
                        <ChatImage 
                          src={msg.archivoUrl} 
                          alt="Imagen adjunta" 
                          onClick={() => {
                            const newWindow = window.open();
                            newWindow.document.write(`<iframe src="${msg.archivoUrl}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                          }} 
                          title="Click para ver en grande"
                        />
                        <DownloadButton href={msg.archivoUrl} download="imagen_chat.png" target="_blank" rel="noopener noreferrer">
                          <DownloadSvg /> Descargar
                        </DownloadButton>
                      </ImageWrapper>
                    ) : (
                      <FileAttachment href={msg.archivoUrl} download="archivo_adjunto" target="_blank" rel="noopener noreferrer">
                        <FileSvg />
                        <span>Descargar archivo</span>
                        <DownloadSvg />
                      </FileAttachment>
                    )}
                  </AttachmentContainer>
                )}

                <MessageTime $esGeneral={esGeneral}>{msg.hora}</MessageTime>
              </MessageBubble>
            ))}

            {estaEscribiendo && (
              <TypingIndicator $esGeneral={esGeneral}>
                Escribiendo...
              </TypingIndicator>
            )}
            <div ref={messagesEndRef} />
          </MessageListContainer>

          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileSelect} 
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />

          {archivoAdjunto && (
            <PreviewBanner>
              <span>📎 Adjunto: <strong>{archivoAdjunto.nombre}</strong></span>
              <button type="button" onClick={() => setArchivoAdjunto(null)}>✕</button>
            </PreviewBanner>
          )}

          <MessageInputForm $esGeneral={esGeneral} onSubmit={enviarMensaje}>
            <AttachButton 
              type="button" 
              title="Adjuntar archivo o imagen" 
              $esGeneral={esGeneral}
              onClick={() => fileInputRef.current?.click()}
            >
              <ClipSvg />
            </AttachButton>
            
            <MessageInput 
              type="text" 
              placeholder="Escribe un mensaje corporativo..." 
              value={mensajeActual}
              onChange={handleInputChange}
              $esGeneral={esGeneral}
            />

            <SendButton type="submit">
              <span>Enviar</span>
              <SendSvg />
            </SendButton>
          </MessageInputForm>

        </ChatArea>

      </ChatContainer>
    </>
  );
}

/* =========================================================
   ESTILOS CON STYLED-COMPONENTS
   ========================================================= */

const ChatContainer = styled.div`
  display: flex;
  width: 100%;
  height: calc(90vh - 90px);
  margin-top: 125px;
  background-color: #1e1e1e;
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;

const SidebarChat = styled.div`
  width: 280px;
  background-color: #252526;
  border-right: 1px solid #333333;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 16px 20px;
  background-color: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #ffffff;
  }
  
  span {
    font-size: 0.75rem;
    color: #888888;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const CanalGeneralItem = styled.div`
  padding: 12px 20px;
  background-color: ${props => props.$activo ? '#37373d' : 'transparent'};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  border-left: 4px solid ${props => props.$activo ? '#EB464B' : 'transparent'};
  transition: background 0.2s;

  &:hover {
    background-color: #2a2d2e;
  }
`;

const Badge = styled.span`
  background-color: #EB464B;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
`;

const UnreadBadge = styled.span`
  background-color: #4CAF50;
  color: white;
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: 50%;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
`;

const SectionTitle = styled.div`
  padding: 15px 20px 5px 20px;
  font-size: 0.75rem;
  color: #aaaaaa;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const UserList = styled.div`
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 3px;
  }
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  background-color: ${props => props.$activo ? '#37373d' : 'transparent'};
  border-left: 4px solid ${props => props.$activo ? '#701CF5' : 'transparent'};
  transition: background 0.2s;
  justify-content: space-between;

  &:hover {
    background-color: #2a2d2e;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  margin-right: 12px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const StatusDot = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: ${props => props.$enLinea ? '#4CAF50' : '#777777'};
  border: 2px solid #252526;
  border-radius: 50%;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  margin-right: 8px;
`;

const UserName = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: #e1e1e6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.span`
  font-size: 0.72rem;
  color: #888888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.$esGeneral ? '#181818' : '#e0e0e0'};
  color: ${props => props.$esGeneral ? '#ffffff' : '#1e1e1e'};
  transition: background-color 0.3s ease;

  ${props => props.$esGeneral && css`
    background-image:
      linear-gradient(rgba(24, 24, 24, 0.92), rgba(24, 24, 24, 0.92)),
      url(${LogoCity});
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 100% 100%, 46% auto;
  `}
`;

const ChatHeader = styled.div`
  padding: 15px 25px;
  background-color: ${props => props.$esGeneral ? '#2d2d2d' : '#f0f0f2'};
  border-bottom: 1px solid ${props => props.$esGeneral ? '#3d3d3d' : '#e0e0e0'};
  display: flex;
  align-items: center;
`;

const ChatTitleInfo = styled.div`
  h4 {
    margin: 0;
    font-size: 1rem;
    color: ${props => props.$esGeneral ? '#ffffff' : '#111111'};
  }
  span {
    font-size: 0.75rem;
    color: ${props => props.$esGeneral ? '#EB464B' : '#701CF5'};
    font-weight: 600;
  }
`;

const MessageListContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 3px;
  }
`;

const MessageBubble = styled.div`
  max-width: 65%;
  padding: 10px 14px;
  border-radius: 8px;
  align-self: ${props => props.$propio ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.$esGeneral 
    ? (props.$propio ? '#701CF5' : '#2d2d2d') 
    : (props.$propio ? '#2d2d2d' : '#e4e4e7')};
  color: ${props => props.$esGeneral ? '#ffffff' : (props => props.$propio ? '#ffffff' : '#111111')};
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
`;

const SenderName = styled.div`
  font-size: 0.75rem;
  font-weight: bold;
  color: ${props => props.$esGeneral ? '#EB464B' : '#701CF5'};
  margin-bottom: 3px;
`;

const MessageText = styled.div`
  font-size: 0.9rem;
  word-break: break-word;
  margin-bottom: 6px;
`;

const AttachmentContainer = styled.div`
  margin-top: 6px;
  margin-bottom: 6px;
`;

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ChatImage = styled.img`
  max-width: 240px;
  max-height: 200px;
  border-radius: 6px;
  cursor: pointer;
  object-fit: cover;
  display: block;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.25);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-decoration: none;
  width: fit-content;

  &:hover {
    background: rgba(0, 0, 0, 0.4);
  }
`;

const FileAttachment = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(0, 0, 0, 0.15);
  padding: 8px 12px;
  border-radius: 6px;
  color: inherit;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;

  &:hover {
    background: rgba(0, 0, 0, 0.25);
  }
`;

const MessageTime = styled.div`
  font-size: 0.65rem;
  color: ${props => props.$esGeneral ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.45)'};
  text-align: right;
  margin-top: 4px;
`;

const TypingIndicator = styled.div`
  font-size: 0.8rem;
  font-style: italic;
  color: #EB464B;
  align-self: flex-start;
  padding: 4px 8px;
`;

const PreviewBanner = styled.div`
  background-color: #333338;
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #e1e1e6;
  border-top: 1px solid #444;

  button {
    background: none;
    border: none;
    color: #ff5555;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    padding: 0 5px;
  }
`;

const MessageInputForm = styled.form`
  padding: 15px 25px;
  background-color: ${props => props.$esGeneral ? '#2d2d2d' : '#f8f8fa'};
  border-top: 1px solid ${props => props.$esGeneral ? '#3d3d3d' : '#e0e0e0'};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AttachButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$esGeneral ? '#aaa' : '#555'};
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${props => props.$esGeneral ? '#ffffff' : '#000000'};
  }
`;

const MessageInput = styled.input`
  flex: 1;
  background-color: ${props => props.$esGeneral ? '#1e1e1e' : '#ffffff'};
  border: 1px solid ${props => props.$esGeneral ? '#3f3f46' : '#cccccc'};
  border-radius: 6px;
  padding: 10px 15px;
  color: ${props => props.$esGeneral ? '#ffffff' : '#111111'};
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #701CF5;
  }
`;

const SendButton = styled.button`
  background-color: #EB464B;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background-color: #d3383d;
  }
`;
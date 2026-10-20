import React, { useState } from 'react';
import styled from 'styled-components';
import { Toaster } from "react-hot-toast";

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

export default function ChatPage() {
  const [mensajeActual, setMensajeActual] = useState("");
  const [chatActivo, setChatActivo] = useState({ id: 'gen', nombre: "Chat General Corporativo", tipo: "general" });

  const usuariosEnLinea = [
    { id: 1, nombre: "David Bustos", rol: "Ingeniero", enLinea: true },
    { id: 2, nombre: "Ana María Gómez", rol: "Supervisora", enLinea: true },
    { id: 3, nombre: "Carlos Pérez", rol: "Operaciones", enLinea: false },
    { id: 4, nombre: "Luisa Fernanda", rol: "Recursos Humanos", enLinea: true },
  ];

  const [mensajes, setMensajes] = useState([
    { id: 1, remitente: "Ana María Gómez", texto: "Hola equipo, ¿cómo van las proyecciones de esta semana?", hora: "10:15 AM", propio: false },
    { id: 2, remitente: "David Bustos", texto: "Todo en orden por aquí, acabo de actualizar el módulo de reglas.", hora: "10:18 AM", propio: true },
  ]);

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!mensajeActual.trim()) return;

    setMensajes([
      ...mensajes,
      { id: Date.now(), remitente: "Tú", texto: mensajeActual, hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), propio: true }
    ]);
    setMensajeActual("");
  };

  const esGeneral = chatActivo.tipo === "general";

  return (
    <>
      <Toaster />
      <ChatContainer>
        
        {/* PANEL IZQUIERDO: LISTA DE CONTACTOS Y CANALES */}
        <SidebarChat>
          <SidebarHeader>
            <h3>Mensajería</h3>
            <span>Corporativo</span>
          </SidebarHeader>

          <CanalGeneralItem 
            $activo={esGeneral}
            onClick={() => setChatActivo({ id: 'gen', nombre: "Chat General Corporativo", tipo: "general" })}
          >
            📢 Chat General
            <Badge>3</Badge>
          </CanalGeneralItem>

          <SectionTitle>Usuarios en Línea</SectionTitle>
          
          <UserList>
            {usuariosEnLinea.map((user) => (
              <UserItem 
                key={user.id}
                $activo={chatActivo.id === user.id}
                onClick={() => setChatActivo({ id: user.id, nombre: user.nombre, tipo: "privado" })}
              >
                <AvatarWrapper>
                  <UserSvg />
                  <StatusDot $enLinea={user.enLinea} />
                </AvatarWrapper>
                <UserInfo>
                  <UserName>{user.nombre}</UserName>
                  <UserRole>{user.rol}</UserRole>
                </UserInfo>
              </UserItem>
            ))}
          </UserList>
        </SidebarChat>

        {/* PANEL DERECHO: CONVERSACIÓN ACTIVA (CAMBIA DE COLOR SEGÚN EL TIPO DE CHAT) */}
        <ChatArea $esGeneral={esGeneral}>
          
          <ChatHeader $esGeneral={esGeneral}>
            <ChatTitleInfo $esGeneral={esGeneral}>
              <h4>{chatActivo.nombre}</h4>
              <span>{esGeneral ? "Canal abierto para todo el personal" : "Conversación privada cifrada"}</span>
            </ChatTitleInfo>
          </ChatHeader>

          <MessageListContainer>
            {mensajes.map((msg) => (
              <MessageBubble key={msg.id} $propio={msg.propio} $esGeneral={esGeneral}>
                {!msg.propio && <SenderName $esGeneral={esGeneral}>{msg.remitente}</SenderName>}
                <MessageText $esGeneral={esGeneral}>{msg.texto}</MessageText>
                <MessageTime $esGeneral={esGeneral}>{msg.hora}</MessageTime>
              </MessageBubble>
            ))}
          </MessageListContainer>

          <MessageInputForm $esGeneral={esGeneral} onSubmit={enviarMensaje}>
            <AttachButton type="button" title="Adjuntar archivo o imagen" $esGeneral={esGeneral}>
              <ClipSvg />
            </AttachButton>
            
            <MessageInput 
              type="text" 
              placeholder="Escribe un mensaje corporativo..." 
              value={mensajeActual}
              onChange={(e) => setMensajeActual(e.target.value)}
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
   ESTILOS CON STYLED-COMPONENTS (Con diseño condicional General vs Privado)
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
`;

const UserName = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: #e1e1e6;
`;

const UserRole = styled.span`
  font-size: 0.72rem;
  color: #888888;
`;

// ZONA DERECHA: CAMBIA SEGÚN EL ESTADO ($esGeneral)
const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.$esGeneral ? '#181818' : '#e0e0e0'};
  color: ${props => props.$esGeneral ? '#ffffff' : '#1e1e1e'};
  transition: background 0.3s ease;
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
    color: ${props => props.$esGeneral ? '#aaaaaa' : '#666666'};
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
  max-width: 60%;
  padding: 10px 14px;
  border-radius: 8px;
  align-self: ${props => props.$propio ? 'flex-end' : 'flex-start'};
  
  /* Si es general: propio=púrpura, ajeno=gris oscuro. Si es privado: inverso o adaptado al fondo blanco */
  background-color: ${props => props.$esGeneral 
    ? (props.$propio ? '#701CF5' : '#2d2d2d') 
    : (props.$propio ? '#2d2d2d' : '#e4e4e7')};
    
  color: ${props => props.$esGeneral ? '#ffffff' : (props.$propio ? '#ffffff' : '#111111')};
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
`;

const MessageTime = styled.div`
  font-size: 0.65rem;
  color: ${props => props.$esGeneral ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.45)'};
  text-align: right;
  margin-top: 4px;
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
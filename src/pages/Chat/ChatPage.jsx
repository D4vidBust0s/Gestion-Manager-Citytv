import styled from "styled-components";
import CajaUsuario from "./CajaUsuario";
import Cabecero from "./Cabecero";

const ChatPage = () => {
  return (
    <>
      <Contenedor>
        <Left>
          <CajaUsuario />
          <CajaUsuario />
          <CajaUsuario />
          <CajaUsuario />
          <CajaUsuario />
        </Left>
        <Center><Cabecero /></Center>
        <Right>Right</Right>
      </Contenedor>
    </>
  );
};

//Styled Components
//--------------------------------------------------------------------------------------------------------------------------------------*/

const Contenedor = styled.div`
  height: 96vh;
  display: flex;
  background: black;
`;

const Left = styled.div`
  background-color: #222222;
  width: 20%;
  padding-top: 12.5%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 4px;
`;

const Center = styled.div`
  padding-top: 7.2%;
  background-color: #d0d4d1;
  width: 70%;
`;

const Right = styled.div`
  padding-top: 10%;
  background-color: #ffffff;
  width: 20%;
`;

export default ChatPage;

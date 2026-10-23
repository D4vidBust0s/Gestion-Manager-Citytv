//Imports
import styled from "styled-components";

//Imagenes
import avatar from "../../assets/avatar.webp";

const CajaUsuario = () => {
  return (
    <>
      <Contenedor>
        <Avatar src={avatar}></Avatar>
        <Contenido>
          <Titulo>Titulo</Titulo>
          <Descripcion>Descripción</Descripcion>
        </Contenido>
        <Btn></Btn>
      </Contenedor>
    </>
  );
};

//Styled Components
//--------------------------------------------------------------------------------------------------------------------------------------*/

const Contenedor = styled.div`

  width: 90%;
  height: 60px;
  background: #535252;
  display: flex;
  padding: 5px;
  align-items: center;

  &:hover {
    transform: scale(1.01);
    cursor: pointer;
    background-color: #5c5c5c;
  }
`;

const Avatar = styled.img`
  width: 18%;
  height: 45px;
  border-radius: 100%;
`;

const Contenido = styled.div`
width: 75%;
height: 50px;
margin-left: 10px;
display: flex;
align-items: center;
justify-content: center;
flex-direction:column;
padding: 5px;
`;

const Titulo = styled.div`
  width: 83%;
  color: #dadada;
`;

const Descripcion = styled.div`
  width: 83%;
  color: #bebebe;
`;

const Btn = styled.div`
  background-color: green;
  height: 20px;
  width: 20px;
  border-radius: 100%;
`;

export default CajaUsuario;

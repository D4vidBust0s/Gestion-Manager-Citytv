import styled from "styled-components";

const Cabecero = () => {
  return (
    <>
      <Contenedor>
        <Nombre>Nombre de Usuario</Nombre>
        <Circulo></Circulo>
        <Estado>online</Estado>
      </Contenedor>
    </>
  )
}

//Styled Components
//--------------------------------------------------------------------------------------------------------------------------------------*/

const Contenedor = styled.div`
     background-color: #222222;
     height: 8%;
     display: flex;
     flex-direction: row;
     align-items: center;
     gap:5px;
     width: 100%;
     box-shadow: .2rem .2rem .8rem red;
`;

const Nombre = styled.div`
    color: #FFFF;
    font-size:1.2rem;
    margin-right: 20px;
`;

const Circulo = styled.div`
    background-color: green;
    height:10px;
    width:10px;
    border-radius: 100%;
    
`;

const Estado = styled.div`
    color: #FFFF;
    font-size:.8rem;
    
`;


export default Cabecero 

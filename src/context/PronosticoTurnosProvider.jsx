//Este contexto manejara el pronostico de el turno que tendran todos los grupos del canal, segun la fecha de la barra seleccionada
//Este contexto se define aqui pero se llenara en listado cuando se llama la fecha en el datapicker
//en el Listado.jsx para traer la programación segun se actualice la fecha en la barra

import React, { createContext, useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';



export const PronosticoContext = createContext(null)



const crear = async (ID_User,NombreUser,SubGrupo,FechaActiva,Start,End,Evento,Color,Tipo,Observacion)=>{


  await axios.post("http://localhost:3000/api/shifts/", {
    idUser: ID_User,
    nombreUser: NombreUser,
    subGrupo: SubGrupo,
    fechaActiva: FechaActiva,
    start: Start,
    end: End,
    evento: Evento,
    color: Color,
    tipo: Tipo,
    observacion: Observacion
  });

  

   
}

export const PronosticoTurnosProvider = ({children}) => {

  

    const [idUsuario,setIdUsuario] = useState("--------------");
    const [idTurno,setIdTurno] = useState("--------------");
    const [nombreCompleto,setNombreCompleto] = useState("--------------");
    const [subG,setSubG] = useState("--------------");
    const [fechaActiva,setFechaActiva] = useState("");
    const [start,setStart] = useState();
    const [end,setEnd] = useState();
    const [nombreEvento,setNombreEvento] = useState("Nombre del evento");
    const [clr,setClr] = useState("#DADADA");
    const [observacion,setObservacion] = useState("---------");

   //Funcion que obtiene la data de la api - listado de todos los stacks
 const obtenerListadoStacks = async () => {
  return await axios
    .get("http://localhost:3000/api/stacks/")
    .then((response) => setData1(response.data));
};

    const agregarTurno = (idusuario,idturno,nombre,subgrupo,fecha,start,end,nombreevent,color,tipo,obs)=>{
    
      //Procedemos a traer el id del stack y lo desglosamos uno a uno y lo agregamos a la DB al usuario actual
      data1?.map((shift,index)=>(
        shift.ID_esquema == idturno &&
        crear(idusuario,nombre,index,new Date(fecha),new Date(start),new Date(end),shift.ID_programa,color,tipo,shift.tipo,obs)
        
      ))

    }

    const [data1, setData1] = useState([]);


  useEffect(() => {
    obtenerListadoStacks();
  }, []);

  return (
    
    <PronosticoContext.Provider 
    value={[idUsuario,
            setIdUsuario,
            agregarTurno,
            idTurno,
            setIdTurno,
            nombreCompleto,
            setNombreCompleto,
            subG,
            setSubG,
            fechaActiva,
            setFechaActiva,
            start,
            setStart,
            end,
            setEnd,
            nombreEvento,
            setNombreEvento,
            clr,
            setClr,
            observacion,
            setObservacion
            
            ]}>
      {children}
    </PronosticoContext.Provider>
    
  )
}

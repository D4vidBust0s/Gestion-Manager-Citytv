//Este contexto manejara el pronostico de el turno que tendran todos los grupos del canal, segun la fecha de la barra seleccionada
//Este contexto se define aqui pero se llenara en listado cuando se llama la fecha en el datapicker
//en el Listado.jsx para traer la programación segun se actualice la fecha en la barra

import React, { createContext } from 'react'
import { useState } from 'react'

export const PronosticoContext = createContext(null)

export const PronosticoTurnosProvider = ({children}) => {

    const [pronosticoTurnos,setPronosticoTurnos] = useState([]);

    

  return (
    
    <PronosticoContext.Provider value={[pronosticoTurnos,setPronosticoTurnos]}>
      {children}
    </PronosticoContext.Provider>
    
  )
}

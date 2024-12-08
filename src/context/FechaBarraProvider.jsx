//Este contexto manejara la fecha en la barra del Mainplanner que principalmente se usara 
//en el Listado.jsx para traer la programación segun se actualice la fecha en la barra

import React, { createContext } from 'react'
import { useState } from 'react'

export const FechaBarraContext = createContext(null)

export const FechaBarraProvider = ({children}) => {

    const [fechaBarra,setFechaBarra] = useState(new Date(new Date().setHours(0,0,0,0)).toDateString());

  return (
    
    <FechaBarraContext.Provider value={[fechaBarra,setFechaBarra]}>
      {children}
    </FechaBarraContext.Provider>
    
  )
}



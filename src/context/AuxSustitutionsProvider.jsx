//Este contexto permitira tener un estado de react que al cambiar informara a la barra, que debera volver a 
//traer o cargar el listado de sustituciones para que actualice en la barra el sustituto de un trabajador


import React, { createContext, useEffect } from 'react';
import { useState } from 'react';

export const AuxSustitutions = createContext(null)


export const AuxSustitutionsProvider = ({children}) => {

  
    const [Aux,setAux] = useState(false);

 

  return (
    
    <AuxSustitutions.Provider value={[Aux,setAux]}>
      {children}
    </AuxSustitutions.Provider>
    
  )
}

/* eslint-disable react/prop-types */

import  './ModalPlanner3.css'

/* Import recursos */
import Anita from '../../assets/Anita.jpg';
import Calendar from '../../assets/calendar.webp';
import imagenPermissions from '../../assets/break1.jpg';
import imagenBreaks from '../../assets/break2.jpg';
import imagenIncapacity from '../../assets/Incapacity1.jpg';
import imagenRecess from '../../assets/recess1.jpg';
import imagenLicense from '../../assets/license1.jpg';



/* Import dependencies */
import { useEffect, useState } from 'react';
import axios from 'axios';






function ModalPlanner1({estado,cambiarEstado,nombres,cargo,fechaPlaner,iduser,subGrupo,color,tipo}) {

  const [, setDate] = useState();
 
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  const [data5, setData5] = useState([]);
  const [data6, setData6] = useState([]);
 



  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de programs
 

 
  const getDescansos = async ()=>{
    return await axios
    .get("http://localhost:3000/api/permissions/")
    .then((response) => setData2(response.data));
  }

  const getIncapacity = async ()=>{
    return await axios
    .get("http://localhost:3000/api/incapacitys")
    .then((response) => setData3(response.data));
  }

  const getRecess = async ()=>{
    return await axios
    .get("http://localhost:3000/api/recess")
    .then((response) => setData4(response.data));
  }

  const getLicenses = async ()=>{
    return await axios
    .get("http://localhost:3000/api/licenses")
    .then((response) => setData5(response.data));
  }

  const getBreaks = async ()=>{
    return await axios
    .get("http://localhost:3000/api/breaks")
    .then((response) => setData6(response.data));
  }



 

 

  


  useEffect(() => {
    const fecha =  Date.now();
      const hoy = new Date(fecha);
      setDate(hoy.toDateString());
  },[]);

  





  useEffect(() => {
   if(tipo=="PERMISO")
   {
    getDescansos();
   }
   else if(tipo=="INCAPACIDAD"){
    getIncapacity();
   }
   else if(tipo=="VACACIONES")
   {
    getRecess();
   }
   else if(tipo=="LICENSIA")
   {
    getLicenses();
   }
   else if(tipo=="DESCANSO")
   {
    getBreaks();
   }
   
  }, [tipo]);



  return (
    <>
      {estado && (
        <div 
          className="container-modal1"
        >
          
          {/*CABECERA */}
          <div className="cabecera">
            
            <img src={Anita} alt="anita" className="img-Profile" />
            <h3 className="nombre">
              {nombres}
              <br />
              <span className="roll">{cargo}</span>
            </h3>

            <h2 className="fecha">{fechaPlaner.toDateString()}</h2>
            <img src={Calendar} alt="calendar" className="img-calendar"/>
          </div>

          <div className="actividad2" style={{background: color}}>
              <div className="actividad_title2">
               {tipo}
              </div>
                <div className="actividad_container2">
                    <div className="actividad_lista">
                       {
                         tipo=="PERMISO" 
                         ?
                         data2?.map((descanso)=>( 

                          descanso.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(descanso.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(descanso.FechaFinal).setHours(0,0,0,0)  ?  
                            <span key={descanso._id} className='tituloP'>{descanso.Nombre}</span>:null) )
                        :


                        tipo=="INCAPACIDAD"
                        ?
                        data3?.map((incapacidad)=>( 
                          
                          incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                            <span key={incapacidad._id} className='tituloP'>{incapacidad.Nombre}</span>:null) )

                            
                        :

                        tipo=="VACACIONES"
                        ?
                        data4?.map((incapacidad)=>( 
                          
                          incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                            <span key={incapacidad._id} className='tituloP'>{incapacidad.Nombre}</span>:null) )

                            
                        :

                        tipo=="LICENSIA"
                        ?
                        data5?.map((incapacidad)=>( 
                          
                          incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                            <span key={incapacidad._id} className='tituloP'>{incapacidad.Nombre}</span>:null) )

                            
                        :

                        tipo=="DESCANSO"
                        ?
                        data6?.map((incapacidad)=>( 
                          
                          incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                            <span key={incapacidad._id} className='tituloP'>{incapacidad.Nombre}</span>:null) )

                            
                        :
                        
                        <span>NO ES NINGUN TIPO</span>
                        
                        
                       }

                    </div> 
                </div>
        </div>

          <div className="cuerpoModal2" style={{border: color +' 2px solid'}}>
          <div className="close2" onClick={() => cambiarEstado(!estado)}>X</div>
            {/* Body */}

            <div className="body_container">
                <div className="body-left">
                    <h4 className='body_left_title'>{tipo}</h4>
        
                    <img src={tipo=="PERMISO"?imagenPermissions:tipo=="INCAPACIDAD"?imagenIncapacity:tipo=="VACACIONES"?imagenRecess:tipo=="LICENSIA"?imagenLicense:tipo=="DESCANSO"?imagenBreaks:null} alt="" />
                    <div className="waterMark">
                      Powered By David Bustos
                    </div>
                </div>

                <div className="body-right">
                    <h4 className='body-right-title'>Información general</h4>
                    
                    <h4 className='body-right-description'>Descripción:</h4>



                    
                    <p className='body-right-parrafo'>
                    {
                         tipo=="PERMISO" 
                         ?
                         data2?.map((descanso)=>( 
                          descanso.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(descanso.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(descanso.FechaFinal).setHours(0,0,0,0)  ? 
                          <span key={descanso._id} className='tituloP'>{descanso.Observacion}</span>:null))
                        :

                        tipo=="INCAPACIDAD" 
                         ?
                         data3?.map((incapacidad)=>( 
                          incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                          <span key={incapacidad._id} className='tituloP'>{incapacidad.Observacion}</span>:null))
                        :

                        tipo=="VACACIONES" 
                         ?
                         data4?.map((incapacidad)=>( 
                          incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                          <span key={incapacidad._id} className='tituloP'>{incapacidad.Observacion}</span>:null))
                        :

                        tipo=="LICENSIA" 
                        ?
                        data5?.map((incapacidad)=>( 
                         incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                         new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                         <span key={incapacidad._id} className='tituloP'>{incapacidad.Observacion}</span>:null))
                       :

                       tipo=="DESCANSO" 
                       ?
                       data6?.map((incapacidad)=>( 
                        incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                        new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                        <span key={incapacidad._id} className='tituloP'>{incapacidad.Observacion}</span>:null))
                      :
                        
                        <span>NO ES NINGUN TIPO</span>

                       }
                   </p>

                    <h4 className='body-right-description'>Fecha de inicio:</h4>
                    <p className='body-right-parrafo'>
                    {
                         tipo=="PERMISO" 
                         ?
                         data2?.map((descanso)=>( 
                          descanso.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(descanso.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(descanso.FechaFinal).setHours(0,0,0,0)  ? 
                            <span key={descanso._id} className='tituloP'>{new Date(descanso.FechaInicio).toDateString()}</span>:null))
                        :

                        tipo=="INCAPACIDAD" 
                         ?
                         data3?.map((incapacidad)=>( 
                          incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                            <span key={incapacidad._id} className='tituloP'>{new Date(incapacidad.FechaInicio).toDateString()}</span>:null))
                        :
                        
                        tipo=="VACACIONES" 
                         ?
                         data4?.map((incapacidad)=>( 
                          incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                            <span key={incapacidad._id} className='tituloP'>{new Date(incapacidad.FechaInicio).toDateString()}</span>:null))
                        :

                        tipo=="LICENSIA" 
                        ?
                        data5?.map((incapacidad)=>( 
                         incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                         new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                           <span key={incapacidad._id} className='tituloP'>{new Date(incapacidad.FechaInicio).toDateString()}</span>:null))
                       :

                       tipo=="DESCANSO" 
                       ?
                       data6?.map((incapacidad)=>( 
                        incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                        new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                          <span key={incapacidad._id} className='tituloP'>{new Date(incapacidad.FechaInicio).toDateString()}</span>:null))
                      :
                        
                        
                        <span>NO ES NINGUN TIPO</span>

                       }
                    </p>

                    <h4 className='body-right-description'>Fecha final:</h4>
                    <p className='body-right-parrafo'>
                    {
                         tipo=="PERMISO" 
                         ?
                         data2?.map((descanso)=>( 
                          descanso.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(descanso.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(descanso.FechaFinal).setHours(0,0,0,0)  ? 
                            <span key={descanso._id} className='tituloP'>{new Date(descanso.FechaFinal).toDateString()}</span>:null))
                        :
                        tipo=="INCAPACIDAD" 
                        ?
                        data3?.map((incapacidad)=>( 
                          incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                         new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                           <span key={incapacidad._id} className='tituloP'>{new Date(incapacidad.FechaFinal).toDateString()}</span>:null))
                       :

                       tipo=="VACACIONES" 
                       ?
                       data4?.map((incapacidad)=>( 
                         incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                        new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                          <span key={incapacidad._id} className='tituloP'>{new Date(incapacidad.FechaFinal).toDateString()}</span>:null))
                      :

                      tipo=="LICENSIA" 
                       ?
                       data5?.map((incapacidad)=>( 
                         incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                        new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                          <span key={incapacidad._id} className='tituloP'>{new Date(incapacidad.FechaFinal).toDateString()}</span>:null))
                      :

                      tipo=="DESCANSO" 
                      ?
                      data6?.map((incapacidad)=>( 
                        incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                       new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                         <span key={incapacidad._id} className='tituloP'>{new Date(incapacidad.FechaFinal).toDateString()}</span>:null))
                     :
                       
                       
                       
                       <span>NO ES NINGUN TIPO</span>

                       }
                    </p>

                    <h4 className='body-right-description'>Autorizado por:</h4>
                    <p className='body-right-parrafo'>
                    {
                         tipo=="PERMISO" 
                         ?
                         data2?.map((descanso)=>( 
                          descanso.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(descanso.FechaInicio).setHours(0,0,0,0)  &&
                          new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(descanso.FechaFinal).setHours(0,0,0,0)  ? 
                            <span key={descanso._id} className='tituloP'>{descanso.NombreEmpleado}</span>:null))
                        :

                        tipo=="INCAPACIDAD" 
                        ?
                        data3?.map((incapacidad)=>( 
                          incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                         new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                           <span key={incapacidad._id} className='tituloP'>{incapacidad.NombreEmpleado}</span>:null))
                       :

                       tipo=="VACACIONES" 
                       ?
                       data4?.map((incapacidad)=>( 
                         incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                        new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                          <span key={incapacidad._id} className='tituloP'>{incapacidad.NombreEmpleado}</span>:null))
                      :

                      tipo=="LICENSIA" 
                      ?
                      data5?.map((incapacidad)=>( 
                        incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                       new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                         <span key={incapacidad._id} className='tituloP'>{incapacidad.NombreEmpleado}</span>:null))
                     :

                     tipo=="DESCANSO" 
                      ?
                      data6?.map((incapacidad)=>( 
                        incapacidad.Id_Empleado==iduser && new Date(fechaPlaner).setHours(0,0,0,0) >= new Date(incapacidad.FechaInicio).setHours(0,0,0,0)  &&
                       new Date(fechaPlaner).setHours(0,0,0,0) <= new Date(incapacidad.FechaFinal).setHours(0,0,0,0)  ? 
                         <span key={incapacidad._id} className='tituloP'>{incapacidad.NombreEmpleado}</span>:null))
                     :
                       
                                    
                       <span>NO ES NINGUN TIPO</span>

                       }
                    </p>

                    <h4 className='body-right-description'>{tipo == "PERMISO" ? "Permisos" : tipo == "INCAPACIDAD" ? "Incapacidades" :  tipo == "VACACIONES" ? "Vacaciones" : tipo == "LICENSIA" ? "Licensias" : null} en este año:</h4>
                   <ul className='ulListado'>


                      {
                         tipo=="PERMISO" 
                         ?
                         data2?.map((descanso)=>( 
                          descanso.Id_Empleado==iduser && descanso.Año == new Date(fechaPlaner).getFullYear() ? 
                          <li key={descanso._id} className='liListado'>- {descanso.Nombre} - <span className='item-li'>fecha inicio:</span> {new Date(descanso.FechaInicio).toDateString()} <span className='item-li'>---- Fecha final:</span> {new Date(descanso.FechaFinal).toDateString()}</li>:null))
                        :
                        tipo=="INCAPACIDAD" 
                         ?
                         data3?.map((incapacidad)=>( 
                          incapacidad.Id_Empleado==iduser && incapacidad.Año == new Date(fechaPlaner).getFullYear() ? 
                          <li key={incapacidad._id} className='liListado'>- {incapacidad.Nombre} - <span className='item-li'>fecha inicio:</span> {new Date(incapacidad.FechaInicio).toDateString()} <span className='item-li'>---- Fecha final:</span> {new Date(incapacidad.FechaFinal).toDateString()}</li>:null))
                        :

                        tipo=="VACACIONES" 
                         ?
                         data4?.map((incapacidad)=>( 
                          incapacidad.Id_Empleado==iduser && incapacidad.Año == new Date(fechaPlaner).getFullYear() ? 
                          <li key={incapacidad._id} className='liListado'>- {incapacidad.Nombre} - <span className='item-li'>fecha inicio:</span> {new Date(incapacidad.FechaInicio).toDateString()} <span className='item-li'>---- Fecha final:</span> {new Date(incapacidad.FechaFinal).toDateString()}</li>:null))
                        :

                        tipo=="LICENSIA" 
                        ?
                        data5?.map((incapacidad)=>( 
                         incapacidad.Id_Empleado==iduser && incapacidad.Año == new Date(fechaPlaner).getFullYear() ? 
                         <li key={incapacidad._id} className='liListado'>- {incapacidad.Nombre} - <span className='item-li'>fecha inicio:</span> {new Date(incapacidad.FechaInicio).toDateString()} <span className='item-li'>---- Fecha final:</span> {new Date(incapacidad.FechaFinal).toDateString()}</li>:null))
                       :

                       tipo=="DESCANSO" 
                        ?
                        data6?.map((incapacidad)=>( 
                         incapacidad.Id_Empleado==iduser && incapacidad.Año == new Date(fechaPlaner).getFullYear() ? 
                         <li key={incapacidad._id} className='liListado'>- {incapacidad.Nombre} - <span className='item-li'>fecha inicio:</span> {new Date(incapacidad.FechaInicio).toDateString()} <span className='item-li'>---- Fecha final:</span> {new Date(incapacidad.FechaFinal).toDateString()}</li>:null))
                       :








                        <span>NO ES NINGUN TIPO</span>
                      }
                    
                   </ul>

                </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default ModalPlanner1

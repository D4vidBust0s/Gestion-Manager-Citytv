/* ESTILOS */
import './ModalDiasFestivos.css'

/* IMAGENES */ 
import Plus from '../../assets/layer-plus.svg';
import Trash from '../../assets/trash.svg';
import Copy from '../../assets/copy.svg';

/* DEPENDENCIAS */ 
import  {useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";



export default function ModalDiasFestivos() {

  const [startDate, setStartDate] = useState(new Date());
  const [startDate2, setStartDate2] = useState(new Date());
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  //const [aux,setAux] = useState(0);
 
  let vAño = 0;
  let vMes = 0;
  let vDia = 0;
  let aux = 0;
  
  

//FUNCIONES
 //Funcion que obtiene la data de la api - listado de holidays segun el año actual

 const llamarAño = async()=>{
  await axios
    .get('http://localhost:3000/api/holidays/'+startDate.getFullYear())
    .then((respuesta1) => setData1(respuesta1.data))
    .catch((error)=>{
        console.log(error);
    })
 }

 const llamarAñoUpdate = async()=>{
  /*
  await axios
    .get('http://localhost:3000/api/holidays/'+startDate2.getFullYear())
    .then((respuesta1) => setData4(respuesta1.data))
    .catch((error)=>{
        console.log(error);
    })
  */

    try {
          const respuesta = await axios.get('http://localhost:3000/api/holidays/'+startDate2.getFullYear())

      if(respuesta.status === 200)
      {
        (respuesta) => setData4(respuesta.data);
         aux = respuesta.data.length;

      }
  
    } catch (error) {
      toast.error("ERROR CON EN LA CONSULTA A LA API" + error);
    }


 }

 const llamarMes = async()=>{
  await axios
    .get('http://localhost:3000/api/holidays/mes/'+startDate.getMonth(),
    {
      params:{
        Año:startDate.getFullYear(),
      }
  })
    .then((respuesta2) => setData2(respuesta2.data))
    .catch((error)=>{
        console.log(error);
    })
 }

/*
el problemas es que al llamr el dia tambien llama a los dias de los otros meses por lo 
cual debo filtrar que sea por dia y por mes aqui en la llamada a la api, asi me toque hacer otro metodo en la api

*/

 const llamarDia = async()=>{
  await axios
    .get('http://localhost:3000/api/holidays/dia/'+startDate.getDate(),
    {
        params:{
          Mes:startDate.getMonth(),
          Año:startDate.getFullYear(),
        }
    })
    .then((respuesta3) => setData3(respuesta3.data))
    .catch((error)=>{
        console.log(error);
    })
 }
 
 const traer = async ()=>{
  
  const year = startDate.getFullYear().toString();
     
    return await axios
      .get("http://localhost:3000/api/holidays/"+year)
      .then((response) => setData(response.data)
      );
 
 }

 const agregar = async ()=>{
  //Validamos los campos necesarios
  if(startDate=="")
  {
    toast.error("No se ha seleccionado una fecha");
  }

  else if(motivoRef.current.value=="")
  {
    toast.error("Debe especificar el motivo para el dia festivo");
    motivoRef.current.focus();
  }
  else{
    

    //Valido si ya existe el registro, si no existe lo creo, si existe lo actualizo

    //Validando Año
    //-------------------------------------------------------------------------------------------------------
    
    llamarAño();

    if(data1.length>0)
    {
      vAño = 1;
    }
    else{
      vAño=0;
    }

    //Validando mes
    //-------------------------------------------------------------------------------------------------------
    
    llamarMes();
    
    if(data2.length>0)
    {
      vMes = 1;
    }

    else{
      vMes=0;
    }

    //Validando dia
    //-------------------------------------------------------------------------------------------------------
    
    llamarDia();
    
    if(data3.length>0)
    {
      vDia = 1;
    }

    else{
      vDia=0;
    }

    
    //Valido los tres registros año - mes - dia
    //-------------------------------------------------------------------------------------------------------
    
    if(vAño==1 && vMes==1)
    {
      if(vDia==0)
      {
        //Como el dia no existe en el mes seleccionado procedo a actualizar el mes con el nuevo
        //dato ya que el mes existe ya

        await axios.put("http://localhost:3000/api/holidays/" + startDate.getDate(), {
          motivo: motivoRef.current.value,
          mes: startDate.getMonth(),
          año: startDate.getFullYear(),
          
        });

        console.log("Año es.."+vAño + " Mes es.."+vMes + " Dia es.."+ vDia);
        console.log("Mes enviado es.."+startDate.getMonth() + " Año enviado es.."+ startDate.getFullYear() + " Dia enviado es.." + startDate.getDate() + " Motivo es.." + motivoRef.current.value);

        motivoRef.current.value="";
        traer();
        toast.success("Mes actualizado correctamente en el año correspondiente");
      }
      else{
        
        //En este paso como el dia existe junto al mes y año, pues simplemte lo actualizo
        await axios.put("http://localhost:3000/api/holidays/", {
          dias: startDate.getDate(),
          motivo: motivoRef.current.value,
          mes: startDate.getMonth(),
          año: startDate.getFullYear(),
          
      });

        //console.log("Año es.."+vAño + " Mes es.."+vMes + " Dia es.."+ vDia);
        //console.log("Mes enviado es.."+startDate.getMonth() + " Año enviado es.."+ startDate.getFullYear() + " Dia enviado es.." + startDate.getDate() + " Motivo es.." + motivoRef.current.value);

        motivoRef.current.value="";
        traer();
        toast.success("Actualizado correctamemente");
      }
    }

    else{

      //El dia es agregado ya que no existe
      
      await axios.post("http://localhost:3000/api/holidays/", {
        nombre: startDate.toLocaleString('default', { month: 'long' }),
        mes: startDate.getMonth(),
        año: startDate.getFullYear(),

          dias: [
            {
              "dia":startDate.getDate(),
              "motivo":motivoRef.current.value
            }
          ]
      });
    
      motivoRef.current.value="";
      traer();
   
      toast.success("Dia agregado correctamente");
    }
      
  }

 }

 

 const seleccionado = async (dia,mes,año,motivo)=>{
  //Para actualizar el motivo se debe traer la fecha y el motivo y actualizarlos en la interfaz, es aqui donde 
  //hago este proceso, ya en la opcion de agregar cuando ya existe el registro simplemete lo actualizo. esto
  //lo realizo en la funcion agregar
  
  //Primero actualizo la caja de texto del motivo
  motivoRef.current.value=motivo;

  //Segundo actualizo la fecha en el datapicker creando una fecha con la info traida
  let newFecha = new Date(año,mes,dia);
  setStartDate(newFecha);  
  
 }

 const eliminar = async ()=>{
 //valido si exite el registro para poder eliminarlo

  llamarAño();

    if(data1.length>0)
    {
      vAño = 1;
    }
    else{
      vAño=0;
    }

    //Validando mes
    //-------------------------------------------------------------------------------------------------------
    
    llamarMes();
    
    if(data2.length>0)
    {
      vMes = 1;
    }

    else{
      vMes=0;
    }

    //Validando dia
    //-------------------------------------------------------------------------------------------------------
    
    llamarDia();
    
    if(data3.length>0)
    {
      vDia = 1;
    }

    else{
      vDia=0;
    }


  if(vAño==1 && vMes==1 && vDia==1)
    {
      //En este paso como el dia existe junto al mes y año, pues simplemte lo actualizo
      await axios.put("http://localhost:3000/api/holidays/delregistro/", {
        dias: startDate.getDate(),
        motivo: motivoRef.current.value,
        mes: startDate.getMonth(),
        año: startDate.getFullYear(),
        
      });

    motivoRef.current.value="";
    traer();
      toast.success("Registro eliminado");
    }

    else{
      toast.error("No puede eliminar un dia que no existe en el registro");
    }
  
}

const renderYearContent = (year) => {
  const tooltipText = `Tooltip for year: ${year}`;
  return <span title={tooltipText}>{year}</span>;
};


const clonar = async ()=>{

  //funcion que permite clonar los eventos festivos de un año en otro
  //----------------------------------------------------------------------------------------

  /* Primero validamos los dos años que existan y que no sean iguales */
  if(startDate.getFullYear() == startDate2.getFullYear())
  {
    toast.error("Los años que desea clonar son iguales");
  }

  else
  {
    
    /* Llamo la api y le envio la información para realizar la operacion de clonación */
  
    await llamarAñoUpdate();

    await axios.put("http://localhost:3000/api/holidays/clone/", {
        an1: startDate.getFullYear(),
        an2: startDate2.getFullYear(), 
        ex: aux,
    });

    toast.success("Clonación correcta" + aux);

  }

}

/*------------------------------------------------------------------------------------------*/
//HOCKS
useEffect(()=>{
  traer();
},[startDate]);

useEffect(()=>{
  console.log(data);
},[data]);

useEffect(()=>{
  llamarAño();
  llamarMes();
  llamarDia();
},[startDate])

useEffect(()=>{
  llamarAñoUpdate();
},[startDate2])




/* REFERENCIAS */
const startDateRef = useRef();
const motivoRef = useRef();


  return (
    <>
    <div><Toaster /></div>

    <div className="supercontainer">
      <div className="contentModalDiasFestivos">
        <div className="year">
        <DatePicker className='picker'
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          renderYearContent={renderYearContent}
          showYearPicker
          dateFormat="yyyy"
        />
        </div>


        <div className="contentCalendar">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            inline
            showWeekNumbers
            showMonthDropdown
            ref={startDateRef}
          />
        </div>

        <div className="fecha">
          {startDate.toDateString()}
        </div>

        <div className="seccionButons">
          <div className="containerSingleButtom">
            <img src={Plus} alt="plus" className="img-butons" onClick={agregar}/>
          </div>
          <div className="containerSingleButtomDel">
            <img src={Trash} alt="trash" className="img-butons" onClick={eliminar}/>
          </div>
        </div>

       
          <div className="cuerpoModa2">
            <div className="container-Observaciones">
              <h3 className="subTitulo">Motivo día festivo</h3>
              <textarea
                name="observaciones"
                cols="90"
                rows="8"
                className="observaciones"
                ref={motivoRef}
              ></textarea>
            </div>
          </div>

          <div className="year">
          <h3 className='tituloaño'>CLonar dias del año actual a...</h3>
        <DatePicker className='picker'
          selected={startDate2}
          onChange={(date) => setStartDate2(date)}
          renderYearContent={renderYearContent}
          showYearPicker
          dateFormat="yyyy"
        />
        </div>


        <div className="seccionButons">
          <div className="containerSingleButtom">
            <img src={Copy} alt="plus" className="img-butons" onClick={clonar}/>
          </div>
        </div>
      </div>
      

      <div className="lateral">
        <h5 className='TT'>
          {"Año " + startDate.getFullYear()}
        </h5>

        {
          data?.map((item)=>(
            <div className="meses" key={item._id}>
              <div className="filaMes">
                {item.Nombre}
                <br/>
                    <span className='sp'>
                      <ul className='ulMeses'>
                        {
                          item.Dias?.map((sub)=>(
                            <li className='liDias' key={sub.dia} onClick={()=>seleccionado(sub.dia,item.Mes,item.Año,sub.motivo)}>
                             <div className='numero'>{sub.dia}</div>
                             <div className='motivo'>{sub.motivo}</div>
                            </li>
                            )
                          )
                        }      
                      </ul>
                    </span>
                </div>
              </div>
          ))
        }

      </div>
      </div>
    </>
  );
}

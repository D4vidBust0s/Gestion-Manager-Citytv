/* ESTILOS */
import '../Balancer/balancer.css';

/* DEPENDENCIAS */
import DatePicker from 'react-datepicker';
import axios from "axios";
import { useState, useEffect} from "react";
//import { Toaster, toast } from "react-hot-toast";
//import Swal from "sweetalert2";

/* IMAGENES */
import Logodefault from '../../assets/logos/audio.svg';
import Calendar from '../../assets/calendar.webp';

/* VARIABLES */
let numDias = [];
let monts = [];
let numDias2 = [];

let fechaRules;
let fechaRulesFormat;
let auxDias;
let auxDias2;
let auxDias3;
let mes;
let año;

let auxDias0;
let auxDias22;
let auxDias33;

let auxMont;
let auxMont2;
let auxMont3;

let corroborador1 = 0;
let corroborador2 = 0;
let corroborador3 = 0;

let ancho = 0;
let ancho1 = 0;
let ancho2 = 0;

let inicial;
let final







export default function BalancerContent() {
    
    const [startDate,setStartDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
    const [data3, setData3] = useState([]);
    const [data4, setData4] = useState([]);
   
   
    //----------------------------------------------------------------------------------------------------------
  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };

  //Funcion que obtiene la data de la api - todos los usuario
  const getPeople = async ()=>{
    return await axios
    .get("http://localhost:3000/api/payroll")
    .then((response) => setData1(response.data));
  };

  //Funcion que trae los datos o reglas de Rules
  const getRules = async () => {
    return await axios
      .get("http://localhost:3000/api/rules")
      .then((response) => setData2(response.data));
      
  };

  //Funcion que trae los datos de el balancer
  const getBalancerActual = async () => {
    return await axios
      .get("http://localhost:3000/api/balancer")
      .then((response) => setData3(response.data));
      
  };

  //Funcion que obtiene la data de la api - listado de turnos segun id y fecha especifica
  const obtenerListadoTurnos = async (fecha) => {
    return await axios
      .get("http://localhost:3000/api/shifts/day",
      {
        params:{
          in: inicial,
          out: final
        }
      })
      .then((response) => setData4(response.data));
  };


 //Funcion que agrega un cero si el numero recibido es de 0 a 9
  const formatearNumero = (Nuevonumero)=>{
   
    
    if(Nuevonumero == 0 || Nuevonumero == 1 || Nuevonumero == 2 || Nuevonumero == 3|| Nuevonumero == 4 || Nuevonumero == 5 || Nuevonumero == 6 || Nuevonumero == 7 || Nuevonumero == 8 || Nuevonumero == 9)
    {
        Nuevonumero = "0"+Nuevonumero;
    }

    else{
      Nuevonumero =  Nuevonumero;
    }

    return Nuevonumero;
  }

  //Funcion que agrega un cero si el numero recibido es de 0 a 9
  const formatearNumero2 = (Nuevonumero)=>{
   
    Nuevonumero++;
    
    if(Nuevonumero == 0 || Nuevonumero == 1 || Nuevonumero == 2 || Nuevonumero == 3|| Nuevonumero == 4 || Nuevonumero == 5 || Nuevonumero == 6 || Nuevonumero == 7 || Nuevonumero == 8 || Nuevonumero == 9)
    {
        Nuevonumero = "0"+Nuevonumero;
    }

    else{
      Nuevonumero =  Nuevonumero;
    }

    return Nuevonumero;
  }


  const operarMatrizDias = (iduser,fechaEvaluada)=>{
    let horas = 0;

    data4.map((shiftsLimited)=>(
      shiftsLimited.ID_user == iduser && shiftsLimited.Fecha_clave == new Date(fechaEvaluada).toISOString() && (horas = shiftsLimited.Index)
    ))

    return horas;
  }
  

//-------------------------------------------------------------------------------------------------------------------------
//Funcion mas grande del sistema que operara con la base de datos shifts para traer las horas laboradas
//por un trabajador segun la los parasmetros recibidos

const operarDiaslaborados = (mes, dia, año, iduser)=>{

  mes ++;

  let HorasLaborada = 0;
  let nuevafecha;

  // 1) crear una fecha aprtir de un string
  nuevafecha = ""+año+"-"+formatearNumero(mes)+"-"+formatearNumero(dia)+"T00:00:00";
  nuevafecha = new Date(nuevafecha).toISOString();

  // 2) Con la fecha y el id de usuario operar la base de datos coleccion shifts para saber las horas laboradas ese dia
  HorasLaborada = operarMatrizDias(iduser,nuevafecha);
  
  return HorasLaborada;

}
  
  const validateMonts = (mont)=>{
    if(mont == 0)
    {
        return "Enero";
    }
    else if(mont == 1){
      return "Febrero";
    }

    else if(mont == 2){
      return "Marzo";
    }

    else if(mont == 3){
      return "Abril";
    }

    else if(mont == 4){
      return "Mayo";
    }

    else if(mont == 5){
      return "Junio";
    }

    else if(mont == 6){
      return "Julio";
    }

    else if(mont == 7){
      return "Agosto";
    }

    else if(mont == 8){
      return "Septiembre";
    }

    else if(mont == 9){
      return "Octubre";
    }

    else if(mont == 10){
      return "Noviembre";
    }

    else if(mont == 11){
      return "Diciembre";
    }
  }

  //Funcion para crear un array con el numero de dias definido en rules
  const createArray = (diasRules)=>{

    //Proceso para traer los dias correctos segun fecha definida
    data2?.map((item)=>{

      fechaRules = new Date(item.DiaPeriod).setHours(0,0,0,0);
      fechaRulesFormat = new Date(fechaRules);
      fechaRulesFormat.setDate(fechaRulesFormat.getDate() + parseInt(item.Dia) + 1);
   
  })
   
    //Limpiamos el array
    for (let index = 0; index < parseInt(diasRules); index++) {
      numDias.splice(0,numDias.length);
    }

      //Limpiamos el array
      for (let index = 0; index < parseInt(diasRules); index++) {
        numDias2.splice(0,numDias2.length);
      }

    //Llenamos el array
    for (let i = 0; i <= parseInt(diasRules); i++) {

      //Proceso para llenar el nuevo array con los dias correspondientes
      auxDias = new Date(fechaRules);
      auxDias2 =  new Date(auxDias.setDate(auxDias.getDate()+i));
      auxDias3 =  new Date(auxDias2).getDate();

      numDias.push(auxDias3);
    }



   //Llenamos el array
   for (let i = 0; i <= parseInt(diasRules); i++) {

    //Proceso para llenar el nuevo array con los dias correspondientes
    auxDias0 = new Date(fechaRules);
    auxDias22 =  new Date(auxDias0.setDate(auxDias0.getDate()+i));
    auxDias33 =  new Date(auxDias22).getDate();

    mes = new Date(auxDias0).getMonth();
    año = new Date(auxDias0).getFullYear();
  
    numDias2.push({dia:auxDias33,mes:mes,año:año});
  }


  
  }


  const createMont = (diasRules,index)=>{
    //Primero haberiguar si son dos meses o uno

      //Limpiamos el array
      for (let index = 0; index < parseInt(diasRules); index++) {
        monts.splice(0,monts.length);
      }
  
      //Llenamos el array
      for (let i = 0; i <= parseInt(diasRules); i++) {
  
        //Proceso para llenar el nuevo array con los meses correspondientes
        auxMont = new Date(fechaRules);
        auxMont2 =  new Date(auxMont.setDate(auxMont.getDate()+i));
        auxMont3 =  new Date(auxMont2).getMonth();
      
        monts.push(auxMont3);
      }

      for (let i = 0; i <= monts.length; i++) {
        corroborador1 = monts[0];
        corroborador2 = monts[i];
        ancho = parseInt(diasRules)*29;
        
        if(corroborador1!=corroborador2)
        {
          corroborador3 = 1;
        }
      }

      ancho1=0;

      for (let i = 0; i <= parseInt(diasRules); i++) {
        //Operacion para saber cuantos dias son de un mes y cuantos de otro
        
        //console.log(numDias[i+1]+"--"+(numDias[i]+1))
        
        if(numDias[i+1]==(numDias[i]+1))
        {
          ancho1++;
        }

        else{
          i=parseInt(diasRules);
          ancho2 = parseInt(diasRules)-ancho1;
        }

       
            
      }

      if(corroborador3==0)
      {
        return <div key={index}>
        <div style={{padding:".2rem",background:" #EB464B",marginRight: "1px",width:ancho+29,height:" 1.8rem"}} key={index}>{validateMonts(auxMont3)}</div>
       </div>
      }

      else if(corroborador3==1)
      {
        return <div key={index} className='right'>
          <div style={{padding:".2rem",background:" #EB464B",marginRight: "1px",width:(ancho1+1)*29,height:" 1.8rem"}} key={index}>{validateMonts(corroborador1)}</div>
          <div style={{padding:".2rem",background:" #701CF5",marginRight: "1px",width:(ancho2)*29,height:" 1.8rem"}} key={index+1}>{validateMonts(auxMont3)}</div>
       </div>
      }

   
   
  }

 


  const exist = (payrollId,payrollGrupo,groupNombre,payrollNombres, payrollApellidos ) =>{


    return (
      <div key={payrollId}>
        <div className="principal">
          
          
          {
            //Mostramos nombre y apellido
            <div className="sujetos">
              { payrollNombres + " " + payrollApellidos}
            </div>
            
          }

          <ul className="pr">
          {
            numDias2?.map((item,index)=>(
              
              //aqui debo hacer la operacion con el dato del mes, el dia y el año, y el id de usuario o con una fecha completa
              //creando una funcion que retorne el valor de horas en ese dia consultando en shifts

              <li className={operarDiaslaborados(item.mes,item.dia,item.año,payrollId) != 0 ? "li-pr4" : "li-pr"} key={index}>{operarDiaslaborados(item.mes,item.dia,item.año,payrollId)}</li> 
            ))
          }
           <li className="li-pr2">
            {0}
          </li>

         </ul>
        </div>
      </div>
    );
  }


  const sumaDias = (fecha,dias)=>{
    return new Date(new Date(fecha).setDate( new Date (fecha).getDate()+parseInt(dias))).getDate();
  }

  const sumaMes = (fecha,dias)=>{
    return new Date(new Date(fecha).setDate( new Date (fecha).getDate()+parseInt(dias))).getMonth();
  }

  const sumaAño = (fecha,dias)=>{
    return new Date(new Date(fecha).setDate( new Date (fecha).getDate()+parseInt(dias))).getFullYear();
  }

  const createFirstBalancer = ()=>{
    console.log("SE CREA EL REGISTRO");
    createBalancer();
  }

  const traerRangoFechas = async ()=>{

    //inicial = ( new Date (item.DiaPeriod).getDate() + " de " + validateMonts(new Date (item.DiaPeriod).getMonth()) + " de " + new Date (item.DiaPeriod).getFullYear()),
    //final = ( sumaDias(item.DiaPeriod,item.Dia) + " de " + validateMonts(sumaMes(item.DiaPeriod,item.Dia)) + " de " + sumaAño(item.DiaPeriod,item.Dia)),

    data2?.map((item)=>(

      inicial = (""+ new Date (item.DiaPeriod).getFullYear()+"-"+formatearNumero2(new Date (item.DiaPeriod).getMonth())+"-"+ formatearNumero(new Date (item.DiaPeriod).getDate()) +"T00:00:00"),
      final = (""+sumaAño(item.DiaPeriod,item.Dia)+"-"+formatearNumero(sumaMes(item.DiaPeriod,item.Dia)+1)+"-"+sumaDias(item.DiaPeriod,item.Dia)+"T00:00:00"),
      
      console.log ("Inicial = " + inicial + " final = " +final)
      ))
  }

  

  useEffect(()=>{
    getRules();
  }, []);

    useEffect(() => {
      obtenerListadoGrupos();
    }, []);
  
    useEffect(() => {
      getPeople();
    }, []);

    useEffect(()=>{
      getBalancerActual();
    },[]);


    useEffect(()=>{
      traerRangoFechas();
    },[data1]);


    useEffect(()=>{
      obtenerListadoTurnos();
    },[]);

   
  
  
    
  return (
   
    <>

        <div className="calendar-2">
                <DatePicker className='calen'
                  closeOnScroll={true}
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
               />
        </div>


      <div className="containerMain">
        <div className="date">
        <img src={Calendar} alt="calendarLog" className='calendarLog'/>
          {data2?.map((item)=>(
              "Periodo de "+ new Date (item.DiaPeriod).getDate() + " de " + validateMonts(new Date (item.DiaPeriod).getMonth()) + " de " + new Date (item.DiaPeriod).getFullYear() + " -- A --  " + sumaDias(item.DiaPeriod,item.Dia) + " de " + validateMonts(sumaMes(item.DiaPeriod,item.Dia)) + " de " + sumaAño(item.DiaPeriod,item.Dia) + " --- " + data4.length + " items encontrados"
          ))}
        </div>

        <div className="top">
          <div className="left"></div>

          <div className="right">
          {
            data2.map((it,index)=>(
              createMont(it.Dia,index)
            ))
          }   
          </div>
        </div>

        {/* POR DEFECTO SON 21 DIAS ASI QUE HAY QUE TRAER ESTE DATO DEL SYSTEMA */}
        <div className="containerDias">
          <ul className="ulDias">
          {/*<li className="liDias">1</li>*/}   

          {
            data2.map((rules_Dia)=>(
              createArray(rules_Dia.Dia)
            ))

            
          }   



            {

                numDias2?.map((item,index)=>(
                  <li className="liDias" key={index}>{item.dia}</li>
                ))
                
            }

            <li className="liDias2">TOTAL</li>
          </ul>

        </div>

        
        {data?.map((group)=>(
         <div className="rowDef" key={group._id}>
          <div className="sectionOne" key={group._id}>
           <img src={group.logo?group.logo:Logodefault} alt={group.nombre} className="logoDef" />

           <div className="ul-listado" key={group.nombre}>
             

              {
                data1?.map((payroll)=>(
                
                  payroll.grupoID == group._id ?  exist(payroll._id,payroll.grupo,group.nombre,payroll.nombres,payroll.apellidos) : null
                  
                ))
              }
             
           </div>
         </div>
       </div>
        ))}


        
       
        
        
      </div>
    </>
  );
}

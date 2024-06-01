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

/* VARIABLES */
let numDias = [];
let monts = [];

let fechaRules;
let fechaRulesFormat;
let auxDias;
let auxDias2;
let auxDias3;

let auxMont;
let auxMont2;
let auxMont3;

let corroborador1 = 0;
let corroborador2 = 0;
let corroborador3 = 0;

let ancho = 0;
let ancho1 = 0;
let ancho2 = 0;





export default function BalancerContent() {
    
    const [startDate,setStartDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
   
   
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

    //Llenamos el array
    for (let i = 0; i <= parseInt(diasRules); i++) {

      //Proceso para llenar el nuevo array con los dias correspondientes
      auxDias = new Date(fechaRules);
      auxDias2 =  new Date(auxDias.setDate(auxDias.getDate()+i));
      auxDias3 =  new Date(auxDias2).getDate();
    
      numDias.push(auxDias3);
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
        
        console.log(numDias[i+1]+"--"+(numDias[i]+1))
        
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
          {payrollNombres + " " + payrollApellidos}
      
          <ul className="pr">
            <li className="li-pr">{data2[0].Dia}</li>
            <li className="li-pr">{payrollId}</li>
            <li className="li-pr">20</li>
            <li className="li-pr">10</li>
            <li className="li-pr">5</li>
            <li className="li-pr">14</li>
            <li className="li-pr">8</li>
            <li className="li-pr">20</li>
            <li className="li-pr">10</li>
            <li className="li-pr">5</li>
            <li className="li-pr">14</li>
            <li className="li-pr">8</li>
            <li className="li-pr">20</li>
            <li className="li-pr">10</li>
            <li className="li-pr">5</li>
            <li className="li-pr">-</li>
            <li className="li-pr">-</li>
            <li className="li-pr">-</li>
            <li className="li-pr">-</li>
            <li className="li-pr">-</li>
            <li className="li-pr">-</li>
            <li className="li-pr2">777</li>
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


  useEffect(()=>{
    getRules();
  }, []);

    useEffect(() => {
      obtenerListadoGrupos();
    }, []);
  
    useEffect(() => {
      getPeople();
    }, []);


  
  
    
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
          {data2?.map((item)=>(
              new Date (item.DiaPeriod).getDate() + " de " + validateMonts(new Date (item.DiaPeriod).getMonth()) + " de " + new Date (item.DiaPeriod).getFullYear() + " ---- " + sumaDias(item.DiaPeriod,item.Dia) + " de " + validateMonts(sumaMes(item.DiaPeriod,item.Dia)) + " de " + sumaAño(item.DiaPeriod,item.Dia)
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
            data2.map((it)=>(
              createArray(it.Dia)
            ))

            
          }   



            {

                numDias?.map((item,index)=>(
                  <li className="liDias" key={index}>{item}</li>
                ))
                
            }

            <li className="liDias2">TOTAL</li>
          </ul>

        </div>

        
        {data?.map((group)=>(
         <div className="rowDef" key={group._id}>
         <div className="sectionOne" key={group._id}>
           <img src={group.logo?group.logo:Logodefault} alt="" className="logoDef" />

           <div className="ul-listado" key={group.nombre}>
             

              {
                data1?.map((payroll)=>(
                
                  payroll.grupo == group.nombre ?  exist(payroll._id,payroll.grupo,group.nombre,payroll.nombres,payroll.apellidos) : null
                  
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

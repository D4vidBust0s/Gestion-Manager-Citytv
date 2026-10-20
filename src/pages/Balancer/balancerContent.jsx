/* ESTILOS */
import './balancer.css';

/* DEPENDENCIAS */
import DatePicker from 'react-datepicker';
import axios from "axios";
import { useState, useEffect } from "react";

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
let final;

export default function ProjectionContent() {
    
    const [startDate, setStartDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
    const [data3, setData3] = useState([]);
    const [data4, setData4] = useState([]);
    const [data5, setData5] = useState([]);
    const [data6, setData6] = useState([]);
    

    // ESTADO PARA LOS VALORES MANUALES (ESPEJO CON INPUTS)
    const [valoresManuales, setValoresManuales] = useState({});
   
    //----------------------------------------------------------------------------------------------------------
    // FUNCIONES DE API
    const obtenerListadoGrupos = async () => {
        return await axios
          .get("http://localhost:3000/api/groups")
          .then((response) => setData(response.data));
    };

    const getPeople = async () => {
        return await axios
        .get("http://localhost:3000/api/payroll")
        .then((response) => setData1(response.data));
    };

    const getRules = async () => {
        return await axios
          .get("http://localhost:3000/api/rules")
          .then((response) => setData2(response.data));
    };

    const getBalancerActual = async () => {
        return await axios
          .get("http://localhost:3000/api/balancer")
          .then((response) => setData3(response.data));
    };

    const obtenerListadoTurnos = async () => {
        return await axios
          .get("http://localhost:3000/api/shifts/day", {
            params: {
              in: inicial,
              out: final
            }
          })
          .then((response) => setData4(response.data));
    };

    const obtenerListadoPrograms = async () => {
        return await axios
          .get("http://localhost:3000/api/programs")
          .then((response) => setData5(response.data));
    };

    const getAllStacks = async () => {
        return await axios
          .get("http://localhost:3000/api/stacks/")
          .then((response) => setData6(response.data));
    };

    const formatearNumero = (Nuevonumero) => {
        if (Nuevonumero >= 0 && Nuevonumero <= 9) {
            Nuevonumero = "0" + Nuevonumero;
        }
        return Nuevonumero;
    };

    const formatearNumero2 = (Nuevonumero) => {
        Nuevonumero++;
        if (Nuevonumero >= 0 && Nuevonumero <= 9) {
            Nuevonumero = "0" + Nuevonumero;
        }
        return Nuevonumero;
    };
  
    const extraerHorasCustom = (inicio, final, idStack) => {
        let respuesta = 0;
        data6?.map((stacks) => (
          stacks.ID_esquema == idStack && (respuesta = stacks.Duration)
        ));
        return respuesta;
    };

    const extraerHorasProgram = (idPrograma) => {
        let fechaIn;
        let fechaOut;

        data5?.map((programa) => (
          programa._id == idPrograma && (fechaIn = programa.Start, fechaOut = programa.End)
        ));

        let timeIn = new Date(fechaIn);
        let timeOut = new Date(fechaOut);

        let respuesta = timeOut.getTime() - timeIn.getTime();
        respuesta = Math.round(respuesta / (1000 * 60));

        return respuesta;
    };

    const operarMatrizDias = (iduser, fechaEvaluada) => {
        let horas = 0;
      
        data4.map((shiftsLimited) => (
          shiftsLimited.ID_user == iduser && shiftsLimited.Fecha_clave == new Date(fechaEvaluada).toISOString() &&
           (
               shiftsLimited.Type == "Null" ? (horas = horas + 30) : 
               shiftsLimited.Type == "Custom" ? (horas = horas + extraerHorasCustom(shiftsLimited.Inicio_main, shiftsLimited.Out, shiftsLimited.Id_Schema)) : 
               shiftsLimited.Type == "Programa" ? (horas = horas + extraerHorasProgram(shiftsLimited.Event_name)) : 
               shiftsLimited.Type == "Secondary" ? (horas = horas + extraerHorasProgram(shiftsLimited.Event_name)) :  
               shiftsLimited.Type == "Requerimiento" ? (horas = horas + extraerHorasProgram(shiftsLimited.Event_name)) : 
               shiftsLimited.Type == "Programmer" ? (horas = horas + extraerHorasCustom(shiftsLimited.Inicio_main, shiftsLimited.Out)) : null
           )
        ));

        return horas / 60;
    };
  
    const operarDiaslaborados = (mes, dia, año, iduser) => {
        mes++;
        let HorasLaboradas = 0;
        let nuevafecha;

        nuevafecha = "" + año + "-" + formatearNumero(mes) + "-" + formatearNumero(dia) + "T00:00:00";
        nuevafecha = new Date(nuevafecha).toISOString();

        HorasLaboradas = operarMatrizDias(iduser, nuevafecha);
        return HorasLaboradas;
    };

    // FUNCIÓN PARA GUARDAR O ACTUALIZAR EN LA BD EN EL ONCHANGE (Y AUTOCREACIÓN)
    const cambiarValorManual = async (userId, fechaIso, valor, grupoId) => {
      const num = valor === "" ? "" : parseFloat(valor) || 0;
      
      // 1. Actualización inmediata en el estado local (fluidez visual)
      setValoresManuales(prev => ({
        ...prev,
        [`${userId}_${fechaIso}`]: num
      }));

      // 2. Petición al backend en segundo plano para guardar en MongoDB
      try {
        await axios.post("http://localhost:3000/api/projections", {
          userId: userId,
          fechaClave: fechaIso,
          valorProyeccion: num === "" ? 0 : num,
          grupoId: grupoId || "GENERAL"
        });
      } catch (error) {
        console.error("Error al sincronizar proyección con la base de datos:", error);
      }
    };
  
    const validateMonts = (mont) => {
        if (mont == 0) return "Enero";
        else if (mont == 1) return "Febrero";
        else if (mont == 2) return "Marzo";
        else if (mont == 3) return "Abril";
        else if (mont == 4) return "Mayo";
        else if (mont == 5) return "Junio";
        else if (mont == 6) return "Julio";
        else if (mont == 7) return "Agosto";
        else if (mont == 8) return "Septiembre";
        else if (mont == 9) return "Octubre";
        else if (mont == 10) return "Noviembre";
        else if (mont == 11) return "Diciembre";
    };

    const createArray = (diasRules) => {
        data2?.map((item) => {
          fechaRules = new Date(item.DiaPeriod).setHours(0, 0, 0, 0);
          fechaRulesFormat = new Date(fechaRules);
          fechaRulesFormat.setDate(fechaRulesFormat.getDate() + parseInt(item.Dia) + 1);
        });
       
        numDias.splice(0, numDias.length);
        numDias2.splice(0, numDias2.length);

        for (let i = 0; i <= parseInt(diasRules); i++) {
          auxDias = new Date(fechaRules);
          auxDias2 = new Date(auxDias.setDate(auxDias.getDate() + i));
          auxDias3 = new Date(auxDias2).getDate();
          numDias.push(auxDias3);
        }

        for (let i = 0; i <= parseInt(diasRules); i++) {
          auxDias0 = new Date(fechaRules);
          auxDias22 = new Date(auxDias0.setDate(auxDias0.getDate() + i));
          auxDias33 = new Date(auxDias22).getDate();
          mes = new Date(auxDias0).getMonth();
          año = new Date(auxDias0).getFullYear();
          numDias2.push({ dia: auxDias33, mes: mes, año: año });
        }
    };

    const createMont = (diasRules, index) => {
        monts.splice(0, monts.length);
  
        for (let i = 0; i <= parseInt(diasRules); i++) {
          auxMont = new Date(fechaRules);
          auxMont2 = new Date(auxMont.setDate(auxMont.getDate() + i));
          auxMont3 = new Date(auxMont2).getMonth();
          monts.push(auxMont3);
        }

        corroborador1 = monts[0];
        corroborador3 = 0;
        ancho = parseInt(diasRules) * 29;
        
        for (let i = 0; i <= monts.length; i++) {
          corroborador2 = monts[i];
          if (corroborador1 != corroborador2) {
            corroborador3 = 1;
          }
        }

        ancho1 = 0;
        for (let i = 0; i <= parseInt(diasRules); i++) {
          if (numDias[i + 1] == (numDias[i] + 1)) {
            ancho1++;
          } else {
            i = parseInt(diasRules);
            ancho2 = parseInt(diasRules) - ancho1;
          }
        }

        if (corroborador3 == 0) {
          return <div key={index}>
            <div style={{ padding: ".2rem", background: " #EB464B", marginRight: "1px", width: ancho + 29, height: " 1.8rem" }} key={index}>{validateMonts(auxMont3)}</div>
          </div>;
        } else if (corroborador3 == 1) {
          return <div key={index} className='right'>
            <div style={{ padding: ".2rem", background: " #EB464B", marginRight: "1px", width: (ancho1 + 1) * 29, height: " 1.8rem" }} key={index}>{validateMonts(corroborador1)}</div>
            <div style={{ padding: ".2rem", background: " #701CF5", marginRight: "1px", width: (ancho2) * 29, height: " 1.8rem" }} key={index + 1}>{validateMonts(auxMont3)}</div>
          </div>;
        }
    };

    // RENDERIZADO CON TOTALES INDEPENDIENTES, VALOR POR DEFECTO DE RULES Y CAMBIO DE COLOR CONDICIONAL
    const exist = (payrollId, payrollGrupo, groupNombre, payrollNombres, payrollApellidos) => {
        
        // Obtenemos la intensidad horaria diaria configurada en Rules (por defecto 8 si no está definida)
        let intensidadDefecto = 8;
        if (data2 && data2.length > 0 && data2[0].IntensidadHorariaDiaria) {
            intensidadDefecto = parseFloat(data2[0].IntensidadHorariaDiaria) || 8;
        }

        // 1. Sumatoria exclusiva de la Base de Datos
        let totalBaseDatos = 0;
        numDias2?.forEach((item) => {
          totalBaseDatos += operarDiaslaborados(item.mes, item.dia, item.año, payrollId);
        });

        // 2. Sumatoria exclusiva de la Fila Manual / Proyección (Tomando el valor guardado o el defecto de Rules)
        let totalManual = 0;
        numDias2?.forEach((item) => {
          let mFormateado = item.mes + 1;
          let fStr = "" + item.año + "-" + formatearNumero(mFormateado) + "-" + formatearNumero(item.dia) + "T00:00:00";
          let fIso = new Date(fStr).toISOString();
          
          const valorActualCelda = valoresManuales[`${payrollId}_${fIso}`] !== undefined && valoresManuales[`${payrollId}_${fIso}`] !== ""
            ? parseFloat(valoresManuales[`${payrollId}_${fIso}`])
            : intensidadDefecto;

          totalManual += isNaN(valorActualCelda) ? 0 : valorActualCelda;
        });

        return (
          <div key={payrollId} className="contenedor-usuario-bloque" style={{ borderBottom: "1px solid #545454", marginBottom: "4px", paddingBottom: "4px" }}>
            
            {/* FILA 1: DATOS DE BASE DE DATOS Y SU TOTAL INDEPENDIENTE */}
            <div className="principal" style={{ borderBottom: "none", marginBottom: "0px" }}>
              <div className="sujetos">
                {payrollNombres + " " + payrollApellidos}
              </div>

              <ul className="pr">
                { 
                  numDias2?.map((item, index) => {
                    const horasDB = operarDiaslaborados(item.mes, item.dia, item.año, payrollId);
                    return (
                      <li className={horasDB != 0 ? "li-pr4" : "li-pr"} key={index}>
                        {horasDB}
                      </li> 
                    );
                  })
                }
                {/* Total exclusivo de Base de Datos */}
                <li className={totalBaseDatos > 0 ? "li-pr2" : "li-pr5"} style={{ height: "20px", zIndex: 20 }}>
                  {totalBaseDatos}
                </li>
             </ul>
            </div>  

            {/* FILA 2: INPUTS DE PROYECCIÓN Y SU TOTAL INDEPENDIENTE ABAJO */}
            <div className="principal" style={{ marginTop: "2px", paddingTop: "0px", borderBottom: "none" }}>
              
              <div className="sujetos" style={{ color: "#701CF5", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", paddingLeft: "4px" }}>
                Proyección:
              </div>

              <ul className="pr" style={{ marginTop: "0px" }}>
                {
                  numDias2?.map((item, index) => {
                    let mFormateado = item.mes + 1;
                    let fStr = "" + item.año + "-" + formatearNumero(mFormateado) + "-" + formatearNumero(item.dia) + "T00:00:00";
                    let fIso = new Date(fStr).toISOString();
                    
                    // Si ya está guardado en el estado (BD), se muestra; de lo contrario toma el valor de Rules por defecto
                    const valorManual = valoresManuales[`${payrollId}_${fIso}`] !== undefined 
                      ? valoresManuales[`${payrollId}_${fIso}`] 
                      : intensidadDefecto;

                    // CAMBIO VISUAL: Validamos si el valor actual es diferente al estándar de Rules
                    const esDiferenteAlDefecto = parseFloat(valorManual) !== parseFloat(intensidadDefecto);

                    return (
                      <li className="li-pr" key={index} style={{ padding: 0 }}>
                        <input
                          type="text"
                          className="input-manual-interno"
                          placeholder="0"
                          value={valorManual}
                          // Si es diferente al valor por defecto, cambia el color a negro (#000000) y resalta en negrita
                          style={{ 
                            color: esDiferenteAlDefecto ? "#000000" : undefined, 
                            fontWeight: esDiferenteAlDefecto ? "bold" : undefined 
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              cambiarValorManual(payrollId, fIso, val, payrollGrupo);
                            }
                          }}
                        />
                      </li>
                    );
                  })
                }
                {/* Total exclusivo de Proyección ubicado exactamente debajo del total de BD */}
                <li className="li-pr2" style={{ height: "20px", zIndex: 20, backgroundColor: "#701CF5", color: "#FFFFFF" }}>
                  {totalManual}
                </li>
              </ul>
            </div>

          </div>
        );
    };

    const sumaDias = (fecha, dias) => {
        return new Date(new Date(fecha).setDate(new Date(fecha).getDate() + parseInt(dias))).getDate();
    };

    const sumaMes = (fecha, dias) => {
        return new Date(new Date(fecha).setDate(new Date(fecha).getDate() + parseInt(dias))).getMonth();
    };

    const sumaAño = (fecha, dias) => {
        return new Date(new Date(fecha).setDate(new Date(fecha).getDate() + parseInt(dias))).getFullYear();
    };

    const traerRangoFechas = async () => {
        data2?.map((item) => (
          inicial = ("" + new Date(item.DiaPeriod).getFullYear() + "-" + formatearNumero2(new Date(item.DiaPeriod).getMonth()) + "-" + formatearNumero(new Date(item.DiaPeriod).getDate()) + "T00:00:00"),
          final = ("" + sumaAño(item.DiaPeriod, item.Dia) + "-" + formatearNumero(sumaMes(item.DiaPeriod, item.Dia) + 1) + "-" + formatearNumero(sumaDias(item.DiaPeriod, item.Dia)) + "T00:00:00")
        ));
    };

    useEffect(() => {
      obtenerProyeccionesGuardadas();
    }, []);

    useEffect(() => { getRules(); }, []);
    useEffect(() => { obtenerListadoGrupos(); }, []);
    useEffect(() => { getPeople(); }, []);
    useEffect(() => { getBalancerActual(); }, []);
    useEffect(() => { getAllStacks(); }, []);
    useEffect(() => { traerRangoFechas(); }, [data1, data2]);
    useEffect(() => { obtenerListadoPrograms(); }, []);
    useEffect(() => {
        setTimeout(function() {
            obtenerListadoTurnos();
        }, 1000);
    }, []);

    // Cargar proyecciones existentes al montar el componente
    const obtenerProyeccionesGuardadas = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/projections");
        const mapaProyecciones = {};
        response.data.forEach(item => {
          mapaProyecciones[`${item.userId}_${item.fechaClave}`] = item.valorProyeccion;
        });
        setValoresManuales(mapaProyecciones);
      } catch (error) {
        console.error("Error al cargar proyecciones guardadas:", error);
      }
    };

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
            {data2?.map((item) => (
                "Periodo de " + new Date(item.DiaPeriod).getDate() + " de " + validateMonts(new Date(item.DiaPeriod).getMonth()) + " de " + new Date(item.DiaPeriod).getFullYear() + " -- A --  " + sumaDias(item.DiaPeriod, item.Dia) + " de " + validateMonts(sumaMes(item.DiaPeriod, item.Dia)) + " de " + sumaAño(item.DiaPeriod, item.Dia)
            ))}
          </div>

          <div className="top">
            <div className="left"></div>
            <div className="right">
            {
              data2.map((it, index) => (
                createMont(it.Dia, index)
              ))
            }   
            </div>
          </div>

          <div className="containerDias">
            <ul className="ulDias">
            {
              data2.map((rules_Dia) => (
                createArray(rules_Dia.Dia)
              ))
            }   
              {
                  numDias2?.map((item, index) => (
                    <li className="liDias" key={index}>{item.dia}</li>
                  ))
              }
              <li className="liDias2">TOTAL</li>
            </ul>
          </div>

          {data?.map((group) => (
           <div className="rowDef" key={group._id}>
            <div className="sectionOne" key={group._id}>
             <img src={group.logo ? group.logo : Logodefault} alt={group.nombre} className="logoDef" />

             <div className="ul-listado" key={group.nombre}>
                {
                  data1?.map((payroll) => (
                    payroll.grupoID == group._id ? exist(payroll._id, payroll.grupo, group.nombre, payroll.nombres, payroll.apellidos) : null
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
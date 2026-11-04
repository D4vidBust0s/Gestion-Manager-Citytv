/* ESTILOS */
import './balancer.css';

/* DEPENDENCIAS */
import DatePicker from 'react-datepicker';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

/* HOOKS */
import { useBalancerData } from '../../Custom_Hooks/useBalancerData';

/* UTILIDADES */
import {
  validateMonts,
  sumaDias,
  sumaMes,
  sumaAño,
} from '../../utils/balancer';

/* IMAGENES */
import Logodefault from '../../assets/logos/audio.svg';
import Calendar from '../../assets/calendar.webp';

export default function ProjectionContent() {

    const [startDate, setStartDate] = useState(new Date());

    const {
        groups,
        payroll,
        rules,
        proyecciones,
        dias,
        encabezados,
        horasPorUsuarioDia,
        intensidadDefecto,
        setProyeccion,
    } = useBalancerData();

    // RENDERIZADO CON TOTALES INDEPENDIENTES, VALOR POR DEFECTO DE RULES Y CAMBIO DE COLOR CONDICIONAL
    const exist = (payrollId, payrollGrupo, payrollNombres, payrollApellidos) => {

        // 1. Horas de la Base de Datos por día (una sola búsqueda por celda)
        const horasPorDia = dias.map((item) => {
            const minutos = horasPorUsuarioDia.get(String(payrollId))?.get(item.iso) ?? 0;
            return minutos / 60;
        });

        // 2. Sumatoria exclusiva de la Base de Datos
        const totalBaseDatos = horasPorDia.reduce((total, horas) => total + horas, 0);

        // 3. Sumatoria exclusiva de la Fila Manual / Proyección (valor guardado o defecto de Rules)
        let totalManual = 0;
        const celdas = dias.map((item) => {
            const clave = `${payrollId}_${item.iso}`;
            const guardado = proyecciones[clave];

            // Si ya está guardado en el estado (BD), se muestra; de lo contrario toma el valor de Rules por defecto
            const valorManual = guardado !== undefined ? guardado : intensidadDefecto;
            const valorTotal = guardado !== undefined && guardado !== ""
                ? parseFloat(guardado)
                : intensidadDefecto;

            totalManual += isNaN(valorTotal) ? 0 : valorTotal;

            return {
                iso: item.iso,
                valor: valorManual,
                // CAMBIO VISUAL: Validamos si el valor actual es diferente al estándar de Rules
                esDiferenteAlDefecto: parseFloat(valorManual) !== parseFloat(intensidadDefecto),
            };
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
                  dias.map((item, index) => {
                    const horasDB = horasPorDia[index];
                    return (
                      <li className={horasDB != 0 ? "li-pr4" : "li-pr"} key={item.iso || index}>
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
                  celdas.map((celda, index) => (
                    <li className="li-pr" key={celda.iso || index} style={{ padding: 0 }}>
                      <input
                        type="text"
                        className="input-manual-interno"
                        placeholder="0"
                        value={celda.valor}
                        // Si es diferente al valor por defecto, cambia el color a negro (#000000) y resalta en negrita
                        style={{
                          color: celda.esDiferenteAlDefecto ? "#000000" : undefined,
                          fontWeight: celda.esDiferenteAlDefecto ? "bold" : undefined
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            setProyeccion(payrollId, celda.iso, val, payrollGrupo);
                          }
                        }}
                      />
                    </li>
                  ))
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

    return (
      <>
        <Toaster />
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
            {rules?.map((item) => (
                "Periodo de " + new Date(item.DiaPeriod).getDate() + " de " + validateMonts(new Date(item.DiaPeriod).getMonth()) + " de " + new Date(item.DiaPeriod).getFullYear() + " -- A --  " + sumaDias(item.DiaPeriod, item.Dia) + " de " + validateMonts(sumaMes(item.DiaPeriod, item.Dia)) + " de " + sumaAño(item.DiaPeriod, item.Dia)
            ))}
          </div>

          <div className="top">
            <div className="left"></div>
            <div className="right">
            {
              encabezados.map((grupo) => (
                <div key={grupo.key} className={grupo.parts.length > 1 ? 'right' : undefined}>
                  {
                    grupo.parts.map((parte, index) => (
                      <div
                        key={`${grupo.key}-${index}`}
                        style={{ padding: ".2rem", background: parte.background, marginRight: "1px", width: parte.width, height: " 1.8rem" }}
                      >
                        {parte.label}
                      </div>
                    ))
                  }
                </div>
              ))
            }
            </div>
          </div>

          <div className="containerDias">
            <ul className="ulDias">
              {
                  dias.map((item, index) => (
                    <li className="liDias" key={item.iso || index}>{item.dia}</li>
                  ))
              }
              <li className="liDias2">TOTAL</li>
            </ul>
          </div>

          {groups?.map((group) => (
           <div className="rowDef" key={group._id}>
            <div className="sectionOne" key={group._id}>
             <img src={group.logo ? group.logo : Logodefault} alt={group.nombre} className="logoDef" />

             <div className="ul-listado" key={group.nombre}>
                {
                  payroll?.map((persona) => (
                    persona.grupoID == group._id ? exist(persona._id, persona.grupo, persona.nombres, persona.apellidos) : null
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

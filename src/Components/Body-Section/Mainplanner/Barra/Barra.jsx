/* ESTILOS */
import './Barra.css'

/* IMAGENES */
import tropa from '../../../../assets/tropa.png';
import flecha from '../../../../assets/arrow.svg'

/* DEPENDENCIAS */
import {useState} from 'react'
import { createPortal } from 'react-dom';

/* COMPONENTES MODALES*/
import ModalPlanner1 from "../../../Modals/ModalPlanner1";

export default function Barra() {
  
  /* estado para la ventana modal1 */
 const [modal1, setModal1] = useState(false); 


  return (
    <>
    {createPortal(<ModalPlanner1 estado={modal1} cambiarEstado={setModal1}/>,document.querySelector('#portal'))}
      
      <div className="barra">
        <img src={tropa} alt="tropa" className="imgTropa"/>
        <div className="content-listado">
          <ul className="ulMain">
            <li className="liMain" onClick={() => setModal1(!modal1)}>
              Anna Brenda Contreras
            </li>
            <li className="liMain">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>

          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain">Anna Brenda Contreras</li>
            <li className="liMain">David Alexander Bustos</li>
            <li className="liMain-var1">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>

          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain-var2">Anna Brenda Contreras</li>
            <li className="liMain">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>
          
          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain">Anna Brenda Contreras</li>
            <li className="liMain-var3">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>

          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain">Anna Brenda Contreras</li>
            <li className="liMain-var3">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>

          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain">Anna Brenda Contreras</li>
            <li className="liMain-var3">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>

          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain">Anna Brenda Contreras</li>
            <li className="liMain-var3">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>

          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain">Anna Brenda Contreras</li>
            <li className="liMain-var3">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>

          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain">Anna Brenda Contreras</li>
            <li className="liMain-var3">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>

          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain">Anna Brenda Contreras</li>
            <li className="liMain-var3">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>

          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain">Anna Brenda Contreras</li>
            <li className="liMain-var3">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>

          <div className="separador"></div>

          <ul className="ulMain">
            <li className="liMain">Anna Brenda Contreras</li>
            <li className="liMain-var3">David Alexander Bustos</li>
            <li className="liMain">Carlos Arturo Vega</li>
            <li className="liMain">Miguel Alejandro Sanabria</li>
            <li className="liMain">Yenny Alejandra Rodriguez</li>
          </ul>



        </div>
      </div>
    </>
  );
}

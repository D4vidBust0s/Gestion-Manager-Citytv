/* ESTILOS */
import  './ModalBase1.css'

/* DEPENDENCIAS */
import propTypes from 'prop-types'

/* IMAGENES */
import CameraManSingle from '../../../assets/Cameraman-single.png'


// eslint-disable-next-line react/prop-types
export default function ModalBase1({estado,cambiarEstado,title,content}) {
   

  return (
    <>
      {estado && (
        <div
          className="containerModalBase1"
        >
          <div className="marco">
            <div className="close" onClick={() => cambiarEstado(!estado)}>X</div>
            <div className="contentCabezal">
              <div className="contentimg">
                <img src={CameraManSingle} alt="Cameraman" />
              </div>
              <div className="titleCabezal">{title}</div>
            </div>
            <div className="contentModal1">
                {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

ModalBase1.propTypes={
    estado: propTypes.bool,
    
}

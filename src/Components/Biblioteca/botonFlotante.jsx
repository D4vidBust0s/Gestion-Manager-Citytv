/* Estilos */
import './botonFlotante.css'

/* Imagenes */
import flecha from '../../assets/arrow.svg'

const botonFlotante = ({actual,cambio}) => {
  return (
    <>
      <div className="floatBtn" onClick={() => cambio(!actual)}>
          <div className="numFull">
            <span>
              24
            </span>
          </div>
          <img src={flecha} alt="flecha" />
        </div>

    </>
  )
}

export default botonFlotante

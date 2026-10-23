/* Estilos */
import './botonFlotante.css';

/* Imagenes */
import flecha from '../../assets/arrow.svg';

// eslint-disable-next-line react/prop-types
const BotonFlotante = ({ actual, cambio, totalNovelties }) => {
  const tienePendientes = totalNovelties > 0;

  return (
    <>
      <div 
        className={`floatBtn ${tienePendientes ? 'pulse-alert' : ''}`} 
        onClick={() => cambio(!actual)}
      >
        {tienePendientes && (
          <div className="numFull">
            <span>
              {totalNovelties}
            </span>
          </div>
        )}
        <img src={flecha} alt="flecha" />
      </div>
    </>
  );
};

export default BotonFlotante;
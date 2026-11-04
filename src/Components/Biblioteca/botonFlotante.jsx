/* Estilos */
import './botonFlotante.css';

/* Imagenes */
import flecha from '../../assets/arrow.svg';

// eslint-disable-next-line react/prop-types
const BotonFlotante = ({ actual, onToggle, totalNovelties }) => {
  const tienePendientes = totalNovelties > 0;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <>
      <div
        className={`floatBtn ${tienePendientes ? 'pulse-alert' : ''}`}
        role="button"
        tabIndex={0}
        aria-expanded={actual}
        aria-controls="menu-aux-planner"
        aria-label={actual ? 'Ocultar cintillo de grupos' : 'Mostrar cintillo de grupos'}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
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

//** ESTILOS **/
import  './BaseOperations2.css'

/* DEPENDENCIAS */
import propTypes from 'prop-types'

/* IMAGENES */


/* COMPONENTS */


export default function BaseOperations2({titulo,content}) {

       
  return (
    <div className='containerBase'>
      <div className="title">{titulo}</div>
      <div className="poster">
        
      </div>
      <div className="content">
        {content}
      </div>
    </div>
  )
}

BaseOperations2.propTypes={
    titulo: propTypes.string,
    content: propTypes.element
}
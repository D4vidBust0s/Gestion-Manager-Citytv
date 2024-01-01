/** ESTILOS **/
import  './BaseOperations1.css'

/* DEPENDENCIAS */
import propTypes from 'prop-types'

/* IMAGENES */
import Logo from '../../../assets/Logo-Dashboard.png'

/* COMPONENTS */


export default function BaseOperations1({titulo,urlposter,content}) {

       
  return (
    <div className='containerBase'>
      <div className="title">{titulo}</div>
      <div className="poster">
        <img src={urlposter} alt="poster" className='img-poster' />
        <div className="aux">
          <img src={Logo} alt="logo"className='logo' />
        </div>
      </div>
      <div className="content">
        {content}
      </div>
    </div>
  )
}

BaseOperations1.propTypes={
    titulo: propTypes.string,
    urlposter: propTypes.string,
    content: propTypes.element
}

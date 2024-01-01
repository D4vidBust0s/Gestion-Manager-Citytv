import {useState,useEffect} from 'react'

import avatar from '../../../assets/Ana-Brenda.jpg'
import menu from '../../../assets/menu.svg'
import "./Top.css";


function Top() {
 
  /* Estados de hora y fecha*/
  const [clockState,setClockState] = useState();
  const [dateState,setDateState]=useState();
 

  useEffect(() =>{
    setInterval(()=>{
      const date = new Date();
      setClockState(date.toLocaleTimeString('en-US', {
        hour12: false,
      }));

      const fecha =  Date.now();
      const hoy = new Date(fecha);
      setDateState(hoy.toDateString());


    },1000)
  },[]);

  return (
    <div className="container">
      <div className="content-avatar">
        <img src={avatar} alt="Avatar" className="avatar" />
      </div>
      <span className="content-menu">
        <img src={menu} alt="menu" className="menu" />
      </span>
      <span className="fecha">
        {dateState}
        <br />
        <h5>{clockState}</h5>
      </span>
      <h3 className="nombre">
        Anna Brenda Contreras
        <br />
        <span className='roll'>Actríz y cantante</span>
      </h3>
    </div>
  );
}

export default Top

/* IMPORTACION DE ESTILOS*/
import './timeline.css'

/* importacion de imagenes */
import cursor from '../../../../assets/cursor.svg'

/* Importacion de dependencias */
import propTypes from 'prop-types';
import {useState,useEffect} from 'react';

export default function Timeline() {

  const [desplazamiento, setDesplazamiento] = useState('-25px');
  

  useEffect(() =>{
    setInterval(()=>{
      const date = new Date();
      let horas;
      let minutos;
      let suma;
      let horaAux;

      horas = (date.getHours()*60*2);
      horaAux = (date.getHours());
      minutos = (date.getMinutes()*2);
      suma = horas + minutos-480-25;    /* 480 son los pixeles por 4 horas por el doble de pixeles - y -25 son los pixeles que se restan para que el puntero este en posicion */
      

      if(horas == 0)
      {
        suma = 2373 + minutos;
        setDesplazamiento(suma+"px");
      }

      else if(horaAux == 1){
        suma = 2493 + minutos;
        setDesplazamiento(suma+"px");
      }

      else if(horaAux == 2){
        suma = 2613 + minutos;
        setDesplazamiento(suma+"px");
      }

      else if(horaAux == 3){
        suma = 2733 + minutos;
        setDesplazamiento(suma+"px");
      }

      else{
        setDesplazamiento(suma+"px");
      }

      if(horas == 4)
      {
        suma = -25 + minutos;
        setDesplazamiento(suma+"px");
      }
     
      
      /*console.log(suma+"px")*/
      
    },1000)
  },[]);


  return (
    <div className="lineTime">
      <div className="cursor" style={{ left: desplazamiento }}>
        <img src={cursor} alt="cursor" className='img-cursor'/>
        <div className="line"></div>
      </div>
          <div className="lineTime__box">
            <p className="box__item">04:00</p>
            <p className="box__item">04:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">04:30</p>
            <p className="box__item">05:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">05:00</p>
            <p className="box__item">05:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">05:30</p>
            <p className="box__item">06:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">06:00</p>
            <p className="box__item">06:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">06:30</p>
            <p className="box__item">07:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">07:00</p>
            <p className="box__item">07:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">07:30</p>
            <p className="box__item">08:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">08:00</p>
            <p className="box__item">08:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">08:30</p>
            <p className="box__item">09:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">09:00</p>
            <p className="box__item">09:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">09:30</p>
            <p className="box__item">10:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">10:00</p>
            <p className="box__item">10:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">10:30</p>
            <p className="box__item">11:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">11:00</p>
            <p className="box__item">11:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">11:30</p>
            <p className="box__item">12:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">12:00</p>
            <p className="box__item">12:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">12:30</p>
            <p className="box__item">13:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">13:00</p>
            <p className="box__item">13:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">13:30</p>
            <p className="box__item">14:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">14:00</p>
            <p className="box__item">14:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">14:30</p>
            <p className="box__item">15:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">15:00</p>
            <p className="box__item">15:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">15:30</p>
            <p className="box__item">16:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">16:00</p>
            <p className="box__item">16:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">16:30</p>
            <p className="box__item">17:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">17:00</p>
            <p className="box__item">17:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">17:30</p>
            <p className="box__item">18:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">18:00</p>
            <p className="box__item">18:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">18:30</p>
            <p className="box__item">19:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">19:00</p>
            <p className="box__item">19:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">19:30</p>
            <p className="box__item">20:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">20:00</p>
            <p className="box__item">20:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">20:30</p>
            <p className="box__item">21:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">21:00</p>
            <p className="box__item">21:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">21:30</p>
            <p className="box__item">22:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">22:00</p>
            <p className="box__item">22:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">22:30</p>
            <p className="box__item">23:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">23:00</p>
            <p className="box__item">23:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">23:30</p>
            <p className="box__item">00:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">00:00</p>
            <p className="box__item">00:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">00:30</p>
            <p className="box__item">01:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">01:00</p>
            <p className="box__item">01:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">01:30</p>
            <p className="box__item">02:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">02:00</p>
            <p className="box__item">02:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">02:30</p>
            <p className="box__item">03:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">03:00</p>
            <p className="box__item">03:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">03:30</p>
            <p className="box__item">04:00</p>
          </div>
    </div>
  )
}

Timeline.propTypes={
  desp: propTypes.string,
}

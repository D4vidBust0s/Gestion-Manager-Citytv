/* IMPORTACION DE ESTILOS*/
import './timeline.css'

/* importacion de imagenes */
import cursor from '../../../../assets/cursor.svg'

/* Importacion de dependencias */
import propTypes from 'prop-types';
import {useState,useEffect} from 'react';

export default function Timeline() {

  const [desplazamiento, setDesplazamiento] = useState();
  

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
      suma = horas + minutos-25;    /*  -25 son los pixeles que se restan para que el puntero este en posicion correcta*/
      

      if(horas == 0)
      {
        suma = 0 + minutos -25;
        setDesplazamiento(suma+"px");
      }

      /*
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
      */

      else{
        setDesplazamiento(suma+"px");
      }

      /*
      if(horas == 4)
      {
        suma = -25 + minutos;
        setDesplazamiento(suma+"px");
      }
     */
      
      /*console.log(horas)*/
      
    },1000)
  },[]);


  return (
    <div className="lineTime">
      <div className="vertical1"></div>
      <div className="vertical2"></div>
      <div className="vertical3"></div>
      <div className="vertical4"></div>
      <div className="vertical5"></div>
      <div className="vertical6"></div>
      <div className="vertical7"></div>
      <div className="vertical8"></div>
      <div className="vertical9"></div>
      <div className="vertical10"></div>
      <div className="vertical11"></div>
      <div className="vertical12"></div>
      <div className="vertical13"></div>
      <div className="vertical14"></div>
      <div className="vertical15"></div>
      <div className="vertical16"></div>
      <div className="vertical17"></div>
      <div className="vertical18"></div>
      <div className="vertical19"></div>
      <div className="vertical20"></div>
      <div className="vertical21"></div>
      <div className="vertical22"></div>
      <div className="vertical23"></div>
      <div className="vertical24"></div>
      <div className="vertical25"></div>
      <div className="vertical26"></div>
      <div className="vertical27"></div>
      <div className="vertical28"></div>
      <div className="vertical29"></div>
      <div className="vertical30"></div>
      <div className="vertical31"></div>
      <div className="vertical32"></div>
      <div className="vertical33"></div>
      <div className="vertical34"></div>
      <div className="vertical35"></div>
      <div className="vertical36"></div>
      <div className="vertical37"></div>
      <div className="vertical38"></div>
      <div className="vertical39"></div>
      <div className="vertical40"></div>
      <div className="vertical41"></div>
      <div className="vertical42"></div>
      <div className="vertical43"></div>
      <div className="vertical44"></div>
      <div className="vertical45"></div>
      <div className="vertical46"></div>
      <div className="vertical47"></div>
     
      

      

      <div className="cursor" style={{ left: desplazamiento }}>
        <img src={cursor} alt="cursor" className='img-cursor'/>
        <div className="line"></div>
      </div>
          <div className="lineTime__box">
            <p className="box__item">00:00</p>
            <p className="box__item_2">00:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">00:30</p>
            <p className="box__item">01:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">01:00</p>
            <p className="box__item_2">01:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">01:30</p>
            <p className="box__item">02:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">02:00</p>
            <p className="box__item_2">02:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">02:30</p>
            <p className="box__item">03:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">03:00</p>
            <p className="box__item_2">03:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">03:30</p>
            <p className="box__item">04:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">04:00</p>
            <p className="box__item_2">04:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">04:30</p>
            <p className="box__item">05:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">05:00</p>
            <p className="box__item_2">05:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">05:30</p>
            <p className="box__item">06:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">06:00</p>
            <p className="box__item_2">06:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">06:30</p>
            <p className="box__item">07:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">07:00</p>
            <p className="box__item_2">07:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">07:30</p>
            <p className="box__item">08:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">08:00</p>
            <p className="box__item_2">08:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">08:30</p>
            <p className="box__item">09:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">09:00</p>
            <p className="box__item_2">09:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">09:30</p>
            <p className="box__item">10:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">10:00</p>
            <p className="box__item_2">10:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">10:30</p>
            <p className="box__item">11:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">11:00</p>
            <p className="box__item_2">11:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">11:30</p>
            <p className="box__item">12:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">12:00</p>
            <p className="box__item_2">12:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">12:30</p>
            <p className="box__item">13:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">13:00</p>
            <p className="box__item_2">13:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">13:30</p>
            <p className="box__item">14:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">14:00</p>
            <p className="box__item_2">14:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">14:30</p>
            <p className="box__item">15:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">15:00</p>
            <p className="box__item_2">15:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">15:30</p>
            <p className="box__item">16:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">16:00</p>
            <p className="box__item_2">16:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">16:30</p>
            <p className="box__item">17:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">17:00</p>
            <p className="box__item_2">17:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">17:30</p>
            <p className="box__item">18:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">18:00</p>
            <p className="box__item_2">18:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">18:30</p>
            <p className="box__item">19:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">19:00</p>
            <p className="box__item_2">19:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">19:30</p>
            <p className="box__item">20:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">20:00</p>
            <p className="box__item_2">20:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">20:30</p>
            <p className="box__item">21:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">21:00</p>
            <p className="box__item_2">21:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">21:30</p>
            <p className="box__item">22:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">22:00</p>
            <p className="box__item_2">22:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">22:30</p>
            <p className="box__item">23:00</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item">23:00</p>
            <p className="box__item_2">23:30</p>
          </div>
          <div className="lineTime__box">
            <p className="box__item_2">23:30</p>
            <p className="box__item">00:00</p>
          </div>
    </div>
  )
}

Timeline.propTypes={
  desp: propTypes.string,
}

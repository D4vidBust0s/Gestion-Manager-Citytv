/* IMPORTACION DE ESTILOS*/
import './timeline.css';

/* importacion de imagenes */
import cursor from '../../../../assets/cursor.svg';

/* Importacion de dependencias */
import propTypes from 'prop-types';
import { useState, useEffect } from 'react';

export default function Timeline() {
  const [desplazamiento, setDesplazamiento] = useState("0px");

  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      const horas = date.getHours() * 60 * 2;
      const minutos = date.getMinutes() * 2;
      let suma = horas + minutos - 25; /* -25px de ajuste para centrar el cursor */

      if (horas === 0) {
        suma = 0 + minutos - 25;
      }

      setDesplazamiento(`${suma}px`);
    }, 1000);

    return () => clearInterval(timer); // Fuga de memoria corregida
  }, []);

  return (
    <div className="lineTime">
      {Array.from({ length: 47 }).map((_, index) => (
        <div key={index} className={`vertical${index + 1}`}></div>
      ))}

      <div className="cursor" style={{ left: desplazamiento }}>
        <img src={cursor} alt="cursor" className='img-cursor' />
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
  );
}

Timeline.propTypes = {
  desp: propTypes.string,
};
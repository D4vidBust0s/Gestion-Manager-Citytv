/* ESTILOS */
import '../Permissions/PermissionsContent.css';

/* DEPENDENCIAS */
import DatePicker from 'react-datepicker';
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";

/* IMAGENES */
import Avatar from '../../assets/avatar.webp';
import calendar from '../../assets/Calendar-withe.svg';
import Plus from '../../assets/Plus.svg';
import Edit from '../../assets/pencil.svg';
import Delete from '../../assets/trash.svg';
import Brush from '../../assets/brush.svg';

//---------------------------------------------------------------------------------------------------

export default function CvContent() {

  /* ESTADOS */
  const [data, setData] = useState([]);                 // Almacena el listado de grupos
  const [data1, setData1] = useState([]);               // Almacena el personal del grupo seleccionado
  const [data2, setData2] = useState([]);               // Almacena el historial / eventos de la hoja de vida
  const [startDate, setStartDate] = useState(new Date()); // Fecha / Año seleccionado para filtros
  const [starIn, setStarIn] = useState(new Date());     // Fecha de inicio o fecha del evento
  const [starOut, setStarOut] = useState(new Date());   // Fecha fin (si aplica rango)
  const [nameUser, setNameUser] = useState("-----------------------"); // Nombre del empleado seleccionado
  const [avatarUser] = useState(Avatar);                // Imagen de avatar por defecto
  const [idUser, setIdUser] = useState(null);           // ID del empleado seleccionado
  const [idRegistro, setIdRegistro] = useState(null);   // ID del registro seleccionado para editar/eliminar

  /* REFERENCIAS */
  const starInRef = useRef();
  const starOutRef = useRef();
  const namePermissionRef = useRef(); // Usado para el Título / Tipo de Novedad (ej. Llegada tarde, Sanción, Reconocimiento)
  const fechaInicialRef = useRef();
  const fechaFinalRef = useRef();
  const observacionesRef = useRef();  // Usado para detalles o descripción de la novedad
  const groupsRef = useRef();

  // -------------------------------------------------------------------------------------------------
  // FUNCIONES DE CONTROL Y API
  // -------------------------------------------------------------------------------------------------

  const groupChange = () => {
    getPeopleOfGroup();
    setNameUser("-----------------------");
    limpiar();
  };

  // Obtiene el listado de grupos de la API
  const obtenerListadoGroups = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/groups");
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener los grupos:", error);
      toast.error("Error al cargar los grupos");
    }
  };

  // Obtiene el personal del grupo seleccionado
  const getPeopleOfGroup = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/payroll/people/" + groupsRef.current.value);
      setData1(response.data);
    } catch (error) {
      console.error("Error al obtener el personal:", error);
      toast.error("Error al cargar el personal");
    }
  };

  // Trae el historial de CV / Novedades del trabajador filtrado por año
  const traerCvTrabajador = async (currentIdUser, currentYear) => {
    const targetUserId = currentIdUser || idUser;
    const targetYear = currentYear || startDate;
    if (!targetUserId) return;

    try {
      const response = await axios.get("http://localhost:3000/api/cv/" + targetUserId, {
        params: { año: targetYear?.getFullYear() }
      });
      setData2(response.data);
    } catch (error) {
      console.error("Error al obtener el historial del trabajador:", error);
    }
  };

  const clickUser = (id, nombre, apellido) => {
    setNameUser(nombre + " " + apellido);
    setIdUser(id);
    traerCvTrabajador(id, startDate);

    if (namePermissionRef.current) namePermissionRef.current.value = "";
    setStarIn(new Date());
    setStarOut(new Date());
    if (observacionesRef.current) observacionesRef.current.value = "";
    setIdRegistro(null);
    setData2([]);
  };

  const limpiar = () => {
    if (namePermissionRef.current) {
      namePermissionRef.current.value = "";
      namePermissionRef.current.focus();
    }
    setStarIn(new Date());
    setStarOut(new Date());
    if (observacionesRef.current) observacionesRef.current.value = "";
    setIdRegistro(null);
    setData2([]);
  };

  const agregar = async () => {
    if (nameUser === "-----------------------") {
      toast.error("Para registrar una novedad en el CV, primero seleccione un trabajador de la lista");
    } else if (!namePermissionRef.current || namePermissionRef.current.value === "") {
      if (namePermissionRef.current) namePermissionRef.current.focus();
      toast.error("Debe especificar el título de la novedad (Ej: Llegada tarde, Sanción, Reconocimiento)");
    } else if (!observacionesRef.current || observacionesRef.current.value === "") {
      if (observacionesRef.current) observacionesRef.current.focus();
      toast.error("Debe especificar una observación o detalle de la novedad");
    } else {
      try {
        await axios.post("http://localhost:3000/api/cv/", {
          nombre: namePermissionRef.current.value,
          año: starIn.getFullYear().toString(),
          fechainicio: starIn,
          fechafinal: starOut,
          observacion: observacionesRef.current.value,
          estado: true,
          nombreempleado: nameUser,
          idempleado: idUser,
        });

        if (namePermissionRef.current) namePermissionRef.current.value = "";
        setStarIn(new Date());
        setStarOut(new Date());
        if (observacionesRef.current) observacionesRef.current.value = "";
        traerCvTrabajador();

        toast.success("Novedad agregada correctamente");
      } catch (error) {
        console.error("Error al agregar registro de CV:", error);
        toast.error("Error al registrar la novedad");
      }
    }
  };

  const eliminar = () => {
    if (idRegistro) {
      Swal.fire({
        title: "¿Realmente desea eliminar este registro del historial para " + nameUser + "?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "No",
        denyButtonText: `Confirmar`,
        footer: '<h6>Gestión Manager Citytv</h6>',
      }).then((result) => {
        if (result.isDenied) {
          EliminarCv();
        }
      });
    } else {
      toast.error("No se ha seleccionado un registro para eliminar");
    }
  };

  const EliminarCv = async () => {
    try {
      await axios.delete("http://localhost:3000/api/cv/" + idRegistro);
      
      traerCvTrabajador();
      
      if (namePermissionRef.current) namePermissionRef.current.value = "";
      setStarIn(new Date());
      setStarOut(new Date());
      if (observacionesRef.current) observacionesRef.current.value = "";
      setIdRegistro(null);

      toast.success("Registro eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar registro de CV:", error);
      toast.error("Error al eliminar el registro");
    }
  };

  const llenarFormulario = (titulo, fechaIn, fechaOut, observacion, idReg) => {
    if (namePermissionRef.current) namePermissionRef.current.value = titulo;
    setStarIn(new Date(fechaIn));
    setStarOut(new Date(fechaOut));
    if (observacionesRef.current) observacionesRef.current.value = observacion;
    setIdRegistro(idReg);
  };

  const traer2 = (newDate) => {
    setStarIn(new Date());
    setStarOut(new Date());
    if (observacionesRef.current) observacionesRef.current.value = "";
    traerCvTrabajador(idUser, newDate);

    if (namePermissionRef.current) namePermissionRef.current.value = "";
    setIdRegistro(null);
  };

  const editar = async () => {
    if (nameUser === "-----------------------") {
      toast.error("Para actualizar la información, primero seleccione un trabajador de la lista");
    } else if (!idRegistro) {
      toast.error("Seleccione un registro del historial para editar");
    } else if (!namePermissionRef.current || namePermissionRef.current.value === "") {
      if (namePermissionRef.current) namePermissionRef.current.focus();
      toast.error("El título de la novedad no puede estar vacío");
    } else if (!observacionesRef.current || observacionesRef.current.value === "") {
      if (observacionesRef.current) observacionesRef.current.focus();
      toast.error("Debe especificar las observaciones de la novedad");
    } else {
      try {
        await axios.put("http://localhost:3000/api/cv/" + idRegistro, {
          nombre: namePermissionRef.current.value,
          año: starIn.getFullYear().toString(),
          fechainicio: starIn,
          fechafinal: starOut,
          observacion: observacionesRef.current.value,
          estado: true,
          nombreempleado: nameUser,
          id_empleado: idUser,
        });

        traerCvTrabajador();
        toast.success("Registro actualizado correctamente");
      } catch (error) {
        console.error("Error al actualizar registro de CV:", error);
        toast.error("Error al actualizar el registro");
      }
    }
  };

  /* EFECTOS */
  useEffect(() => {
    obtenerListadoGroups();
  }, []);

  return (
    <div className="contentRotations">
      <Toaster />
      
      {/* Selector de Grupos */}
      <div className="subTitulo">
        Grupos
        <select className="inputDir" onChange={() => groupChange()} ref={groupsRef}>
          <option key={0} value={"none"}>{"-----------------------------------"}</option>
          {
            data?.map((group) => (
              <option key={group._id} value={group._id}>{group.nombre}</option>
            ))
          }
        </select>
      </div>

      {/* Sección principal del empleado y su historial */}
      <div className="sectionDaily">
        <img src={avatarUser} alt="CV" className="imgAvatar"/>
        <h2 className="seleccionadoDaily">{nameUser}</h2>

        {/* Listado de personal perteneciente al grupo */}
        <div className="mainCajas">
          <div className="subTitulo">Personal del grupo</div>
          <div className="caja1">
            {
              data1?.map((nombres) => (
                <p className="item" key={nombres._id} onClick={() => clickUser(nombres._id, nombres.nombres, nombres.apellidos)}>
                  {nombres.nombres} {nombres.apellidos}
                </p>
              ))
            }
          </div>
        </div>

        {/* Listado del Historial / Novedades del año seleccionado */}
        <div className="mainCajas">
          <div className="subTitulo">Historial de CV / Novedades - Año {startDate.getFullYear()}</div>
          <div className="yearSelect">
            <DatePicker 
              className='picker'
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                traer2(date);
              }}
              showYearPicker
              dateFormat="yyyy"
              ref={fechaInicialRef}
            />
          </div>
          <div className="cajaPermissions">
            <ul>
              {
                data2?.map((item) => (
                  <li 
                    className='itemHover' 
                    key={item._id} 
                    onClick={() => llenarFormulario(item.Nombre, item.FechaInicio, item.FechaFinal, item.Observacion, item._id)}
                  >
                    - {item.Nombre} ({new Date(item.FechaInicio).toLocaleDateString()})
                  </li>
                ))
              }
            </ul>    
          </div>
        </div>
      </div>

      {/* Calendario flotante lateral */}
      <div className="mainFloat">
        <div className="caja">
          <div className="contentCalendar">
            <DatePicker
              selected={starIn}
              onChange={(date) => setStartDate(date)}
              inline
              showWeekNumbers
              showMonthDropdown
              startDate={starIn}
              endDate={starOut}
              ref={fechaFinalRef}
            />
          </div>
        </div>
      </div>

      {/* Formulario de detalles para registrar Falencias, Sanciones o Reconocimientos */}
      <div className="sectionDetails">
        <div className="mainCajas2">
          <div className="caja1">
            <h5 className='titleDetail'>Tipo de Novedad / Sanción / Reconocimiento</h5>
            <input type="text" className='inputname' placeholder="Ej: Llegada tarde / Reconocimiento / Observación" ref={namePermissionRef}/>
            <h5 className='titleCaducidad'>Fechas del Evento</h5>

            <div className="contentControls">
              <img src={calendar} alt="In" className='imgCalendar'/>
              <DatePicker
                className='inputIn'
                selected={starIn}
                onChange={(date) => setStarIn(date)}
                showYearDropdown
                dateFormatCalendar="MMMM"
                yearDropdownItemNumber={50}
                scrollableYearDropdown
                ref={starInRef}
              />

              <img src={calendar} alt="Out" className='imgCalendar'/>
              <DatePicker
                className='inputOut'
                selected={starOut}
                onChange={(date) => setStarOut(date)}
                showYearDropdown
                dateFormatCalendar="MMMM"
                yearDropdownItemNumber={50}
                scrollableYearDropdown
                ref={starOutRef}
              />
            </div>
            
            <h5 className='titleCaducidad'>Observaciones o detalles del suceso</h5>
            <textarea className='inputObservaciones' placeholder="Describa el motivo, llamados de atención o felicitación..." ref={observacionesRef}/>
          </div>

          {/* Botonera de acciones (Limpiar, Agregar, Editar, Eliminar) */}
          <div className="cajaControls">
            <div className="seccionButons">
              <div className="containerSingleButtom">
                <img src={Brush} alt="brush" className='img-butons' onClick={limpiar} />
              </div>
              <div className="containerSingleButtom">
                <img src={Plus} alt="plus" className='img-butons' onClick={agregar}/>
              </div>
              <div className="containerSingleButtom">
                <img src={Edit} alt="edit" className='img-butons' onClick={editar}/>
              </div>
              <div className="containerDeleteButtom2">
                <img src={Delete} alt="delete" className='img-butons' onClick={eliminar}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
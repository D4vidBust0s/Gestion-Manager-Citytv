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

export default function RecesContent() {

  /* ESTADOS */
  const [data, setData] = useState([]);                 // Almacena el listado de grupos
  const [data1, setData1] = useState([]);               // Almacena el personal del grupo seleccionado
  const [data2, setData2] = useState([]);               // Almacena los periodos de vacaciones del trabajador
  const [startDate, setStartDate] = useState(new Date()); // Fecha / Año seleccionado para filtros
  const [starIn, setStarIn] = useState(new Date());     // Fecha de inicio de las vacaciones
  const [starOut, setStarOut] = useState(new Date());   // Fecha de finalización de las vacaciones
  const [nameUser, setNameUser] = useState("-----------------------"); // Nombre del empleado seleccionado
  const [avatarUser] = useState(Avatar);                // Imagen de avatar por defecto
  const [idUser, setIdUser] = useState(null);           // ID del empleado seleccionado
  const [idRegistro, setIdRegistro] = useState(null);   // ID del registro de vacaciones seleccionado para editar/eliminar

  /* REFERENCIAS */
  const starInRef = useRef();
  const starOutRef = useRef();
  const namePermissionRef = useRef();
  const fechaInicialRef = useRef();
  const fechaFinalRef = useRef();
  const observacionesRef = useRef();
  const groupsRef = useRef();

  // -------------------------------------------------------------------------------------------------
  // FUNCIONES DE CONTROL Y API
  // -------------------------------------------------------------------------------------------------

  /**
   * Maneja el cambio de grupo en el select principal.
   * Actualiza el personal y limpia los campos y selecciones previas.
   */
  const groupChange = () => {
    getPeopleOfGroup();
    setNameUser("-----------------------");
    limpiar();
  };

  /**
   * Obtiene de la API el listado general de grupos de la empresa.
   */
  const obtenerListadoGroups = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/groups");
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener los grupos:", error);
      toast.error("Error al cargar los grupos");
    }
  };

  /**
   * Obtiene de la API el personal que pertenece al grupo seleccionado.
   */
  const getPeopleOfGroup = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/payroll/people/" + groupsRef.current.value);
      setData1(response.data);
    } catch (error) {
      console.error("Error al obtener el personal del grupo:", error);
      toast.error("Error al cargar el personal");
    }
  };

  /**
   * Trae los periodos de vacaciones registrados para un trabajador específico filtrados por año.
   * @param {string} currentIdUser - ID del empleado
   * @param {Date} currentYear - Objeto fecha del cual se extrae el año
   */
  const traerVacacionesTrabajador = async (currentIdUser, currentYear) => {
    const targetUserId = currentIdUser || idUser;
    const targetYear = currentYear || startDate;

    if (!targetUserId) return;

    try {
      const response = await axios.get("http://localhost:3000/api/recess/" + targetUserId, {
        params: {
          año: targetYear?.getFullYear(),
        }
      });
      setData2(response.data);
    } catch (error) {
      console.error("Error al obtener los recesos del trabajador:", error);
    }
  };

  /**
   * Selecciona un empleado de la lista y carga sus vacaciones correspondientes.
   */
  const clickUser = (id, nombre, apellido) => {
    setNameUser(nombre + " " + apellido);
    setIdUser(id);
    traerVacacionesTrabajador(id, startDate);

    // Limpiamos los campos del formulario
    if (namePermissionRef.current) namePermissionRef.current.value = "";
    setStarIn(new Date());
    setStarOut(new Date());
    if (observacionesRef.current) observacionesRef.current.value = "";
    setIdRegistro(null);
    setData2([]);
  };

  /**
   * Limpia los campos del formulario de entrada de datos.
   */
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

  /**
   * Agrega un nuevo registro de vacaciones mediante una petición POST a la API.
   */
  const agregar = async () => {
    // Validaciones de campos obligatorios
    if (nameUser === "-----------------------") {
      toast.error("Para agregar un registro de vacaciones al trabajador, primero selecciónelo de la lista");
    } else if (!namePermissionRef.current || namePermissionRef.current.value === "") {
      if (namePermissionRef.current) namePermissionRef.current.focus();
      toast.error("Debe especificar un nombre que describa el periodo de vacaciones que toma el trabajador");
    } else if (!observacionesRef.current || observacionesRef.current.value === "") {
      if (observacionesRef.current) observacionesRef.current.focus();
      toast.error("Debe especificar una observación o descripción del periodo de vacaciones");
    } else {
      try {
        await axios.post("http://localhost:3000/api/recess/", {
          nombre: namePermissionRef.current.value,
          año: starIn.getFullYear().toString(),
          fechainicio: starIn,
          fechafinal: starOut,
          observacion: observacionesRef.current.value,
          estado: true,
          nombreempleado: nameUser,
          idempleado: idUser,
        });

        // Limpieza tras éxito
        if (namePermissionRef.current) namePermissionRef.current.value = "";
        setStarIn(new Date());
        setStarOut(new Date());
        if (observacionesRef.current) observacionesRef.current.value = "";
        traerVacacionesTrabajador();

        toast.success("Registro agregado correctamente");
      } catch (error) {
        console.error("Error al agregar vacaciones:", error);
        toast.error("Error al registrar el periodo de vacaciones");
      }
    }
  };

  /**
   * Muestra una alerta de confirmación (SweetAlert2) para eliminar un periodo de vacaciones.
   */
  const eliminar = () => {
    if (idRegistro) {
      Swal.fire({
        title: "¿Realmente desea eliminar el registro de vacaciones para " + nameUser + "?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "No",
        denyButtonText: `Confirmar`,
        footer: '<h6>Gestión Manager Citytv</h6>',
      }).then((result) => {
        if (result.isDenied) {
          EliminarReceso();
        }
      });
    } else {
      toast.error("No se ha seleccionado un registro para eliminar");
    }
  };

  /**
   * Ejecuta la petición DELETE para eliminar el periodo de vacaciones seleccionado.
   */
  const EliminarReceso = async () => {
    try {
      await axios.delete("http://localhost:3000/api/recess/" + idRegistro);
      
      traerVacacionesTrabajador();
      
      // Limpieza de campos tras eliminar
      if (namePermissionRef.current) namePermissionRef.current.value = "";
      setStarIn(new Date());
      setStarOut(new Date());
      if (observacionesRef.current) observacionesRef.current.value = "";
      setIdRegistro(null);

      toast.success("Registro eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar vacaciones:", error);
      toast.error("Error al eliminar el registro");
    }
  };

  /**
   * Carga los datos de un registro existente en el formulario para su visualización o edición.
   */
  const llenarFormulario = (nombre, fechaIn, fechaOut, observacion, idReg) => {
    if (namePermissionRef.current) namePermissionRef.current.value = nombre;
    setStarIn(new Date(fechaIn));
    setStarOut(new Date(fechaOut));
    if (observacionesRef.current) observacionesRef.current.value = observacion;
    setIdRegistro(idReg);
  };

  /**
   * Reinicia los estados de fechas y recarga las vacaciones al cambiar de año en el selector.
   */
  const traer2 = (newDate) => {
    setStarIn(new Date());
    setStarOut(new Date());
    if (observacionesRef.current) observacionesRef.current.value = "";
    traerVacacionesTrabajador(idUser, newDate);

    if (namePermissionRef.current) namePermissionRef.current.value = "";
    setIdRegistro(null);
  };

  /**
   * Actualiza el registro de vacaciones seleccionado mediante una petición PUT a la API.
   */
  const editar = async () => {
    if (nameUser === "-----------------------") {
      toast.error("Para actualizar la información de un trabajador, primero selecciónelo de la lista");
    } else if (!namePermissionRef.current || namePermissionRef.current.value === "") {
      if (namePermissionRef.current) namePermissionRef.current.focus();
      toast.error("El campo nombre del periodo de vacaciones no puede estar vacío, selecciónelo de la lista de registros");
    } else if (!observacionesRef.current || observacionesRef.current.value === "") {
      if (observacionesRef.current) observacionesRef.current.focus();
      toast.error("Debe especificar una observación o descripción para el periodo de vacaciones");
    } else {
      try {
        await axios.put("http://localhost:3000/api/recess/" + idRegistro, {
          nombre: namePermissionRef.current.value,
          año: starIn.getFullYear().toString(),
          fechainicio: starIn,
          fechafinal: starOut,
          observacion: observacionesRef.current.value,
          estado: true,
          nombreempleado: nameUser,
          id_empleado: idUser,
        });

        traerVacacionesTrabajador();
        toast.success("Registro actualizado correctamente");
      } catch (error) {
        console.error("Error al actualizar vacaciones:", error);
        toast.error("Error al actualizar el registro");
      }
    }
  };

  /* EFECTOS */
  // Carga inicial del listado de grupos al montar el componente
  useEffect(() => {
    obtenerListadoGroups();
  }, []);

  // -------------------------------------------------------------------------------------------------
  // RENDERIZADO DEL COMPONENTE
  // -------------------------------------------------------------------------------------------------
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

      {/* Sección principal del empleado y sus registros */}
      <div className="sectionDaily">
        <img src={avatarUser} alt="Recess" className="imgAvatar"/>
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

        {/* Listado de vacaciones del año seleccionado */}
        <div className="mainCajas">
          <div className="subTitulo">Registro de vacaciones durante el año {startDate.getFullYear()}</div>
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
                data2?.map((permisos) => (
                  <li 
                    className='itemHover' 
                    key={permisos._id} 
                    onClick={() => llenarFormulario(permisos.Nombre, permisos.FechaInicio, permisos.FechaFinal, permisos.Observacion, permisos._id)}
                  >
                    - {permisos.Nombre}
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

      {/* Formulario de detalles para crear / editar vacaciones */}
      <div className="sectionDetails">
        <div className="mainCajas2">
          <div className="caja1">
            <h5 className='titleDetail'>Nombre del periodo de vacaciones</h5>
            <input type="text" className='inputname' ref={namePermissionRef}/>
            <h5 className='titleCaducidad'>Caducidad</h5>

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
            
            <h5 className='titleCaducidad'>Observaciones o anotaciones</h5>
            <textarea className='inputObservaciones' ref={observacionesRef}/>
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
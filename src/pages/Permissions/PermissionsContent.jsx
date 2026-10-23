/* ESTILOS */
import './PermissionsContent.css';

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

export default function PermissionsContent() {

  /* ESTADOS */
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [starIn, setStarIn] = useState(new Date());
  const [starOut, setStarOut] = useState(new Date());
  const [nameUser, setNameUser] = useState("-----------------------");
  const [avatarUser] = useState(Avatar);
  const [idUser, setIdUser] = useState(null);
  const [idRegistro, setIdRegistro] = useState(null);

  /* REFERENCIAS */
  const starInRef = useRef();
  const starOutRef = useRef();
  const namePermissionRef = useRef();
  const fechaInicialRef = useRef();
  const fechaFinalRef = useRef();
  const observacionesRef = useRef();
  const groupsRef = useRef();

  // FUNCIONES
  const groupChange = () => {
    getPeopleOfGroup();
    setNameUser("-----------------------");
    limpiar();
  };

  // Función que obtiene la data de la api - listado de grupos
  const obtenerListadoGroups = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/groups");
      setData(response.data);
    } catch (error) {
      console.error("Error trayendo grupos:", error);
    }
  };

  const getPeopleOfGroup = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/payroll/idgp/" + groupsRef.current.value);
      setData1(response.data);
    } catch (error) {
      console.error("Error trayendo personal del grupo:", error);
    }
  };

  const traerPermisosTrabajador = async (currentIdUser, currentYear) => {
    const targetUserId = currentIdUser || idUser;
    const targetYear = currentYear || startDate;

    if (!targetUserId) return;

    try {
      const response = await axios.get("http://localhost:3000/api/permissions/" + targetUserId, {
        params: {
          año: targetYear?.getFullYear(),
        }
      });
      setData2(response.data);
    } catch (error) {
      console.error("Error trayendo permisos:", error);
    }
  };

  const clickUser = (id, nombre, apellido) => {
    setNameUser(nombre + " " + apellido);
    setIdUser(id);
    traerPermisosTrabajador(id, startDate);

    // Dejamos limpios los campos del formulario
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
    // Validaciones
    if (nameUser === "-----------------------") {
      toast.error("Para agregar un permiso a un trabajador, primero selecciónelo de la lista");
    } else if (!namePermissionRef.current || namePermissionRef.current.value === "") {
      if (namePermissionRef.current) namePermissionRef.current.focus();
      toast.error("Debe especificar un nombre que describa el permiso");
    } else if (!observacionesRef.current || observacionesRef.current.value === "") {
      if (observacionesRef.current) observacionesRef.current.focus();
      toast.error("Debe especificar una observación o descripción del permiso");
    } else {
      try {
        await axios.post("http://localhost:3000/api/permissions/", {
          nombre: namePermissionRef.current.value,
          año: starIn.getFullYear().toString(),
          fechainicio: starIn,
          fechafinal: starOut,
          observacion: observacionesRef.current.value,
          estado: true,
          nombreempleado: nameUser,
          idempleado: idUser,
        });

        // Limpiamos los campos
        if (namePermissionRef.current) namePermissionRef.current.value = "";
        setStarIn(new Date());
        setStarOut(new Date());
        if (observacionesRef.current) observacionesRef.current.value = "";
        traerPermisosTrabajador();

        toast.success("Registro agregado correctamente");
      } catch (error) {
        toast.error("Error al agregar el registro");
        console.error(error);
      }
    }
  };

  const eliminar = () => {
    if (idRegistro) {
      Swal.fire({
        title: "¿Realmente desea eliminar el permiso para " + nameUser + "?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "No",
        denyButtonText: `Confirmar`,
        footer: '<h6>Gestión Manager Citytv</h6>',
      }).then((result) => {
        if (result.isDenied) {
          EliminarPermiso();
        }
      });
    } else {
      toast.error("No se ha seleccionado un registro para eliminar");
    }
  };

  const EliminarPermiso = async () => {
    try {
      await axios.delete("http://localhost:3000/api/permissions/" + idRegistro);
      
      traerPermisosTrabajador();
      
      // Dejamos limpios los campos del formulario
      if (namePermissionRef.current) namePermissionRef.current.value = "";
      setStarIn(new Date());
      setStarOut(new Date());
      if (observacionesRef.current) observacionesRef.current.value = "";
      setIdRegistro(null);

      toast.success("Registro eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el registro");
      console.error(error);
    }
  };

  const llenarFormulario = (nombre, fechaIn, fechaOut, observacion, idReg) => {
    if (namePermissionRef.current) namePermissionRef.current.value = nombre;
    setStarIn(new Date(fechaIn));
    setStarOut(new Date(fechaOut));
    if (observacionesRef.current) observacionesRef.current.value = observacion;
    setIdRegistro(idReg);
  };

  const traer2 = (newDate) => {
    setStarIn(new Date());
    setStarOut(new Date());
    if (observacionesRef.current) observacionesRef.current.value = "";
    traerPermisosTrabajador(idUser, newDate);

    // Dejamos limpios los campos del formulario
    if (namePermissionRef.current) namePermissionRef.current.value = "";
    setStarIn(new Date());
    setStarOut(new Date());
    if (observacionesRef.current) observacionesRef.current.value = "";
    setIdRegistro(null);
  };

  const editar = async () => {
    // Validaciones
    if (nameUser === "-----------------------") {
      toast.error("Para actualizar la información de un trabajador, primero selecciónelo de la lista");
    } else if (!namePermissionRef.current || namePermissionRef.current.value === "") {
      if (namePermissionRef.current) namePermissionRef.current.focus();
      toast.error("El campo nombre del permiso no puede estar vacío, selecciónelo de la lista de registros");
    } else if (!observacionesRef.current || observacionesRef.current.value === "") {
      if (observacionesRef.current) observacionesRef.current.focus();
      toast.error("Debe especificar una observación o descripción del permiso");
    } else {
      try {
        await axios.put("http://localhost:3000/api/permissions/" + idRegistro, {
          nombre: namePermissionRef.current.value,
          año: starIn.getFullYear().toString(),
          fechainicio: starIn,
          fechafinal: starOut,
          observacion: observacionesRef.current.value,
          estado: true,
          nombreempleado: nameUser,
          id_empleado: idUser,
        });

        traerPermisosTrabajador();
        toast.success("Registro actualizado correctamente");
      } catch (error) {
        toast.error("Error al actualizar el registro");
        console.error(error);
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

      <div className="sectionDaily">
        <img src={avatarUser} alt="Permissions" className="imgAvatar" />
        <h2 className="seleccionadoDaily">{nameUser}</h2>

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

        <div className="mainCajas">
          <div className="subTitulo">Registro de permisos en el año {startDate.getFullYear()}</div>
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

      {/* ---------------------------------------------------------------------------------------------------------- */}

      <div className="sectionDetails">
        <div className="mainCajas2">
          <div className="caja1">
            <h5 className='titleDetail'>Nombre del permiso</h5>
            <input type="text" className='inputname' ref={namePermissionRef} />
            <h5 className='titleCaducidad'>Caducidad</h5>

            <div className="contentControls">
              <img src={calendar} alt="In" className='imgCalendar' />
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

              <img src={calendar} alt="Out" className='imgCalendar' />
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
            <textarea className='inputObservaciones' ref={observacionesRef} />
          </div>

          <div className="cajaControls">
            <div className="seccionButons">
              <div className="containerSingleButtom">
                <img src={Brush} alt="pencil" className='img-butons' onClick={limpiar} />
              </div>
              <div className="containerSingleButtom">
                <img src={Plus} alt="pencil" className='img-butons' onClick={agregar} />
              </div>
              <div className="containerSingleButtom">
                <img src={Edit} alt="plus" className='img-butons' onClick={editar} />
              </div>
              <div className="containerDeleteButtom2">
                <img src={Delete} alt="trash" className='img-butons' onClick={eliminar} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
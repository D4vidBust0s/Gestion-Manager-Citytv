/* ESTILOS */
import './ProgramsContent.css'

/* DEPENDENCIAS */
import DatePicker from 'react-datepicker';
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";

/* IMAGENES */
import Clock from '../../assets/bx-time-five.svg'
import Plus from '../../assets/Plus.svg'
import Edit from '../../assets/pencil.svg'
import Delete from '../../assets/trash.svg'

export default function ProgramsContent() {

  /* Estados para los datepicker */
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Estados para los programs
  const [data, setData] = useState([]);
  const [color, setColor] = useState("#000000");

  /* Estados para los dias de la semana */
  const [checkLunes, setCheckLunes] = useState(false);
  const [checkMartes, setCheckMartes] = useState(false);
  const [checkMiercoles, setCheckMiercoles] = useState(false);
  const [checkJueves, setCheckJueves] = useState(false);
  const [checkLViernes, setCheckViernes] = useState(false);
  const [checkSabado, setCheckSabado] = useState(false);
  const [checkDomingo, setCheckDomingo] = useState(false);
  const [checkMain, setCheckMain] = useState(false);
  const [checkSecondary, setCheckSecondary] = useState(false);

  // Estados para los controles HTML
  const [nameProgram, setNameProgram] = useState("");
  const [description, setDescription] = useState("");
  const [ID, setId] = useState(null);

  // Referencias
  const refName = useRef();
  const refLunes = useRef();
  const refMartes = useRef();
  const refMiercoles = useRef();
  const refJueves = useRef();
  const refViernes = useRef();
  const refSabado = useRef();
  const refDomingo = useRef();
  const refStart = useRef();
  const refEnd = useRef();
  const refDescripcion = useRef();
  const refMain = useRef();
  const refSecondary = useRef();

  // Función que obtiene la data de la api - listado de programs
  const obtenerListadoPrograms = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/programs");
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener listado de programas:", error);
    }
  };

  // Limpieza centralizada del formulario
  const limpiarFormulario = () => {
    setNameProgram("");
    setDescription("");
    setStartDate(new Date());
    setEndDate(new Date());
    setCheckLunes(false);
    setCheckMartes(false);
    setCheckMiercoles(false);
    setCheckJueves(false);
    setCheckViernes(false);
    setCheckSabado(false);
    setCheckDomingo(false);
    setCheckMain(false);
    setCheckSecondary(false);
    setColor("#000000");
    setId(null);
  };

  // Cambiamos estado para los check segun corresponda
  const handleOnChangeLunes = () => {
    setCheckLunes(!checkLunes);
  };

  const handleOnChangeMartes = () => {
    setCheckMartes(!checkMartes);
  };

  const handleOnChangeMiercoles = () => {
    setCheckMiercoles(!checkMiercoles);
  };

  const handleOnChangeJueves = () => {
    setCheckJueves(!checkJueves);
  };

  const handleOnChangeViernes = () => {
    setCheckViernes(!checkLViernes);
  };

  const handleOnChangeSabado = () => {
    setCheckSabado(!checkSabado);
  };

  const handleOnChangeDomingo = () => {
    setCheckDomingo(!checkDomingo);
  };

  // Exclusión automática Main vs Secondary para evitar errores de validación
  const handleOnChangeMain = () => {
    const nextVal = !checkMain;
    setCheckMain(nextVal);
    if (nextVal) {
      setCheckSecondary(false);
    }
  };

  const handleOnChangeSecondary = () => {
    const nextVal = !checkSecondary;
    setCheckSecondary(nextVal);
    if (nextVal) {
      setCheckMain(false);
    }
  };

  useEffect(() => {
    obtenerListadoPrograms();
  }, []);

  // Habilitamos la escritura de los controles HTML
  const cambiarNombre = (e) => {
    setNameProgram(e.target.value);
  };

  const cambiarDescription = (e) => {
    setDescription(e.target.value);
  };

  // Función para traer y cargar la información al hacer clic sobre un programa
  const grupoClick = async (id) => {
    try {
      const response = await axios.get("http://localhost:3000/api/programs/" + id);
      const prog = response.data;

      setNameProgram(prog.nombre || "");
      setDescription(prog.descripcion || "");
      setCheckLunes(Boolean(prog.lunes ?? prog.Lunes));
      setCheckMartes(Boolean(prog.Martes ?? prog.martes));
      setCheckMiercoles(Boolean(prog.Miercoles ?? prog.miercoles));
      setCheckJueves(Boolean(prog.Jueves ?? prog.jueves));
      setCheckViernes(Boolean(prog.Viernes ?? prog.viernes));
      setCheckSabado(Boolean(prog.Sabado ?? prog.sabado));
      setCheckDomingo(Boolean(prog.Domingo ?? prog.domingo));

      if (prog.Start || prog.start) {
        setStartDate(new Date(prog.Start || prog.start));
      }
      if (prog.End || prog.end) {
        setEndDate(new Date(prog.End || prog.end));
      }

      const tipo = prog.Type || prog.type;
      setCheckMain(tipo === "Main");
      setCheckSecondary(tipo === "Secondary");
      setColor(prog.Color || prog.col || "#000000");
      setId(id);
    } catch (error) {
      toast.error("Error al cargar los datos del programa");
    }
  };

  // Agregar Program
  const agregarProgram = async () => {
    if (!nameProgram || nameProgram.trim() === "") {
      toast.error("El campo Programa o evento no puede estar vacío");
    } else if (!startDate) {
      toast.error("El campo Start no está definido");
    } else if (!endDate) {
      toast.error("El campo End no está definido");
    } else if (!description || description.trim() === "") {
      toast.error("El campo Descripción no debe estar vacío");
    } else if (checkMain && checkSecondary) {
      toast.error("Solo puede seleccionar un tipo de evento, ya sea Main o Secondary, no los dos a la vez");
    } else if (!checkMain && !checkSecondary) {
      toast.error("Se debe seleccionar si el tipo es Main o Secondary");
    } else if (
      !checkLunes &&
      !checkMartes &&
      !checkMiercoles &&
      !checkJueves &&
      !checkLViernes &&
      !checkSabado &&
      !checkDomingo
    ) {
      toast.error("Se debe seleccionar mínimo un día");
    } else {
      const tipoEvento = checkMain ? "Main" : "Secondary";
      await axios.post("http://localhost:3000/api/programs/", {
        nombre: nameProgram,
        lunes: checkLunes,
        Lunes: checkLunes,
        martes: checkMartes,
        Martes: checkMartes,
        miercoles: checkMiercoles,
        Miercoles: checkMiercoles,
        jueves: checkJueves,
        Jueves: checkJueves,
        viernes: checkLViernes,
        Viernes: checkLViernes,
        sabado: checkSabado,
        Sabado: checkSabado,
        domingo: checkDomingo,
        Domingo: checkDomingo,
        descripcion: description,
        start: startDate.toString(),
        Start: startDate.toString(),
        end: endDate.toString(),
        End: endDate.toString(),
        type: tipoEvento,
        Type: tipoEvento,
        col: color,
        Color: color,
      });

      obtenerListadoPrograms();
      toast.success("Programa agregado");
      limpiarFormulario();
    }
  };

  // Eliminar program con confirmación
  const eliminarProgram = async () => {
    if (!nameProgram || ID === null) {
      toast.error("No ha seleccionado ningún programa para eliminar");
    } else {
      Swal.fire({
        title: "¿Realmente desea eliminar el Programa?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "No",
        denyButtonText: `Confirmar`,
        footer: '<h6>Gestión Manager Citytv</h6>',
      }).then((result) => {
        if (result.isDenied) {
          EliminarProg();
        }
      });
    }
  };

  const EliminarProg = async () => {
    await axios.delete("http://localhost:3000/api/programs/" + ID);
    obtenerListadoPrograms();
    toast.error("Programa eliminado");
    limpiarFormulario();
  };

  // Actualizar program
  const updateProgram = async () => {
    if (!nameProgram || nameProgram.trim() === "") {
      toast.error("El campo nombre del programa o evento no puede estar vacío");
    } else if (!startDate) {
      toast.error("El campo hora inicio no está definido");
    } else if (!endDate) {
      toast.error("El campo hora final no está definido");
    } else if (!description || description.trim() === "") {
      toast.error("Debe especificar una descripción");
    } else if (checkMain && checkSecondary) {
      toast.error("Solo puede seleccionar un tipo de evento, ya sea Main o Secondary, no los dos a la vez");
    } else if (!checkMain && !checkSecondary) {
      toast.error("Se debe seleccionar si el tipo es Main o Secondary");
    } else if (
      !checkLunes &&
      !checkMartes &&
      !checkMiercoles &&
      !checkJueves &&
      !checkLViernes &&
      !checkSabado &&
      !checkDomingo
    ) {
      toast.error("Se debe seleccionar mínimo un día");
    } else {
      const tipoEvento = checkMain ? "Main" : "Secondary";
      await axios.put("http://localhost:3000/api/programs/" + ID, {
        nombre: nameProgram,
        lunes: checkLunes,
        Lunes: checkLunes,
        martes: checkMartes,
        Martes: checkMartes,
        miercoles: checkMiercoles,
        Miercoles: checkMiercoles,
        jueves: checkJueves,
        Jueves: checkJueves,
        viernes: checkLViernes,
        Viernes: checkLViernes,
        sabado: checkSabado,
        Sabado: checkSabado,
        domingo: checkDomingo,
        Domingo: checkDomingo,
        descripcion: description,
        start: startDate.toString(),
        Start: startDate.toString(),
        end: endDate.toString(),
        End: endDate.toString(),
        type: tipoEvento,
        Type: tipoEvento,
        col: color,
        Color: color,
      });

      obtenerListadoPrograms();
      toast.success("Programa actualizado");
      limpiarFormulario();
    }
  };

  return (
    <>
      <div><Toaster /></div>
      <div className="contenPGM">
        <div className="sectionAdd">
          <h3 className="subTitulo">Programa o evento fijo</h3>
          <input
            type="text"
            ref={refName}
            className="inputName"
            value={nameProgram}
            onChange={cambiarNombre}
            placeholder="Nombre del programa"
          />

          <h3 className="subTitulo">Horario</h3>

          <div className="horarios">
            <ul className="ulHorarios">
              <li>
                <input type="checkbox" ref={refLunes} name="lunes" id="1" checked={checkLunes} onChange={handleOnChangeLunes} /> Lunes
              </li>
              <li>
                <input type="checkbox" ref={refMartes} name="Martes" id="2" checked={checkMartes} onChange={handleOnChangeMartes} /> Martes
              </li>
              <li>
                <input type="checkbox" ref={refMiercoles} name="Miercoles" id="3" checked={checkMiercoles} onChange={handleOnChangeMiercoles} /> Miércoles
              </li>
              <li>
                <input type="checkbox" ref={refJueves} name="Jueves" id="4" checked={checkJueves} onChange={handleOnChangeJueves} /> Jueves
              </li>
              <li>
                <input type="checkbox" ref={refViernes} name="Viernes" id="5" checked={checkLViernes} onChange={handleOnChangeViernes} /> Viernes
              </li>
              <li>
                <input type="checkbox" ref={refSabado} name="Sabado" id="6" checked={checkSabado} onChange={handleOnChangeSabado} /> Sábado
              </li>
              <li>
                <input type="checkbox" ref={refDomingo} name="Domingo" id="7" checked={checkDomingo} onChange={handleOnChangeDomingo} /> Domingo
              </li>
            </ul>

            <div className="TipoEvent">
              <div>
                <input type="checkbox" name="Main Program" id="chkMain" checked={checkMain} className="check" ref={refMain} onChange={handleOnChangeMain} /> Main
              </div>
              <div>
                <input type="checkbox" name="Secondary Program" id="chkSecondary" checked={checkSecondary} className="check" ref={refSecondary} onChange={handleOnChangeSecondary} /> Secondary
              </div>
            </div>

            <div className="color">
              <h3 className="subTitulo2">Color</h3>
              <input type="color" value={color || "#000000"} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>

          <div className="contentSectionTime">
            <img src={Clock} alt="Clock Start" className="imgTime" />
            <DatePicker
              className="inputHour"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Inicio"
              dateFormat="h:mm aa"
              ref={refStart}
            />

            <img src={Clock} alt="Clock End" className="imgTime" />
            <DatePicker
              className="inputHour"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Final"
              dateFormat="h:mm aa"
              ref={refEnd}
            />
          </div>

          <h3 className="subTitulo">Descripción del programa o evento</h3>
          <textarea
            className="area"
            ref={refDescripcion}
            value={description}
            onChange={cambiarDescription}
            placeholder="Descripción del evento..."
          ></textarea>

          <div className="seccionButons">
            <div className="containerSingleButtom" title="Agregar Programa">
              <img src={Plus} alt="plus" className="img-butons" onClick={agregarProgram} />
            </div>
            <div className="containerSingleButtom" title="Actualizar Programa">
              <img src={Edit} alt="pencil" className="img-butons" onClick={updateProgram} />
            </div>
            <div className="containerSingleButtomDelete" title="Eliminar Programa">
              <img src={Delete} alt="trash" className="img-butons" onClick={eliminarProgram} />
            </div>
          </div>
        </div>

        <div className="sectionLt">
          <div className="cabezal">
            Main Programs
          </div>

          <div className="sub1">
            <ul className="ListUL">
              {data?.map((prog) => (
                (prog.Type === "Main" || prog.type === "Main") && (
                  <li
                    key={prog._id}
                    className={`ListLI ${ID === prog._id ? 'activo' : ''}`}
                    onClick={() => grupoClick(prog._id)}
                  >
                    {prog.nombre}
                  </li>
                )
              ))}
            </ul>
          </div>

          <div className="cabezal2">
            Secondary Events
          </div>

          <div className="sub2">
            <ul className="ListUL">
              {data?.map((prog) => (
                (prog.Type === "Secondary" || prog.type === "Secondary") && (
                  <li
                    key={prog._id}
                    className={`ListLI ${ID === prog._id ? 'activo' : ''}`}
                    onClick={() => grupoClick(prog._id)}
                  >
                    {prog.nombre}
                  </li>
                )
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

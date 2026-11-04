/* ESTILOS */
import './ProgramsContent.css'

/* DEPENDENCIAS */
import DatePicker from 'react-datepicker';
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

/* HOOKS */
import { useMasterDetailCrud } from "../../Custom_Hooks/useMasterDetailCrud";

/* SERVICIOS */
import { programsApi } from "../../api/programs";

/* IMAGENES */
import Clock from '../../assets/bx-time-five.svg'
import Plus from '../../assets/Plus.svg'
import Edit from '../../assets/pencil.svg'
import Delete from '../../assets/trash.svg'

/** Clave del día en el payload: el backend guarda la versión en minúscula y en Capitalizada. */
const DIAS = [
  ["lunes", "Lunes"],
  ["martes", "Martes"],
  ["miercoles", "Miercoles"],
  ["jueves", "Jueves"],
  ["viernes", "Viernes"],
  ["sabado", "Sabado"],
  ["domingo", "Domingo"],
];

/**
 * Pantalla de Programas / eventos fijos.
 * Lista, selección y CRUD viven en useMasterDetailCrud.
 */
export default function ProgramsContent() {

  /* Estados para los datepicker */
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  /* Estados para los programas */
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

  /* Estados para los controles HTML */
  const [nameProgram, setNameProgram] = useState("");
  const [description, setDescription] = useState("");

  const dias = {
    lunes: checkLunes,
    martes: checkMartes,
    miercoles: checkMiercoles,
    jueves: checkJueves,
    viernes: checkLViernes,
    sabado: checkSabado,
    domingo: checkDomingo,
  };

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
  };

  /** Validaciones comunes a agregar y actualizar (los textos cambian por modo). */
  const validar = (mode) => {
    const isEdit = mode === "edit";

    if (!nameProgram || nameProgram.trim() === "") {
      toast.error(
        isEdit
          ? "El campo nombre del programa o evento no puede estar vacío"
          : "El campo Programa o evento no puede estar vacío"
      );
      return false;
    }
    if (!startDate) {
      toast.error(isEdit ? "El campo hora inicio no está definido" : "El campo Start no está definido");
      return false;
    }
    if (!endDate) {
      toast.error(isEdit ? "El campo hora final no está definido" : "El campo End no está definido");
      return false;
    }
    if (!description || description.trim() === "") {
      toast.error(isEdit ? "Debe especificar una descripción" : "El campo Descripción no debe estar vacío");
      return false;
    }
    if (checkMain && checkSecondary) {
      toast.error("Solo puede seleccionar un tipo de evento, ya sea Main o Secondary, no los dos a la vez");
      return false;
    }
    if (!checkMain && !checkSecondary) {
      toast.error("Se debe seleccionar si el tipo es Main o Secondary");
      return false;
    }
    if (!Object.values(dias).some(Boolean)) {
      toast.error("Se debe seleccionar mínimo un día");
      return false;
    }
    return true;
  };

  const buildPayload = () => {
    const tipoEvento = checkMain ? "Main" : "Secondary";
    const payload = {
      nombre: nameProgram,
      descripcion: description,
      // El backend acepta las dos grafías; se envían ambas por compatibilidad
      start: startDate.toString(),
      Start: startDate.toString(),
      end: endDate.toString(),
      End: endDate.toString(),
      type: tipoEvento,
      Type: tipoEvento,
      col: color,
      Color: color,
    };

    DIAS.forEach(([minuscula, capitalizada]) => {
      payload[minuscula] = dias[minuscula];
      payload[capitalizada] = dias[minuscula];
    });

    return payload;
  };

  const { items, selectedId, select, create, update, remove } =
    useMasterDetailCrud({
      api: programsApi,
      entityName: "programa",
      validate: validar,
      buildPayload,
      deleteTitle: () => "¿Realmente desea eliminar el Programa?",
      success: {
        add: "Programa agregado",
        update: "Programa actualizado",
        remove: "Programa eliminado",
      },
      errors: {
        load: "Error al cargar el listado de programas",
        loadOne: "Error al cargar los datos del programa",
        add: "Error al agregar el programa",
        update: "Error al actualizar el programa",
        remove: "Error al eliminar el programa",
      },
      onLoaded: (prog) => {
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
      },
      onCleared: limpiarFormulario,
    });

  // Main y Secondary se excluyen entre sí
  const handleOnChangeMain = () => {
    const nextVal = !checkMain;
    setCheckMain(nextVal);
    if (nextVal) setCheckSecondary(false);
  };

  const handleOnChangeSecondary = () => {
    const nextVal = !checkSecondary;
    setCheckSecondary(nextVal);
    if (nextVal) setCheckMain(false);
  };

  const mainPrograms = items.filter(
    (prog) => prog.Type === "Main" || prog.type === "Main"
  );
  const secondaryPrograms = items.filter(
    (prog) => prog.Type === "Secondary" || prog.type === "Secondary"
  );

  return (
    <>
      <div><Toaster /></div>
      <div className="contenPGM">
        <div className="sectionAdd">
          <h3 className="subTitulo">Programa o evento fijo</h3>
          <input
            type="text"
            className="inputName"
            value={nameProgram}
            onChange={(event) => setNameProgram(event.target.value)}
            placeholder="Nombre del programa"
          />

          <h3 className="subTitulo">Horario</h3>

          <div className="horarios">
            <ul className="ulHorarios">
              <li>
                <input type="checkbox" name="lunes" id="1" checked={checkLunes} onChange={() => setCheckLunes(!checkLunes)} /> Lunes
              </li>
              <li>
                <input type="checkbox" name="Martes" id="2" checked={checkMartes} onChange={() => setCheckMartes(!checkMartes)} /> Martes
              </li>
              <li>
                <input type="checkbox" name="Miercoles" id="3" checked={checkMiercoles} onChange={() => setCheckMiercoles(!checkMiercoles)} /> Miércoles
              </li>
              <li>
                <input type="checkbox" name="Jueves" id="4" checked={checkJueves} onChange={() => setCheckJueves(!checkJueves)} /> Jueves
              </li>
              <li>
                <input type="checkbox" name="Viernes" id="5" checked={checkLViernes} onChange={() => setCheckViernes(!checkLViernes)} /> Viernes
              </li>
              <li>
                <input type="checkbox" name="Sabado" id="6" checked={checkSabado} onChange={() => setCheckSabado(!checkSabado)} /> Sábado
              </li>
              <li>
                <input type="checkbox" name="Domingo" id="7" checked={checkDomingo} onChange={() => setCheckDomingo(!checkDomingo)} /> Domingo
              </li>
            </ul>

            <div className="TipoEvent">
              <div>
                <input type="checkbox" name="Main Program" id="chkMain" checked={checkMain} className="check" onChange={handleOnChangeMain} /> Main
              </div>
              <div>
                <input type="checkbox" name="Secondary Program" id="chkSecondary" checked={checkSecondary} className="check" onChange={handleOnChangeSecondary} /> Secondary
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
              onChange={(date) => date && setStartDate(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Inicio"
              dateFormat="h:mm aa"
            />

            <img src={Clock} alt="Clock End" className="imgTime" />
            <DatePicker
              className="inputHour"
              selected={endDate}
              onChange={(date) => date && setEndDate(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Final"
              dateFormat="h:mm aa"
            />
          </div>

          <h3 className="subTitulo">Descripción del programa o evento</h3>
          <textarea
            className="area"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripción del evento..."
          ></textarea>

          <div className="seccionButons">
            <div className="containerSingleButtom" title="Agregar Programa">
              <img src={Plus} alt="plus" className="img-butons" onClick={create} />
            </div>
            <div className="containerSingleButtom" title="Actualizar Programa">
              <img src={Edit} alt="pencil" className="img-butons" onClick={update} />
            </div>
            <div className="containerSingleButtomDelete" title="Eliminar Programa">
              <img src={Delete} alt="trash" className="img-butons" onClick={remove} />
            </div>
          </div>
        </div>

        <div className="sectionLt">
          <div className="cabezal">
            Main Programs
          </div>

          <div className="sub1">
            <ul className="ListUL">
              {mainPrograms.map((prog) => (
                <li
                  key={prog._id}
                  className={`ListLI ${selectedId === prog._id ? 'activo' : ''}`}
                  onClick={() => select(prog._id)}
                >
                  {prog.nombre}
                </li>
              ))}
            </ul>
          </div>

          <div className="cabezal2">
            Secondary Events
          </div>

          <div className="sub2">
            <ul className="ListUL">
              {secondaryPrograms.map((prog) => (
                <li
                  key={prog._id}
                  className={`ListLI ${selectedId === prog._id ? 'activo' : ''}`}
                  onClick={() => select(prog._id)}
                >
                  {prog.nombre}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

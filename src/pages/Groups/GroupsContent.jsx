/* ESTILOS */
import "./GroupsContent.css";

/* DEPENDENCIAS */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";

/* IMAGENES */
import Default from "../../assets/Default.svg";
import Plus from "../../assets/Plus.svg";
import Edit from "../../assets/pencil.svg";
import Delete from "../../assets/trash.svg";
import coleccionLogos from "../../assets/logos/logos";

export default function GroupsContent() {
  // ESTADOS
  const [data, setData] = useState([]);

  // Estados para los controles HTML
  const [nameGroup, setNameGroup] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(Default);
  const [valueLogo, setValueLogo] = useState("Default");
  const [ID, setId] = useState(null);
  const [order, setOrder] = useState("1");
  const [planner, setPlanner] = useState("MainPlanner");

  // Referencias
  const refName = useRef();
  const refLogo = useRef();
  const refDescripcion = useRef();
  const refOrder = useRef();
  const refMainplanner = useRef();

  // Función que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/groups");
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener listado de grupos:", error);
    }
  };

  // Limpieza unificada del formulario
  const limpiarFormulario = () => {
    setNameGroup("");
    setDescription("");
    setLogo(Default);
    setValueLogo("Default");
    setOrder("1");
    setPlanner("MainPlanner");
    setId(null);
  };

  // Función para traer y cargar la información al dar clic sobre el grupo
  const grupoClick = async (id) => {
    try {
      const response = await axios.get("http://localhost:3000/api/groups/" + id);
      const g = response.data;

      setNameGroup(g.nombre || "");
      setDescription(g.descripcion || "");
      setLogo(g.logo || Default);
      setValueLogo(g.logo || "Default");
      const ord = (g.orden ?? g.order ?? "1").toString();
      setOrder(ord);
      const mp = (g.mainplanner || "MainPlanner").trim();
      setPlanner(mp);
      setId(id);
    } catch (error) {
      toast.error("Error al cargar los datos del grupo");
    }
  };

  // Agregar grupo
  const agregarGrupo = async () => {
    if (!nameGroup || nameGroup.trim() === "") {
      toast.error("El campo nombre del grupo no puede estar vacío");
    } else if (!logo) {
      toast.error("El campo logo no puede estar vacío");
    } else if (!description || description.trim() === "") {
      toast.error("El campo Descripción debe tener un contenido");
    } else if (!order) {
      toast.error("El campo Orden no debe estar vacío");
    } else {
      await axios.post("http://localhost:3000/api/groups/", {
        nombre: nameGroup,
        logo: logo,
        order: Number(order) || order,
        orden: Number(order) || order,
        descripcion: description,
        mainplanner: planner,
      });

      obtenerListadoGrupos();
      toast.success("Grupo agregado");
      limpiarFormulario();
    }
  };

  // Eliminar grupo con confirmación
  const eliminarGrupo = async () => {
    if (!nameGroup || ID == null) {
      toast.error("No ha seleccionado ningún grupo para eliminar");
    } else {
      Swal.fire({
        title: "¿Realmente desea eliminar el Grupo " + nameGroup + "?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "No",
        denyButtonText: `Confirmar`,
        footer: '<h6>Gestión Manager Citytv</h6>',
      }).then((result) => {
        if (result.isDenied) {
          EliminarGP();
        }
      });
    }
  };

  const EliminarGP = async () => {
    try {
      await axios.delete("http://localhost:3000/api/groups/" + ID);
      obtenerListadoGrupos();
      toast.error("Grupo Eliminado");
      limpiarFormulario();
    } catch (error) {
      toast.error("Error al eliminar el grupo");
    }
  };

  // Actualizar grupo
  const updateGrupo = async () => {
    if (!nameGroup || nameGroup.trim() === "") {
      toast.error("El campo nombre del grupo no puede estar vacío");
    } else if (!logo) {
      toast.error("El campo logo no puede estar vacío");
    } else if (!description || description.trim() === "") {
      toast.error("El campo Descripción debe tener un contenido");
    } else if (!order) {
      toast.error("El campo Orden debe especificar el número de orden");
    } else if (!ID) {
      toast.error("No ha seleccionado ningún grupo para actualizar");
    } else {
      await axios.put("http://localhost:3000/api/groups/" + ID, {
        nombre: nameGroup,
        logo: logo,
        order: Number(order) || order,
        orden: Number(order) || order,
        descripcion: description,
        mainplanner: planner,
      });

      obtenerListadoGrupos();
      toast.success("Grupo Actualizado");
      limpiarFormulario();
    }
  };

  // Escritura en controles HTML
  const cambiarNombre = (e) => {
    setNameGroup(e.target.value);
  };

  const cambiarLogo = (e) => {
    setLogo(e.target.value);
  };

  const cambiarOrden = (e) => {
    setOrder(e.target.value);
  };

  const cambiarDescripcion = (e) => {
    setDescription(e.target.value);
  };

  useEffect(() => {
    obtenerListadoGrupos();
  }, []);

  // Lista ordenada ascendentemente por número de orden
  const sortedData = [...data].sort((a, b) => {
    const ordenA = Number(a.orden ?? a.order ?? 999);
    const ordenB = Number(b.orden ?? b.order ?? 999);
    return ordenA - ordenB;
  });

  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className="contenPGM">
        <div className="sectionAdd">
          <h3 className="subTitulo">Nombre del Grupo {order ? " (" + order + ")" : ""}</h3>
          <input
            type="text"
            className="inputName"
            ref={refName}
            value={nameGroup}
            id="name"
            onChange={cambiarNombre}
            placeholder="Nombre del grupo..."
          />

          <h3 className="subTitulo">Orden</h3>
          <div className="contentSectionLogo2">
            <select
              className="inputDir"
              ref={refOrder}
              value={order}
              onChange={cambiarOrden}
            >
              {Array.from({ length: 30 }, (_, i) => (
                <option key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <h3 className="subTitulo">Logo</h3>
          <div className="contentSectionLogo">
            <select
              className="inputDir"
              ref={refLogo}
              value={logo}
              onChange={cambiarLogo}
            >
              <option key={0} value={Default}>
                Seleccione un Logo
              </option>
              {coleccionLogos.map((option) => (
                <option key={option.id} value={option.img}>
                  {option.titulo}
                </option>
              ))}
            </select>

            <div className="cajaLogo">
              <img src={logo} alt="LogoGrupo" />
            </div>
          </div>

          <h3 className="subTitulo">MainPlanner</h3>
          <div className="contentSectionLogo">
            <select
              className="inputDir"
              ref={refMainplanner}
              value={planner}
              onChange={(e) => setPlanner(e.target.value)}
            >
              <option key={1} value="MainPlanner">
                MainPlanner
              </option>
              <option key={2} value="MainPlanner +">
                MainPlanner +
              </option>
            </select>
          </div>

          <h3 className="subTitulo">Descripción del grupo</h3>
          <textarea
            className="area"
            ref={refDescripcion}
            value={description}
            onChange={cambiarDescripcion}
            placeholder="Descripción del área o responsabilidades..."
          ></textarea>

          <div className="seccionButons">
            <div className="containerSingleButtom" title="Agregar Grupo">
              <img
                src={Plus}
                alt="plus"
                className="img-butons"
                onClick={agregarGrupo}
              />
            </div>
            <div className="containerSingleButtom" title="Actualizar Grupo">
              <img
                src={Edit}
                alt="pencil"
                className="img-butons"
                onClick={updateGrupo}
              />
            </div>
            <div className="containerDeleteButtom" title="Eliminar Grupo">
              <img
                src={Delete}
                alt="trash"
                className="img-butons"
                onClick={eliminarGrupo}
              />
            </div>
          </div>
        </div>

        <div className="sectionList">
          <ul className="ListUL">
            {sortedData?.map((group) => {
              const numOrden = group.orden ?? group.order;
              return (
                <li
                  key={group._id}
                  className={`ListLI ${ID === group._id ? "activo" : ""}`}
                  onClick={() => grupoClick(group._id)}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      marginRight: "0.5rem",
                      color: ID === group._id ? "#FFFFFF" : "#7ED957",
                      display: "inline-block",
                      minWidth: "1.6rem",
                    }}
                  >
                    {numOrden ? `${numOrden}.` : "-"}
                  </span>
                  {group.nombre}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ESTILOS */
import "./GroupsContent.css";

/* DEPENDENCIAS */
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

/* HOOKS */
import { useMasterDetailCrud } from "../../Custom_Hooks/useMasterDetailCrud";

/* SERVICIOS */
import { groupsApi } from "../../api/groups";

/* IMAGENES */
import Default from "../../assets/Default.svg";
import Plus from "../../assets/Plus.svg";
import Edit from "../../assets/pencil.svg";
import Delete from "../../assets/trash.svg";
import coleccionLogos from "../../assets/logos/logos";

/**
 * Pantalla de Grupos: listado a la izquierda, formulario a la derecha.
 * La lista, la selección y el CRUD (con confirmación) viven en
 * useMasterDetailCrud; aquí quedan los campos y su validación.
 */
export default function GroupsContent() {
  // Estados del formulario
  const [nameGroup, setNameGroup] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(Default);
  const [order, setOrder] = useState("1");
  const [planner, setPlanner] = useState("MainPlanner");

  const limpiarFormulario = () => {
    setNameGroup("");
    setDescription("");
    setLogo(Default);
    setOrder("1");
    setPlanner("MainPlanner");
  };

  const validar = (mode) => {
    if (!nameGroup || nameGroup.trim() === "") {
      toast.error("El campo nombre del grupo no puede estar vacío");
      return false;
    }
    if (!logo) {
      toast.error("El campo logo no puede estar vacío");
      return false;
    }
    if (!description || description.trim() === "") {
      toast.error("El campo Descripción debe tener un contenido");
      return false;
    }
    if (!order) {
      toast.error(
        mode === "edit"
          ? "El campo Orden debe especificar el número de orden"
          : "El campo Orden no debe estar vacío"
      );
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    nombre: nameGroup,
    logo,
    order: Number(order) || order,
    orden: Number(order) || order,
    descripcion: description,
    mainplanner: planner,
  });

  const {
    items,
    selectedId,
    select,
    create,
    update,
    remove,
  } = useMasterDetailCrud({
    api: groupsApi,
    entityName: "grupo",
    validate: validar,
    buildPayload,
    sortItems: (a, b) =>
      Number(a.orden ?? a.order ?? 999) - Number(b.orden ?? b.order ?? 999),
    deleteTitle: () => `¿Realmente desea eliminar el Grupo ${nameGroup}?`,
    success: {
      add: "Grupo agregado",
      update: "Grupo actualizado",
      remove: "Grupo eliminado",
    },
    errors: {
      load: "Error al cargar el listado de grupos",
      loadOne: "Error al cargar los datos del grupo",
      add: "Error al agregar el grupo",
      update: "Error al actualizar el grupo",
      remove: "Error al eliminar el grupo",
    },
    onLoaded: (group) => {
      setNameGroup(group.nombre || "");
      setDescription(group.descripcion || "");
      setLogo(group.logo || Default);
      setOrder((group.orden ?? group.order ?? "1").toString());
      setPlanner((group.mainplanner || "MainPlanner").trim());
    },
    onCleared: limpiarFormulario,
  });

  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className="contenPGM">
        <div className="sectionAdd">
          <h3 className="subTitulo">
            Nombre del Grupo {order ? " (" + order + ")" : ""}
          </h3>
          <input
            type="text"
            className="inputName"
            value={nameGroup}
            id="name"
            onChange={(event) => setNameGroup(event.target.value)}
            placeholder="Nombre del grupo..."
          />

          <h3 className="subTitulo">Orden</h3>
          <div className="contentSectionLogo2">
            <select
              className="inputDir"
              value={order}
              onChange={(event) => setOrder(event.target.value)}
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
              value={logo}
              onChange={(event) => setLogo(event.target.value)}
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
              value={planner}
              onChange={(event) => setPlanner(event.target.value)}
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
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripción del área o responsabilidades..."
          ></textarea>

          <div className="seccionButons">
            <div className="containerSingleButtom" title="Agregar Grupo">
              <img src={Plus} alt="plus" className="img-butons" onClick={create} />
            </div>
            <div className="containerSingleButtom" title="Actualizar Grupo">
              <img src={Edit} alt="pencil" className="img-butons" onClick={update} />
            </div>
            <div className="containerDeleteButtom" title="Eliminar Grupo">
              <img
                src={Delete}
                alt="trash"
                className="img-butons"
                onClick={remove}
              />
            </div>
          </div>
        </div>

        <div className="sectionList">
          <ul className="ListUL">
            {items.map((group) => (
              <li
                key={group._id}
                className={`ListLI ${selectedId === group._id ? "activo" : ""}`}
                onClick={() => select(group._id)}
              >
                <span
                  style={{
                    fontWeight: "700",
                    marginRight: "0.5rem",
                    color: selectedId === group._id ? "#FFFFFF" : "#7ED957",
                    display: "inline-block",
                    minWidth: "1.6rem",
                  }}
                >
                  {group.orden ?? group.order
                    ? `${group.orden ?? group.order}.`
                    : "-"}
                </span>
                {group.nombre}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

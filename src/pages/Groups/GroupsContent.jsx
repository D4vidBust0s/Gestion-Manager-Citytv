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

/* API */

export default function ProgramsContent() {
  //ESTADOS
  //Estados para los grupos
  const [data, setData] = useState([]);

  //Estados para los controles HTML
  const [nameGroup, setNameGroup] = useState("Default");
  const [description, setDescription] = useState("Description default group");
  const [logo, setLogo] = useState(Default);
  const [valueLogo, setValueLogo] = useState("Default");
  const [ID, setId] = useState(null);

  //Referencias
  const refName = useRef();
  const refLogo = useRef();
  const refDescripcion = useRef();

  //------------------------------------------------------------------------------------

  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };

  //Funcion para traer y actualizar la informacion al dar click sobre el grupo
  const grupoClick = async (id) => {
    await axios
      .get("http://localhost:3000/api/groups/" + id)
      .then(
        (response) =>
          setNameGroup(response.data.nombre) +
          setDescription(response.data.descripcion) +
          setLogo(response.data.logo) +
          setValueLogo(response.data.logo)
      );
    setId(id);
  };

  //Agregar grupo
  const agregarGrupo = async () => {
    if (refName.current.value == "") {
      toast.error("El campo nombre del grupo no puede estar vacio");
    } else if (refLogo.current.value == "") {
      toast.error("El campo logo no puede estar vacio");
    } else if (refDescripcion.current.value == "") {
      toast.error("El campo Descripción debe tener un contenido");
    } else {
      await axios.post("http://localhost:3000/api/groups/", {
        nombre: nameGroup,
        logo: logo,
        descripcion: description,
      });

      obtenerListadoGrupos();

      toast.success("Grupo agregado");
      setNameGroup("");
      setLogo(logo);
      setDescription("");
    }
  };

  //Eliminar grupo
  const eliminarGrupo = async () => {
    if (refName.current.value == "" || ID == null) {
      toast.error("No ha seleccionado ningun grupo para eliminar");
    } 
    else 
    {
      Swal.fire({
        title: "¿Realmente desea eliminar el Grupo?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "No",
        denyButtonText: `Confirmar`,
        footer: '<h6>Gestión Manager Citytv</h6>',
        
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          //Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) 
        {
          EliminarGP();
          //Swal.fire("Registro eliminado del sistema", "", "success");
        }
      });
    }
  };

   const EliminarGP = async ()=>{
        await axios.delete("http://localhost:3000/api/groups/" + ID);

        obtenerListadoGrupos();

        toast.error("Grupo Eliminado");
        setNameGroup("");
        setLogo(Default);
        setDescription("");
   }

  //Actualizar grupo
  const updateGrupo = async () => {
    if (refName.current.value == "") {
      toast.error("El campo nombre del grupo no puede estar vacio");
    } else if (refLogo.current.value == "") {
      toast.error("El campo logo no puede estar vacio");
    } else if (refDescripcion.current.value == "") {
      toast.error("El campo Descripción debe tener un contenido");
    } else {
      await axios.put("http://localhost:3000/api/groups/" + ID, {
        nombre: nameGroup,
        logo: logo,
        descripcion: description,
      });

      obtenerListadoGrupos();

      toast.success("Grupo Actualizado");
      setNameGroup("");
      setLogo(Default);
      setDescription("");
      setValueLogo("");
    }
  };

  //-----------------------------------------------------------------------------------
  //ESCRITURA EN CONTROLES HTML
  const cambiarNombre = (e) => {
    setNameGroup(e.target.value);
  };

  const cambiarLogo = (e) => {
    setLogo(e.target.value);
  };

  const cambiarDescripcion = (e) => {
    setDescription(e.target.value);
  };

  //----------------------------------------------------------------------------------

  useEffect(() => {
    obtenerListadoGrupos();
  }, []);

  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className="contenPGM">
        <div className="sectionAdd">
          <h3 className="subTitulo">Nombre del Grupo</h3>
          <input
            type="text"
            className="inputName"
            ref={refName}
            value={nameGroup}
            id="name"
            onChange={cambiarNombre}
          />
          <h3 className="subTitulo">Logo</h3>
          <div className="contentSectionLogo">
            <select className="inputDir" ref={refLogo} onChange={cambiarLogo}>
            <option key={0} value={Default}>{valueLogo}</option>
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

          <h3 className="subTitulo">Descripción del grupo</h3>
          <textarea
            className="area"
            ref={refDescripcion}
            value={description}
            onChange={cambiarDescripcion}
          ></textarea>

          <div className="seccionButons">
            <div className="containerSingleButtom">
              <img
                src={Plus}
                alt="pencil"
                className="img-butons"
                onClick={agregarGrupo}
              />
            </div>
            <div className="containerSingleButtom">
              <img
                src={Edit}
                alt="plus"
                className="img-butons"
                onClick={updateGrupo}
              />
            </div>
            <div className="containerDeleteButtom">
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
            {data?.map((group) => (
              <li
                key={group._id}
                className="ListLI"
                onClick={() => grupoClick(group._id)}
              >
                {group.nombre}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

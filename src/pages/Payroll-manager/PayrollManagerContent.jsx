/* ESTILOS */
import "./PayrollManagerContent.css";

/* DEPENDENCIAS */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { GetUsers } from "./getUsers";

/* COMPONENTES MODALES*/
import ModalBase1 from "../../Components/Modals/ModalBases/ModalBase1";
import ModalPayrollManager from "../../Components/Modals/ModalManagerPayroll";

/* IMAGENES */
import Plus from "../../assets/Plus.svg";
import Edit from "../../assets/pencil.svg";
import Delete from "../../assets/trash.svg";

export default function PayrollManagerContent() {
  // Estado para la ventana modal de agregar usuario
  const [modal1, setModal1] = useState(false);

  // Estados para los grupos
  const [data, setData] = useState([]);

  // Estado para el payroll completo / filtrado por grupo
  const [data2, setData2] = useState([]);

  // Estado para recuperar la informacion de un trabajador
  const [data3, setData3] = useState([]);

  // Estado para la persona seleccionada
  const [selectPerson, setSelectPerson] = useState("-----");

  // Estado para guardar el id de la persona seleccionada
  const [selectPersonId, setSelectPersonId] = useState(null);

  // Estado para guardar el id del grupo de la persona seleccionada
  const [selectPersonIdgroup, setSelectPersonIdgroup] = useState(null);

  // Estado para guardar el ID del grupo activo (reemplaza la variable global suelta)
  const [idGroupGlobal, setIdGroupGlobal] = useState("");

  // Estado para definir si se va a agregar (0) o editar (1)
  const [operation, setOperation] = useState("0");

  // ==================== FUNCIONES ====================

  // Obtiene la lista de grupos
  const obtenerListadoGrupos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/groups");
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener grupos:", error);
    }
  };

  // Obtiene la data de un trabajador específico
  const obtenerSinglePayroll = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/payroll/${selectPersonId}`);
      setData3(response.data);
    } catch (error) {
      console.error("Error al obtener información del trabajador:", error);
    }
  };

  // Actualiza la persona seleccionada (Enfoque declarativo, sin alterar el DOM directamente)
  const operationPerson = (id, name, apellido, idGroup) => {
  setSelectPerson(`${name} ${apellido}`);
  setSelectPersonId(id);
  setSelectPersonIdgroup(idGroup);
  setIdGroupGlobal(idGroup); // <--- ¡Aseguramos que el ID del grupo global nunca esté vacío!
};

  // Muestra los usuarios pertenecientes a un grupo
  const showUsersGroup = async (groupID) => {
    setIdGroupGlobal(groupID);
    setSelectPerson("-----");
    setSelectPersonId(null);

    try {
      const response = await axios.get(`http://localhost:3000/api/payroll/idGroup/${groupID}`);
      setData2(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios del grupo:", error);
    }
  };

  // Abre el modal para agregar persona
  const addPerson = () => {
    setOperation(0);
    setModal1(!modal1);
  };

  // Abre el modal para editar persona seleccionada
  const EditPerson = () => {
    if (selectPerson === "-----") {
      toast.error("Para editar una persona del listado, primero debe seleccionarla dando clic");
    } else {
      if (selectPersonId) {
        setModal1(!modal1);
        obtenerSinglePayroll();
        setOperation(1);
      }
    }
  };

  // Eliminar registro en rotations manager
  const deleteFromRm = async () => {
    await axios.delete(`http://localhost:3000/api/rotationsmanager/delsimplereg/${selectPersonId}`);
  };

  // Eliminar registro en rotations manager fines de semana
  const deleteFromRmFS = async () => {
    await axios.delete(`http://localhost:3000/api/rotationsmanager-fs/delsimplereg/${selectPersonId}`);
  };

  // Actualiza el número total de usuarios en rotationsmanager y rotationsmanagerFS
  const updateTotalGrupo = async () => {
    if (!idGroupGlobal) return;

    let totalGroupsActual = data2?.filter((rm) => String(rm.activo) === "true").length || 0;
    totalGroupsActual = Math.max(0, totalGroupsActual - 1);

    await axios.put(`http://localhost:3000/api/rotationsmanager/uptdatetotalgroup/${idGroupGlobal}`, {
      nuevovalor: totalGroupsActual,
    });

    await axios.put(`http://localhost:3000/api/rotationsmanager-fs/uptdatetotalgroup/${idGroupGlobal}`, {
      nuevovalor: totalGroupsActual,
    });
  };

  // Dispara la alerta de confirmación para eliminar
  const deletePerson = () => {
    if (selectPerson === "-----" || !idGroupGlobal) {
      toast.error("Para eliminar una persona del listado, primero debe seleccionar un grupo y luego dar clic en el listado");
    } else {
      Swal.fire({
        title: `¿Realmente desea eliminar a ${selectPerson}?`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "No",
        denyButtonText: `Confirmar`,
        footer: "<h6>Gestión Manager Citytv</h6>",
      }).then((result) => {
        if (result.isDenied) {
          EliminarPerson();
        }
      });
    }
  };

  // Lógica asíncrona limpia para la eliminación completa
  const EliminarPerson = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/payroll/${selectPersonId}`);
      await obtenerListadoGrupos();
      setSelectPerson("-----");
      setSelectPersonId(null);
      await obtenerListadoPayroll();
      await deleteFromRm();
      await deleteFromRmFS();
      await updateTotalGrupo();
      toast.success("Usuario eliminado del sistema correctamente");
    } catch (error) {
      toast.error("Hubo un error al eliminar el usuario");
      console.error(error);
    }
  };

  // Obtiene la lista general de todos los usuarios
  const obtenerListadoPayroll = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/payroll");
      setData2(response.data);
    } catch (error) {
      console.error("Error al obtener listado de payroll:", error);
    }
  };

  // Carga inicial unificada
  useEffect(() => {
    obtenerListadoGrupos();
    obtenerListadoPayroll();
  }, []);

  return (
    <>
      <Toaster />
      {createPortal(
        <ModalBase1
          estado={modal1}
          cambiarEstado={setModal1}
          title="Gestión del personal"
          content={
            <ModalPayrollManager
              id={selectPersonId}
              op={operation}
              idGrupo={selectPersonIdgroup}
            />
          }
        />,
        document.querySelector("#portal"),
      )}

      <div className="contenPAYROLL">
        <h3 className="subTitulo1">Grupos o Áreas</h3>
        <div className="sectionAdd">
          {/* Componente externo encargado de pintar o gestionar la selección de grupos */}
          <GetUsers set={setData2} />

          <div className="seccionButons">
            <div className="person">{selectPerson}</div>
            <div className="containerSingleButtom" onClick={() => addPerson()}>
              <img src={Plus} alt="Agregar" className="img-butons" />
            </div>
            <div className="containerSingleButtom">
              <img
                src={Edit}
                alt="Editar"
                className="img-butons"
                onClick={() => EditPerson()}
              />
            </div>
            <div className="containerSingleButtomDel">
              <img
                src={Delete}
                alt="Eliminar"
                className="img-butons"
                onClick={() => deletePerson()}
              />
            </div>
          </div>
        </div>

        <div className="sectionListPayroll">
          <h3 className="subTitulo2">Listado de personas del grupo</h3>
          <ul className="ListUL">
  {data2.map((payroll) =>
    payroll.cargo !== "USERBALANCER" ? (
      <div className="sb" key={payroll._id}>
        <div className="subGrupo">{payroll.subGrupo}</div>
        <li
          className={
            payroll._id === selectPersonId
              ? "ListLI active2"
              : payroll.activo === false
              ? "ListLI2"
              : "ListLI"
          }
          onClick={() =>
            operationPerson(
              payroll._id,
              payroll.nombres,
              payroll.apellidos,
              payroll.grupoID,
            )
          }
        >
          {payroll.nombres} {payroll.apellidos}
          {/* Si está inactivo, añadimos un indicador visual */}
          {payroll.activo === false && (
            <span style={{ fontSize: "0.8rem", marginLeft: "8px", fontStyle: "italic", opacity: 0.8 }}>
              (Desactivado)
            </span>
          )}
        </li>
      </div>
    ) : null,
  )}
</ul>
        </div>
      </div>
    </>
  );
}
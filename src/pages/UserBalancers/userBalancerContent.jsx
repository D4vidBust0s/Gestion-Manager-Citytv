
/* ESTILOS */
import './userBalancer.css'

/* DEPENDENCIAS */
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Toaster, toast} from 'react-hot-toast';
import Swal from "sweetalert2";

/* SERVICIOS */
import { groupsApi } from '../../api/groups';
import {
  getNextUserBalancerNumber,
  getUserBalancerCountsByGroup,
  isBalancerUser,
  payrollApi,
} from '../../api/payroll';
import {
  rotationsManagerApi,
  rotationsManagerFsApi,
} from '../../api/rotationsManager';

/* IMAGENES */
import Plus from '../../assets/Plus.svg';
import Menos from '../../assets/menos.svg'

const USER_BALANCER_NAME = "UserBalancer";

const buildBalancerName = (sequence) => `${USER_BALANCER_NAME}-${sequence}`;

//Body con el que se crea el usuario virtual en /payroll
const buildPayrollPayload = (groupId, balancerName) => ({
  Nombres: balancerName,
  Apellidos: "",
  Edad: "",
  FechaDeNacimiento: "",
  Genero: "",
  EstadoCivil: "",
  CelularPrioritario: "",
  CelularAux: "",
  TelefonoFijo: "",
  DireccionResidencia: "",
  Email: "",
  Cc: "",
  Pasaporte: "",
  TarjetaProfesional: "",
  Cargo: "USERBALANCER",
  Grupo: groupId,
  GrupoID: groupId,
  FechaIngreso: new Date(),
  RH: "",
  ContactoPrincipal: "",
  ContactoAux: "",
  Activo: true,
  Mainplanner: "",
  SubGrupo: 0,
});

//Body con el que se registra el usuario en el planificador (ES y FS)
const buildPlannerPayload = (userId, groupId) => ({
  nombreusuario: USER_BALANCER_NAME,
  userid: userId,
  groupname: groupId,
  groupid: groupId,
  schemaname: "------------",
  schemaid: "------------",
  totalschema: 0,
  totalgroup: 0,
  actual: 0,
  dayKey: new Date().setHours(0, 0, 0, 0),
});

const UserBalancerContent = () => {

  /* ESTADOS */
  const [groups, setGroups] = useState([]);
  const [groupPayroll, setGroupPayroll] = useState([]);
  const [allPayroll, setAllPayroll] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  /* REFERENCIAS */
  const savingRef = useRef(false);
  const groupRequestRef = useRef(0);

  /* CARGA DE DATOS */

  const cargarGrupos = useCallback(async () => {
    try {
      const data = await groupsApi.getAll();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar los grupos:", error);
      toast.error(error?.message || "Error al cargar los grupos");
    }
  }, []);

  const cargarTodoElPayroll = useCallback(async () => {
    try {
      const data = await payrollApi.getAll();
      setAllPayroll(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar los UserBalancers:", error);
      toast.error(error?.message || "Error al cargar los UserBalancers");
    }
  }, []);

  const cargarPayrollDelGrupo = useCallback(async (groupId) => {
    if (!groupId) {
      groupRequestRef.current += 1;
      setGroupPayroll([]);
      return;
    }

    const requestId = ++groupRequestRef.current;
    setGroupPayroll([]);

    try {
      const data = await payrollApi.getByGroup(groupId);
      if (requestId !== groupRequestRef.current) return;
      setGroupPayroll(Array.isArray(data) ? data : []);
    } catch (error) {
      if (requestId !== groupRequestRef.current) return;
      console.error("Error al cargar el personal del grupo:", error);
      toast.error(error?.message || "Error al cargar el personal del grupo");
    }
  }, []);

  const refrescarDatos = useCallback(
    async (groupId) => {
      await Promise.all([
        groupId ? cargarPayrollDelGrupo(groupId) : Promise.resolve(),
        cargarTodoElPayroll(),
      ]);
    },
    [cargarPayrollDelGrupo, cargarTodoElPayroll]
  );

  useEffect(() => {
    cargarGrupos();
    cargarTodoElPayroll();
  }, [cargarGrupos, cargarTodoElPayroll]);

  /* CONTADORES POR GRUPO */
  const balancerCountsByGroup = useMemo(
    () => getUserBalancerCountsByGroup(allPayroll),
    [allPayroll]
  );

  /* SELECCIONES */

  const showUsersGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setSelectedUserId(null);
    cargarPayrollDelGrupo(groupId);
  };

  const changeID = (idUser) => {
    setSelectedUserId(idUser);
  };

  /* OPERACIONES CONTRA LA API */

  const addUserBalancer = async () => {
    if (!selectedGroupId) {
      toast.error("No ha seleccionado un grupo. Para agregar user balancers al sistema, primero seleccione el grupo al que lo va a agregar");
      return;
    }

    if (savingRef.current) return;

    savingRef.current = true;
    setIsSaving(true);

    try {
      // Se consulta el grupo de nuevo para calcular el consecutivo con datos
      // actuales y no con una lista que pudo quedar desactualizada.
      const payrollDelGrupo = await payrollApi.getByGroup(selectedGroupId);

      if (!Array.isArray(payrollDelGrupo)) {
        throw new Error(
          "No fue posible consultar los UserBalancers del grupo"
        );
      }

      const numero = getNextUserBalancerNumber(
        payrollDelGrupo,
        selectedGroupId
      );
      const nombre = buildBalancerName(numero);

      const creado = await payrollApi.create(
        buildPayrollPayload(selectedGroupId, nombre)
      );
      const createdId = creado?._id;

      if (!createdId) {
        throw new Error(
          "La API no devolvió el identificador del UserBalancer creado"
        );
      }

      const plannerPayload = buildPlannerPayload(createdId, selectedGroupId);
      await rotationsManagerApi.create(plannerPayload);
      await rotationsManagerFsApi.create(plannerPayload);

      await refrescarDatos(selectedGroupId);
      toast.success(`${nombre} agregado correctamente`);
    } catch (error) {
      console.error("Error al agregar el UserBalancer:", error);
      toast.error(error?.message || "Error al agregar el UserBalancer");
      await refrescarDatos(selectedGroupId);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const eliminar = async (userId) => {
    await payrollApi.removeUserBalancer(userId);
    await rotationsManagerApi.remove(userId);
    await rotationsManagerFsApi.remove(userId);
  };

  const delUserBalancer = async () => {
    if (!selectedUserId) {
      toast.error("Para eliminar un UserBalancer primero debe seleccionarlo");
      return;
    }

    if (savingRef.current) return;

    const userId = selectedUserId;
    savingRef.current = true;

    try {
      const result = await Swal.fire({
        title: "¿Realmente desea eliminar el userBalancer seleccionado?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "No estoy seguro",
        denyButtonText: `Confirmar`,
        footer: '<h6>Gestión Manager Citytv</h6>',
      });

      if (!result.isDenied) return;

      setIsSaving(true);
      await eliminar(userId);
      setSelectedUserId(null);
      await refrescarDatos(selectedGroupId);
      toast.success("UserBalancer eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el UserBalancer:", error);
      toast.error(error?.message || "Error al eliminar el UserBalancer");
      await refrescarDatos(selectedGroupId);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <>
     <Toaster />
    <div className="contenPAYROLL">
    <h3 className="subTitulo1">Grupos o Áreas </h3>
      <div className="sectionAdd">

        <ul className='ulListado'>
            {
                groups?.map((group)=>{
                  const count = balancerCountsByGroup[String(group._id)] ?? 0;

                  return (
                    <li
                      key={group._id}
                      className={`contentForma groupRow${selectedGroupId === group._id ? " activo" : ""}`}
                      onClick={() => showUsersGroup(group._id)}
                    >
                      <img src={group.logo} alt={group.nombre} className='img-cam'/>
                      {group.nombre}
                      {count > 0 && (
                        <span
                          className="balancer-count"
                          title={`${count} UserBalancer(s)`}
                          aria-label={`${count} UserBalancers en ${group.nombre}`}
                        >
                          {count}
                        </span>
                      )}
                    </li>
                  );
                })
            }

        </ul>

      </div>

      <div className="sectionListPayroll">
      <h3 className="subTitulo2">Usuarios inactivos o desactivados</h3>
        <ul className='ListUL2'>

          {
             groupPayroll.map((payroll)=>(
              payroll.activo==false ?
              <div className="sb" key={payroll._id} >
                <div className="subGrupo">{"*"}</div>
                 <li className='ListLI' key={payroll._id}> {payroll.nombres} {payroll.apellidos}</li>
              </div>
              : null
             ))

          }
        </ul>

        <h3 className="subT">Usuarios para equilibrar el grupo</h3>
        <ul className='ListUL2'>

          {
             groupPayroll.map((payroll)=>(
              isBalancerUser(payroll) ?
              <div className="sb" key={payroll._id}>
                <div className="subGrupo">{"*"}</div>
                 <li
                   className={`ListLI${selectedUserId === payroll._id ? " activo11" : ""}`}
                   key={payroll._id}
                   onClick={() => changeID(payroll._id)}
                 >
                   {payroll.nombres} {payroll.apellidos}
                 </li>
              </div>
              :null
             ))

          }
        </ul>

      </div>
    </div>
    <div className="btns">
        <div className={`mas${isSaving ? " is-saving" : ""}`} onClick={()=>addUserBalancer()}><img src={Plus} alt="Plus" className='img-plus'/></div>
        <div className={`menos${isSaving ? " is-saving" : ""}`} onClick={()=>delUserBalancer()}><img src={Menos} alt="Plus" className='img-plus'/></div>
    </div>
    </>
  )
}

export default UserBalancerContent

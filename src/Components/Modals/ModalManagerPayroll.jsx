/* eslint-disable react/prop-types */

/* ESTILOS */
import "./ModalManagerPayroll.css";

/* IMAGENES */
import Face from "../../assets/face.svg";
import Calendar from "../../assets/Calendar-withe.svg";
import Mobile from "../../assets/mobile-withe.svg";
import Documents from "../../assets/document-withe.svg";
import Enterprise from "../../assets/enterprise.svg";
import Pulse from "../../assets/Pulse.svg";
import Annita from "../../assets/imageLess.jpeg";
import Pencil from "../../assets/pencil.svg";
import Save from "../../assets/bxs-save.svg";

/* DEPENDENCIAS */
import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

export default function ModalManagerPayroll({ id, op, idGrupo }) {
  /* Estados para los DatePickers */
  const [startDateNacimiento, setStartDateNacimiento] = useState(new Date());
  const [startDateIngreso, setStartDateIngreso] = useState(new Date());

  /* Estados para las respuestas de la API */
  const [data, setData] = useState([]);
  const [dataDos, setDataDos] = useState({});

  /* Estado para la palabra activo o inactivo según el estado */
  const [estado, setEstado] = useState(true);

  /* Estado para la foto de perfil (Base64 o imagen por defecto) */
  const [foto, setFoto] = useState(Annita);

  /* Referencias de inputs (todas declaradas correctamente para evitar errores) */
  const nombresRef = useRef();
  const apellidosRef = useRef();
  const edadRef = useRef();
  const nacimientoRef = useRef(); // <-- Agregada para evitar errores en las validaciones comentadas
  const generoRef = useRef();
  const civilRef = useRef();
  const celPrioritarioRef = useRef();
  const celAuxRef = useRef();
  const fijoRef = useRef();
  const dirRef = useRef();
  const emailRef = useRef();
  const ccRef = useRef();
  const pasaporteRef = useRef();
  const profesionalRef = useRef();
  const cargoRef = useRef();
  const grupoRef = useRef();
  const ingresoRef = useRef(); // <-- Agregada para el datepicker de ingreso
  const rhRef = useRef();
  const contactoPrincipalRef = useRef();
  const contactoSecundarioRef = useRef();
  const estadoRef = useRef();
  const mainplannerRef = useRef();
  const sbRef = useRef();
  const fileInputRef = useRef(); // Referencia para el input file oculto

  // -------------------------------------------------------------------------------------------------------
  // FUNCIONES DE API Y LÓGICA
  // -------------------------------------------------------------------------------------------------------

  const obtenerListadoGrupos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/groups");
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener grupos:", error);
    }
  };

  const obtenerSinglePayroll = async () => {
    if (!id) return;
    try {
      const response = await axios.get(`http://localhost:3000/api/payroll/${id}`);
      setDataDos(response.data);
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  };

  const modifyEstate = (e) => {
    setEstado(e.target.value === "true");
  };

  // Función para manejar la selección de la imagen y convertirla a Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result); // Guardamos la imagen en Base64 en el estado
      };
      reader.readAsDataURL(file);
    }
  };

  const enviar = async (usNombre, usApellido, userId, grupo, grupoId, scName, scID, ts, tg, ac) => {
    await axios.post("http://localhost:3000/api/rotationsmanager/", {
      nombreusuario: `${usNombre} ${usApellido}`.trim(),
      userid: userId,
      groupname: grupo,
      groupid: grupoId,
      schemaname: scName,
      schemaid: scID,
      totalschema: ts,
      totalgroup: tg,
      actual: ac,
      dayKey: new Date(),
    });
  };

  const enviarFS = async (usNombre, usApellido, userId, grupo, grupoId, scName, scID, ts, tg, ac) => {
    await axios.post("http://localhost:3000/api/rotationsmanager-fs/", {
      nombreusuario: `${usNombre} ${usApellido}`.trim(),
      userid: userId,
      groupname: grupo,
      groupid: grupoId,
      schemaname: scName,
      schemaid: scID,
      totalschema: ts,
      totalgroup: tg,
      actual: ac,
      dayKey: new Date(),
    });
  };

  const actualizar = async () => {
    return await axios.put(`http://localhost:3000/api/rotationsmanager/payroll/${id}`, {
      username: `${nombresRef.current.value} ${apellidosRef.current.value}`.trim(),
      groupname: grupoRef.current.value,
      groupid: grupoRef.current.value,
    });
  };

  const actualizarFS = async () => {
    return await axios.put(`http://localhost:3000/api/rotationsmanager-fs/payroll/${id}`, {
      username: `${nombresRef.current.value} ${apellidosRef.current.value}`.trim(),
      groupname: grupoRef.current.value,
      groupid: grupoRef.current.value,
    });
  };

  const enviarFormulario = async () => {
    /* VALIDACIONES */
    if (nombresRef.current.value === "") {
      toast.error("El campo nombres no puede estar vacio");
      nombresRef.current.focus();
    }
    /*
    else if(apellidosRef.current.value=="")
    {
      toast.error("El campo apellidos no puede estar vacio");
      apellidosRef.current.focus();
    }
    else if(edadRef.current.value=="")
    {
      toast.error("El campo edad no puede estar vacio");
      edadRef.current.focus();
    }
    else if(nacimientoRef.current.input.value=="")
    {
      toast.error("El campo fecha de nacimiento no puede estar vacio");
      nacimientoRef.current.input.focus();
    }
    else if(celPrioritarioRef.current.value=="")
    {
      toast.error("Debe especificar un número celular prioritario");
      celPrioritarioRef.current.focus();
    }
    else if(celAuxRef.current.value=="")
    {
      toast.error("Debe especificar un número celular auxiliar");
      celAuxRef.current.focus();
    }
    else if(dirRef.current.value=="")
    {
      toast.error("Debe especificar una dirección de domicilio");
      dirRef.current.focus();
    }
    else if(emailRef.current.value=="")
    {
      toast.error("Debe especificar una dirección de correo electrónico");
      emailRef.current.focus();
    }
    else if(ccRef.current.value=="")
    {
      toast.error("Debe especificar un número de documento");
      ccRef.current.focus();
    }
    else if(cargoRef.current.value=="")
    {
      toast.error("Debe especificar el cargo del empleado");
      cargoRef.current.focus();
    }
    else if(rhRef.current.value=="")
    {
      toast.error("Debe especificar el RH del empleado");
      rhRef.current.focus();
    }
    else if(contactoPrincipalRef.current.value=="")
    {
      toast.error("Debe especificar la información de contácto de alguien para contactárlo en caso de emergencia");
      contactoPrincipalRef.current.focus();
    }
    else if(contactoSecundarioRef.current.value=="")
    {
      toast.error("Debe especificar la información de un contácto auxiliar para contactárlo en caso de emergencia");
      contactoSecundarioRef.current.focus();
    }
    */
    else {
      try {
        if (op == 0) {
          const response = await axios.post("http://localhost:3000/api/payroll/", {
            Nombres: nombresRef.current.value,
            Apellidos: apellidosRef.current.value,
            Edad: edadRef.current.value,
            FechaDeNacimiento: startDateNacimiento,
            Genero: generoRef.current.value,
            EstadoCivil: civilRef.current.value,
            CelularPrioritario: celPrioritarioRef.current.value,
            CelularAux: celAuxRef.current.value,
            TelefonoFijo: fijoRef.current.value,
            DireccionResidencia: dirRef.current.value,
            Email: emailRef.current.value,
            Cc: ccRef.current.value,
            Pasaporte: pasaporteRef.current.value,
            TarjetaProfesional: profesionalRef.current.value,
            Cargo: cargoRef.current.value,
            Grupo: grupoRef.current.value,
            GrupoID: grupoRef.current.value,
            FechaIngreso: startDateIngreso,
            RH: rhRef.current.value,
            ContactoPrincipal: contactoPrincipalRef.current.value,
            ContactoAux: contactoSecundarioRef.current.value,
            Activo: estadoRef.current.value === "true",
            Mainplanner: mainplannerRef.current.value,
            SubGrupo: parseInt(sbRef.current.value) || 1,
            foto: foto === Annita ? "" : foto, // Guardamos la foto si se seleccionó una
          });

          const newUserId = response.data._id;
          await enviar(nombresRef.current.value, apellidosRef.current.value, newUserId, grupoRef.current.value, grupoRef.current.value, "------------", "------------", 0, 0, 0);
          await enviarFS(nombresRef.current.value, apellidosRef.current.value, newUserId, grupoRef.current.value, grupoRef.current.value, "------------", "------------", 0, 0, 0);
          
          toast.success("Nuevo trabajador agregado al sistema correctamente");
        } else if (op == 1) {
          await axios.put(`http://localhost:3000/api/payroll/${id}`, {
            Nombres: nombresRef.current.value,
            Apellidos: apellidosRef.current.value,
            Edad: edadRef.current.value,
            FechaDeNacimiento: startDateNacimiento,
            Genero: generoRef.current.value,
            EstadoCivil: civilRef.current.value,
            CelularPrioritario: celPrioritarioRef.current.value,
            CelularAux: celAuxRef.current.value,
            TelefonoFijo: fijoRef.current.value,
            DireccionResidencia: dirRef.current.value,
            Email: emailRef.current.value,
            Cc: ccRef.current.value,
            Pasaporte: pasaporteRef.current.value,
            TarjetaProfesional: profesionalRef.current.value,
            Cargo: cargoRef.current.value,
            Grupo: grupoRef.current.value,
            GrupoID: grupoRef.current.value,
            FechaIngreso: startDateIngreso,
            Rh: rhRef.current.value,
            ContactoPrincipal: contactoPrincipalRef.current.value,
            ContactoAux: contactoSecundarioRef.current.value,
            Activo: estadoRef.current.value === "true",
            Mainplanner: mainplannerRef.current.value,
            SubGrupo: parseInt(sbRef.current.value) || 1,
            foto: foto === Annita ? "" : foto,
          });

          await actualizar();
          await actualizarFS();
          await obtenerSinglePayroll();
          toast.success("Usuario actualizado correctamente");
        }
      } catch (error) {
        console.error("Error al procesar el formulario:", error);
        toast.error("Hubo un error al procesar la información");
      }
    }
  };

  // -------------------------------------------------------------------------------------------------------
  // EFECTOS DE CICLO DE VIDA
  // -------------------------------------------------------------------------------------------------------

  useEffect(() => {
    obtenerListadoGrupos();
  }, []);

  useEffect(() => {
    if (op == 1 && id) {
      obtenerSinglePayroll();
    }
  }, [id, op]);

  useEffect(() => {
    if (op == 1 && dataDos && Object.keys(dataDos).length > 0) {
      if (nombresRef.current) nombresRef.current.value = dataDos.nombres || "";
      if (apellidosRef.current) apellidosRef.current.value = dataDos.apellidos || "";
      if (edadRef.current) edadRef.current.value = dataDos.edad || "";
      if (generoRef.current) generoRef.current.value = dataDos.genero || "Femenino";
      if (civilRef.current) civilRef.current.value = dataDos.estadoCivil || "Soltero";
      if (celPrioritarioRef.current) celPrioritarioRef.current.value = dataDos.celularPrioritario || "";
      if (celAuxRef.current) celAuxRef.current.value = dataDos.celularAux || "";
      if (fijoRef.current) fijoRef.current.value = dataDos.telefonoFijo || "";
      if (dirRef.current) dirRef.current.value = dataDos.direccionResidencia || "";
      if (emailRef.current) emailRef.current.value = dataDos.email || "";
      if (ccRef.current) ccRef.current.value = dataDos.cc || "";
      if (pasaporteRef.current) pasaporteRef.current.value = dataDos.pasaporte || "";
      if (profesionalRef.current) profesionalRef.current.value = dataDos.tarjetaProfesional || "";
      if (cargoRef.current) cargoRef.current.value = dataDos.cargo || "";
      if (grupoRef.current) grupoRef.current.value = dataDos.grupoID || idGrupo || "";
      if (rhRef.current) rhRef.current.value = dataDos.RH || "";
      if (contactoPrincipalRef.current) contactoPrincipalRef.current.value = dataDos.contactoPrincipal || "";
      if (contactoSecundarioRef.current) contactoSecundarioRef.current.value = dataDos.contactoAux || "";
      if (estadoRef.current) estadoRef.current.value = String(dataDos.activo);
      if (mainplannerRef.current) mainplannerRef.current.value = dataDos.mainplanner || "Main planner 1";
      if (sbRef.current) sbRef.current.value = dataDos.subGrupo || 1;

      if (dataDos.fechaDeNacimiento) {
        setStartDateNacimiento(new Date(dataDos.fechaDeNacimiento));
      }
      if (dataDos.fechaIngreso) {
        setStartDateIngreso(new Date(dataDos.fechaIngreso));
      }

      // Si el trabajador tiene foto guardada, la cargamos; de lo contrario usamos Annita
      if (dataDos.foto) {
        setFoto(dataDos.foto);
      } else {
        setFoto(Annita);
      }

      setEstado(Boolean(dataDos.activo));
    }
  }, [dataDos, op, idGrupo]);

  return (
    <>
      <Toaster />
      <div className="containerGestionPersonal">
        <div className="cuerpoModalPayroll">
          {/* COLUMNA 1: Datos Personales y Contacto */}
          <div className="column1">
            <div className="sbTitle">
              <img src={Face} alt="face" className="img-sbTitle" />
              Información Personal
            </div>
            <div className="row">
              <div className="columA">Nombres</div>
              <div className="columB">
                <input type="text" name="Nombres" className="input-normal" ref={nombresRef} />
              </div>
            </div>

            <div className="row">
              <div className="columA">Apellidos</div>
              <div className="columB">
                <input type="text" name="Apellidos" className="input-normal" ref={apellidosRef} />
              </div>
            </div>

            <div className="row">
              <div className="columA">Edad</div>
              <div className="columB">
                <input type="text" name="Edad" className="input-normal" ref={edadRef} />
              </div>
            </div>

            <div className="row">
              <div className="columA">Fecha de Nacimiento</div>
              <div className="columB">
                <DatePicker
                  className="input-especial"
                  selected={startDateNacimiento}
                  onChange={(date) => setStartDateNacimiento(date)}
                  showYearDropdown
                  dateFormatCalendar="MMMM"
                  yearDropdownItemNumber={50}
                  scrollableYearDropdown
                  ref={nacimientoRef}
                />
                <img src={Calendar} alt="Calendar" className="img-Calendar" />
              </div>
            </div>

            <div className="row">
              <div className="columA">Género</div>
              <div className="columB">
                <select name="Genero" className="input-normal" ref={generoRef}>
                  <option value={"Femenino"}>Femenino</option>
                  <option value={"Masculino"}>Masculino</option>
                  <option value={"Otro"}>Otro</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="columA">Estado Civil</div>
              <div className="columB">
                <select name="EstadoCivil" className="input-normal" ref={civilRef}>
                  <option value={"Soltero"}>Soltero</option>
                  <option value={"Casado"}>Casado</option>
                  <option value={"Otro"}>Otro</option>
                </select>
              </div>
            </div>

            <br />

            <div className="sbTitle">
              <img src={Mobile} alt="contacto" className="img-sbTitle" />
              Contacto
            </div>

            <div className="row">
              <div className="columA">Celular Prioritario</div>
              <div className="columB">
                <input type="text" name="celularP" className="input-normal" ref={celPrioritarioRef} />
              </div>
            </div>

            <div className="row">
              <div className="columA">Celular Auxiliar</div>
              <div className="columB">
                <input type="text" name="celularAux" className="input-normal" ref={celAuxRef} />
              </div>
            </div>

            <div className="row">
              <div className="columA">Teléfono Fijo</div>
              <div className="columB">
                <input type="text" name="telFijo" className="input-normal" ref={fijoRef} />
              </div>
            </div>

            <div className="row">
              <div className="columA">Dirección Residencia</div>
              <div className="columB">
                <textarea name="direccion" className="input-normal-texbloc" ref={dirRef}></textarea>
              </div>
            </div>

            <div className="row">
              <div className="columA">E-mail</div>
              <div className="columB">
                <input type="text" name="e-mail" className="input-normal" ref={emailRef} />
              </div>
            </div>
          </div>

          {/* COLUMNA 2: Documentos, Empresa y Emergencia */}
          <div className="column2">
            <div className="sbTitle">
              <img src={Documents} alt="documentos" className="img-sbTitle" />
              Documentos
            </div>

            <div className="row">
              <div className="columA">C.C</div>
              <div className="columB">
                <input type="text" name="c.c" className="input-normal" ref={ccRef} />
              </div>
            </div>

            <div className="row">
              <div className="columA">Pasaporte</div>
              <div className="columB">
                <input type="text" name="pasaporte" className="input-normal" ref={pasaporteRef} />
              </div>
            </div>

            <div className="row">
              <div className="columA">Tarjeta Profesional</div>
              <div className="columB">
                <input type="text" name="tarjetaProfesional" className="input-normal" ref={profesionalRef} />
              </div>
            </div>

            <br />

            <div className="sbTitle">
              <img src={Enterprise} alt="empresa" className="img-sbTitle" />
              Empresa
            </div>

            <div className="row">
              <div className="columA">Cargo o Función</div>
              <div className="columB">
                <input type="text" name="cargo" className="input-normal" ref={cargoRef} />
              </div>
            </div>

            <div className="row">
              <div className="columA">Grupo o Área</div>
              <div className="columB">
                <select name="Grupo" className="input-normal" ref={grupoRef}>
                  {data?.map((group) => (
                    <option value={group._id} key={group._id}>
                      {group.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="columA">Fecha de Ingreso</div>
              <div className="columB">
                <DatePicker
                  className="input-especial"
                  selected={startDateIngreso}
                  onChange={(date) => setStartDateIngreso(date)}
                  showYearDropdown
                  dateFormatCalendar="MMMM"
                  yearDropdownItemNumber={50}
                  scrollableYearDropdown
                  ref={ingresoRef}
                />
                <img src={Calendar} alt="Calendar" className="img-Calendar" />
              </div>
            </div>

            <br />

            <div className="sbTitle">
              <img src={Pulse} alt="emergencia" className="img-sbTitle" />
              Emergencia
            </div>

            <div className="row">
              <div className="columA">RH</div>
              <div className="columB">
                <input type="text" name="RH" className="input-normal" ref={rhRef} />
              </div>
            </div>

            <div className="row">
              <div className="columA">Contacto Principal</div>
              <div className="columB">
                <textarea name="emergenciaPrincipal" className="input-normal-texbloc" ref={contactoPrincipalRef}></textarea>
              </div>
            </div>

            <div className="row">
              <div className="columA">Contacto Secundario</div>
              <div className="columB">
                <textarea name="emergenciaSecundario" className="input-normal-texbloc" ref={contactoSecundarioRef}></textarea>
              </div>
            </div>
          </div>

          {/* COLUMNA 3: Imagen, Estado, Mainplanner y Guardado */}
          <div className="column3">
            {/* Input de archivo oculto que se activa al hacer clic en el lápiz o la foto */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              accept="image/*" 
              onChange={handleImageChange} 
            />

            {/* Imagen de perfil */}
            <img 
              src={foto} 
              alt="User" 
              className={estado ? "img-user" : "userSepia"} 
              style={{ cursor: "pointer" }}
              onClick={() => fileInputRef.current.click()}
            />
            
            {/* Icono del lápiz para activar la selección de imagen */}
            <img 
              src={Pencil} 
              alt="Edit Photo" 
              className="img-editPhoto" 
              onClick={() => fileInputRef.current.click()}
            />  

            <h3>{op == 0 ? "----------------------------" : `${dataDos.nombres || ""} ${dataDos.apellidos || ""}`}</h3>
            
            <div className={estado ? "estadoUp" : "estadoDown"}>
              {estado ? "Activo" : "Inactivo"}
            </div>

            <div className="row2">
              <div className="columB">
                <select name="Estado" className="input-normal2" ref={estadoRef} onChange={modifyEstate}>
                  <option value={"true"}>Activo</option>
                  <option value={"false"}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="etiqueta">Mainplanner</div>
            <div className="row2">
              <div className="columB">
                <select name="Mainplanner" className="input-normal2" ref={mainplannerRef}>
                  <option value={"Main planner 1"}>Main planner 1</option>
                  <option value={"Main planner 2"}>Main planner 2</option>
                </select>
              </div>
            </div>

            <div className="etiqueta">Sub Grupo</div>
            <div className="row2">
              <div className="columB">
                <select name="subgrupo" className="input-normal2" ref={sbRef}>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="seccionButons2">
              <div className="containerSingleButtom">
                <img src={Save} alt="save" className="img-butom-save" onClick={enviarFormulario} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
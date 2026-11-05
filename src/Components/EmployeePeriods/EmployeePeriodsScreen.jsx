import DatePicker from "react-datepicker";
import { Toaster } from "react-hot-toast";
import PropTypes from "prop-types";

import {
  NO_GROUP,
  useEmployeePeriods,
} from "../../Custom_Hooks/useEmployeePeriods";

/* IMAGENES */
import Avatar from "../../assets/avatar.webp";
import calendar from "../../assets/Calendar-withe.svg";
import Plus from "../../assets/Plus.svg";
import Edit from "../../assets/pencil.svg";
import Delete from "../../assets/trash.svg";
import Brush from "../../assets/brush.svg";

/**
 * Pantalla genérica de "periodos por empleado".
 *
 * Reproduce el mismo marcado y las mismas clases CSS que las siete pantallas
 * originales (permisos, licencias, incapacidades, compensatorios, descansos,
 * vacaciones y CV); cada página solo aporta su configuración.
 *
 * El CSS NO se importa aquí: cada página conserva su propio import, porque
 * Descansos usa RotationsContent.css y el resto PermissionsContent.css.
 *
 * config = {
 *   api,                        // servicio de src/api (createCrudApi)
 *   texts: {...},               // títulos y mensajes
 *   avatarAlt,                  // texto alternativo de la imagen
 *   loadPeople,                 // opcional: cómo cargar el personal del grupo
 *   employeeNameFromSelection,  // opcional: CV usa el nombre del trabajador
 *   requireRecordToEdit,        // opcional: CV exige seleccionar un registro
 *   includeVirtualUsers,        // opcional: no filtrar los UserBalancer
 *   formatRecordLabel,          // opcional: texto de cada ítem de la lista
 * }
 */
export default function EmployeePeriodsScreen({ config }) {
  const {
    api,
    texts = {},
    avatarAlt = "Permissions",
    loadPeople,
    employeeNameFromSelection = false,
    requireRecordToEdit = false,
    includeVirtualUsers = false,
    formatRecordLabel = (record) => `- ${record?.Nombre ?? ""}`,
  } = config;

  const {
    groups,
    groupId,
    people,
    records,
    yearDate,
    employeeName,
    rangeStart,
    rangeEnd,
    nameRef,
    observationRef,
    setRangeStart,
    setRangeEnd,
    selectGroup,
    selectEmployee,
    changeYear,
    selectRecord,
    resetForm,
    add,
    edit,
    requestRemove,
  } = useEmployeePeriods({
    api,
    texts,
    loadPeople,
    employeeNameFromSelection,
    requireRecordToEdit,
    includeVirtualUsers,
  });

  return (
    <div className="contentRotations">
      <Toaster />

      {/* Selector de grupos */}
      <div className="subTitulo">
        Grupos
        <select
          className="inputDir"
          value={groupId}
          onChange={(event) => selectGroup(event.target.value)}
        >
          <option value={NO_GROUP}>{"-----------------------------------"}</option>
          {groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Trabajador seleccionado y sus registros */}
      <div className="sectionDaily">
        <img src={Avatar} alt={avatarAlt} className="imgAvatar" />
        <h2 className="seleccionadoDaily">{employeeName}</h2>

        <div className="mainCajas">
          <div className="subTitulo">Personal del grupo</div>
          <div className="caja1">
            {people.map((person) => (
              <p
                className="item"
                key={person._id}
                onClick={() => selectEmployee(person)}
              >
                {person.nombres} {person.apellidos}
              </p>
            ))}
          </div>
        </div>

        <div className="mainCajas">
          <div className="subTitulo">
            {texts.listTitle
              ? texts.listTitle(yearDate.getFullYear())
              : `Registros del año ${yearDate.getFullYear()}`}
          </div>
          <div className="yearSelect">
            <DatePicker
              className="picker"
              selected={yearDate}
              onChange={changeYear}
              showYearPicker
              dateFormat="yyyy"
            />
          </div>
          <div className="cajaPermissions">
            <ul>
              {records.map((record) => (
                <li
                  className="itemHover"
                  key={record._id}
                  onClick={() => selectRecord(record)}
                >
                  {formatRecordLabel(record)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Calendario flotante: edita la fecha de inicio del periodo */}
      <div className="mainFloat">
        <div className="caja">
          <div className="contentCalendar">
            <DatePicker
              selected={rangeStart}
              onChange={(date) => date && setRangeStart(date)}
              inline
              showWeekNumbers
              showMonthDropdown
              startDate={rangeStart}
              endDate={rangeEnd}
            />
          </div>
        </div>
      </div>

      {/* Formulario de detalle */}
      <div className="sectionDetails">
        <div className="mainCajas2">
          <div className="caja1">
            <h5 className="titleDetail">
              {texts.fieldLabel ?? "Nombre del registro"}
            </h5>
            <input
              type="text"
              className="inputname"
              placeholder={texts.namePlaceholder}
              ref={nameRef}
            />

            <h5 className="titleCaducidad">{texts.datesLabel ?? "Caducidad"}</h5>

            <div className="contentControls">
              <img src={calendar} alt="In" className="imgCalendar" />
              <DatePicker
                className="inputIn"
                selected={rangeStart}
                onChange={(date) => date && setRangeStart(date)}
                showYearDropdown
                dateFormatCalendar="MMMM"
                yearDropdownItemNumber={50}
                scrollableYearDropdown
              />

              <img src={calendar} alt="Out" className="imgCalendar" />
              <DatePicker
                className="inputOut"
                selected={rangeEnd}
                onChange={(date) => date && setRangeEnd(date)}
                showYearDropdown
                dateFormatCalendar="MMMM"
                yearDropdownItemNumber={50}
                scrollableYearDropdown
              />
            </div>

            <h5 className="titleCaducidad">
              {texts.observationLabel ?? "Observaciones o anotaciones"}
            </h5>
            <textarea
              className="inputObservaciones"
              placeholder={texts.observationPlaceholder}
              ref={observationRef}
            />
          </div>

          {/* Botonera: limpiar, agregar, editar, eliminar */}
          <div className="cajaControls">
            <div className="seccionButons">
              <div className="containerSingleButtom">
                <img
                  src={Brush}
                  alt="brush"
                  className="img-butons"
                  onClick={() => resetForm(true)}
                />
              </div>
              <div className="containerSingleButtom">
                <img src={Plus} alt="add" className="img-butons" onClick={add} />
              </div>
              <div className="containerSingleButtom">
                <img
                  src={Edit}
                  alt="edit"
                  className="img-butons"
                  onClick={edit}
                />
              </div>
              <div className="containerDeleteButtom2">
                <img
                  src={Delete}
                  alt="delete"
                  className="img-butons"
                  onClick={requestRemove}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

EmployeePeriodsScreen.propTypes = {
  config: PropTypes.shape({
    api: PropTypes.object,
    texts: PropTypes.object,
    avatarAlt: PropTypes.string,
    loadPeople: PropTypes.func,
    employeeNameFromSelection: PropTypes.bool,
    requireRecordToEdit: PropTypes.bool,
    includeVirtualUsers: PropTypes.bool,
    formatRecordLabel: PropTypes.func,
  }).isRequired,
};

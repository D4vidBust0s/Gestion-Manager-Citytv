/* COMPONENTS */
import BaseOperations2 from "../../Components/Body-Section/Bases/BaseOperations2";
import RequirementsContent from "./RequirementsContent";

/**
 * Pantalla de requerimientos (Journal).
 * El estado compartido vive en RequirementsProvider; la interfaz en
 * RequirementsContent.
 */
export default function Requirements() {
  return (
    <div className="mainContainer">
      <BaseOperations2
        titulo="Requirements"
        content={<RequirementsContent />}
      />
    </div>
  );
}

/* COMPONENTS */
import BaseOperations2 from "../../Components/Body-Section/Bases/BaseOperations2";
import ConsolidateContent from "./ConsolidateContent";

/**
 * Pantalla de consolidación de turnos (Journal).
 * La lógica y la interfaz viven en ConsolidateContent.
 */
export default function Consolidate() {
  return (
    <div className="mainContainer">
      <BaseOperations2
        titulo="Consolidate"
        content={<ConsolidateContent />}
      />
    </div>
  );
}

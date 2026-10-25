import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck } from "@fortawesome/free-solid-svg-icons";

function money(value) {
  return `\u20B1 ${Number(value || 0).toLocaleString("en-PH")}`;
}

export default function ChooseUnit({ availableUnits, selectedUnit, unitId, setUnitId, error, onContinue }) {
  return (
    <form onSubmit={onContinue} className="assign-tenant-body">
      <div className="assign-tenant-section-title"><h3>Choose Unit</h3><p>Select an available unit to assign to the tenant.</p></div>
      <label className="assign-tenant-field">
        Available Unit <b>*</b>
        <select value={unitId} onChange={(event) => setUnitId(event.target.value)} disabled={!availableUnits.length}>
          {availableUnits.length ? availableUnits.map((unit) => <option key={unit.unit_id} value={unit.unit_id}>{unit.unit}</option>) : <option value="">No available units</option>}
        </select>
      </label>
      {selectedUnit && <div className="assign-unit-preview">
        <div className="assign-unit-preview-top"><span>Selected Unit</span><b><FontAwesomeIcon icon={faCheck} /> Available</b></div>
        <h3>{selectedUnit.unit}</h3>
        <div className="assign-unit-rent"><span>Monthly Rent</span><strong>{money(selectedUnit.unit_cost)}</strong></div>
      </div>}
      {!availableUnits.length && <p className="assign-tenant-error">There are no available units to assign.</p>}
      {error && <p className="assign-tenant-error" role="alert">{error}</p>}
      <footer className="assign-tenant-actions">
        <button type="button" className="assign-tenant-back" disabled>Back</button>
        <button type="submit" className="assign-tenant-continue" disabled={!selectedUnit}>Continue <FontAwesomeIcon icon={faArrowRight} /></button>
      </footer>
    </form>
  );
}

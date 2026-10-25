import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUser } from "@fortawesome/free-solid-svg-icons";

function money(value) {
  return `\u20B1 ${Number(value || 0).toLocaleString("en-PH")}`;
}

export default function AccountCredentialsModal({ tenant, selectedUnit, username, setUsername, password, setPassword, confirmPassword, setConfirmPassword, error, setError, onBack, onCreate }) {
  return (
    <form onSubmit={onCreate} className="assign-tenant-body assign-tenant-final">
      <div className="assign-tenant-section-title"><h3>Tenant Information</h3><p>Review the tenant details before creating the account.</p></div>
      <div className="assign-tenant-person">
        <div className="assign-photo-preview">{tenant.profilePicture ? <img src={tenant.profilePicture} alt="Tenant profile" /> : <FontAwesomeIcon icon={faUser} />}</div>
        <div><strong>{tenant.fullName}</strong><span>Tenant profile</span></div>
        <em>{tenant.profilePicture ? "Profile photo" : "Optional photo"}</em>
      </div>
      <div className="assign-tenant-details">
        <div><small>Full Name</small><strong>{tenant.fullName}</strong></div>
        <div><small>Contact Number</small><strong>{tenant.contactNumber}</strong></div>
        <div><small>Email Address</small><strong>{tenant.email}</strong></div>
      </div>
      <div className="assign-tenant-section-title assign-credentials-heading"><h3>Account Credentials</h3></div>
      <label className="assign-tenant-field">Username<input required value={username} onChange={(event) => setUsername(event.target.value)} /></label>
      <label className="assign-tenant-field">Initial Password<input required type="password" autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="At least 8 characters" /></label>
      <label className="assign-tenant-field">Confirm Password<input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError(""); }} placeholder="Re-enter password" /></label>
      <div className="assign-rental-summary">
        <h3>Rental Summary</h3>
        <div><span>Assigned Unit</span><strong>{selectedUnit?.unit}</strong></div>
        <div><span>Monthly Rent</span><strong>{money(selectedUnit?.unit_cost)}</strong></div>
      </div>
      {error && <p className="assign-tenant-error" role="alert">{error}</p>}
      <footer className="assign-tenant-actions">
        <button type="button" className="assign-tenant-back" onClick={onBack}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <button type="submit" className="assign-tenant-continue">Create Tenant</button>
      </footer>
    </form>
  );
}

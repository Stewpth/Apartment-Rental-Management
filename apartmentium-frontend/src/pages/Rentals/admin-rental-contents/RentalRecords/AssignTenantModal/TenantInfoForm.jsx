import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faUpload, faUser } from "@fortawesome/free-solid-svg-icons";

export default function TenantInfoForm({ tenant, updateTenant, error, setError, onContinue, onBack }) {
  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateTenant("profilePicture", String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={onContinue} className="assign-tenant-body">
      <div className="assign-tenant-section-title"><h3>Tenant Information</h3><p>Enter the personal details of the tenant.</p></div>
      <div className="assign-photo-field">
        <span>Profile Picture <small>(Optional)</small></span>
        <div className="assign-photo-control">
          <div className="assign-photo-preview">{tenant.profilePicture ? <img src={tenant.profilePicture} alt="Tenant profile preview" /> : <FontAwesomeIcon icon={faUser} />}</div>
          <label className="assign-photo-upload"><FontAwesomeIcon icon={faUpload} /> Upload Picture<input type="file" accept="image/png,image/jpeg" onChange={handlePhoto} /></label>
          <small>JPG or PNG - Recommended square image</small>
        </div>
      </div>
      <label className="assign-tenant-field">Full Name <b>*</b><input required value={tenant.fullName} onChange={(event) => updateTenant("fullName", event.target.value)} placeholder="Enter tenant's full name" /></label>
      <label className="assign-tenant-field">Email Address <b>*</b><input required type="email" value={tenant.email} onChange={(event) => updateTenant("email", event.target.value)} placeholder="e.g. maria@email.com" /><small>Gagamitin ang email na ito para sa OTP verification.</small></label>
      <label className="assign-tenant-field">Contact Number <b>*</b><input required type="tel" value={tenant.contactNumber} onChange={(event) => updateTenant("contactNumber", event.target.value)} placeholder="e.g. 09171234567" /></label>
      {error && <p className="assign-tenant-error" role="alert">{error}</p>}
      <footer className="assign-tenant-actions">
        <button type="button" className="assign-tenant-back" onClick={onBack}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <button type="submit" className="assign-tenant-continue">Continue <FontAwesomeIcon icon={faArrowRight} /></button>
      </footer>
    </form>
  );
}

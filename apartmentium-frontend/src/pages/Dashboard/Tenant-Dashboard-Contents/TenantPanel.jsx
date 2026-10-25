import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./TenantPanel.css";

export default function TenantPanel({ title, icon, children, className = "" }) {
  return (
    <section className={`tenant-panel ${className}`}>
      <header className={`tenant-panel-header ${className}`}>
        <h2>
          <FontAwesomeIcon icon={icon} />
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

import "./ViewRequest.css";

export default function ViewRequestHeader() {
  return (
    <section className="requests-header">
      <h2 className="page-name-requests">Request Details</h2>
      <span className="requests-header-description">
        Review this tenant's request and manage its status.
      </span>
    </section>
  );
}

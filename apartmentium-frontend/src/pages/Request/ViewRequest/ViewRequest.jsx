import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheck,
  faXmark,
  faClock,
  faSpinner,
  faCircleCheck,
  faCircleXmark,
  faScrewdriverWrench,
  faClipboardCheck,
  faCommentDots,
  faTruckMoving,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../api/axios";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import "./ViewRequest.css";
import RequestAttachmentLink from "../RequestAttachmentLink";

const categories = {
  REPAIR: ["Repair", faScrewdriverWrench],
  PERMISSION: ["Permission", faClipboardCheck],
  COMPLAINT: ["Complaint", faCommentDots],
  MOVING_OUT: ["Moving Out", faTruckMoving],
};
const statuses = {
  PENDING: ["Pending", faClock],
  IN_PROGRESS: ["In Progress", faSpinner],
  RESOLVED: ["Resolved", faCircleCheck],
  REJECTED: ["Rejected", faCircleXmark],
};

export default function ViewRequest() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [moveOutDate, setMoveOutDate] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/requests/${id}`);
      setRequest(data.data);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load request.");
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  async function update(payload) {
    setSaving(true);
    try {
      await api.patch(`/admin/requests/${id}`, payload);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update request.");
    } finally {
      setSaving(false);
    }
  }
  async function confirmMoveOut() {
    if (!moveOutDate) return;
    setSaving(true);
    try {
      await api.post(`/admin/requests/${id}/confirm-move-out`, {
        actualMoveOutDate: moveOutDate,
      });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to confirm move-out.");
    } finally {
      setSaving(false);
    }
  }

  const [categoryLabel, categoryIcon] = categories[request?.category] ?? [
    "Request",
    faClipboardCheck,
  ];
  const [statusLabel, statusIcon] = statuses[request?.status] ?? [
    "Pending",
    faClock,
  ];
  const canAccept = request?.status === "PENDING";
  const acceptStatus =
    request?.category === "PERMISSION" ? "RESOLVED" : "IN_PROGRESS";
  return (
    <>
      <title>Request Details</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content">
            <div className="request-container">
              <div className="request-contents">
                <Link to="/admin/requests" className="request-back-link">
                  <FontAwesomeIcon icon={faArrowLeft} />{" "}
                  <span>Back to Requests</span>
                </Link>
                {error && (
                  <p className="payments-error" role="alert">
                    {error}
                  </p>
                )}
                {request && (
                  <>
                    <section className="view-request-header">
                      <span
                        className={`request-category ${request.category.toLowerCase()}`}
                      >
                        <FontAwesomeIcon icon={categoryIcon} /> {categoryLabel}
                      </span>
                      <h1>{request.title}</h1>
                      <p>
                        {request.reference} ·{" "}
                        {new Intl.DateTimeFormat("en-PH", {
                          dateStyle: "long",
                        }).format(new Date(request.createdAt))}
                      </p>
                    </section>
                    <section className="request-info-container">
                      <h2>Request Information</h2>
                      <div className="request-info-grid">
                        <div>
                          <strong>Tenant</strong>
                          <span>{request.tenant.fullName}</span>
                        </div>
                        <div>
                          <strong>Unit</strong>
                          <span>{request.tenant.unitNumber}</span>
                        </div>
                        <div>
                          <strong>Status</strong>
                          <span
                            className={`request-status ${request.status.toLowerCase()}`}
                          >
                            <FontAwesomeIcon icon={statusIcon} /> {statusLabel}
                          </span>
                        </div>
                        <div>
                          <strong>Category</strong>
                          <span>{categoryLabel}</span>
                        </div>
                        {request.priority && (
                          <div>
                            <strong>Priority</strong>
                            <span>{request.priority}</span>
                          </div>
                        )}
                      </div>
                    </section>
                    <section className="request-description-container">
                      <h2>Description</h2>
                      <p>{request.description}</p>
                      {request.reason && (
                        <>
                          <h3>Reason for moving out</h3>
                          <p>{request.reason}</p>
                        </>
                      )}
                      {request.requestedMoveOutDate && (
                        <p>
                          Requested move-out date:{" "}
                          {request.requestedMoveOutDate}
                        </p>
                      )}
                    </section>
                    {request.adminNotes && (
                      <section className="request-description-container">
                        <h2>Admin Notes</h2>
                        <p>{request.adminNotes}</p>
                      </section>
                    )}
                    <AdminRequestFields
                      request={request}
                      onSave={update}
                      saving={saving}
                    />
                    {!!request.attachments.length && (
                      <section className="request-description-container">
                        <h2>Attachments</h2>
                        <ul>
                          {request.attachments.map((file) => (
                            <li key={file.id}>
                              <RequestAttachmentLink file={file} />
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {!!request.updates.length && (
                      <section className="request-description-container">
                        <h2>Updates</h2>
                        {request.updates.map((update) => (
                          <p key={update.id}>
                            <strong>{update.authorName}</strong> ·{" "}
                            {update.status ?? "Note"} ·{" "}
                            {new Date(update.createdAt).toLocaleString()}{" "}
                            {update.message && `— ${update.message}`}
                          </p>
                        ))}
                      </section>
                    )}
                    {request.settlement && (
                      <SettlementPanel
                        settlement={request.settlement}
                        onRefresh={load}
                      />
                    )}
                    {request.rental.status === "ENDED" &&
                      request.rental.unitStatus === "MAINTENANCE" && (
                        <button
                          className="request-btn accept"
                          disabled={saving}
                          onClick={async () => {
                            setSaving(true);
                            try {
                              await api.post(
                                `/admin/rentals/${request.rental.id}/mark-unit-ready`,
                                {},
                              );
                              await load();
                            } catch (e) {
                              setError(
                                e.response?.data?.message ||
                                  "Unable to mark unit ready.",
                              );
                            } finally {
                              setSaving(false);
                            }
                          }}
                        >
                          Mark Unit Ready
                        </button>
                      )}
                    <div className="view-request-actions">
                      {canAccept && (
                        <>
                          <button
                            className="request-btn reject"
                            disabled={saving}
                            onClick={() =>
                              update({
                                status: "REJECTED",
                                message: "Request rejected.",
                              })
                            }
                          >
                            <FontAwesomeIcon icon={faXmark} /> Reject
                          </button>
                          <button
                            className="request-btn accept"
                            disabled={saving}
                            onClick={() =>
                              update({
                                status: acceptStatus,
                                message: "Request accepted.",
                              })
                            }
                          >
                            <FontAwesomeIcon icon={faCheck} />{" "}
                            {request.category === "PERMISSION"
                              ? "Approve Request"
                              : "Accept Request"}
                          </button>
                        </>
                      )}
                      {request.status === "IN_PROGRESS" &&
                        ["REPAIR", "COMPLAINT"].includes(request.category) && (
                          <button
                            className="request-btn accept"
                            disabled={saving}
                            onClick={() =>
                              update({
                                status: "RESOLVED",
                                message: "Request resolved.",
                              })
                            }
                          >
                            Mark Resolved
                          </button>
                        )}
                    </div>
                    {request.category === "MOVING_OUT" &&
                      request.status === "IN_PROGRESS" && (
                        <section className="request-description-container">
                          <h2>Confirm Actual Move-out</h2>
                          <label>
                            Actual move-out date{" "}
                            <input
                              type="date"
                              required
                              value={moveOutDate}
                              onChange={(event) =>
                                setMoveOutDate(event.target.value)
                              }
                            />
                          </label>
                          <button
                            className="request-btn accept"
                            disabled={saving || !moveOutDate}
                            onClick={confirmMoveOut}
                          >
                            Confirm Move-out and Create Settlement
                          </button>
                        </section>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function AdminRequestFields({ request, onSave, saving }) {
  const [priority, setPriority] = useState(request.priority || "NORMAL");
  const [notes, setNotes] = useState(request.adminNotes || "");
  useEffect(() => {
    setPriority(request.priority || "NORMAL");
    setNotes(request.adminNotes || "");
  }, [request]);
  return (
    <form
      className="request-description-container"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ priority, adminNotes: notes });
      }}
    >
      <h2>Admin Review</h2>
      <label>
        Priority{" "}
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </label>
      <label>
        Admin response or notes{" "}
        <textarea
          maxLength={2000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
      <button className="request-btn accept" disabled={saving}>
        Save Review Details
      </button>
    </form>
  );
}

function SettlementPanel({ settlement, onRefresh }) {
  const [refundAmount, setRefundAmount] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  async function submitRefund(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/admin/settlements/${settlement.id}/refunds`, {
        amount: Number(refundAmount),
        note,
      });
      setRefundAmount("");
      setNote("");
      await onRefresh();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to record refund.");
    }
  }
  async function submitAdjustment(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/admin/settlements/${settlement.id}/adjustments`, {
        amount: Number(adjustmentAmount),
        reason,
      });
      setAdjustmentAmount("");
      setReason("");
      await onRefresh();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to record adjustment.");
    }
  }
  const refunded = settlement.refunds.reduce(
    (sum, refund) => sum + Number(refund.amount),
    0,
  );
  const adjustedBalance =
    Number(settlement.originalBalance) +
    settlement.adjustments.reduce(
      (sum, adjustment) => sum + Number(adjustment.amount),
      0,
    );
  const adjustedRefundDue = Math.max(0, -adjustedBalance);
  return (
    <section className="request-description-container">
      <h2>Final Settlement Snapshot</h2>
      <p>Unpaid monthly dues: ₱{settlement.unpaidDues}</p>
      <p>Unused rent credit: ₱{settlement.unusedRentCredit}</p>
      <p>
        Existing tenant credit: ₱{settlement.existingTenantCredit} (remaining
        refund component ₱{settlement.tenantCreditRefund})
      </p>
      <p>Approved charges: ₱{settlement.approvedCharges}</p>
      <p>Credits applied: ₱{settlement.creditsApplied}</p>
      <p>Original signed balance: ₱{settlement.originalBalance}</p>
      <p>
        Adjusted balance after audited corrections: ₱
        {adjustedBalance.toFixed(2)}
      </p>
      <p>
        Amount owed: ₱{Math.max(0, adjustedBalance).toFixed(2)} · Refund due: ₱
        {adjustedRefundDue.toFixed(2)}
      </p>
      <p>
        Refund recorded: ₱{refunded.toFixed(2)} · Remaining: ₱
        {Math.max(0, adjustedRefundDue - refunded).toFixed(2)}
      </p>
      <h3>Unpaid due snapshot</h3>
      {settlement.dueSnapshots.map((due) => (
        <p key={due.billingPeriod}>
          {due.billingPeriod}: balance ₱{due.balance} (due {due.dueDate})
        </p>
      ))}
      {settlement.refunds.map((refund) => (
        <p key={refund.id}>
          Refund ₱{refund.amount} recorded{" "}
          {new Date(refund.processedAt).toLocaleString()}
          {refund.note ? ` · ${refund.note}` : ""}
        </p>
      ))}
      {settlement.adjustments.map((adjustment) => (
        <p key={adjustment.id}>
          Adjustment ₱{adjustment.amount}: {adjustment.reason}
        </p>
      ))}
      {error && <p role="alert">{error}</p>}
      {adjustedRefundDue > refunded && (
        <form onSubmit={submitRefund}>
          <h3>Record processed refund</h3>
          <label>
            Amount
            <input
              required
              type="number"
              min="0.01"
              max={(adjustedRefundDue - refunded).toFixed(2)}
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </label>
          <label>
            Note
            <input
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button type="submit" className="request-btn accept">
            Record Refund
          </button>
        </form>
      )}
      <form onSubmit={submitAdjustment}>
        <h3>Audited settlement adjustment</h3>
        <label>
          Amount (+charge / −credit)
          <input
            required
            type="number"
            step="0.01"
            value={adjustmentAmount}
            onChange={(e) => setAdjustmentAmount(e.target.value)}
          />
        </label>
        <label>
          Reason
          <input
            required
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button type="submit" className="request-btn accept">
          Record Adjustment
        </button>
      </form>
    </section>
  );
}

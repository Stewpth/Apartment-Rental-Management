import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function RequestActions({
  request,
  saving,
  onUpdate,
  onConfirmMoveOut,
  onMarkUnitReady,
}) {
  const [moveOutDate, setMoveOutDate] = useState("");
  const canAccept = request.status === "PENDING";
  const acceptStatus =
    request.category === "PERMISSION" ? "RESOLVED" : "IN_PROGRESS";
  const canResolve =
    request.status === "IN_PROGRESS" &&
    ["REPAIR", "COMPLAINT"].includes(request.category);
  const canConfirmMoveOut =
    request.category === "MOVING_OUT" && request.status === "IN_PROGRESS";
  const canMarkUnitReady =
    request.rental.status === "ENDED" &&
    request.rental.unitStatus === "MAINTENANCE";

  return (
    <>
      {canMarkUnitReady && (
        <button
          type="button"
          className="request-btn accept"
          disabled={saving}
          onClick={onMarkUnitReady}
        >
          Mark Unit Ready
        </button>
      )}
      {(canAccept || canResolve) && (
        <div className="view-request-actions">
          {canAccept && (
            <>
              <button
                type="button"
                className="request-btn reject"
                disabled={saving}
                onClick={() =>
                  onUpdate({ status: "REJECTED", message: "Request rejected." })
                }
              >
                <FontAwesomeIcon icon={faXmark} /> Reject
              </button>
              <button
                type="button"
                className="request-btn accept"
                disabled={saving}
                onClick={() =>
                  onUpdate({
                    status: acceptStatus,
                    message: "Request accepted.",
                  })
                }
              >
                <FontAwesomeIcon icon={faCheck} />
                {request.category === "PERMISSION"
                  ? "Approve Request"
                  : "Accept Request"}
              </button>
            </>
          )}
          {canResolve && (
            <button
              type="button"
              className="request-btn accept"
              disabled={saving}
              onClick={() =>
                onUpdate({ status: "RESOLVED", message: "Request resolved." })
              }
            >
              Mark Resolved
            </button>
          )}
        </div>
      )}
      {canConfirmMoveOut && (
        <section className="request-description-container">
          <h2>Confirm Actual Move-out</h2>
          <label>
            Actual move-out date
            <input
              type="date"
              required
              value={moveOutDate}
              onChange={(event) => setMoveOutDate(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="request-btn accept"
            disabled={saving || !moveOutDate}
            onClick={() => onConfirmMoveOut(moveOutDate)}
          >
            Confirm Move-out and Create Settlement
          </button>
        </section>
      )}
    </>
  );
}

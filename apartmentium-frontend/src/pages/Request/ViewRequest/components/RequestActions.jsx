import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  getTomorrowInManila,
  isAfterTodayInManila,
} from "../../../../utils/manilaDate";

export default function RequestActions({
  request,
  saving,
  onUpdate,
  onConfirmMoveOut,
  onMarkUnitReady,
}) {
  const [moveOutDate, setMoveOutDate] = useState("");
  const [moveOutDateError, setMoveOutDateError] = useState("");
  const movingOutDateCanBeApproved =
    request.category !== "MOVING_OUT" ||
    isAfterTodayInManila(request.requestedMoveOutDate);
  const canAccept = request.status === "PENDING" && movingOutDateCanBeApproved;
  const movingOutRequestExpired =
    request.status === "PENDING" &&
    request.category === "MOVING_OUT" &&
    !movingOutDateCanBeApproved;
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
  const tomorrowInManila = getTomorrowInManila();
  const earliestMoveOutDate =
    request.rental.moveInDate > tomorrowInManila
      ? request.rental.moveInDate
      : tomorrowInManila;

  return (
    <>
      {movingOutRequestExpired && (
        <p className="request-action-warning" role="alert">
          This requested move-out date has passed. Reject this request and ask
          the tenant to submit a new request with a future date.
        </p>
      )}
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
              min={earliestMoveOutDate}
              value={moveOutDate}
              disabled={saving}
              onChange={(event) => {
                setMoveOutDate(event.target.value);
                setMoveOutDateError("");
              }}
            />
          </label>
          {moveOutDateError && <p role="alert">{moveOutDateError}</p>}
          <button
            type="button"
            className="request-btn accept"
            disabled={saving || !moveOutDate}
            onClick={() => {
              if (moveOutDate < request.rental.moveInDate) {
                setMoveOutDateError(
                  "Actual move-out date cannot be before the tenant's move-in date.",
                );
                return;
              }
              if (!isAfterTodayInManila(moveOutDate)) {
                setMoveOutDateError(
                  "Move-out date must be tomorrow or later.",
                );
                return;
              }
              onConfirmMoveOut(moveOutDate);
            }}
          >
            {saving
              ? "Confirming move-out..."
              : "Confirm Move-out and Create Settlement"}
          </button>
        </section>
      )}
    </>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import api from "../../../api/axios";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import AdminRequestFields from "./components/AdminRequestFields";
import RequestActions from "./components/RequestActions";
import RequestOverview from "./components/RequestOverview";
import "./ViewRequest.css";

export default function ViewRequest() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/requests/${id}`);
      setRequest(data.data);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load request.",
      );
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
      return true;
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update request.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function confirmMoveOut(actualMoveOutDate) {
    setSaving(true);
    try {
      await api.post(`/admin/requests/${id}/confirm-move-out`, {
        actualMoveOutDate,
      });
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to confirm move-out.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function markUnitReady() {
    setSaving(true);
    try {
      await api.post(`/admin/rentals/${request.rental.id}/mark-unit-ready`, {});
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to mark unit ready.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <title>Request Details</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content">
            <div className="request-container view-request-container">
              <div className="request-contents view-request-contents">
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
                    <RequestOverview request={request} />
                    <AdminRequestFields
                      request={request}
                      onSave={update}
                      saving={saving}
                    />
                    <RequestActions
                      request={request}
                      saving={saving}
                      onUpdate={update}
                      onConfirmMoveOut={confirmMoveOut}
                      onMarkUnitReady={markUnitReady}
                    />
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

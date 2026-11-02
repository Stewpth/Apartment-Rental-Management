import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import PaymentsHeader from "./PaymentsHeader";
import PaymentsTable from "./PaymentsTable";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";

import "./Payments.css";

export default function Payment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/payments");
      setPayments(data.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load payment records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  return (
    <>
      <title>Payments</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content">
            <div className="payments-container">
              <div className="payments-contents">
                <PaymentsHeader
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
                {error ? <p className="payments-error" role="alert">{error}</p> : loading ? <LoadingState message="Loading payment records…" /> : payments.length ? <PaymentsTable payments={payments} searchTerm={searchTerm} /> : <EmptyState title="No payment records yet" description="Payment records will appear here when active rentals have monthly dues." />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

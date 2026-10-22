import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import ViewRequestHeader from "./ViewRequestHeader";
import RequestInfo from "./RequestInfo";
import RequestDescription from "./RequestDescription";

import "./ViewRequest.css";

export default function ViewRequest() {
  return (
    <>
      <title>Request</title>

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
                <ViewRequestHeader />
                <RequestInfo />
                <RequestDescription />
                <div className="view-request-actions">
                  <button className="request-btn reject">
                    <span>Reject</span>
                  </button>
                  <button className="request-btn accept">
                    <FontAwesomeIcon
                      className="request-btn-icon"
                      icon={faCheck}
                    />
                    <span>Accept Request</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

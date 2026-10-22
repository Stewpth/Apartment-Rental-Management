import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import ViewRequestHeader from "./ViewRequestHeader";
import RequestInfo from "./RequestInfo";

import "./ViewRequest.css";

export default function ViewRequest() {
  return (
    <>
      <title>Rentals</title>

      <div className="page-container">
        <Sidebar />

        <main className="page-main">
          <Header />

          <div className="page-content">
            <div className="request-container">
              <div className="request-contents">
                <Link to="/admin/requests" className="request-back-link">
                  {" "}
                  <FontAwesomeIcon icon={faArrowLeft} />
                  <span>Back to Payments</span>
                </Link>
                <ViewRequestHeader />
                <RequestInfo />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

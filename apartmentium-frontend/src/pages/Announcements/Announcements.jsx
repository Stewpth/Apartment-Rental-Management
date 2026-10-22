import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faPlus } from "@fortawesome/free-solid-svg-icons";

import "./Announcements.css";

export default function Announcements() {
  return (
    <>
      <title>Announcements</title>

      <div className="page-container">
        <Sidebar />

        <main className="page-main">
          <Header />

          <div className="page-content">
            <div className="announcements-container">
              <div className="announcements-contents">
                <div className="announcements-heading">
                  <div>
                    <h1>Announcements</h1>
                    <p>View and manage announcements for your community</p>
                  </div>
                  <button type="button" className="announcement-create-button">
                    <FontAwesomeIcon icon={faPlus} />
                    <span>New Announcement</span>
                  </button>
                </div>

                <section className="announcements-empty-state" aria-live="polite">
                  <FontAwesomeIcon className="announcements-empty-icon" icon={faBullhorn} />
                  <h2>No announcements yet</h2>
                  <p>Announcements will appear here when posted</p>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

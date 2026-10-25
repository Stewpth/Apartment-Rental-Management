import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import {
  sidebarAdminNavigation,
  sidebarTenantNavigation,
  sidebarOptions,
} from "./SidebarNavigation";

import ProfileCard from "../ui/ProfileCard";

import "./Sidebar.css";

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Change navigation depends on the user's role
  const location = useLocation();
  const userRoleNavigation = location.pathname.startsWith("/admin")
    ? sidebarAdminNavigation
    : sidebarTenantNavigation;

  function shouldUseExactMatch(path) {
    return (
      path === "/admin/dashboard" ||
      path === "/tenant/dashboard" ||
      path === "/admin/settings" ||
      path === "/tenant/settings"
    );
  }

  return (
    <div className="sidebar-wrapper">
      <aside
        className={`sidebar-container ${isSidebarOpen ? "open" : "closed"}`}
      >
        <section className="sidebar-top">
          <div className="sidebar-header">
            <FontAwesomeIcon icon={faHouse} className="sidebar-logo" />
            <h1 className="sidebar-system-name">Apartmentium</h1>
          </div>

          <nav className="sidebar-nav">
            {userRoleNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={shouldUseExactMatch(item.path)}
                aria-label={item.title}
                title={item.title}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </section>

        <section className="sidebar-bottom">
          <nav className="sidebar-options">
            {sidebarOptions.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={shouldUseExactMatch(item.path)}
                aria-label={item.title}
                title={item.title}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <ProfileCard
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </div>
        </section>
      </aside>

      <div className="sidebar-toggle-box">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="sidebar-toggle-button"
        >
          <FontAwesomeIcon
            icon={isSidebarOpen ? faChevronLeft : faChevronRight}
            className="sidebar-toggle-icon"
          />
        </button>
      </div>
    </div>
  );
}

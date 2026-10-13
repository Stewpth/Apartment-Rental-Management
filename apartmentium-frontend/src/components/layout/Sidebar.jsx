import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { sidebarNavigation, sidebarOptions } from "./SidebarNavigation";

import ProfileCard from "../ui/ProfileCard";

import "./Sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`sidebar-container ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <FontAwesomeIcon icon={faHouse} className="sidebar-logo" />
        <h1 className="sidebar-system-name">Apartmentium</h1>
      </div>

      <nav className="sidebar-nav">
        {sidebarNavigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin/dashboard"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />

            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <nav className="sidebar-options">
        {sidebarOptions.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin/settings"}
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
        <ProfileCard />
      </div>

      <div className="sidebar-toggle-box">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sidebar-toggle-button"
        >
          <FontAwesomeIcon
            icon={isOpen ? faChevronLeft : faChevronRight}
            className="sidebar-toggle-icon"
          />
        </button>
      </div>
    </aside>
  );
}

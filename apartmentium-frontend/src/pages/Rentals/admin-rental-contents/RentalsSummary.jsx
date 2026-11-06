import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDoorOpen,
  faScrewdriverWrench,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { faBuilding, faFileLines } from "@fortawesome/free-regular-svg-icons";
import "./RentalsSummary.css";

const rentalCards = [
  { key: "units", title: "Total Units", counts: 24, icon: faBuilding },
  { key: "occupied", title: "Occupied", counts: 20, icon: faUserGroup },
  { key: "available", title: "Available", counts: 4, icon: faDoorOpen },
  { key: "maintenance", title: "Maintenance", counts: 0, icon: faScrewdriverWrench },
  {
    key: "active_rentals",
    title: "Active Rentals",
    counts: 16,
    icon: faFileLines,
  },
];

export default function RentalsSummary({ units = [] }) {
  const counts = {
    units: units.length,
    occupied: units.filter((unit) => unit.tenant_id).length,
    available: units.filter((unit) => unit.isAvailable).length,
    maintenance: units.filter((unit) => unit.isMaintenance).length,
    active_rentals: units.filter((unit) => unit.status === "ACTIVE").length,
  };
  return (
    <div className="rentals-summary-grid">
      {rentalCards.map((card) => {
        return (
          <div className="rentals-summary-card" key={card.key}>
            <FontAwesomeIcon
              icon={card.icon}
              className={`rentals-card-icon ${card.key}`}
            />
            <div className="rentals-summary-card-labels">
              <span className="rentals-card-title">{card.title}</span>
              <h2 className="rentals-card-count">{counts[card.key]}</h2>
            </div>
          </div>
        );
      })}
    </div>
  );
}

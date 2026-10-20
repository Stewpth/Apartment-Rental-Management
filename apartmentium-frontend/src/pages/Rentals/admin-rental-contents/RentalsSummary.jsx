import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorOpen, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faBuilding, faFileLines } from "@fortawesome/free-regular-svg-icons";
import "./RentalsSummary.css";

// This is good to put it on database. just make the value of icon string.
const rentalCards = [
  { key: "units", title: "Total Units", counts: 24, icon: faBuilding },
  { key: "occupied", title: "Occupied", counts: 20, icon: faUserGroup },
  { key: "available", title: "Available", counts: 4, icon: faDoorOpen },
  {
    key: "active_rentals",
    title: "Active Rentals",
    counts: 16,
    icon: faFileLines,
  },
];

export default function RentalsSummary() {
  return (
    <div className="rentals-summary-grid">
      {rentalCards.map((card) => {
        return (
          <div className="rentals-summary-card" key={card.key}>
            <FontAwesomeIcon
              icon={card.icon}
              className={`rentals-card-icon ${card.key}`}
            />
            <span className="rentals-card-title">{card.title}</span>
            <h2 className="rentals-card-count">{card.counts}</h2>
          </div>
        );
      })}
    </div>
  );
}

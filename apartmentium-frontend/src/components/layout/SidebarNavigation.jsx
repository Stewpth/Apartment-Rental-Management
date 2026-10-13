import {
  faBorderAll,
  faBuilding,
  faClipboard,
  faCreditCard,
  faBullhorn,
  faCog,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export const sidebarNavigation = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: faBorderAll,
  },
  {
    title: "Rentals",
    path: "/admin/rentals",
    icon: faBuilding,
  },
  {
    title: "Payments",
    path: "/admin/payments",
    icon: faCreditCard,
  },
  {
    title: "Announcements",
    path: "/admin/announcements",
    icon: faBullhorn,
  },
  {
    title: "Requests",
    path: "/admin/requests",
    icon: faClipboard,
  },
];

export const sidebarOptions = [
  {
    title: "Settings",
    path: "/admin/settings",
    icon: faCog,
  },
  {
    title: "User",
    path: "/admin/user",
    icon: faUser,
  },
];

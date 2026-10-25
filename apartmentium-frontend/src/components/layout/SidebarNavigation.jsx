import {
  faBorderAll,
  faBuilding,
  faClipboard,
  faCreditCard,
  faBullhorn,
  faCog,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export const sidebarAdminNavigation = [
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

// Announcement should be only on the dashboard
export const sidebarTenantNavigation = [
  {
    title: "Dashboard",
    path: "/tenant/dashboard",
    icon: faBorderAll,
  },
  {
    title: "My Rentals",
    path: "/tenant/rentals",
    icon: faBuilding,
  },
  {
    title: "My Payments",
    path: "/tenant/payments",
    icon: faCreditCard,
  },
  {
    title: "My Requests",
    path: "/tenant/requests",
    icon: faClipboard,
  },
];

export const sidebarOptions = [
  {
    title: "Settings",
    path: "/admin/settings",
    tenantPath: "/tenant/settings",
    icon: faCog,
  },
  {
    title: "Profile",
    path: "/admin/profile",
    tenantPath: "/tenant/profile",
    icon: faUser,
  },
];



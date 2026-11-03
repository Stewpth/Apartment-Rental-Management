import {
  faClock,
  faSpinner,
  faCircleCheck,
  faCircleXmark,
  faScrewdriverWrench,
  faClipboardCheck,
  faCommentDots,
  faTruckMoving,
} from "@fortawesome/free-solid-svg-icons";

export const categories = {
  REPAIR: ["Repair", faScrewdriverWrench],
  PERMISSION: ["Permission", faClipboardCheck],
  COMPLAINT: ["Complaint", faCommentDots],
  MOVING_OUT: ["Moving Out", faTruckMoving],
};

export const statuses = {
  PENDING: ["Pending", faClock],
  IN_PROGRESS: ["In Progress", faSpinner],
  RESOLVED: ["Resolved", faCircleCheck],
  REJECTED: ["Rejected", faCircleXmark],
};

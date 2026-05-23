import { toast } from "react-toastify";

export const validateReservationDates = (
  reservationType,
  startTime,
  endTime
) => {
  if (reservationType === "INSTANT") return true;

  if (!startTime || !endTime) {
    toast.error("Please select start and end date");
    return false;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    toast.error("End date must be after start date");
    return false;
  }

  const diffInMs = end - start;
  const diffInDays =
    diffInMs / (1000 * 60 * 60 * 24);

  if (
    reservationType === "DAILY" &&
    diffInDays !== 1
  ) {
    toast.error(
      "Daily booking must be exactly 1 day"
    );
    return false;
  }

  if (
    reservationType === "WEEKLY" &&
    diffInDays !== 7
  ) {
    toast.error(
      "Weekly booking must be exactly 7 days"
    );
    return false;
  }

  if (
    reservationType === "MONTHLY" &&
    (diffInDays < 28 || diffInDays > 31)
  ) {
    toast.error(
      "Monthly booking must be between 28 to 31 days"
    );
    return false;
  }

  return true;
};
export const getEndDateLimits = (
  reservationType,
  startTime
) => {
  if (
    reservationType === "INSTANT" ||
    !startTime
  ) {
    return {};
  }

  const start = new Date(startTime);

  let minDate = new Date(start);
  let maxDate = new Date(start);

  if (reservationType === "DAILY") {
    minDate.setDate(start.getDate() + 1);
    maxDate.setDate(start.getDate() + 1);
  }

  if (reservationType === "WEEKLY") {
    minDate.setDate(start.getDate() + 7);
    maxDate.setDate(start.getDate() + 7);
  }

  if (reservationType === "MONTHLY") {
    minDate.setDate(start.getDate() + 28);
    maxDate.setDate(start.getDate() + 31);
  }

  const formatDate = (date) => {
    const pad = (num) =>
      String(num).padStart(2, "0");

    return `${date.getFullYear()}-${pad(
      date.getMonth() + 1
    )}-${pad(date.getDate())}`;
  };

  return {
    min: formatDate(minDate),
    max: formatDate(maxDate),
  };
};
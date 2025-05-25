export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString + "T00:00:00Z");
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };
  return date.toLocaleDateString(undefined, options);
};

export const formatDateRange = (startDate, endDate) => {
  const options = { year: "numeric", month: "short", timeZone: "UTC" };
  const start = startDate
    ? new Date(startDate + "T00:00:00Z").toLocaleDateString(undefined, options)
    : "N/A";
  const end = endDate
    ? new Date(endDate + "T00:00:00Z").toLocaleDateString(undefined, options)
    : "Present";

  if (!startDate && !endDate) return "Dates N/A";
  if (!startDate) return `Until ${end}`;
  return `${start} - ${end}`;
};

export const formatDatePickerDate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDatePickerDate = (dateString) => {
  if (
    !dateString ||
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return null; // Return null for invalid or empty strings
  }
  const parts = dateString.split("-");
  return new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2])
  );
};

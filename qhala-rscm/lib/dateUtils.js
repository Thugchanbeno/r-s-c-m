export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
export const formatDateRange = (startDate, endDate) => {
  const options = { year: "numeric", month: "short" };
  const start = startDate
    ? new Date(startDate).toLocaleDateString(undefined, options)
    : "N/A";
  const end = endDate
    ? new Date(endDate).toLocaleDateString(undefined, options)
    : "Present";
  if (!startDate && !endDate) return "Dates N/A";
  if (!startDate) return `Until ${end}`;
  return `${start} - ${end}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };
  return date.toLocaleDateString(undefined, options);
};

export const formatDateRange = (startDate, endDate) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };

  let start = "N/A";
  if (startDate) {
    const d = new Date(startDate);
    if (!isNaN(d.getTime())) {
      start = d.toLocaleDateString(undefined, options);
    }
  }

  let end = "Present";
  if (endDate) {
    const d = new Date(endDate);
    if (!isNaN(d.getTime())) {
      end = d.toLocaleDateString(undefined, options);
    }
  }

  if (!startDate && !endDate) return "Dates N/A";
  if (!startDate) return `Until ${end}`;
  return `${start} - ${end}`;
};

export const formatDatePickerDate = (date) => {
  if (!date) return "";
  // Use local time instead of UTC to avoid timezone issues
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
    return null;
  }
  const parts = dateString.split("-");
  // Use local time instead of UTC to avoid timezone shifting
  return new Date(
    parseInt(parts[0]), // year
    parseInt(parts[1]) - 1, // month (0-indexed)
    parseInt(parts[2]) // day
  );
};

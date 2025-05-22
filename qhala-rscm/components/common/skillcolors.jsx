// Enhanced skill level colors with a more refined palette
// Added hover and focus states for interactive elements
export const getSkillLevelColor = (level, { isInteractive = false } = {}) => {
  const baseClasses = getBaseColorClasses(level);

  // Add hover and focus effects for interactive elements
  if (isInteractive) {
    const hoverClasses = getHoverColorClasses(level);
    return `${baseClasses} ${hoverClasses} transition-colors duration-200 cursor-pointer`;
  }

  return baseClasses;
};

// Base colors with improved contrast ratios and matching the design system
const getBaseColorClasses = (level) => {
  switch (level) {
    case 1: // Beginner / Novice
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    case 2: // Elementary / Basic
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
    case 3: // Intermediate / Competent
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
    case 4: // Advanced / Proficient
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case 5: // Expert / Master
      return "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200";
    default: // Unknown or N/A
      return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
  }
};

// Hover state colors with consistent styling
const getHoverColorClasses = (level) => {
  switch (level) {
    case 1:
      return "hover:bg-red-100 hover:text-red-800 hover:ring-red-300";
    case 2:
      return "hover:bg-amber-100 hover:text-amber-800 hover:ring-amber-300";
    case 3:
      return "hover:bg-blue-100 hover:text-blue-800 hover:ring-blue-300";
    case 4:
      return "hover:bg-emerald-100 hover:text-emerald-800 hover:ring-emerald-300";
    case 5:
      return "hover:bg-purple-100 hover:text-purple-800 hover:ring-purple-300";
    default:
      return "hover:bg-slate-100 hover:text-slate-800 hover:ring-slate-300";
  }
};

// Get skill level name
export const getSkillLevelName = (level) => {
  switch (level) {
    case 1:
      return "Beginner";
    case 2:
      return "Elementary";
    case 3:
      return "Intermediate";
    case 4:
      return "Advanced";
    case 5:
      return "Expert";
    default:
      return "N/A";
  }
};
export const getAllocationPercentageColor = (percentage) => {
  if (percentage == null || percentage < 0) {
    // Allow > 100
    return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
  }

  if (percentage <= 20) {
    return "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200";
  } else if (percentage <= 40) {
    return "bg-lime-50 text-lime-700 ring-1 ring-inset ring-lime-200";
  } else if (percentage <= 60) {
    return "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200";
  } else if (percentage <= 80) {
    return "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";
  } else if (percentage <= 100) {
    return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
  } else {
    // Over 100% - distinct "overallocated" style
    return "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-300 border-2 border-rose-500"; // Example: Rose color, stronger border
  }
};
// New function for User Availability Status Border and Shadow Styles
export const getAvailabilityStyles = (status) => {
  switch (status) {
    case "available":
      return "border-green-400 shadow-[0_0_12px_2px_rgba(74,222,128,0.4)]";
    case "unavailable":
      return "border-red-400 shadow-[0_0_12px_2px_rgba(239,68,68,0.4)]";
    case "on_leave":
      return "border-slate-400 shadow-[0_0_12px_2px_rgba(148,163,184,0.3)]";
    default:
      return "border-transparent shadow-none";
  }
};

export const getMatchScoreColorClasses = (score, type = "text") => {
  const percentage = Math.max(0, Math.min(1, score)) * 100;

  if (type === "text") {
    if (percentage >= 75) return "text-green-600 dark:text-green-400";
    if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 25) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  }
  if (type === "bg") {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  }
  if (type === "border") {
    if (percentage >= 75) return "border-green-500";
    if (percentage >= 50) return "border-yellow-500";
    if (percentage >= 25) return "border-orange-500";
    return "border-red-500";
  }

  if (percentage >= 75) return "text-green-600 dark:text-green-400";
  if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

export const getScoreRatingText = (score) => {
  const percentage = Math.max(0, Math.min(1, score)) * 100;
  if (percentage >= 85) return "Excellent";
  if (percentage >= 70) return "Great";
  if (percentage >= 55) return "Good";
  if (percentage >= 40) return "Fair";
  if (percentage >= 25) return "Considerable";
  return "Needs Review";
};

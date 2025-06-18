export const getSkillLevelColor = (level, { isInteractive = false } = {}) => {
  const baseClasses = getBaseColorClasses(level);

  // Add hover and focus effects for interactive elements
  if (isInteractive) {
    const hoverClasses = getHoverColorClasses(level);
    return `${baseClasses} ${hoverClasses} transition-colors duration-200 cursor-pointer`;
  }

  return baseClasses;
};

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
    return "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-300 border-2 border-rose-500";
  }
};
// function for User Availability Status Border and Shadow Styles
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
  const colorScale = [
    {
      p: 0,
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-500",
      border: "border-red-500",
    },
    {
      p: 10,
      text: "text-red-500 dark:text-red-400",
      bg: "bg-red-400",
      border: "border-red-400",
    },
    {
      p: 20,
      text: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500",
      border: "border-orange-500",
    },
    {
      p: 30,
      text: "text-orange-500 dark:text-orange-400",
      bg: "bg-orange-400",
      border: "border-orange-400",
    },
    {
      p: 40,
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500",
      border: "border-amber-500",
    },
    {
      p: 50,
      text: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-400",
      border: "border-amber-400",
    },
    {
      p: 60,
      text: "text-yellow-500 dark:text-yellow-300",
      bg: "bg-yellow-400",
      border: "border-yellow-400",
    },
    {
      p: 70,
      text: "text-lime-600 dark:text-lime-400",
      bg: "bg-lime-500",
      border: "border-lime-500",
    },
    {
      p: 80,
      text: "text-lime-500 dark:text-lime-400",
      bg: "bg-lime-400",
      border: "border-lime-400",
    },
    {
      p: 90,
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-500",
      border: "border-green-500",
    },
    {
      p: 100,
      text: "text-green-500 dark:text-green-400",
      bg: "bg-green-400",
      border: "border-green-400",
    },
  ];

  let selectedColor = colorScale[0];
  for (let i = colorScale.length - 1; i >= 0; i--) {
    if (percentage >= colorScale[i].p) {
      selectedColor = colorScale[i];
      break;
    }
  }
  selectedColor = colorScale[colorScale.length - 1];
  for (let i = 0; i < colorScale.length; i++) {
    if (percentage <= colorScale[i].p) {
      selectedColor = colorScale[i];
      break;
    }
  }

  switch (type) {
    case "text":
      return selectedColor.text;
    case "bg":
      return selectedColor.bg;
    case "border":
      return selectedColor.border;
    default:
      return selectedColor.text;
  }
};

export const getScoreRatingText = (score) => {
  const percentage = Math.max(0, Math.min(1, score)) * 100;

  if (percentage >= 95) return "Excellent";
  if (percentage >= 90) return "Outstanding";
  if (percentage >= 85) return "Very Good";
  if (percentage >= 80) return "Great";
  if (percentage >= 75) return "Good";
  if (percentage >= 70) return "Above Average";
  if (percentage >= 60) return "Fairly Good";
  if (percentage >= 50) return "Average";
  if (percentage >= 40) return "Fair";
  if (percentage >= 30) return "Considerable";
  if (percentage >= 20) return "Needs Improvement";
  if (percentage >= 10) return "Poor";
  return "Very Poor";
};

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "Planning":
      return "primary";
    case "Active":
      return "success";
    case "On Hold":
      return "warning";
    case "Completed":
      return "secondary";
    case "Cancelled":
      return "error";
    default:
      return "default";
  }
};
export const darkItemStyles = {
  base: "bg-slate-900 text-slate-100 border-slate-700",
  hover: "hover:bg-slate-800 hover:text-[rgb(var(--accent))] hover:shadow-sm",
};
export const darkItemSelectedStyles = {
  base: "bg-slate-800 text-[rgb(var(--accent))] border-slate-700",
};
export const proficiencySelectedStyles = {
  base: "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] border-[rgb(var(--accent))] scale-105 shadow-sm",
};
export const selectedItemRingStyles =
  "ring-2 ring-offset-1 ring-[rgb(var(--qhala-soft-peach-darker))] ring-offset-background";

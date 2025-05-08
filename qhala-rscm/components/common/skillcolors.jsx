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

//revisit bc of the error in the global css file, find the best color to match proficiencies best.
// Helper function to determine color based on skill level
export const getSkillLevelColor = (level) => {
  switch (level) {
    case 1:
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case 2:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case 3:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case 4:
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case 5:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

import mongoose from "mongoose";

export const validateCurrentSkills = (skills) => {
  if (!Array.isArray(skills)) return "Current skills must be an array";

  for (const skill of skills) {
    if (!skill.skillId || !mongoose.Types.ObjectId.isValid(skill.skillId)) {
      return "Invalid skill ID format";
    }

    if (
      !Number.isInteger(skill.proficiency) ||
      skill.proficiency < 1 ||
      skill.proficiency > 5
    ) {
      return "Proficiency must be an integer between 1-5";
    }
  }
  return null;
};

export const validateDesiredSkills = (skillIds) => {
  if (!Array.isArray(skillIds)) return "Desired skills must be an array";

  for (const id of skillIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Invalid skill ID format";
    }
  }
  return null;
};

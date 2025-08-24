import Project from "../../models/Project.js";
import {
  connectMongoDB,
  disconnectMongoDB,
  logProgress,
  convex,
  api,
  saveMappings,
  loadMappings,
} from "./utils.js";

export async function migrateProjects() {
  console.log("Starting projects migration...");

  await connectMongoDB();

  try {
    const projects = await Project.find({}).lean();
    console.log(`Found ${projects.length} projects to migrate`);

    const mappings = loadMappings();

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      logProgress(i + 1, projects.length, "projects");

      try {
        const requiredSkills =
          project.requiredSkills
            ?.map((skill) => {
              const convexSkillId =
                mappings.skillIdMapping[skill.skillId?.toString()];
              if (!convexSkillId) {
                console.warn(
                  `⚠️ Skipping skill ${skill.skillId} for project ${project.name} (no mapping)`
                );
                return null;
              }
              return {
                skillId: convexSkillId,
                skillName: skill.skillName,
                proficiencyLevel: skill.proficiencyLevel,
                isRequired: skill.isRequired,
              };
            })
            .filter(Boolean) || [];

        const convexProject = {
          name: project.name,
          description: project.description,
          department: project.department || "Unassigned",
          function: project.function || "qhala",
          requiredSkills,
          nlpExtractedSkills: project.nlpExtractedSkills || [],
          startDate: project.startDate
            ? project.startDate.getTime()
            : undefined,
          endDate: project.endDate ? project.endDate.getTime() : undefined,
          status: project.status || "Planning",
        };

        if (project.pmId && mappings.userIdMapping[project.pmId.toString()]) {
          convexProject.pmId = mappings.userIdMapping[project.pmId.toString()];
        }

        const convexId = await convex.mutation(
          api.projects.create,
          convexProject
        );

        mappings.projectIdMapping[project._id.toString()] = convexId;
      } catch (error) {
        console.error(
          `❌ Error migrating project ${project.name}:`,
          error.message
        );
      }
    }

    saveMappings(mappings);
    console.log("✅ Projects migration completed!");
  } catch (error) {
    console.error("❌ Projects migration failed:", error);
    throw error;
  } finally {
    await disconnectMongoDB();
  }
}

// ✅ Runner
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProjects();
}
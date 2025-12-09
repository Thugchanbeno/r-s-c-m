import { ConvexClient } from "convex/browser";
import * as fs from "fs";
import * as path from "path";

const SKILLS_FILE = path.join(__dirname, "../QhalaRSCM.skills.expanded.json");
const DEPLOYMENT = process.env.CONVEX_DEPLOYMENT || "dev:cautious-cormorant-500";
const URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://cautious-cormorant-500.convex.cloud";

function normalizeSkillName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

async function seedSkills() {
  const client = new ConvexClient(URL);

  console.log(`Seeding skills to ${DEPLOYMENT} at ${URL}`);
  console.log(`Reading skills from ${SKILLS_FILE}`);

  const skillsData = JSON.parse(fs.readFileSync(SKILLS_FILE, "utf-8"));

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const collisions: string[] = [];

  for (const skill of skillsData) {
    const normalized = normalizeSkillName(skill.name);

    try {
      const mutation = await client.mutation(
        async (ctx: any) => {
          const skills = ctx.db;
          const existing = await skills
            .query("skills")
            .filter((s: any) => s.normalized_name === normalized)
            .first();

          if (existing) {
            const mergedAliases = Array.from(
              new Set([...(existing.aliases || []), ...(skill.aliases || [])])
            );

            if (mergedAliases.length > existing.aliases.length) {
              await skills.patch(existing._id, {
                aliases: mergedAliases,
                category: skill.category,
                description: skill.description,
                updated_at: new Date().toISOString(),
              });
              updated++;
            } else {
              skipped++;
            }
          } else {
            await skills.insert({
              name: skill.name,
              description: skill.description,
              category: skill.category,
              aliases: skill.aliases || [],
              normalized_name: normalized,
              created_at: new Date().toISOString(),
            });
            added++;
          }
        },
        {}
      );
    } catch (error: any) {
      if (error.message.includes("duplicate")) {
        collisions.push(skill.name);
      } else {
        console.error(`Error seeding skill ${skill.name}:`, error);
      }
    }
  }

  console.log("\n=== Seeding Complete ===");
  console.log(`Added: ${added}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);

  if (collisions.length > 0) {
    console.warn(`\nCollisions detected (${collisions.length}):`);
    collisions.slice(0, 10).forEach((name) => console.warn(`  - ${name}`));
    if (collisions.length > 10) {
      console.warn(`  ... and ${collisions.length - 10} more`);
    }
  }

  console.log(`\nTotal skills: ${added + updated + skipped}`);
}

seedSkills().catch(console.error);

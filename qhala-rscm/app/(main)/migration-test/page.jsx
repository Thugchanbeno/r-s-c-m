"use client";

import { useState } from "react";

export default function MigrationTestPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function callApi(path, method = "GET", body) {
    setLoading(true);
    try {
      const res = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setResult({ path, method, body, data });
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Migration Test Dashboard</h1>

      {/* USERS */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">Users</h2>
        <div className="space-x-2">
          <button onClick={() => callApi("/api/users")} className="btn">
            Get All Users
          </button>
          <button
            onClick={() =>
              callApi("/api/users", "POST", {
                name: "Test User",
                email: "test@example.com",
                role: "employee",
              })
            }
            className="btn-green"
          >
            Create User
          </button>
          <button
            onClick={() => callApi("/api/users/self-onboard", "POST", {
              name: "Self Onboarded",
              email: "self@example.com",
              employeeType: "permanent",
              weeklyHours: 40,
            })}
            className="btn-green"
          >
            Self Onboard
          </button>
          <button
            onClick={() => callApi("/api/users/123/allocation-summary")}
            className="btn"
          >
            Get Allocation Summary (userId=123)
          </button>
        </div>
      </section>

      {/* SKILLS */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">Skills</h2>
        <div className="space-x-2">
          <button onClick={() => callApi("/api/skills")} className="btn">
            Get All Skills
          </button>
          <button
            onClick={() =>
              callApi("/api/skills", "POST", { name: "React", category: "Frontend" })
            }
            className="btn-green"
          >
            Create Skill
          </button>
          <button onClick={() => callApi("/api/skills/distribution")} className="btn">
            Get Distribution
          </button>
          <button
            onClick={() =>
              callApi("/api/skills/suggestions", "POST", {
                description: "I build web apps with React and Node.js",
              })
            }
            className="btn"
          >
            AI Suggestions
          </button>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">Projects</h2>
        <div className="space-x-2">
          <button onClick={() => callApi("/api/projects")} className="btn">
            Get All Projects
          </button>
          <button
            onClick={() =>
              callApi("/api/projects", "POST", {
                name: "Migration Project",
                description: "Testing Convex migration",
                department: "Engineering",
              })
            }
            className="btn-green"
          >
            Create Project
          </button>
          <button
            onClick={() =>
              callApi("/api/projects/123/extract-skills", "POST", {
                description: "This project needs React and Node.js",
              })
            }
            className="btn"
          >
            Extract Skills (NLP)
          </button>
          <button
            onClick={() => callApi("/api/projects/123/utilization")}
            className="btn"
          >
            Utilization Report
          </button>
        </div>
      </section>

      {/* USER SKILLS */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">User Skills</h2>
        <div className="space-x-2">
          <button onClick={() => callApi("/api/userskills")} className="btn">
            Get My Skills
          </button>
          <button
            onClick={() =>
              callApi("/api/userskills", "PUT", {
                currentSkills: [{ skillId: "someSkillId", proficiency: 3 }],
                desiredSkillIds: ["someSkillId"],
              })
            }
            className="btn-green"
          >
            Update My Skills
          </button>
          <button onClick={() => callApi("/api/user-skills/pending-verifications")} className="btn">
            Pending Verifications
          </button>
        </div>
      </section>

      {/* ALLOCATIONS */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">Allocations</h2>
        <div className="space-x-2">
          <button onClick={() => callApi("/api/allocations")} className="btn">
            Get Allocations
          </button>
          <button
            onClick={() =>
              callApi("/api/allocations", "POST", {
                userId: "someUserId",
                projectId: "someProjectId",
                allocationPercentage: 50,
                role: "Developer",
              })
            }
            className="btn-green"
          >
            Create Allocation
          </button>
          <button
            onClick={() => callApi("/api/allocations/summary?scope=overall")}
            className="btn"
          >
            Company Utilization
          </button>
          <button
            onClick={() =>
              callApi("/api/allocations/summary?scope=department&department=Engineering")
            }
            className="btn"
          >
            Department Utilization
          </button>
          <button
            onClick={() =>
              callApi("/api/allocations/summary?scope=function&function=q-trust")
            }
            className="btn"
          >
            Function Utilization
          </button>
        </div>
      </section>

      {/* RESOURCE REQUESTS */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">Resource Requests</h2>
        <div className="space-x-2">
          <button onClick={() => callApi("/api/resourcerequests")} className="btn">
            Get Requests
          </button>
          <button
            onClick={() =>
              callApi("/api/resourcerequests", "POST", {
                projectId: "someProjectId",
                requestedUserId: "someUserId",
                requestedRole: "Developer",
                requestedPercentage: 50,
              })
            }
            className="btn-green"
          >
            Create Request
          </button>
          <button
            onClick={() =>
              callApi("/api/resourcerequests/report?status=pending_hr")
            }
            className="btn"
          >
            Requests Report
          </button>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">Notifications</h2>
        <div className="space-x-2">
          <button onClick={() => callApi("/api/notifications")} className="btn">
            Get Notifications
          </button>
          <button onClick={() => callApi("/api/notifications/count")} className="btn">
            Get Unread Count
          </button>
          <button
            onClick={() =>
              callApi("/api/notifications/preferences", "PUT", {
                preferences: {
                  new_request: true,
                  request_approved: true,
                  request_rejected: true,
                  new_allocation: true,
                  task_assigned: true,
                  task_completed: true,
                  skill_verification: true,
                  system_alert: true,
                  general_info: true,
                },
              })
            }
            className="btn-green"
          >
            Update Preferences
          </button>
        </div>
      </section>

      {/* CV CACHE */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">CV Cache</h2>
        <div className="space-x-2">
          <button onClick={() => callApi("/api/cv")} className="btn">
            Get CV Cache
          </button>
          <button
            onClick={() =>
              callApi("/api/cv", "POST", {
                fileName: "testCV.pdf",
                rawText: "John Doe, React Developer, 5 years experience",
                fileStorageId: "someStorageId",
              })
            }
            className="btn-green"
          >
            Upload CV
          </button>
          <button
            onClick={() =>
              callApi("/api/cv/extract-entities", "POST", {
                text: "Jane Doe, Python Developer, 3 years experience",
                fileName: "JaneCV.pdf",
                cacheResult: true,
              })
            }
            className="btn"
          >
            Extract Entities
          </button>
          <button
            onClick={() =>
              callApi("/api/cv/123/link", "POST", { userId: "someUserId" })
            }
            className="btn"
          >
            Link CV to User
          </button>
        </div>
      </section>

      {/* RESULTS */}
      <section className="border p-4 rounded bg-gray-50">
        <h2 className="font-semibold">Results</h2>
        {loading && <p>Loading...</p>}
        {result && (
          <pre className="text-sm bg-black text-green-400 p-2 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}

// Tailwind helper classes
const btn = "px-3 py-1 bg-blue-500 text-white rounded";
const btnGreen = "px-3 py-1 bg-green-500 text-white rounded";
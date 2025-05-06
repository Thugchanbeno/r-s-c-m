"use client";
import { useState } from "react";
import Button from "@/components/common/Button";

const AddSkillForm = ({ onSkillAdded }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, description }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Error: ${response.status}`);
      }

      setSuccess(`Skill "${result.data.name}" added successfully!`);
      // Clear form
      setName("");
      setCategory("");
      setDescription("");
      if (onSkillAdded) onSkillAdded(); // Notify parent (e.g., close form, refresh list)
    } catch (err) {
      setError(err.message || "Could not add skill.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-100 p-2 rounded">
          Error: {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600 bg-green-100 p-2 rounded">
          {success}
        </p>
      )}

      <div>
        <label
          htmlFor="skill-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Skill Name*
        </label>
        <input
          type="text"
          id="skill-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>

      <div>
        <label
          htmlFor="skill-category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Category (Optional)
        </label>
        <input
          type="text"
          id="skill-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          placeholder="e.g., Programming, Data Science, Cloud"
        />
      </div>

      <div>
        <label
          htmlFor="skill-description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description (Optional)
        </label>
        <textarea
          id="skill-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} isLoading={submitting}>
          {submitting ? "Adding..." : "Add Skill"}
        </Button>
      </div>
    </form>
  );
};

export default AddSkillForm;

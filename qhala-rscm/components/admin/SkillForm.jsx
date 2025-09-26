"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

const AddSkillForm = ({ onSkillAdded, onCancel }) => {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [aliases, setAliases] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Convex mutation
  const createSkill = useMutation(api.skills.create);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.email) {
      setError("Authentication required");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const aliasesArray = aliases
      .split(",")
      .map((alias) => alias.trim())
      .filter((alias) => alias !== "");

    try {
      const skillId = await createSkill({
        email: session.user.email,
        name,
        category: category || undefined,
        description: description || undefined,
        aliases: aliasesArray.length > 0 ? aliasesArray : undefined,
      });

      setSuccess(`Skill "${name}" added successfully!`);
      setName("");
      setCategory("");
      setDescription("");
      setAliases("");
      if (onSkillAdded) onSkillAdded();
      toast.success(`Skill "${name}" added successfully!`);
    } catch (err) {
      setError(err.message || "Could not add skill.");
      toast.error(err.message || "Could not add skill.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBaseClasses =
    "mt-1 block w-full rounded-[var(--radius)] border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] shadow-sm focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))] sm:text-sm p-2 placeholder:text-[rgb(var(--muted-foreground))] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      {error && (
        <div className="flex items-center p-3 text-sm rounded-[var(--radius)] bg-red-50 text-red-700 border border-red-200 shadow-sm">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center p-3 text-sm rounded-[var(--radius)] bg-green-50 text-green-700 border border-green-200 shadow-sm">
          <CheckCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      <div>
        <label
          htmlFor="skill-name"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Skill Name*
        </label>
        <input
          type="text"
          id="skill-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={`${inputBaseClasses.replace("p-2", "")} px-4 py-2 `}
          placeholder="e.g., JavaScript, Python"
        />
      </div>
      <div>
        <label
          htmlFor="skill-aliases"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Aliases (Optional, comma-separated)
        </label>
        <input
          type="text"
          id="skill-aliases"
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
          className={`${inputBaseClasses.replace("p-2", "")} px-4 py-2 `}
          placeholder="e.g., JS, Node, ReactJS"
        />
      </div>

      <div>
        <label
          htmlFor="skill-category"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Category (Optional)
        </label>
        <input
          type="text"
          id="skill-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${inputBaseClasses.replace("p-2", "")} px-4 py-2 `}
          placeholder="e.g., Programming, Design, Cloud"
        />
      </div>
      <div>
        <label
          htmlFor="skill-description"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Description (Optional)
        </label>
        <textarea
          id="skill-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputBaseClasses.replace("p-2", "")} px-4 py-2 `}
          placeholder="Briefly describe the skill"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          isLoading={submitting}
        >
          Add Skill
        </Button>
      </div>
    </form>
  );
};

export default AddSkillForm;

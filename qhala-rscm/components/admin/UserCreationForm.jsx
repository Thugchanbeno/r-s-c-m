"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Save, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/common/Label";
import Select from "@/components/common/Select";
import { ErrorMessage } from "@/components/user/ProfileComponents";
import { staggerChildren, fadeIn } from "@/lib/animations";

const ROLE_OPTIONS = ["admin", "pm", "hr", "employee"];
const STATUS_OPTIONS = ["available", "unavailable", "on_leave"];

const PrefilledSkills = ({ skills }) => (
  <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-muted border min-h-[60px]">
    {skills && skills.length > 0 ? (
      skills.map((skill) => (
        <span
          key={skill.id}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground"
        >
          {skill.name}
        </span>
      ))
    ) : (
      <p className="text-sm text-muted-foreground italic self-center">
        No skills were extracted.
      </p>
    )}
  </div>
);

export const UserCreationForm = ({ initialData, onBack, onSuccess }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    department: "",
    role: "employee",
    availabilityStatus: "available",
    skills: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Convex mutation
  const createUser = useMutation(api.users.create);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        title: initialData.title || "",
        skills: initialData.skills || [],
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.email) {
      setError("Authentication required");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      // Extract skill IDs if skills exist
      const skillIds = formData.skills.map(skill => skill.id).filter(Boolean);
      
      await createUser({
        email: session.user.email,
        name: formData.name,
        newUserEmail: formData.email,
        role: formData.role,
        department: formData.department,
        availabilityStatus: formData.availabilityStatus,
        skills: skillIds.length > 0 ? skillIds : undefined,
      });
      
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(err.message || "Failed to create user.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="space-y-6">
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Dismas Ombuya"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., D.Ombuya@gmail.com"
              required
            />
          </div>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Engineering"
            />
          </div>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="availabilityStatus">Availability Status</Label>
            <Select
              id="availabilityStatus"
              name="availabilityStatus"
              value={formData.availabilityStatus}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ").charAt(0).toUpperCase() +
                    status.replace("_", " ").slice(1)}
                </option>
              ))}
            </Select>
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="space-y-2">
          <Label>Normalized Skills</Label>
          <PrefilledSkills skills={formData.skills} />
        </motion.div>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex flex-col items-stretch gap-4">
        {error && <ErrorMessage message={error} />}
        {success && (
          <div className="text-sm text-green-600 text-center font-medium">
            User created successfully!
          </div>
        )}
        <div className="flex justify-between items-center">
          <Button type="button" variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={success}>
            <Save className="mr-2 h-4 w-4" /> Create User
          </Button>
        </div>
      </div>
    </motion.form>
  );
};

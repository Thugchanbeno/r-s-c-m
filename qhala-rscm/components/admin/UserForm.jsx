"use client";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

const EditUserForm = ({ userId, onUserUpdated, onCancel }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee",
    department: "",
    availabilityStatus: "available",
    authProviderId: "",
    lineManagerId: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Convex hooks
  const userData = useQuery(
    api.users.getById, 
    userId ? { id: userId } : "skip"
  );
  const allUsers = useQuery(
    api.users.getAll,
    session?.user?.email ? { email: session.user.email, search: "", limit: 1000 } : "skip"
  );
  const updateUser = useMutation(api.users.updateProfile);

  const loading = userData === undefined;

  // Handle user data from Convex query
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "employee",
        department: userData.department || "",
        availabilityStatus: userData.availabilityStatus || "available",
        authProviderId: userData.authProviderId || "",
        lineManagerId: userData.lineManagerId || null,
      });
      setError(null);
      setSuccess(null);
    }
  }, [userData]);

  // Set error if user not found
  useEffect(() => {
    if (!userId) {
      setError("No User ID provided for editing.");
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.email) {
      setError("Authentication required");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUser({
        email: session.user.email,
        id: userId,
        role: formData.role,
        department: formData.department,
        availabilityStatus: formData.availabilityStatus,
        lineManagerId: formData.lineManagerId || undefined,
      });
      
      setSuccess(`User "${formData.name}" updated successfully!`);
      toast.success(`User "${formData.name}" updated successfully!`);
      if (onUserUpdated) {
        onUserUpdated(userData);
      }
    } catch (err) {
      setError(err.message || "Could not update user.");
      toast.error(err.message || "Could not update user.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBaseClasses =
    "mt-1 block w-full rounded-[var(--radius)] border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] shadow-sm focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))] sm:text-sm p-2 placeholder:text-[rgb(var(--muted-foreground))] disabled:opacity-50 disabled:cursor-not-allowed";

  if (loading) {
    return (
      <div className="p-10 text-center min-h-[200px] flex flex-col justify-center items-center">
        <LoadingSpinner size={24} />
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          Loading user data...
        </p>
      </div>
    );
  }

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

      {/* Display-only fields */}
      <div className="border-b border-[rgb(var(--border))] pb-3 mb-3">
        <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
          Name
        </p>
        <p className="mt-1 text-base text-[rgb(var(--foreground))]">
          {formData.name || "(Not Available)"}
        </p>
      </div>
      <div className="border-b border-[rgb(var(--border))] pb-3 mb-3">
        <label className="block text-sm font-medium text-[rgb(var(--muted-foreground))]">
          Email Address
        </label>
        <p className="mt-1 text-base text-[rgb(var(--foreground))]">
          {formData.email || "(Not Available)"}
        </p>
      </div>

      {/* Editable fields */}
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Role*
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className={`${inputBaseClasses} appearance-none`}
        >
          <option value="employee">Employee</option>
          <option value="line_manager">Line Manager</option>
          <option value="pm">Project Manager</option>
          <option value="hr">HR</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="department"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Department
        </label>
        <input
          type="text"
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          className={inputBaseClasses}
          placeholder="Enter department"
        />
      </div>

      <div>
        <label
          htmlFor="availabilityStatus"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Availability Status*
        </label>
        <select
          id="availabilityStatus"
          name="availabilityStatus"
          value={formData.availabilityStatus}
          onChange={handleChange}
          required
          className={`${inputBaseClasses} appearance-none`}
        >
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="lineManagerId"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Line Manager
        </label>
        <select
          id="lineManagerId"
          name="lineManagerId"
          value={formData.lineManagerId || ""}
          onChange={handleChange}
          className={`${inputBaseClasses} appearance-none`}
        >
          <option value="">None</option>
          {allUsers && allUsers
            .filter((u) => u._id !== userId && u.role === "line_manager")
            .map((manager) => (
              <option key={manager._id} value={manager._id}>
                {manager.name}
              </option>
            ))}
        </select>
        <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
          Only users with Line Manager role will appear here
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
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
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;

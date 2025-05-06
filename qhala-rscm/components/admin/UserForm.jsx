"use client";
import { useState, useEffect, useCallback } from "react";
import Button from "@/components/common/Button"; // Adjust path
import LoadingSpinner from "@/components/common/LoadingSpinner";

// This form fetches user data and allows editing specific fields (role, department)
const EditUserForm = ({ userId, onUserUpdated, onCancel }) => {
  // Form state - initialize empty, will be filled by fetched data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee", // Default role
    department: "",
    authProviderId: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch existing user data when userId changes
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setError("No User ID provided for editing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || `Error fetching user: ${response.status}`
        );
      }
      const result = await response.json();
      if (result.success && result.data) {
        // Populate form state with fetched data
        setFormData({
          name: result.data.name || "",
          email: result.data.email || "",
          role: result.data.role || "employee",
          department: result.data.department || "",
          authProviderId: result.data.authProviderId || "",
        });
      } else {
        throw new Error(result.error || "Invalid user data received.");
      }
    } catch (err) {
      console.error("EditUserForm: Failed to load user data:", err);
      setError(`Failed to load user data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // Trigger fetch on mount and when fetchUserData changes (due to userId)

  // Handle changes only for editable fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Update only role or department
    }));
  };

  // Handle form submission (Update via PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Only send fields that are meant to be updated
        body: JSON.stringify({
          role: formData.role,
          department: formData.department,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || `Error updating user: ${response.status}`
        );
      }

      setSuccess(`User "${formData.name}" updated successfully!`);
      if (onUserUpdated) {
        onUserUpdated(result.data);
      }
      // Optionally close modal after a delay or let parent handle it via onUserUpdated
      // setTimeout(onCancel, 1500);
    } catch (err) {
      console.error("EditUserForm: Failed to update user:", err);
      setError(err.message || "Could not update user.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render loading state while fetching initial data
  if (loading) {
    return (
      <div className="p-4 text-center">
        <LoadingSpinner size={20} />
      </div>
    );
  }

  // Render form content
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      {error && (
        <p className="text-sm text-red-600 bg-red-100 p-3 rounded -mt-1 mb-3">
          Error: {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600 bg-green-100 p-3 rounded -mt-1 mb-3">
          {success}
        </p>
      )}
      <div className="border-b pb-3 mb-3">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Name
        </p>
        <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
          {formData.name || "(Not Available)"}
        </p>
      </div>
      <div className="border-b pb-3 mb-3">
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
          Email Address
        </label>
        <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
          {formData.email || "(Not Available)"}
        </p>
      </div>
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Role*
        </label>
        <select
          id="role"
          name="role" // Name matches state key
          value={formData.role}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" // Added padding
        >
          <option value="employee">Employee</option>
          <option value="pm">Project Manager</option>
          <option value="hr">HR</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="department"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Department
        </label>
        <input
          type="text"
          id="department"
          name="department" // Name matches state key
          value={formData.department}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && ( // Show cancel button only if handler is provided
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting} isLoading={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;

"use client";
import { useState, useEffect } from "react";
import { X, User, Mail, Building2, UserCheck, Save, Briefcase } from "lucide-react";
import Image from "next/image";

const UserManagementModal = ({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  users = [],
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    availabilityStatus: "",
    weeklyHours: "",
    lineManagerId: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        department: user.department || "",
        availabilityStatus: user.availabilityStatus || "available",
        weeklyHours: user.weeklyHours || "",
        lineManagerId: user.lineManagerId || "",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      weeklyHours: formData.weeklyHours ? parseInt(formData.weeklyHours) : null,
    };

    onSubmit(dataToSubmit);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-rscm-lilac/20 flex items-center justify-center">
                <User className="w-5 h-5 text-rscm-violet" />
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold text-rscm-dark-purple">
                Manage User
              </h2>
              <p className="text-xs text-gray-600">{user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
              <User className="w-3.5 h-3.5" />
              Full Name*
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
              <Mail className="w-3.5 h-3.5" />
              Email*
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
              disabled
              className="w-full px-3 py-2 bg-gray-100 rounded-md text-sm outline-none cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Role */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
                <UserCheck className="w-3.5 h-3.5" />
                Role*
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
              >
                <option value="employee">Employee</option>
                <option value="line_manager">Line Manager</option>
                <option value="pm">Project Manager</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
                <Building2 className="w-3.5 h-3.5" />
                Department*
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                required
                placeholder="e.g., Engineering"
                className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
              />
            </div>

            {/* Availability Status */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-rscm-dark-purple">
                Availability*
              </label>
              <select
                value={formData.availabilityStatus}
                onChange={(e) => setFormData((prev) => ({ ...prev, availabilityStatus: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
              >
                <option value="available">Available</option>
                <option value="partially_available">Partially Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Weekly Hours */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
                <Briefcase className="w-3.5 h-3.5" />
                Weekly Hours
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.weeklyHours}
                onChange={(e) => setFormData((prev) => ({ ...prev, weeklyHours: e.target.value }))}
                placeholder="40"
                className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Line Manager */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
              <UserCheck className="w-3.5 h-3.5" />
              Line Manager
            </label>
            <select
              value={formData.lineManagerId}
              onChange={(e) => setFormData((prev) => ({ ...prev, lineManagerId: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
            >
              <option value="">No line manager assigned</option>
              {users
                .filter((u) => u._id !== user?._id && u.role === "line_manager")
                .map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.name} {manager.department ? `- ${manager.department}` : ""}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500">
              Only users with the Line Manager role will appear in this list
            </p>
          </div>

          {/* Info Message */}
          <div className="bg-rscm-lilac/10 border border-rscm-lilac/30 rounded-md px-3 py-2">
            <p className="text-xs text-rscm-dark-purple">
              <strong>Note:</strong> For advanced user management (skills, employment details), visit the user's profile page.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rscm-violet rounded-md hover:bg-rscm-plum transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;

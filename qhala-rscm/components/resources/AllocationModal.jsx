"use client";
import { useState, useEffect } from "react";
import { X, User, Briefcase, Calendar, Percent, Save } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDatePickerDate, parseDatePickerDate } from "@/lib/dateUtils";

const AllocationModal = ({
  isOpen,
  onClose,
  onSubmit,
  allocation = null,
  users = [],
  projects = [],
  isSubmitting = false,
}) => {
  const isEditMode = !!allocation;

  const [formData, setFormData] = useState({
    userId: "",
    projectId: "",
    allocationPercentage: "",
    role: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (allocation) {
        setFormData({
          userId: allocation.userId || "",
          projectId: allocation.projectId || "",
          allocationPercentage: allocation.allocationPercentage || "",
          role: allocation.role || "",
          startDate: allocation.startDate ? formatDatePickerDate(new Date(allocation.startDate)) : "",
          endDate: allocation.endDate ? formatDatePickerDate(new Date(allocation.endDate)) : "",
        });
      } else {
        setFormData({
          userId: "",
          projectId: "",
          allocationPercentage: "",
          role: "",
          startDate: "",
          endDate: "",
        });
      }
    }
  }, [allocation, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert dates to timestamps
    const dataToSubmit = {
      ...formData,
      allocationPercentage: parseInt(formData.allocationPercentage),
      startDate: formData.startDate ? parseDatePickerDate(formData.startDate)?.getTime() : null,
      endDate: formData.endDate ? parseDatePickerDate(formData.endDate)?.getTime() : null,
    };

    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rscm-violet/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-rscm-violet" />
            </div>
            <h2 className="text-base font-semibold text-rscm-dark-purple">
              {isEditMode ? "Edit Allocation" : "Create Allocation"}
            </h2>
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
          {/* User Selection */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
              <User className="w-3.5 h-3.5" />
              User*
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
              required
              disabled={isEditMode}
              className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Project Selection */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
              <Briefcase className="w-3.5 h-3.5" />
              Project*
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectId: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name} ({project.department})
                </option>
              ))}
            </select>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Role */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-rscm-dark-purple">
                Role*
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                required
                placeholder="e.g., Developer, Designer"
                className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
              />
            </div>

            {/* Allocation Percentage */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
                <Percent className="w-3.5 h-3.5" />
                Allocation %*
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.allocationPercentage}
                onChange={(e) => setFormData((prev) => ({ ...prev, allocationPercentage: e.target.value }))}
                required
                placeholder="0-100"
                className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
                <Calendar className="w-3.5 h-3.5" />
                Start Date
              </label>
              <DatePicker
                selected={parseDatePickerDate(formData.startDate)}
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: formatDatePickerDate(date),
                  }))
                }
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
                wrapperClassName="w-full"
                showPopperArrow={false}
                isClearable
                autoComplete="off"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-rscm-dark-purple">
                <Calendar className="w-3.5 h-3.5" />
                End Date
              </label>
              <DatePicker
                selected={parseDatePickerDate(formData.endDate)}
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    endDate: formatDatePickerDate(date),
                  }))
                }
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                minDate={parseDatePickerDate(formData.startDate)}
                className="w-full px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
                wrapperClassName="w-full"
                showPopperArrow={false}
                isClearable
                autoComplete="off"
              />
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-rscm-lilac/10 border border-rscm-lilac/30 rounded-md px-3 py-2">
            <p className="text-xs text-rscm-dark-purple">
              <strong>Note:</strong> Allocation percentage represents the amount of the user's capacity assigned to this project.
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
              {isEditMode ? "Update" : "Create"} Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllocationModal;

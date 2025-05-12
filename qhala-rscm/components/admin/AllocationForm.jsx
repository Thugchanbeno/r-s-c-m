"use client";
import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { AlertCircle } from "lucide-react";
import SearchableSelectField from "@/components/common/SearchableSelectField";

const AllocationForm = ({
  onFormSubmit,
  onCancel,
  currentAllocation,
  isProcessing,
  usersList = [],
  projectsList = [],
  loadingDropdowns,
  dropdownError,
}) => {
  // Form field state remains the same
  const [userId, setUserId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [role, setRole] = useState("");
  const [allocationPercentage, setAllocationPercentage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState(null);

  // Effect to pre-fill
  useEffect(() => {
    setFormError(null);
    if (currentAllocation) {
      setUserId(
        currentAllocation.userId?._id || currentAllocation.userId || ""
      );
      setProjectId(
        currentAllocation.projectId?._id || currentAllocation.projectId || ""
      );
      setRole(currentAllocation.role || "");
      setAllocationPercentage(
        currentAllocation.allocationPercentage?.toString() || ""
      );
      setStartDate(
        currentAllocation.startDate
          ? new Date(currentAllocation.startDate).toISOString().split("T")[0]
          : ""
      );
      setEndDate(
        currentAllocation.endDate
          ? new Date(currentAllocation.endDate).toISOString().split("T")[0]
          : ""
      );
    } else {
      setUserId("");
      setProjectId("");
      setRole("");
      setAllocationPercentage("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate("");
    }
  }, [currentAllocation]);

  // Handle submit r
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!userId || !projectId || !role || !allocationPercentage) {
      setFormError(
        "User, Project, Role, and Allocation Percentage are required."
      );
      return;
    }
    const percentageNum = parseInt(allocationPercentage, 10);
    if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      setFormError("Percentage must be a number between 0 and 100.");
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setFormError("End date cannot be before start date.");
      return;
    }

    onFormSubmit({
      userId,
      projectId,
      role,
      allocationPercentage: percentageNum,
      startDate: startDate || null,
      endDate: endDate || null,
    });
  };

  // Base classes for standard inputs
  const inputBaseClasses =
    "mt-1 block w-full rounded-[var(--radius)] border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] shadow-sm focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))] sm:text-sm p-2 placeholder:text-[rgb(var(--muted-foreground))] disabled:opacity-50 disabled:cursor-not-allowed";

  // Loading state for dropdowns
  if (loadingDropdowns) {
    return (
      <div className="p-10 text-center min-h-[300px] flex flex-col justify-center items-center">
        <LoadingSpinner size={24} />
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          Loading form options...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-1 md:p-2">
      {formError && (
        <div className="flex items-center p-3 text-sm rounded-[var(--radius)] bg-red-50 text-red-700 border border-red-200 shadow-sm">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}
      {dropdownError && !loadingDropdowns && (
        <div className="flex items-center p-3 text-sm rounded-[var(--radius)] bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>Warning: {dropdownError}</span>
        </div>
      )}

      <SearchableSelectField
        label="User"
        value={userId}
        onChange={setUserId}
        options={usersList}
        optionValueKey="_id"
        optionDisplayKey="name"
        optionSecondaryKey="email"
        placeholder="Select a user"
        disabled={isProcessing}
        required={true}
      />

      <SearchableSelectField
        label="Project"
        value={projectId}
        onChange={setProjectId}
        options={projectsList}
        optionValueKey="_id"
        optionDisplayKey="name"
        placeholder="Select a project"
        disabled={isProcessing}
        required={true}
      />
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Role on Project<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className={inputBaseClasses}
          placeholder="e.g., Developer, Tester"
          disabled={isProcessing}
        />
      </div>

      <div>
        <label
          htmlFor="allocationPercentage"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Allocation Percentage (0-100%)
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="number"
          id="allocationPercentage"
          value={allocationPercentage}
          onChange={(e) => setAllocationPercentage(e.target.value)}
          required
          min="0"
          max="100"
          className={inputBaseClasses}
          placeholder="e.g., 50"
          disabled={isProcessing}
        />
      </div>

      {/* Date Inputs - Consider a dedicated DateRangePicker component later if needed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-[rgb(var(--foreground))]"
          >
            Start Date<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className={inputBaseClasses}
            disabled={isProcessing}
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-[rgb(var(--foreground))]"
          >
            End Date{" "}
            <span className="text-xs text-[rgb(var(--muted-foreground))]">
              (Optional)
            </span>
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputBaseClasses}
            disabled={isProcessing || !startDate}
          />
        </div>
      </div>

      {/* Action Buttons - Added slight top margin */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-[rgb(var(--border))] mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isProcessing}
          isLoading={isProcessing}
        >
          {currentAllocation ? "Update Allocation" : "Create Allocation"}
        </Button>
      </div>
    </form>
  );
};

export default AllocationForm;

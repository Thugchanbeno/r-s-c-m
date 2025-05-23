"use client";
import { useState } from "react";
import Button from "@/components/common/Button";
import { AlertCircle } from "lucide-react";

const RequestResourceForm = ({
  userToRequest,
  projectId,
  onSubmit,
  onCancel,
  isSubmittingRequest,
}) => {
  const [requestedRole, setRequestedRole] = useState("");
  const [requestedPercentage, setRequestedPercentage] = useState("");
  const [requestedStartDate, setRequestedStartDate] = useState("");
  const [requestedEndDate, setRequestedEndDate] = useState("");
  const [pmNotes, setPmNotes] = useState("");
  const [formError, setFormError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!requestedRole.trim()) {
      setFormError("Role on project is required.");
      return;
    }
    const percentageNum = parseInt(requestedPercentage, 10);
    if (isNaN(percentageNum) || percentageNum < 1 || percentageNum > 100) {
      setFormError("Allocation percentage must be a number between 1 and 100.");
      return;
    }

    if (
      requestedStartDate &&
      requestedEndDate &&
      new Date(requestedStartDate) > new Date(requestedEndDate)
    ) {
      setFormError("End date cannot be before start date.");
      return;
    }

    onSubmit({
      requestedRole: requestedRole.trim(),
      requestedPercentage: percentageNum,
      requestedStartDate: requestedStartDate || null,
      requestedEndDate: requestedEndDate || null,
      pmNotes: pmNotes.trim() || null,
    });
  };

  const inputBaseClasses =
    "mt-1 block w-full rounded-[var(--radius)] border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] shadow-sm focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))] sm:text-sm p-2 placeholder:text-[rgb(var(--muted-foreground))] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1 md:p-2">
      {formError && (
        <div className="flex items-center p-3 text-sm rounded-[var(--radius)] bg-red-50 text-red-700 border border-red-200 shadow-sm">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}
      <div className="p-3 rounded-[var(--radius)] bg-[rgb(var(--muted))]">
        <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
          Requesting Resource:
        </p>
        <p className="text-lg font-semibold text-[rgb(var(--foreground))]">
          {userToRequest?.name || "Selected User"}
        </p>
      </div>

      <div>
        <label
          htmlFor="requestedRole"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Role on Project*
        </label>
        <input
          type="text"
          id="requestedRole"
          value={requestedRole}
          onChange={(e) => setRequestedRole(e.target.value)}
          required
          className={inputBaseClasses}
          placeholder="e.g., Lead Developer, QA Tester"
        />
      </div>

      <div>
        <label
          htmlFor="requestedPercentage"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Allocation Percentage (1-100%)*
        </label>
        <input
          type="number"
          id="requestedPercentage"
          value={requestedPercentage}
          onChange={(e) => setRequestedPercentage(e.target.value)}
          required
          min="1"
          max="100"
          className={inputBaseClasses}
          placeholder="e.g., 50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="requestedStartDate"
            className="block text-sm font-medium text-[rgb(var(--foreground))]"
          >
            Requested Start Date (Optional)
          </label>
          <input
            type="date"
            id="requestedStartDate"
            value={requestedStartDate}
            onChange={(e) => setRequestedStartDate(e.target.value)}
            className={inputBaseClasses}
          />
        </div>
        <div>
          <label
            htmlFor="requestedEndDate"
            className="block text-sm font-medium text-[rgb(var(--foreground))]"
          >
            Requested End Date (Optional)
          </label>
          <input
            type="date"
            id="requestedEndDate"
            value={requestedEndDate}
            onChange={(e) => setRequestedEndDate(e.target.value)}
            className={inputBaseClasses}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="pmNotes"
          className="block text-sm font-medium text-[rgb(var(--foreground))]"
        >
          Notes for Approver (Optional)
        </label>
        <textarea
          id="pmNotes"
          value={pmNotes}
          onChange={(e) => setPmNotes(e.target.value)}
          rows={3}
          className={inputBaseClasses}
          placeholder="e.g., Specific expertise needed, critical phase..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-3 border-t border-[rgb(var(--border))] mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmittingRequest}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmittingRequest}
          isLoading={isSubmittingRequest}
        >
          Submit Request
        </Button>
      </div>
    </form>
  );
};

export default RequestResourceForm;

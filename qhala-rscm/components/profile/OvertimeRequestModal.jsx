"use client";
import { useState } from "react";
import { X, Clock } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const OvertimeRequestModal = ({ isOpen, onClose, userEmail }) => {
  const [projectId, setProjectId] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [overtimeDate, setOvertimeDate] = useState("");
  const [reason, setReason] = useState("");
  const [compensationType, setCompensationType] = useState("time_off");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOvertimeRequest = useMutation(api.workRequests.createOvertimeRequest);
  const projects = useQuery(
    api.projects.getAll,
    userEmail ? { email: userEmail } : "skip"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!overtimeHours || !overtimeDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(overtimeHours) <= 0) {
      toast.error("Overtime hours must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOvertimeRequest({
        email: userEmail,
        projectId: projectId || undefined,
        overtimeHours: parseFloat(overtimeHours),
        overtimeDate: new Date(overtimeDate).getTime(),
        reason,
        compensationType,
      });

      toast.success("Overtime logged successfully");
      onClose();
      
      setProjectId("");
      setOvertimeHours("");
      setOvertimeDate("");
      setReason("");
      setCompensationType("time_off");
    } catch (error) {
      toast.error(error.message || "Failed to log overtime");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-rscm-dark-purple">
              Log overtime
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Record overtime hours for approval
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-rscm-dark-purple mb-2">
              Related project <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-plum shadow-sm"
            >
              <option value="">Select a project</option>
              {projects?.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-rscm-dark-purple mb-2">
                Hours worked
              </label>
              <input
                type="number"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                required
                min="0.5"
                step="0.5"
                placeholder="e.g. 4.5"
                className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-plum shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rscm-dark-purple mb-2">
                Date worked
              </label>
              <input
                type="date"
                value={overtimeDate}
                onChange={(e) => setOvertimeDate(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-plum shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-rscm-dark-purple mb-2">
              Compensation type
            </label>
            <select
              value={compensationType}
              onChange={(e) => setCompensationType(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-plum shadow-sm"
            >
              <option value="time_off">Time off in lieu</option>
              <option value="payment">Paid overtime</option>
              <option value="both">Split compensation</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              {compensationType === "time_off" && "You'll receive compensatory time off"}
              {compensationType === "payment" && "You'll receive additional payment"}
              {compensationType === "both" && "You'll receive a combination of time off and payment"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-rscm-dark-purple mb-2">
              Description
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              placeholder="Describe the work performed during overtime hours..."
              className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-plum shadow-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium bg-rscm-plum text-white hover:bg-rscm-violet rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Log overtime"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OvertimeRequestModal;

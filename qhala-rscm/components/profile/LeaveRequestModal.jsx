"use client";
import { useState } from "react";
import { X, Calendar, FileText, User } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const LeaveRequestModal = ({ isOpen, onClose, userEmail }) => {
  const [leaveType, setLeaveType] = useState("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [coveringUserId, setCoveringUserId] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLeaveRequest = useMutation(api.workRequests.createLeaveRequest);
  const users = useQuery(
    api.users.getAll,
    userEmail ? { email: userEmail } : "skip"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    setIsSubmitting(true);
    try {
      await createLeaveRequest({
        email: userEmail,
        leaveType,
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
        reason,
        coveringUserId: coveringUserId || undefined,
        handoverNotes: handoverNotes || undefined,
      });

      toast.success("Leave request submitted successfully");
      onClose();
      
      setLeaveType("annual");
      setStartDate("");
      setEndDate("");
      setReason("");
      setCoveringUserId("");
      setHandoverNotes("");
    } catch (error) {
      toast.error(error.message || "Failed to submit leave request");
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
              Request leave
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Submit a new leave request for approval
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
                Leave type
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet shadow-sm"
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-rscm-dark-purple mb-2">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-rscm-dark-purple mb-2">
                  End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  min={startDate}
                  className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-rscm-dark-purple mb-2">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
                placeholder="Briefly describe the reason for your leave request..."
                className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet shadow-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rscm-dark-purple mb-2">
                Covering person <span className="text-gray-400">(optional)</span>
              </label>
              <select
                value={coveringUserId}
                onChange={(e) => setCoveringUserId(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet shadow-sm"
              >
                <option value="">Select a colleague (optional)</option>
                {users?.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-rscm-dark-purple mb-2">
                Handover notes <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                rows={3}
                placeholder="Any important handover information for your team..."
                className="w-full px-4 py-3 bg-white rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet shadow-sm resize-none"
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
              className="px-5 py-2.5 text-sm font-medium bg-rscm-violet text-white hover:bg-rscm-plum rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <span>Submit request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestModal;

"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Calendar as CalendarIcon,
  User,
  Percent,
  FileText,
  Briefcase,
  Clock,
} from "lucide-react";
import { RSCM_COLORS } from "@/components/charts/ChartComponents";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDatePickerDate, parseDatePickerDate } from "@/lib/dateUtils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ALLOCATION_ROLES } from "@/lib/constants/roles";

const RequestResourceForm = ({
  userToRequest,
  projectId,
  onSubmit,
  onCancel,
  isSubmittingRequest,
}) => {
  const { user } = useAuth();
  const createResourceRequest = useMutation(api.resourceRequests.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    role: userToRequest?.title || "Consultant",
    percentage: 100,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "percentage" ? parseInt(value) || 0 : value,
    }));
  };

  const handleStartDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      startDate: formatDatePickerDate(date),
    }));
  };

  const handleEndDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      endDate: formatDatePickerDate(date),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      toast.error("You must be logged in to submit a request");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        email: user.email,
        projectId: projectId,
        requestedUserId: userToRequest._id || userToRequest.userId,
        requestedRole: formData.role,
        requestedPercentage: Number(formData.percentage),
        requestedStartDate: new Date(formData.startDate).getTime(),
        pmNotes: formData.notes || undefined,
      };

      if (formData.endDate) {
        payload.requestedEndDate = new Date(formData.endDate).getTime();
      }

      await createResourceRequest(payload);

      toast.success(`Request sent for ${userToRequest.name}`);

      if (onCancel) onCancel();
    } catch (error) {
      console.error("Failed to submit request:", error);
      if (error.message.includes("Unauthorized")) {
        toast.error(
          "Permission Denied. Ensure you are logged in as a PM/Admin."
        );
      } else if (error.message.includes("ArgumentValidationError")) {
        toast.error(
          "Backend Mismatch: Please update resourceRequests.js to accept 'email'."
        );
      } else {
        toast.error(error.message || "Failed to send request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
      <div className="px-6 py-5 bg-gray-50/80 border-b border-gray-100 flex items-center gap-4">
        <div className="relative h-12 w-12 flex-shrink-0">
          {userToRequest?.avatarUrl ? (
            <img
              src={userToRequest.avatarUrl}
              alt={userToRequest.name}
              className="h-full w-full rounded-xl object-cover shadow-sm border-2 border-white"
            />
          ) : (
            <div
              className="h-full w-full rounded-xl flex items-center justify-center shadow-sm border-2 border-white"
              style={{ backgroundColor: `${RSCM_COLORS.lilac}20` }}
            >
              <span
                className="text-lg font-bold"
                style={{ color: RSCM_COLORS.violet }}
              >
                {userToRequest?.name?.[0]}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-white rounded-md px-1.5 py-0.5 shadow-sm border border-gray-100 flex items-center gap-1">
            <Briefcase size={8} className="text-gray-400" />
            <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">
              {userToRequest?.department?.substring(0, 3) || "TEA"}
            </span>
          </div>
        </div>

        <div>
          <h3
            className="text-base font-bold leading-tight"
            style={{ color: RSCM_COLORS.darkPurple }}
          >
            Request Resource
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            Allocating{" "}
            <span className="font-semibold text-gray-700">
              {userToRequest?.name}
            </span>
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
              Role on Project
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-rscm-violet/10 transition-all outline-none"
              required
            >
              {ALLOCATION_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
              Load %
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="percentage"
                min="1"
                max="100"
                value={formData.percentage}
                onChange={handleChange}
                className="w-full pl-9 pr-2 py-2.5 text-sm bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-rscm-violet/10 transition-all outline-none"
                required
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
              Start Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <DatePicker
                selected={parseDatePickerDate(formData.startDate)}
                onChange={handleStartDateChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-rscm-violet/10 transition-all outline-none placeholder:text-gray-300 cursor-pointer"
                wrapperClassName="w-full"
                required
                popperProps={{ strategy: "fixed" }}
                popperPlacement="bottom-start"
                popperClassName="!z-[9999]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
              End Date{" "}
              <span className="font-normal normal-case ml-0.5 opacity-50">
                (Opt)
              </span>
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <DatePicker
                selected={parseDatePickerDate(formData.endDate)}
                onChange={handleEndDateChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-rscm-violet/10 transition-all outline-none placeholder:text-gray-300 cursor-pointer"
                wrapperClassName="w-full"
                minDate={parseDatePickerDate(formData.startDate)}
                popperProps={{ strategy: "fixed" }}
                popperPlacement="bottom-start"
                popperClassName="!z-[9999]"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
            Notes for Approver
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Why is this specific person needed?"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-rscm-violet/10 transition-all outline-none resize-none placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
          <Clock size={12} />
          {projectId ? "Active Project" : "Draft"}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-rscm-dark-purple hover:bg-gray-100 font-medium text-xs h-9 px-4 rounded-lg transition-colors"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-white min-w-[110px] h-9 rounded-lg text-xs font-bold tracking-wide shadow-sm hover:shadow-md transition-all active:scale-[.98]"
            style={{ backgroundColor: RSCM_COLORS.violet }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default RequestResourceForm;

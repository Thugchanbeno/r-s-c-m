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
} from "lucide-react";
import { RSCM_COLORS } from "@/components/charts/ChartComponents";

const RequestResourceForm = ({
  userToRequest,
  projectId,
  onSubmit,
  onCancel,
  isSubmittingRequest,
}) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full relative">
      {/* HEADER */}
      <div
        className="px-7 py-6 flex items-center gap-4 border-b"
        style={{ borderColor: `${RSCM_COLORS.lilac}40` }}
      >
        <div className="relative h-14 w-14 shrink-0">
          {userToRequest?.avatarUrl ? (
            <img
              src={userToRequest.avatarUrl}
              alt={userToRequest.name}
              className="h-full w-full rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div
              className="h-full w-full rounded-2xl flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${RSCM_COLORS.lilac}25` }}
            >
              <span
                className="text-xl font-bold"
                style={{ color: RSCM_COLORS.violet }}
              >
                {userToRequest?.name?.[0]}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h3
            className="text-lg font-semibold"
            style={{ color: RSCM_COLORS.darkPurple }}
          >
            {userToRequest?.name}
          </h3>

          <span
            className="text-[11px] mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-md"
            style={{
              backgroundColor: `${RSCM_COLORS.violet}15`,
              color: RSCM_COLORS.violet,
            }}
          >
            <Briefcase size={11} />
            {userToRequest?.department || "Team Member"}
          </span>
        </div>
      </div>

      {/* FIELDS */}
      <div className="flex-1 px-7 py-6 space-y-6 overflow-y-auto">
        {/* Role */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">
            Role on Project
          </label>
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              backgroundColor: `${RSCM_COLORS.lilac}10`,
            }}
          >
            <User
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g. Lead Developer"
              className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-violet-200 transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Allocation + Start */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">
              Allocation %
            </label>
            <div
              className="relative rounded-xl overflow-hidden"
              style={{ backgroundColor: `${RSCM_COLORS.lilac}10` }}
            >
              <Percent
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="number"
                name="percentage"
                min="1"
                max="100"
                value={formData.percentage}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-violet-200 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">
              Start Date
            </label>
            <div
              className="relative rounded-xl overflow-hidden"
              style={{ backgroundColor: `${RSCM_COLORS.lilac}10` }}
            >
              <CalendarIcon
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-violet-200 transition-all duration-200"
                required
              />
            </div>
          </div>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">
            End Date{" "}
            <span className="normal-case font-normal text-xs text-gray-300">
              (optional)
            </span>
          </label>
          <div
            className="relative rounded-xl overflow-hidden"
            style={{ backgroundColor: `${RSCM_COLORS.lilac}10` }}
          >
            <CalendarIcon
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-violet-200 transition-all duration-200"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">
            Notes
          </label>
          <div
            className="relative rounded-xl overflow-hidden"
            style={{ backgroundColor: `${RSCM_COLORS.lilac}10` }}
          >
            <FileText
              size={16}
              className="absolute left-4 top-4 text-gray-400"
            />
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any context about why this resource is needed..."
              className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-violet-200 transition-all duration-200 resize-none"
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="px-7 py-4 flex items-center justify-between sticky bottom-0 backdrop-blur-xl border-t"
        style={{
          borderColor: `${RSCM_COLORS.lilac}40`,
          backgroundColor: `rgba(255,255,255,0.8)`,
        }}
      >
        <span className="text-[11px] text-gray-500 font-medium">
          Requesting for {projectId ? "Current Project" : "Project"}
        </span>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmittingRequest}
            className="text-gray-600 hover:text-gray-900 hover:bg-transparent text-xs font-medium"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmittingRequest}
            className="text-white min-w-[140px] h-10 rounded-xl text-xs font-semibold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[.97]"
            style={{ backgroundColor: RSCM_COLORS.violet }}
          >
            {isSubmittingRequest ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Request"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default RequestResourceForm;

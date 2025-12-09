"use client";
import { useState, useEffect } from "react";
import { X, Briefcase } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const EmploymentDetailsModal = ({ isOpen, onClose, user, userEmail }) => {
  const [form, setForm] = useState({
    employeeType: "",
    weeklyHours: 40,
    contractStartDate: null,
    contractEndDate: null,
    paymentTerms: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfile = useMutation(api.users.updateProfile);

  useEffect(() => {
    if (user) {
      setForm({
        employeeType: user.employeeType || "",
        weeklyHours: user.weeklyHours || 40,
        contractStartDate: user.contractStartDate || null,
        contractEndDate: user.contractEndDate || null,
        paymentTerms: user.paymentTerms || "",
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        email: userEmail,
        id: user._id,
        employeeType: form.employeeType,
        weeklyHours: Number(form.weeklyHours),
        contractStartDate: form.contractStartDate,
        contractEndDate: form.contractEndDate,
        paymentTerms: form.paymentTerms,
      });
      toast.success("Employment details updated successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update employment details");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rscm-violet/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-rscm-violet" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-rscm-dark-purple">
                Edit Employment Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Update contract and employment information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Employee Type and Weekly Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Type
              </label>
              <select
                value={form.employeeType}
                onChange={(e) => handleChange("employeeType", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet"
              >
                <option value="">Select type</option>
                <option value="permanent">Permanent</option>
                <option value="consultancy">Consultancy</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Hours
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={form.weeklyHours}
                onChange={(e) => handleChange("weeklyHours", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet"
              />
            </div>
          </div>

          {/* Contract Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Start Date
              </label>
              <input
                type="date"
                value={
                  form.contractStartDate
                    ? new Date(form.contractStartDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleChange(
                    "contractStartDate",
                    e.target.value ? new Date(e.target.value).getTime() : null
                  )
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract End Date
              </label>
              <input
                type="date"
                value={
                  form.contractEndDate
                    ? new Date(form.contractEndDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleChange(
                    "contractEndDate",
                    e.target.value ? new Date(e.target.value).getTime() : null
                  )
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet"
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Terms
            </label>
            <textarea
              value={form.paymentTerms}
              onChange={(e) => handleChange("paymentTerms", e.target.value)}
              rows={4}
              placeholder="Enter payment terms and conditions..."
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet resize-none"
            />
          </div>
        </div>

        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium bg-rscm-violet text-white hover:bg-rscm-plum rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmploymentDetailsModal;

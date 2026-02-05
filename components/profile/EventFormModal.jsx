"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import { X, AlertCircle, ChevronDown } from "lucide-react";
import { parseError, getErrorMessage } from "@/lib/error-handler";

const eventCategories = [
  { value: "seminar", label: "Seminar" },
  { value: "meeting", label: "Meeting" },
  { value: "webinar", label: "Webinar" },
  { value: "conference", label: "Conference" },
  { value: "training", label: "Training" },
  { value: "other", label: "Other" },
];

export default function EventFormModal({ isOpen, onClose, onSuccess, initialEvent = null }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(
    initialEvent || {
      title: "",
      eventCategory: "meeting",
      location: "",
      startDateTime: "",
      endDateTime: "",
      notes: "",
      attendees: [],
    }
  );
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showAttendeeDropdown, setShowAttendeeDropdown] = useState(false);

  const usersData = useQuery(
    api.users.getBasicList,
    user?.email ? { email: user.email } : "skip"
  ) || [];

  const attendeeUsers = useMemo(() => {
    if (!Array.isArray(usersData)) return [];
    return usersData.filter(u => u._id !== user?._id?.toString?.());
  }, [usersData, user]);

  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }

    if (!formData.startDateTime) {
      newErrors.startDateTime = "Start date/time is required";
    }

    if (!formData.endDateTime) {
      newErrors.endDateTime = "End date/time is required";
    }

    if (formData.startDateTime && formData.endDateTime) {
      const start = new Date(formData.startDateTime);
      const end = new Date(formData.endDateTime);
      if (end <= start) {
        newErrors.endDateTime = "End date/time must be after start date/time";
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: user?.email,
        title: formData.title.trim(),
        eventCategory: formData.eventCategory,
        location: formData.location.trim(),
        startDateTime: new Date(formData.startDateTime).getTime(),
        endDateTime: new Date(formData.endDateTime).getTime(),
        notes: formData.notes.trim(),
        attendees: formData.attendees || [],
      };

      if (initialEvent?._id) {
        await updateEvent({
          ...payload,
          eventId: initialEvent._id,
        });
      } else {
        await createEvent(payload);
      }

      toast.success(initialEvent ? "Event updated successfully" : "Event logged successfully");
      onSuccess();
      setFormData({
        title: "",
        eventCategory: "meeting",
        location: "",
        startDateTime: "",
        endDateTime: "",
        notes: "",
        attendees: [],
      });
      onClose();
    } catch (error) {
      const parsed = parseError(error);
      const message = getErrorMessage(parsed);
      toast.error(message);
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>

      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-rscm-dark-purple">
            {initialEvent ? "Edit Event" : "Log Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{apiError}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-rscm-dark-purple mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Industry Conference"
              className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                errors.title
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 hover:border-gray-300 focus:border-rscm-violet"
              } focus:outline-none focus:ring-1 focus:ring-rscm-violet/20`}
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-rscm-dark-purple mb-1.5">
              Category
            </label>
            <select
              name="eventCategory"
              value={formData.eventCategory}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 focus:border-rscm-violet focus:outline-none focus:ring-1 focus:ring-rscm-violet/20 transition-colors"
            >
              {eventCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rscm-dark-purple mb-1.5">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
              className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                errors.location
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 hover:border-gray-300 focus:border-rscm-violet"
              } focus:outline-none focus:ring-1 focus:ring-rscm-violet/20`}
            />
            {errors.location && (
              <p className="text-xs text-red-600 mt-1">{errors.location}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-rscm-dark-purple mb-1.5">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                  errors.startDateTime
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-gray-300 focus:border-rscm-violet"
                } focus:outline-none focus:ring-1 focus:ring-rscm-violet/20`}
              />
              {errors.startDateTime && (
                <p className="text-xs text-red-600 mt-1">{errors.startDateTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-rscm-dark-purple mb-1.5">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                  errors.endDateTime
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-gray-300 focus:border-rscm-violet"
                } focus:outline-none focus:ring-1 focus:ring-rscm-violet/20`}
              />
              {errors.endDateTime && (
                <p className="text-xs text-red-600 mt-1">{errors.endDateTime}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-rscm-dark-purple mb-1.5">
              Attendees (Optional)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttendeeDropdown(!showAttendeeDropdown)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 focus:border-rscm-violet focus:outline-none focus:ring-1 focus:ring-rscm-violet/20 transition-colors flex items-center justify-between"
              >
                <span className="text-gray-600">
                  {formData.attendees.length === 0
                    ? "Select attendees..."
                    : `${formData.attendees.length} selected`}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showAttendeeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg bg-white shadow-lg z-10 max-h-48 overflow-y-auto">
                  {attendeeUsers.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">No users available</div>
                  ) : (
                    attendeeUsers.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => {
                            const attendees = prev.attendees || [];
                            if (attendees.includes(u._id)) {
                              return {
                                ...prev,
                                attendees: attendees.filter((id) => id !== u._id),
                              };
                            }
                            return {
                              ...prev,
                              attendees: [...attendees, u._id],
                            };
                          });
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.attendees.includes(u._id)}
                          readOnly
                          className="pointer-events-none"
                        />
                        <span className="text-sm text-gray-700">{u.name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {formData.attendees.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.attendees.map((attendeeId) => {
                  const attendee = attendeeUsers.find((u) => u._id === attendeeId);
                  return (
                    <div
                      key={attendeeId}
                      className="inline-flex items-center gap-2 px-2.5 py-1 bg-rscm-violet/10 text-rscm-violet text-xs rounded-full"
                    >
                      <span>{attendee?.name || "Unknown"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            attendees: (prev.attendees || []).filter(
                              (id) => id !== attendeeId
                            ),
                          }));
                        }}
                        className="hover:text-rscm-plum"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-rscm-dark-purple mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional details..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm hover:border-gray-300 focus:border-rscm-violet focus:outline-none focus:ring-1 focus:ring-rscm-violet/20 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-rscm-dark-purple bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rscm-violet hover:bg-rscm-plum rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? initialEvent
                  ? "Updating..."
                  : "Creating..."
                : initialEvent
                ? "Update Event"
                : "Log Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

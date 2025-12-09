import { useState, useEffect } from "react";
import { X, Plus, Edit3, Loader2, Check } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDatePickerDate, parseDatePickerDate } from "@/lib/dateUtils";
import { toast } from "sonner";

const TaskFormModal = ({
  isOpen,
  initialData,
  projectTeam = [],
  isLocal = false,
  isEditing = false,
  onSubmit,
  onCancel,
}) => {
  const getInitialFormData = () => ({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "todo",
    priority: initialData?.priority || "medium",
    dueDate: initialData?.dueDate
      ? formatDatePickerDate(new Date(initialData.dueDate))
      : "",
    estimatedHours: initialData?.estimatedHours || "",
    assignedUserIds: initialData?.assignedUserIds || [],
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchMode, setBatchMode] = useState(false);

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      if (isEditing) {
        setBatchMode(false);
      }
    }
  }, [initialData, isOpen, isEditing, getInitialFormData]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        dueDate: formData.dueDate
          ? parseDatePickerDate(formData.dueDate)?.getTime()
          : null,
        estimatedHours: formData.estimatedHours
          ? parseInt(formData.estimatedHours)
          : null,
        assignedUserIds: formData.assignedUserIds.filter(Boolean),
      });

      if (batchMode && !isEditing) {
        setFormData({
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          dueDate: "",
          estimatedHours: "",
          assignedUserIds: formData.assignedUserIds,
        });
        toast.success("Task added! Continue or close.");
      } else if (!batchMode) {
        onCancel();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssignee = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignedUserIds: prev.assignedUserIds.includes(userId)
        ? prev.assignedUserIds.filter((id) => id !== userId)
        : [...prev.assignedUserIds, userId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Edit3 className="w-4 h-4 text-rscm-violet" />
            ) : (
              <Plus className="w-4 h-4 text-rscm-violet" />
            )}
            <h2 className="text-lg font-semibold text-rscm-dark-purple">
              {isEditing ? "Edit Task" : "Create Task"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-rscm-dark-purple">
              Task Title*
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              className="w-full px-3 py-2 bg-gray-50 rounded-md focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-colors text-sm"
              placeholder="Enter task title..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-rscm-dark-purple">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 rounded-md focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-colors resize-none text-sm"
              placeholder="Add details..."
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-rscm-dark-purple">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 bg-gray-50 rounded-md focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-colors text-sm"
                disabled={isSubmitting}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-rscm-dark-purple">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priority: e.target.value }))
                }
                className="w-full px-3 py-2 bg-gray-50 rounded-md focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-colors text-sm"
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-rscm-dark-purple">
                Due Date
              </label>
              <DatePicker
                selected={parseDatePickerDate(formData.dueDate)}
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: formatDatePickerDate(date),
                  }))
                }
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                className="w-full px-3 py-2 bg-gray-50 rounded-md focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-colors text-sm"
                wrapperClassName="w-full"
                showPopperArrow={false}
                isClearable
                autoComplete="off"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-rscm-dark-purple">
                Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedHours: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-gray-50 rounded-md focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-colors text-sm"
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {!isLocal && projectTeam && projectTeam.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <label className="text-xs font-medium text-rscm-dark-purple block">
                Assign To Team Members
              </label>
              <div className="grid grid-cols-2 gap-2">
                {projectTeam.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedUserIds.includes(user._id)}
                      onChange={() => toggleAssignee(user._id)}
                      className="w-4 h-4 rounded border-gray-300 text-rscm-violet focus:ring-rscm-violet/20"
                      disabled={isSubmitting}
                    />
                    <span className="text-xs text-rscm-dark-purple flex-1">
                      {user.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            {!isEditing && (
              <label className="flex items-center gap-2 text-xs mr-auto">
                <input
                  type="checkbox"
                  checked={batchMode}
                  onChange={(e) => setBatchMode(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-rscm-violet"
                  disabled={isSubmitting}
                />
                <span className="text-gray-600">Batch add mode</span>
              </label>
            )}
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {batchMode && !isEditing ? "Done" : "Cancel"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim()}
              className="flex items-center gap-2 px-3 py-2 bg-rscm-violet text-white rounded-md hover:bg-rscm-plum transition-colors disabled:opacity-50 text-xs font-medium"
            >
              {isSubmitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              {isEditing ? "Update" : batchMode ? "Add & Continue" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;

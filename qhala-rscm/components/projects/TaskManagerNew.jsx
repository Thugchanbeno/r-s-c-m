"use client";
import { useState } from "react";
import {
  Plus,
  Calendar,
  Flag,
  CheckCircle2,
  Circle,
  PlayCircle,
  PauseCircle,
  XCircle,
  Clock,
  Edit3,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useTasks } from "@/lib/hooks/useTasks";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDatePickerDate, parseDatePickerDate } from "@/lib/dateUtils";

const taskStatuses = [
  {
    value: "todo",
    label: "To Do",
    icon: Circle,
    color: "bg-gray-100 text-gray-700",
    iconColor: "text-gray-400",
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: PlayCircle,
    color: "bg-rscm-lilac/20 text-rscm-violet",
    iconColor: "text-rscm-violet",
  },
  {
    value: "review",
    label: "Review",
    icon: PauseCircle,
    color: "bg-yellow-100 text-yellow-700",
    iconColor: "text-yellow-600",
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
    iconColor: "text-green-600",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
    iconColor: "text-red-600",
  },
];

const priorityConfig = {
  low: {
    color: "bg-green-100 text-green-700",
    icon: Flag,
  },
  medium: {
    color: "bg-yellow-100 text-yellow-700",
    icon: Flag,
  },
  high: {
    color: "bg-orange-100 text-orange-700",
    icon: Flag,
  },
  urgent: {
    color: "bg-red-100 text-red-700",
    icon: AlertTriangle,
  },
};

// Local Task Manager (for project creation flow)
export const TaskManagerLocal = ({ initialTasks = [], onTasksChange }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleAddTask = (task) => {
    const newTask = {
      ...task,
      tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: task.status || "todo",
      createdAt: Date.now(),
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    onTasksChange?.(updated);
    toast.success("Task added");
    setShowAddForm(false);
  };

  const handleUpdateTask = (id, updates) => {
    const updated = tasks.map((t) =>
      t.tempId === id || t._id === id ? { ...t, ...updates } : t
    );
    setTasks(updated);
    onTasksChange?.(updated);
    toast.success("Task updated");
  };

  const handleDeleteTask = (id) => {
    const updated = tasks.filter((t) => t.tempId !== id && t._id !== id);
    setTasks(updated);
    onTasksChange?.(updated);
    toast.success("Task deleted");
  };

  return (
    <TaskManagerUI
      projectId={null}
      tasks={tasks}
      showAddForm={showAddForm}
      setShowAddForm={setShowAddForm}
      editingTask={editingTask}
      setEditingTask={setEditingTask}
      onCreateTask={handleAddTask}
      onUpdateTask={handleUpdateTask}
      onDeleteTask={handleDeleteTask}
      isLocal={true}
    />
  );
};

// Convex Task Manager (for existing projects)
export const TaskManagerConvex = ({ projectId }) => {
  const { tasks, handleCreateTask, handleUpdateTask, handleDeleteTask } =
    useTasks(projectId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const create = async (task) => {
    try {
      await handleCreateTask({ ...task, projectId });
      setShowAddForm(false);
    } catch (err) {
      // Error handled in hook
    }
  };

  const update = async (id, updates) => {
    try {
      await handleUpdateTask(id, updates);
    } catch (err) {
      // Error handled in hook
    }
  };

  const remove = async (id) => {
    try {
      await handleDeleteTask(id);
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <TaskManagerUI
      projectId={projectId}
      tasks={tasks || []}
      showAddForm={showAddForm}
      setShowAddForm={setShowAddForm}
      editingTask={editingTask}
      setEditingTask={setEditingTask}
      onCreateTask={create}
      onUpdateTask={update}
      onDeleteTask={remove}
      isLocal={false}
    />
  );
};

const TaskManagerUI = ({
  projectId,
  tasks,
  showAddForm,
  setShowAddForm,
  editingTask,
  setEditingTask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  isLocal = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-rscm-dark-purple">
            {projectId ? "Project Tasks" : "Tasks"}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isLocal
              ? "Add tasks that will be created when the project is saved"
              : "Organize and track your work"}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 bg-rscm-violet text-white px-3 py-1.5 rounded-md hover:bg-rscm-plum transition-colors text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-lg">
          <TaskForm
            onSubmit={async (data) => {
              await onCreateTask(data);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {editingTask && (
        <div className="bg-white border border-gray-100 rounded-lg">
          <TaskForm
            initialData={editingTask}
            isEditing
            onSubmit={async (data) => {
              const taskId = editingTask.tempId || editingTask._id;
              await onUpdateTask(taskId, data);
              setEditingTask(null);
            }}
            onCancel={() => setEditingTask(null)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {taskStatuses.map((status) => {
          const StatusIcon = status.icon;
          const statusTasks = tasks.filter((t) => t.status === status.value);
          
          return (
            <div key={status.value} className="space-y-2">
              <div className="bg-white border-b border-gray-100 px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon className={`w-3.5 h-3.5 ${status.iconColor}`} />
                    <h4 className="font-semibold text-xs text-rscm-dark-purple">
                      {status.label}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                    {statusTasks.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 min-h-[150px]">
                {statusTasks.map((task) => (
                  <TaskCard
                    key={task.tempId || task._id}
                    task={task}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => onDeleteTask(task.tempId || task._id)}
                    onStatusChange={(s) =>
                      onUpdateTask(task.tempId || task._id, { status: s })
                    }
                    priorityConfig={priorityConfig}
                    isLocal={isLocal}
                  />
                ))}

                {statusTasks.length === 0 && (
                  <div className="border border-dashed border-gray-200 rounded-md px-3 py-6 text-center">
                    <StatusIcon className="w-4 h-4 mx-auto text-gray-300 mb-1" />
                    <p className="text-xs text-gray-400">
                      No tasks
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(!tasks || tasks.length === 0) && !showAddForm && (
        <div className="bg-white border border-gray-100 rounded-lg px-6 py-8 text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-semibold text-rscm-dark-purple mb-1">
            Ready to get organized?
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {isLocal
              ? "Add tasks that will be created when you save the project"
              : "Break down your work into manageable tasks"}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 bg-rscm-violet text-white px-3 py-1.5 rounded-md hover:bg-rscm-plum transition-colors text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Your First Task
          </button>
        </div>
      )}
    </div>
  );
};

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  priorityConfig,
  isLocal = false,
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const PriorityIcon = task.priority ? priorityConfig[task.priority]?.icon : Flag;

  return (
    <div className="group bg-white border border-gray-100 rounded-md hover:border-rscm-violet/30 transition-colors px-3 py-2.5">
      <div className="flex justify-between items-start gap-2 mb-2">
        <h5 className="font-medium text-xs text-rscm-dark-purple line-clamp-2 flex-1">
          {task.title}
        </h5>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 rounded hover:bg-rscm-dutch-white/30 text-gray-500 hover:text-rscm-violet transition-colors"
            title="Edit task"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          {task.priority && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                priorityConfig[task.priority]?.color || ""
              }`}
            >
              <PriorityIcon className="w-3 h-3" />
              {task.priority}
            </span>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>

        {task.estimatedHours && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {task.estimatedHours}h
          </div>
        )}

        {isLocal && (
          <div className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" />
            Pending save
          </div>
        )}
      </div>
    </div>
  );
};

const TaskForm = ({ initialData, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "todo",
    priority: initialData?.priority || "medium",
    dueDate: initialData?.dueDate
      ? formatDatePickerDate(new Date(initialData.dueDate))
      : "",
    estimatedHours: initialData?.estimatedHours || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-gray-100">
        {isEditing ? (
          <Edit3 className="w-3.5 h-3.5 text-rscm-violet" />
        ) : (
          <Plus className="w-3.5 h-3.5 text-rscm-violet" />
        )}
        <h4 className="text-sm font-semibold text-rscm-dark-purple">
          {isEditing ? "Edit Task" : "Create Task"}
        </h4>
      </div>

      <div className="space-y-3">
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
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rscm-violet text-white rounded-md hover:bg-rscm-plum transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
          >
            {isSubmitting && (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskManagerUI;

// components/projects/task-manager.jsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Calendar,
  Flag,
  MoreHorizontal,
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTasks } from "@/lib/hooks/useTasks";

const taskStatuses = [
  {
    value: "todo",
    label: "To Do",
    icon: Circle,
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: PlayCircle,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    value: "review",
    label: "Review",
    icon: PauseCircle,
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle2,
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  },
];

const priorityConfig = {
  low: {
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    icon: Flag,
  },
  medium: {
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: Flag,
  },
  high: {
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    icon: Flag,
  },
  urgent: {
    color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    icon: AlertTriangle,
  },
};

export const TaskManagerLocal = ({ initialTasks = [], onTasksChange }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  //temporarily creates a task assigning it a temporary ID before full project creation(all CRUD on these tasks will need to account for the temporary ID)
  const handleAddTask = (task) => {
    const newTask = {
      ...task,
      // Use a proper temporary ID that won't conflict with Convex
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
      // Error handling is done in the hook
    }
  };

  const update = async (id, updates) => {
    try {
      await handleUpdateTask(id, updates);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const remove = async (id) => {
    try {
      await handleDeleteTask(id);
    } catch (err) {
      // Error handling is done in the hook
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {projectId ? "Project Tasks" : "Tasks"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLocal
              ? "Add tasks that will be created when the project is saved"
              : "Organize and track your work"}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus size={16} /> Add Task
        </Button>
      </div>

      {/* Add/Edit Forms */}
      {showAddForm && (
        <Card>
          <TaskForm
            onSubmit={async (data) => {
              await onCreateTask(data);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </Card>
      )}

      {editingTask && (
        <Card>
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
        </Card>
      )}

      {/* Task Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {taskStatuses.map((status) => (
          <div key={status.value} className="space-y-3">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <status.icon size={16} />
                  <h3 className="font-medium text-sm">{status.label}</h3>
                </div>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", status.color)}
                >
                  {tasks.filter((t) => t.status === status.value).length}
                </Badge>
              </div>
            </Card>

            <div className="space-y-2 min-h-[200px]">
              {tasks
                .filter((t) => t.status === status.value)
                .map((task) => (
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

              {tasks.filter((t) => t.status === status.value).length === 0 && (
                <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                  <status.icon
                    size={20}
                    className="mx-auto text-muted-foreground/50 mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    No {status.label.toLowerCase()} tasks
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Global Empty State */}
      {(!tasks || tasks.length === 0) && !showAddForm && (
        <Card className="p-8 text-center">
          <CheckCircle2
            size={40}
            className="mx-auto text-muted-foreground/30 mb-4"
          />
          <h3 className="text-lg font-medium mb-2">Ready to get organized?</h3>
          <p className="text-muted-foreground mb-6">
            {isLocal
              ? "Add tasks that will be created when you save the project"
              : "Break down your work into manageable tasks"}
          </p>
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus size={16} /> Create Your First Task
          </Button>
        </Card>
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

  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-primary/20">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-medium text-sm line-clamp-2 flex-1 leading-relaxed">
            {task.title}
          </h4>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="h-7 w-7 p-0"
            >
              <Edit3 size={12} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          {/* Priority and Due Date */}
          <div className="flex items-center justify-between">
            {task.priority && (
              <Badge
                size="sm"
                className={cn(
                  "text-xs px-2 py-1",
                  priorityConfig[task.priority]?.color
                )}
              >
                <Flag size={8} className="mr-1" />
                {task.priority}
              </Badge>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={10} />
                {formatDate(task.dueDate)}
              </div>
            )}
          </div>

          {/* Estimated Hours */}
          {task.estimatedHours && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={10} />
              {task.estimatedHours}h estimated
            </div>
          )}

          {/* Local indicator */}
          {isLocal && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              <AlertTriangle size={10} />
              Will be created when project is saved
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const TaskForm = ({ initialData, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "todo",
    priority: initialData?.priority || "medium",
    dueDate: initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split("T")[0]
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
        dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : null,
        estimatedHours: formData.estimatedHours
          ? parseInt(formData.estimatedHours)
          : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? <Edit3 size={18} /> : <Plus size={18} />}
          {isEditing ? "Edit Task" : "Create Task"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Task Title*</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Enter task title..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            placeholder="Add details..."
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hours</label>
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default TaskManagerUI;

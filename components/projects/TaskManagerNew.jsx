"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
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
import TaskFormModal from "./TaskFormModal";

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
  const { user } = useAuth();
  const { tasks, handleCreateTask, handleUpdateTask, handleDeleteTask } =
    useTasks(projectId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const projectTeam =
    useQuery(
      api.projects.getTeam,
      projectId && user?.email ? { projectId, email: user.email } : "skip"
    ) || [];

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
      projectTeam={projectTeam}
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
  projectTeam = [],
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

      <TaskFormModal
        isOpen={showAddForm}
        initialData={null}
        projectTeam={projectTeam}
        isLocal={isLocal}
        isEditing={false}
        onSubmit={async (data) => {
          await onCreateTask(data);
          setShowAddForm(false);
        }}
        onCancel={() => setShowAddForm(false)}
      />

      <TaskFormModal
        isOpen={!!editingTask}
        initialData={editingTask}
        projectTeam={projectTeam}
        isLocal={isLocal}
        isEditing={true}
        onSubmit={async (data) => {
          const taskId = editingTask.tempId || editingTask._id;
          await onUpdateTask(taskId, data);
          setEditingTask(null);
        }}
        onCancel={() => setEditingTask(null)}
      />
      

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
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}
                  >
                    {statusTasks.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 min-h-[150px]">
                {statusTasks.map((task) => (
                  <TaskCard
                    key={task.tempId || task._id}
                    task={task}
                    projectTeam={projectTeam}
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
                    <p className="text-xs text-gray-400">No tasks</p>
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
  projectTeam = [],
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const PriorityIcon = task.priority
    ? priorityConfig[task.priority]?.icon
    : Flag;

  const assignedUsers = (task.assignedUserIds || []).map((userId) =>
    projectTeam?.find((u) => u._id === userId)
  ).filter(Boolean);

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

      {assignedUsers.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-end">
          <div className="flex -space-x-1">
            {assignedUsers.slice(0, 4).map((u) => (
              <div key={u._id} className="inline-block rounded-full border-2 border-white" title={u.name}>
                {u.avatarUrl ? (
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-rscm-violet/10 flex items-center justify-center text-[9px] font-bold text-rscm-violet">
                    {u.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
            ))}
            {assignedUsers.length > 4 && (
              <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[9px] font-medium flex items-center justify-center border-2 border-white" title={`${assignedUsers.length - 4} more`}>
                +{assignedUsers.length - 4}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagerUI;

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/common/Card";
import { PlusCircle, Trash2, Edit3, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const statusOptions = [
  "todo",
  "in_progress",
  "review",
  "completed",
  "cancelled",
];
const priorityOptions = ["low", "medium", "high", "urgent"];

const TaskManager = ({
  projectId = null,
  tasks = [],
  onTasksChange,
  canEdit = true,
}) => {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedUserId: null,
    relatedSkillId: null,
    estimatedHours: "",
    dueDate: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    const task = {
      ...newTask,
      _id: Date.now().toString(), // temp ID until saved in backend
      projectId,
    };

    const updated = [...localTasks, task];
    setLocalTasks(updated);
    onTasksChange && onTasksChange(updated);

    setNewTask({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignedUserId: null,
      relatedSkillId: null,
      estimatedHours: "",
      dueDate: "",
    });
    setIsAdding(false);
  };

  const handleDeleteTask = (id) => {
    const updated = localTasks.filter((t) => t._id !== id);
    setLocalTasks(updated);
    onTasksChange && onTasksChange(updated);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Tasks {projectId ? "(Project)" : "(Standalone)"}
        </h3>
        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1"
          >
            <PlusCircle size={16} /> Add Task
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-2 border rounded-md p-3 bg-muted/30">
          <Input
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
          <div className="flex gap-2">
            <select
              value={newTask.status}
              onChange={(e) =>
                setNewTask({ ...newTask, status: e.target.value })
              }
              className="text-sm border rounded-md p-1"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value })
              }
              className="text-sm border rounded-md p-1"
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <Button size="sm" onClick={handleAddTask}>
            Save Task
          </Button>
        </div>
      )}

      {localTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet.</p>
      ) : (
        <div className="space-y-2">
          {localTasks.map((task) => (
            <div
              key={task._id}
              className="flex items-center justify-between p-2 border rounded-md bg-card shadow-sm"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground">
                    {task.description}
                  </p>
                )}
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">{task.status}</Badge>
                  <Badge
                    className={cn(
                      task.priority === "high" && "bg-red-100 text-red-700",
                      task.priority === "urgent" && "bg-red-600 text-white"
                    )}
                  >
                    {task.priority}
                  </Badge>
                  {task.dueDate && (
                    <span className="flex items-center text-xs text-muted-foreground">
                      <Clock size={12} className="mr-1" /> {task.dueDate}
                    </span>
                  )}
                </div>
              </div>
              {canEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TaskManager;

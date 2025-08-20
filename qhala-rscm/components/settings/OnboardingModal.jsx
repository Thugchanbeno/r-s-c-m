import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Plus, Edit2, Trash2, CheckCircle, Clock } from "lucide-react";

const OnboardingModal = ({ isOpen, onClose, workflows, onUpdateWorkflows }) => {
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    department: "",
    steps: [],
  });
  const [newStep, setNewStep] = useState({
    title: "",
    description: "",
    assignee: "",
    daysToComplete: 1,
  });

  const handleAddStep = () => {
    if (newStep.title.trim()) {
      setNewWorkflow({
        ...newWorkflow,
        steps: [...newWorkflow.steps, { ...newStep, id: Date.now() }],
      });
      setNewStep({ title: "", description: "", assignee: "", daysToComplete: 1 });
    }
  };

  const handleAddWorkflow = () => {
    if (newWorkflow.name.trim() && newWorkflow.steps.length > 0) {
      const workflow = {
        ...newWorkflow,
        id: Date.now(),
        active: true,
        completedCount: 0,
      };
      onUpdateWorkflows([...workflows, workflow]);
      setNewWorkflow({ name: "", department: "", steps: [] });
    }
  };

  const removeStep = (stepId) => {
    setNewWorkflow({
      ...newWorkflow,
      steps: newWorkflow.steps.filter((step) => step.id !== stepId),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Onboarding Workflows" size="xl">
      <div className="space-y-6">
        {/* Create New Workflow */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Create New Workflow</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Workflow name"
              value={newWorkflow.name}
              onChange={(e) =>
                setNewWorkflow({ ...newWorkflow, name: e.target.value })
              }
              className="px-3 py-2 border rounded-md"
            />
            <select
              value={newWorkflow.department}
              onChange={(e) =>
                setNewWorkflow({ ...newWorkflow, department: e.target.value })
              }
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Select department</option>
              <option value="engineering">Engineering</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">Human Resources</option>
            </select>
          </div>

          {/* Add Steps */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Workflow Steps</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Step title"
                value={newStep.title}
                onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                placeholder="Assignee"
                value={newStep.assignee}
                onChange={(e) => setNewStep({ ...newStep, assignee: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <textarea
                placeholder="Step description"
                value={newStep.description}
                onChange={(e) =>
                  setNewStep({ ...newStep, description: e.target.value })
                }
                className="px-3 py-2 border rounded-md"
                rows="2"
              />
              <div>
                <label className="block text-sm font-medium mb-1">
                  Days to complete
                </label>
                <input
                  type="number"
                  min="1"
                  value={newStep.daysToComplete}
                  onChange={(e) =>
                    setNewStep({
                      ...newStep,
                      daysToComplete: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <button
              onClick={handleAddStep}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
            >
              Add Step
            </button>
          </div>

          {/* Preview Steps */}
          {newWorkflow.steps.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Preview Steps</h4>
              <div className="space-y-2">
                {newWorkflow.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className="text-xs text-gray-600">
                          {step.assignee} • {step.daysToComplete} days
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeStep(step.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddWorkflow}
            disabled={!newWorkflow.name.trim() || newWorkflow.steps.length === 0}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            <Plus size={16} className="mr-2" />
            Create Workflow
          </button>
        </div>

        {/* Existing Workflows */}
        <div>
          <h3 className="font-medium mb-3">Existing Workflows</h3>
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{workflow.name}</h4>
                    <p className="text-sm text-gray-600">
                      {workflow.department} • {workflow.steps.length} steps •{" "}
                      {workflow.completedCount} completed
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        workflow.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {workflow.active ? "Active" : "Inactive"}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingModal;
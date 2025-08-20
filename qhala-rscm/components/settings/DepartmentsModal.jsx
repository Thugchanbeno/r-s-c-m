import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Plus, Edit2, Trash2, Users, ChevronRight } from "lucide-react";

const DepartmentModal = ({ isOpen, onClose, departments, onUpdateDepartments }) => {
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    parentId: null,
    manager: "",
  });
  const [editingDepartment, setEditingDepartment] = useState(null);

  const handleAddDepartment = () => {
    if (newDepartment.name.trim()) {
      const department = {
        ...newDepartment,
        id: Date.now(),
        employeeCount: 0,
        children: [],
      };
      onUpdateDepartments([...departments, department]);
      setNewDepartment({ name: "", description: "", parentId: null, manager: "" });
    }
  };

  const handleDeleteDepartment = (deptId) => {
    const updatedDepartments = departments.filter((dept) => dept.id !== deptId);
    onUpdateDepartments(updatedDepartments);
  };

  const renderDepartmentTree = (depts, level = 0) => {
    return depts.map((dept) => (
      <div key={dept.id} className={`ml-${level * 4}`}>
        <div className="flex items-center justify-between p-3 border rounded-lg mb-2">
          <div className="flex items-center">
            {level > 0 && <ChevronRight size={16} className="mr-2 text-gray-400" />}
            <div>
              <h4 className="font-medium">{dept.name}</h4>
              <p className="text-sm text-gray-600">
                {dept.manager && `Manager: ${dept.manager}`}
                {dept.employeeCount > 0 && ` • ${dept.employeeCount} employees`}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setEditingDepartment(dept)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDeleteDepartment(dept.id)}
              className="p-1 hover:bg-gray-100 rounded text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {dept.children && renderDepartmentTree(dept.children, level + 1)}
      </div>
    ));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Department Configuration" size="lg">
      <div className="space-y-6">
        {/* Add New Department */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Add New Department</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Department name"
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, name: e.target.value })
              }
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Manager name"
              value={newDepartment.manager}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, manager: e.target.value })
              }
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <textarea
            placeholder="Description"
            value={newDepartment.description}
            onChange={(e) =>
              setNewDepartment({ ...newDepartment, description: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md mt-3"
            rows="2"
          />
          <select
            value={newDepartment.parentId || ""}
            onChange={(e) =>
              setNewDepartment({
                ...newDepartment,
                parentId: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 border rounded-md mt-3"
          >
            <option value="">No parent department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddDepartment}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-3"
          >
            <Plus size={16} className="mr-2" />
            Add Department
          </button>
        </div>

        {/* Department Tree */}
        <div>
          <h3 className="font-medium mb-3">Department Hierarchy</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {renderDepartmentTree(departments)}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DepartmentModal;
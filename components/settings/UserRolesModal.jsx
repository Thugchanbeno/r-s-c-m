import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Plus, Edit2, Trash2 } from "lucide-react";

const UserRolesModal = ({ isOpen, onClose, roles, onUpdateRoles }) => {
  const [newRole, setNewRole] = useState({ name: "", permissions: [] });
  const [editingRole, setEditingRole] = useState(null);

  const permissions = [
    "user_management",
    "settings_access",
    "reports_view",
    "data_export",
    "system_admin",
  ];

  const handleAddRole = () => {
    if (newRole.name.trim()) {
      const updatedRoles = [...roles, { ...newRole, id: Date.now() }];
      onUpdateRoles(updatedRoles);
      setNewRole({ name: "", permissions: [] });
    }
  };

  const handleDeleteRole = (roleId) => {
    const updatedRoles = roles.filter((role) => role.id !== roleId);
    onUpdateRoles(updatedRoles);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Roles" size="lg">
      <div className="space-y-6">
        {/* Add New Role */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Add New Role</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Role name"
              value={newRole.name}
              onChange={(e) =>
                setNewRole({ ...newRole, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
            <div>
              <label className="text-sm font-medium mb-2 block">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRole.permissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewRole({
                            ...newRole,
                            permissions: [...newRole.permissions, permission],
                          });
                        } else {
                          setNewRole({
                            ...newRole,
                            permissions: newRole.permissions.filter(
                              (p) => p !== permission
                            ),
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">
                      {permission.replace("_", " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={handleAddRole}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Add Role
            </button>
          </div>
        </div>

        {/* Existing Roles */}
        <div>
          <h3 className="font-medium mb-3">Existing Roles</h3>
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{role.name}</h4>
                  <p className="text-sm text-gray-600">
                    {role.permissions.length} permissions
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="p-1 hover:bg-gray-100 rounded text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserRolesModal;
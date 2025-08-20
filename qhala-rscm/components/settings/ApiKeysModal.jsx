import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Calendar, Shield } from "lucide-react";

const ApiKeysModal = ({ isOpen, onClose, apiKeys, onUpdateApiKeys }) => {
  const [keys, setKeys] = useState([
    {
      id: 1,
      name: "Production API",
      key: "sk_live_1234567890abcdef",
      permissions: ["read", "write"],
      lastUsed: "2025-07-29",
      created: "2025-07-01",
      status: "active",
      usage: 1250,
      limit: 10000,
    },
    {
      id: 2,
      name: "Development API",
      key: "sk_test_abcdef1234567890",
      permissions: ["read"],
      lastUsed: "2025-07-28",
      created: "2025-07-15",
      status: "active",
      usage: 450,
      limit: 5000,
    },
  ]);

  const [newKey, setNewKey] = useState({
    name: "",
    permissions: [],
    limit: 1000,
    expiresAt: "",
  });

  const [showKey, setShowKey] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const permissions = [
    { id: "read", name: "Read", description: "View data and resources" },
    { id: "write", name: "Write", description: "Create and update resources" },
    { id: "delete", name: "Delete", description: "Delete resources" },
    { id: "admin", name: "Admin", description: "Full administrative access" },
  ];

  const generateApiKey = () => {
    const prefix = newKey.permissions.includes("admin") ? "sk_live_" : "sk_test_";
    const randomString = Math.random().toString(36).substring(2, 18);
    return prefix + randomString;
  };

  const handleCreateKey = () => {
    if (newKey.name.trim() && newKey.permissions.length > 0) {
      const apiKey = {
        ...newKey,
        id: Date.now(),
        key: generateApiKey(),
        created: new Date().toISOString().split('T')[0],
        lastUsed: null,
        status: "active",
        usage: 0,
      };
      setKeys([...keys, apiKey]);
      setNewKey({ name: "", permissions: [], limit: 1000, expiresAt: "" });
      setIsCreating(false);
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    
  };

  const revokeKey = (keyId) => {
    setKeys(keys.map(key => 
      key.id === keyId ? { ...key, status: "revoked" } : key
    ));
  };

  const deleteKey = (keyId) => {
    setKeys(keys.filter(key => key.id !== keyId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="API Keys Management" size="xl">
      <div className="space-y-6">
        {/* Create New API Key */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">API Keys</h3>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Create New Key
            </button>
          </div>

          {isCreating && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Key Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Production API"
                    value={newKey.name}
                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rate Limit (requests/hour)</label>
                  <input
                    type="number"
                    value={newKey.limit}
                    onChange={(e) => setNewKey({ ...newKey, limit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-3">
                  {permissions.map((permission) => (
                    <label key={permission.id} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={newKey.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKey({
                              ...newKey,
                              permissions: [...newKey.permissions, permission.id],
                            });
                          } else {
                            setNewKey({
                              ...newKey,
                              permissions: newKey.permissions.filter(p => p !== permission.id),
                            });
                          }
                        }}
                        className="mt-1 mr-2"
                      />
                      <div>
                        <span className="text-sm font-medium">{permission.name}</span>
                        <p className="text-xs text-gray-600">{permission.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={newKey.expiresAt}
                  onChange={(e) => setNewKey({ ...newKey, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create API Key
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Existing API Keys */}
        <div>
          <h3 className="font-medium mb-4">Existing API Keys</h3>
          <div className="space-y-4">
            {keys.map((key) => (
              <div key={key.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Key className="text-blue-600 mr-3" size={20} />
                    <div>
                      <h4 className="font-medium">{key.name}</h4>
                      <p className="text-sm text-gray-600">
                        Created: {key.created} • Last used: {key.lastUsed || "Never"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(key.status)}`}>
                      {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* API Key Display */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">
                      {showKey[key.id] ? key.key : key.key.replace(/./g, "•")}
                    </code>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {showKey[key.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium">Permissions</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {key.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Usage</p>
                    <p className="text-sm text-gray-600">
                      {key.usage.toLocaleString()} / {key.limit.toLocaleString()}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(key.usage / key.limit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Actions</p>
                    <div className="flex space-x-2 mt-1">
                      {key.status === "active" && (
                        <button
                          onClick={() => revokeKey(key.id)}
                          className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="text-yellow-600 mr-3 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-yellow-800">Security Best Practices</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Store API keys securely and never commit them to version control</li>
                <li>• Use different keys for different environments (development, staging, production)</li>
                <li>• Regularly rotate your API keys</li>
                <li>• Monitor API key usage for unusual activity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ApiKeysModal;
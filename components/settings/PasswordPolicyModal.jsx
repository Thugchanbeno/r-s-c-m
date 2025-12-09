import { useState } from "react";
import Modal from "@/components/common/Modal";

const PasswordPolicyModal = ({ isOpen, onClose, policy, onUpdatePolicy }) => {
  const [localPolicy, setLocalPolicy] = useState(policy);

  const handleSave = () => {
    onUpdatePolicy(localPolicy);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Password Policy">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Minimum Length
          </label>
          <input
            type="number"
            min="6"
            max="32"
            value={localPolicy.minLength}
            onChange={(e) =>
              setLocalPolicy({
                ...localPolicy,
                minLength: parseInt(e.target.value),
              })
            }
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localPolicy.requireUppercase}
              onChange={(e) =>
                setLocalPolicy({
                  ...localPolicy,
                  requireUppercase: e.target.checked,
                })
              }
              className="mr-2"
            />
            Require uppercase letters
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localPolicy.requireNumbers}
              onChange={(e) =>
                setLocalPolicy({
                  ...localPolicy,
                  requireNumbers: e.target.checked,
                })
              }
              className="mr-2"
            />
            Require numbers
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localPolicy.requireSpecialChars}
              onChange={(e) =>
                setLocalPolicy({
                  ...localPolicy,
                  requireSpecialChars: e.target.checked,
                })
              }
              className="mr-2"
            />
            Require special characters
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PasswordPolicyModal;
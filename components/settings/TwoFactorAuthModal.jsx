import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Shield, Smartphone, Key, AlertTriangle } from "lucide-react";

const TwoFactorAuthModal = ({ isOpen, onClose, twoFactorSettings, onUpdateTwoFactorSettings }) => {
  const [settings, setSettings] = useState({
    enabled: false,
    required: false,
    methods: {
      sms: { enabled: true, primary: true },
      email: { enabled: true, primary: false },
      authenticator: { enabled: false, primary: false },
    },
    backupCodes: {
      generated: false,
      count: 0,
    }
  });

  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes] = useState([
    "ABC123DEF456",
    "GHI789JKL012",
    "MNO345PQR678",
    "STU901VWX234",
    "YZA567BCD890"
  ]);

  const updateMethodSetting = (method, field, value) => {
    setSettings(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [method]: {
          ...prev.methods[method],
          [field]: value
        }
      }
    }));
  };

  const setPrimaryMethod = (method) => {
    const updatedMethods = Object.keys(settings.methods).reduce((acc, key) => {
      acc[key] = {
        ...settings.methods[key],
        primary: key === method
      };
      return acc;
    }, {});

    setSettings(prev => ({
      ...prev,
      methods: updatedMethods
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Two-Factor Authentication" size="lg">
      <div className="space-y-6">
        {/* Global 2FA Settings */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Shield className="text-green-600 mr-3" size={20} />
            <h3 className="font-medium">Two-Factor Authentication Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Enable 2FA</label>
                <p className="text-sm text-gray-600">Add an extra layer of security to user accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.enabled && (
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Require 2FA for all users</label>
                  <p className="text-sm text-gray-600">Make 2FA mandatory for all user accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.required}
                    onChange={(e) => setSettings({...settings, required: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* 2FA Methods */}
        {settings.enabled && (
          <div>
            <h3 className="font-medium mb-4">Authentication Methods</h3>
            <div className="space-y-3">
              {/* SMS */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Smartphone className="text-blue-600 mr-3" size={20} />
                    <div>
                      <h4 className="font-medium">SMS Authentication</h4>
                      <p className="text-sm text-gray-600">Send verification codes via SMS</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {settings.methods.sms.primary && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Primary
                      </span>
                    )}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.methods.sms.enabled}
                        onChange={(e) => updateMethodSetting('sms', 'enabled', e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                {settings.methods.sms.enabled && !settings.methods.sms.primary && (
                  <button
                    onClick={() => setPrimaryMethod('sms')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Set as primary
                  </button>
                )}
              </div>

              {/* Email */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Key className="text-green-600 mr-3" size={20} />
                    <div>
                      <h4 className="font-medium">Email Authentication</h4>
                      <p className="text-sm text-gray-600">Send verification codes via email</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {settings.methods.email.primary && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Primary
                      </span>
                    )}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.methods.email.enabled}
                        onChange={(e) => updateMethodSetting('email', 'enabled', e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                {settings.methods.email.enabled && !settings.methods.email.primary && (
                  <button
                    onClick={() => setPrimaryMethod('email')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Set as primary
                  </button>
                )}
              </div>

              {/* Authenticator App */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Smartphone className="text-purple-600 mr-3" size={20} />
                    <div>
                      <h4 className="font-medium">Authenticator App</h4>
                      <p className="text-sm text-gray-600">Use apps like Google Authenticator or Authy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {settings.methods.authenticator.primary && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Primary
                      </span>
                    )}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.methods.authenticator.enabled}
                        onChange={(e) => updateMethodSetting('authenticator', 'enabled', e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                {settings.methods.authenticator.enabled && !settings.methods.authenticator.primary && (
                  <button
                    onClick={() => setPrimaryMethod('authenticator')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Set as primary
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Backup Codes */}
        {settings.enabled && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-yellow-600 mr-3" size={20} />
              <h3 className="font-medium">Backup Recovery Codes</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Generate backup codes that users can use if they lose access to their primary 2FA method.
            </p>
            
            {!showBackupCodes ? (
              <button
                onClick={() => setShowBackupCodes(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Generate Backup Codes
              </button>
            ) : (
              <div>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium mb-2">Sample Backup Codes:</p>
                  <div className="grid grid-cols-1 gap-1 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Each user will receive unique backup codes when they enable 2FA.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdateTwoFactorSettings(settings);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TwoFactorAuthModal;
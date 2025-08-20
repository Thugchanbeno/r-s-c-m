import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Bell, Settings, Users, Calendar, FileText } from "lucide-react";

const InAppNotificationsModal = ({ isOpen, onClose, notificationSettings, onUpdateNotificationSettings }) => {
  const [settings, setSettings] = useState({
    realTimeNotifications: true,
    soundEnabled: true,
    desktopNotifications: false,
    emailDigest: "daily",
    categories: {
      tasks: { enabled: true, priority: "high" },
      messages: { enabled: true, priority: "medium" },
      meetings: { enabled: true, priority: "high" },
      reports: { enabled: false, priority: "low" },
      system: { enabled: true, priority: "medium" },
    }
  });

  const updateCategorySetting = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          [field]: value
        }
      }
    }));
  };

  const categoryIcons = {
    tasks: <FileText size={16} />,
    messages: <Users size={16} />,
    meetings: <Calendar size={16} />,
    reports: <FileText size={16} />,
    system: <Settings size={16} />,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="In-App Notifications" size="lg">
      <div className="space-y-6">
        {/* Global Settings */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Global Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Real-time Notifications</label>
                <p className="text-sm text-gray-600">Show notifications as they happen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.realTimeNotifications}
                  onChange={(e) => setSettings({...settings, realTimeNotifications: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Sound Notifications</label>
                <p className="text-sm text-gray-600">Play sound for new notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Desktop Notifications</label>
                <p className="text-sm text-gray-600">Show browser notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.desktopNotifications}
                  onChange={(e) => setSettings({...settings, desktopNotifications: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block font-medium mb-2">Email Digest Frequency</label>
              <select
                value={settings.emailDigest}
                onChange={(e) => setSettings({...settings, emailDigest: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="never">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Categories */}
        <div>
          <h3 className="font-medium mb-4">Notification Categories</h3>
          <div className="space-y-3">
            {Object.entries(settings.categories).map(([category, config]) => (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-3">
                      {categoryIcons[category]}
                    </div>
                    <div>
                      <h4 className="font-medium capitalize">{category}</h4>
                      <p className="text-sm text-gray-600">
                        Notifications for {category} related activities
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={config.enabled}
                      onChange={(e) => updateCategorySetting(category, 'enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {config.enabled && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority Level</label>
                    <select
                      value={config.priority}
                      onChange={(e) => updateCategorySetting(category, 'priority', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

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
              onUpdateNotificationSettings(settings);
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

export default InAppNotificationsModal;
import { useState } from "react";
import Modal from "@/components/common/Modal";
import { HardDrive, Download, Upload, Calendar, Clock, CheckCircle, AlertCircle, Play } from "lucide-react";

const SystemBackupModal = ({ isOpen, onClose, backupSettings, onUpdateBackupSettings }) => {
  const [settings, setSettings] = useState({
    autoBackup: true,
    frequency: "daily",
    time: "02:00",
    retention: 30,
    includeFiles: true,
    includeDatabase: true,
    compression: true,
    encryption: true,
    storageLocation: "cloud",
  });

  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      date: "2025-07-30",
      time: "02:00",
      type: "automatic",
      status: "completed",
      size: "2.4 GB",
      duration: "12 minutes",
    },
    {
      id: 2,
      date: "2025-07-29",
      time: "02:00",
      type: "automatic",
      status: "completed",
      size: "2.3 GB",
      duration: "11 minutes",
    },
    {
      id: 3,
      date: "2025-07-28",
      time: "14:30",
      type: "manual",
      status: "completed",
      size: "2.3 GB",
      duration: "10 minutes",
    },
    {
      id: 4,
      date: "2025-07-28",
      time: "02:00",
      type: "automatic",
      status: "failed",
      size: "-",
      duration: "-",
      error: "Storage quota exceeded",
    },
  ]);

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newBackup = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      type: "manual",
      status: "completed",
      size: "2.4 GB",
      duration: "3 minutes",
    };
    
    setBackupHistory([newBackup, ...backupHistory]);
    setIsCreatingBackup(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-600" size={16} />;
      case "failed":
        return <AlertCircle className="text-red-600" size={16} />;
      case "running":
        return <Clock className="text-blue-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Backup Configuration" size="xl">
      <div className="space-y-6">
        {/* Backup Settings */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Backup Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Automatic Backups</label>
                <p className="text-sm text-gray-600">Enable scheduled automatic backups</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.autoBackup && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Frequency</label>
                    <select
                      value={settings.frequency}
                      onChange={(e) => setSettings({...settings, frequency: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <input
                      type="time"
                      value={settings.time}
                      onChange={(e) => setSettings({...settings, time: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Retention (days)</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.retention}
                      onChange={(e) => setSettings({...settings, retention: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">What to backup</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.includeDatabase}
                      onChange={(e) => setSettings({...settings, includeDatabase: e.target.checked})}
                      className="mr-2"
                    />
                    Database
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.includeFiles}
                      onChange={(e) => setSettings({...settings, includeFiles: e.target.checked})}
                      className="mr-2"
                    />
                    User files and uploads
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Options</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.compression}
                      onChange={(e) => setSettings({...settings, compression: e.target.checked})}
                      className="mr-2"
                    />
                    Enable compression
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.encryption}
                      onChange={(e) => setSettings({...settings, encryption: e.target.checked})}
                      className="mr-2"
                    />
                    Enable encryption
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Storage Location</label>
              <select
                value={settings.storageLocation}
                onChange={(e) => setSettings({...settings, storageLocation: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="local">Local Storage</option>
                <option value="cloud">Cloud Storage</option>
                <option value="both">Both Local and Cloud</option>
              </select>
            </div>
          </div>
        </div>

        {/* Manual Backup */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Manual Backup</h3>
              <p className="text-sm text-gray-600">Create a backup immediately</p>
            </div>
            <button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreatingBackup ? (
                <>
                  <Clock size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" />
                  Create Backup Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Backup History */}
        <div>
          <h3 className="font-medium mb-4">Backup History</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HardDrive className="text-blue-600 mr-3" size={20} />
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium mr-2">
                          {backup.date} at {backup.time}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(backup.status)}`}>
                          {backup.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {backup.type === "automatic" ? "Automatic" : "Manual"} backup
                        {backup.status === "completed" && ` • ${backup.size} • ${backup.duration}`}
                        {backup.error && ` • ${backup.error}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(backup.status)}
                    {backup.status === "completed" && (
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Usage */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Storage Usage</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">24.8 GB</p>
              <p className="text-sm text-gray-600">Total Backups</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">75.2 GB</p>
              <p className="text-sm text-gray-600">Available Space</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">15</p>
              <p className="text-sm text-gray-600">Backup Files</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Storage Used</span>
              <span>24.8 GB / 100 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "25%" }}></div>
            </div>
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
              onUpdateBackupSettings(settings);
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

export default SystemBackupModal;
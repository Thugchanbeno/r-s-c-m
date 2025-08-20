import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Mail, Edit2, Eye, Toggle } from "lucide-react";

const EmailNotificationsModal = ({ isOpen, onClose, emailSettings, onUpdateEmailSettings }) => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Welcome Email",
      subject: "Welcome to {{company_name}}!",
      trigger: "user_registration",
      enabled: true,
      lastModified: "2025-07-29",
    },
    {
      id: 2,
      name: "Password Reset",
      subject: "Reset your password",
      trigger: "password_reset",
      enabled: true,
      lastModified: "2025-07-28",
    },
    {
      id: 3,
      name: "Task Assignment",
      subject: "New task assigned: {{task_name}}",
      trigger: "task_assigned",
      enabled: true,
      lastModified: "2025-07-27",
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const toggleTemplate = (templateId) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { ...template, enabled: !template.enabled }
        : template
    ));
  };

  const editTemplate = (template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Notifications" size="lg">
      <div className="space-y-6">
        {/* Global Settings */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Global Email Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Email Notifications</label>
                <p className="text-sm text-gray-600">Enable/disable all email notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Name</label>
                <input
                  type="text"
                  defaultValue="Your Company"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">From Email</label>
                <input
                  type="email"
                  defaultValue="noreply@yourcompany.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div>
          <h3 className="font-medium mb-4">Email Templates</h3>
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail size={16} className="text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.subject}</p>
                      <p className="text-xs text-gray-500">
                        Trigger: {template.trigger} • Last modified: {template.lastModified}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={template.enabled}
                        onChange={() => toggleTemplate(template.id)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <button
                      onClick={() => editTemplate(template)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Email */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Test Email</h3>
          <div className="flex space-x-3">
            <input
              type="email"
              placeholder="Enter test email address"
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Send Test
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EmailNotificationsModal;
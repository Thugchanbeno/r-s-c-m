import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card";
import Button from "@/components/common/Button.jsx";
import { Settings, Users, Bell, Shield, Database } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Settings sections data structure
const settingsSections = [
  {
    title: "User Management",
    icon: <Users size={18} className="mr-2" />,
    items: [
      {
        title: "User Roles",
        description: "Configure roles and permissions",
        actionLabel: "Manage",
        action: () => console.log("Navigate to user roles management"),
      },
      {
        title: "Department Configuration",
        description: "Set up departments and hierarchies",
        actionLabel: "Manage",
        action: () => console.log("Navigate to department configuration"),
      },
      {
        title: "User Onboarding",
        description: "Configure onboarding workflows",
        actionLabel: "Manage",
        action: () => console.log("Navigate to user onboarding settings"),
      },
    ],
  },
  {
    title: "Security Settings",
    icon: <Shield size={18} className="mr-2" />,
    items: [
      {
        title: "Password Policy",
        description: "Configure password requirements",
        actionLabel: "Manage",
        action: () => console.log("Navigate to password policy settings"),
      },
      {
        title: "Two-Factor Authentication",
        description: "Configure 2FA settings",
        actionLabel: "Manage",
        action: () => console.log("Navigate to 2FA settings"),
      },
      {
        title: "API Keys",
        description: "Manage integration access",
        actionLabel: "Manage",
        action: () => console.log("Navigate to API keys management"),
      },
    ],
  },
  {
    title: "Notification Settings",
    icon: <Bell size={18} className="mr-2" />,
    items: [
      {
        title: "Email Notifications",
        description: "Configure email templates and triggers",
        actionLabel: "Manage",
        action: () => console.log("Navigate to email notification settings"),
      },
      {
        title: "In-App Notifications",
        description: "Configure in-app alert settings",
        actionLabel: "Manage",
        action: () => console.log("Navigate to in-app notification settings"),
      },
    ],
  },
  {
    title: "System Configuration",
    icon: <Database size={18} className="mr-2" />,
    items: [
      {
        title: "Skills Database",
        description: "Manage available skills and categories",
        actionLabel: "Manage",
        action: () => console.log("Navigate to skills database management"),
      },
      {
        title: "System Backup",
        description: "Configure backup schedule and retention",
        actionLabel: "Manage",
        action: () => console.log("Navigate to system backup settings"),
      },
      {
        title: "System Logs",
        description: "View system activity and audit logs",
        actionLabel: "View",
        action: () => console.log("Navigate to system logs view"),
      },
    ],
  },
];

export const SettingsView = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // Show loading state while session is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!session || session.user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Access Restricted
          </h2>
          <p className="text-gray-500 mt-2">
            You don't have permission to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-view transition-opacity duration-300 opacity-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">
          Manage organization-wide settings and configurations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center">
                {section.icon}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.items.map((item, subIdx) => (
                  <div
                    key={subIdx}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500">
                        {item.description}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={item.action}>
                      {item.actionLabel}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

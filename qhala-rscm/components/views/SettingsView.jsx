// components/views/settingsview.jsx
import SettingsCard from "@/components/common/SettingsCard";
import {
  Users,
  Lock,
  Bell,
  Database,
  UserCog,
  Building,
  UserPlus,
  Mail,
  MessageSquare,
  Code,
  Cpu,
  HardDrive,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion"; // Import motion

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Time between each child animation
      delayChildren: 0.1, // Delay before starting children animations
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const SettingsLayout = () => {
  return (
    <motion.div // Main container for animations
      className="max-w-7xl mx-auto p-4 md:p-6" // Added some padding for the page
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Admin Settings
        </h1>
        <p className="text-slate-600">
          Configure system-wide settings and permissions
        </p>
      </motion.div>

      <motion.div className="mb-10" variants={itemVariants}>
        {" "}
        {/* Section title as an item */}
        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          System Settings
        </h2>
        <p className="text-slate-600 mb-6">
          Manage organization-wide settings and configurations
        </p>
      </motion.div>

      {/* The grid itself doesn't need to be a motion container if SettingsCard handles its own item animation
          and the parent `motion.div` is the container.
          Each SettingsCard will be a direct animated child of the main container.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          {/* SettingsCard is already a motion.div with itemVariants */}
          <SettingsCard icon={<Users />} title="User Management" description="">
            <div className="space-y-4">
              <SettingItem
                icon={<UserCog size={16} />}
                title="User Roles"
                description="Configure roles and permissions"
              />
              <SettingItem
                icon={<Building size={16} />}
                title="Department Configuration"
                description="Set up departments and hierarchies"
              />
              <SettingItem
                icon={<UserPlus size={16} />}
                title="User Onboarding"
                description="Configure onboarding workflows"
              />
            </div>
          </SettingsCard>

          <SettingsCard
            icon={<Bell />}
            title="Notification Settings"
            description=""
          >
            <div className="space-y-4">
              <SettingItem
                icon={<Mail size={16} />}
                title="Email Notifications"
                description="Configure email templates and triggers"
              />
              <SettingItem
                icon={<MessageSquare size={16} />}
                title="In-App Notifications"
                description="Configure in-app alert settings"
              />
            </div>
          </SettingsCard>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          <SettingsCard
            icon={<Lock />}
            title="Security Settings"
            description=""
          >
            <div className="space-y-4">
              <SettingItem
                icon={<Lock size={16} />}
                title="Password Policy"
                description="Configure password requirements"
              />
              <SettingItem
                icon={<UserCog size={16} />}
                title="Two-Factor Authentication"
                description="Configure 2FA settings"
              />
              <SettingItem
                icon={<Code size={16} />}
                title="API Keys"
                description="Manage integration access"
              />
            </div>
          </SettingsCard>

          <SettingsCard
            icon={<Database />}
            title="System Configuration"
            description=""
          >
            <div className="space-y-4">
              <SettingItem
                icon={<Cpu size={16} />}
                title="Skills Database"
                description="Manage available skills and categories"
              />
              <SettingItem
                icon={<HardDrive size={16} />}
                title="System Backup"
                description="Configure backup schedule and retention"
              />
              <SettingItem
                icon={<FileText size={16} />}
                title="System Logs"
                description="View system activity and audit logs"
                actionType="view"
              />
            </div>
          </SettingsCard>
        </div>
      </div>
    </motion.div>
  );
};

// SettingItem remains unchanged for now, but could also be animated if desired
const SettingItem = ({ icon, title, description, actionType = "manage" }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-start">
        <div className="mr-3 mt-0.5 text-slate-400">{icon}</div>
        <div>
          <h4 className="text-sm font-medium text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <button
        className={`
        text-xs font-medium px-3 py-1 rounded transition-colors
        ${
          actionType === "manage"
            ? "text-blue-600 hover:bg-blue-50 "
            : "text-slate-600 hover:bg-slate-50  "
        }
      `}
      >
        {actionType === "manage" ? "Manage" : "View"}
      </button>
    </div>
  );
};

export default SettingsLayout;

import { useState } from "react";
import SettingsCard from "@/components/common/SettingsCard";
import UserRolesModal from "@/components/settings/UserRolesModal";
import DepartmentModal from "@/components/settings/DepartmentsModal";
import OnboardingModal from "@/components/settings/OnboardingModal";
import EmailNotificationsModal from "@/components/settings/EmailNotificationsModal";
import InAppNotificationsModal from "@/components/settings/InAppNotificationsModal";
import PasswordPolicyModal from "@/components/settings/PasswordPolicyModal";
import TwoFactorAuthModal from "@/components/settings/TwoFactorAuthModal";
import ApiKeysModal from "@/components/settings/ApiKeysModal";
import SkillsDatabaseModal from "@/components/settings/SkillsDatabaseModal";
import SystemBackupModal from "@/components/settings/SystemBackupModal";
import SystemLogsModal from "@/components/settings/SystemLogsModal";
import { useSettings } from "@/lib/hooks/useSettings";
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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

const SettingsView = () => {
  const { settings, updateSetting, loading } = useSettings();
  const [activeModal, setActiveModal] = useState(null);

  const handleSettingAction = (settingType) => {
    setActiveModal(settingType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <motion.div
        className="max-w-7xl mx-auto p-4 md:p-6 bg-[rgb(var(--background))]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
            Admin Settings
          </h1>
          <p className="text-[rgb(var(--muted-foreground))]">
            Configure system-wide settings and permissions
          </p>
        </motion.div>

        <motion.div className="mb-10" variants={itemVariants}>
          <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">
            System Settings
          </h2>
          <p className="text-[rgb(var(--muted-foreground))] mb-6">
            Manage organization-wide settings and configurations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SettingsCard
              icon={<Users />}
              title="User Management"
              description=""
            >
              <div className="space-y-4">
                <SettingItem
                  icon={<UserCog size={16} />}
                  title="User Roles"
                  description="Configure roles and permissions"
                  onClick={() => handleSettingAction("userRoles")}
                />
                <SettingItem
                  icon={<Building size={16} />}
                  title="Department Configuration"
                  description="Set up departments and hierarchies"
                  onClick={() => handleSettingAction("departments")}
                />
                <SettingItem
                  icon={<UserPlus size={16} />}
                  title="User Onboarding"
                  description="Configure onboarding workflows"
                  onClick={() => handleSettingAction("onboarding")}
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
                  onClick={() => handleSettingAction("emailNotifications")}
                />
                <SettingItem
                  icon={<MessageSquare size={16} />}
                  title="In-App Notifications"
                  description="Configure in-app alert settings"
                  onClick={() => handleSettingAction("inAppNotifications")}
                />
              </div>
            </SettingsCard>
          </div>

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
                  onClick={() => handleSettingAction("passwordPolicy")}
                />
                <SettingItem
                  icon={<UserCog size={16} />}
                  title="Two-Factor Authentication"
                  description="Configure 2FA settings"
                  onClick={() => handleSettingAction("twoFactorAuth")}
                />
                <SettingItem
                  icon={<Code size={16} />}
                  title="API Keys"
                  description="Manage integration access"
                  onClick={() => handleSettingAction("apiKeys")}
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
                  onClick={() => handleSettingAction("skillsDatabase")}
                />
                <SettingItem
                  icon={<HardDrive size={16} />}
                  title="System Backup"
                  description="Configure backup schedule and retention"
                  onClick={() => handleSettingAction("systemBackup")}
                />
                <SettingItem
                  icon={<FileText size={16} />}
                  title="System Logs"
                  description="View system activity and audit logs"
                  actionType="view"
                  onClick={() => handleSettingAction("systemLogs")}
                />
              </div>
            </SettingsCard>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <UserRolesModal
        isOpen={activeModal === "userRoles"}
        onClose={closeModal}
        roles={settings.userRoles}
        onUpdateRoles={(roles) => updateSetting("userRoles", roles)}
      />

      <DepartmentModal
        isOpen={activeModal === "departments"}
        onClose={closeModal}
        departments={settings.departments}
        onUpdateDepartments={(departments) => updateSetting("departments", departments)}
      />

      <OnboardingModal
        isOpen={activeModal === "onboarding"}
        onClose={closeModal}
        workflows={settings.onboardingWorkflows || []}
        onUpdateWorkflows={(workflows) => updateSetting("onboardingWorkflows", workflows)}
      />

      <EmailNotificationsModal
        isOpen={activeModal === "emailNotifications"}
        onClose={closeModal}
        emailSettings={settings.emailSettings}
        onUpdateEmailSettings={(emailSettings) => updateSetting("emailSettings", emailSettings)}
      />

      <InAppNotificationsModal
        isOpen={activeModal === "inAppNotifications"}
        onClose={closeModal}
        notificationSettings={settings.notifications}
        onUpdateNotificationSettings={(notifications) => updateSetting("notifications", notifications)}
      />

      <PasswordPolicyModal
        isOpen={activeModal === "passwordPolicy"}
        onClose={closeModal}
        policy={settings.passwordPolicy}
        onUpdatePolicy={(policy) => updateSetting("passwordPolicy", policy)}
      />

      <TwoFactorAuthModal
        isOpen={activeModal === "twoFactorAuth"}
        onClose={closeModal}
        twoFactorSettings={settings.twoFactorAuth}
        onUpdateTwoFactorSettings={(twoFactorAuth) => updateSetting("twoFactorAuth", twoFactorAuth)}
      />

      <ApiKeysModal
        isOpen={activeModal === "apiKeys"}
        onClose={closeModal}
        apiKeys={settings.apiKeys || []}
        onUpdateApiKeys={(apiKeys) => updateSetting("apiKeys", apiKeys)}
      />

      <SkillsDatabaseModal
        isOpen={activeModal === "skillsDatabase"}
        onClose={closeModal}
        skillsData={settings.skillsData}
        onUpdateSkillsData={(skillsData) => updateSetting("skillsData", skillsData)}
      />

      <SystemBackupModal
        isOpen={activeModal === "systemBackup"}
        onClose={closeModal}
        backupSettings={settings.backup}
        onUpdateBackupSettings={(backup) => updateSetting("backup", backup)}
      />

      <SystemLogsModal
        isOpen={activeModal === "systemLogs"}
        onClose={closeModal}
      />
    </>
  );
};

const SettingItem = ({
  icon,
  title,
  description,
  actionType = "manage",
  onClick,
}) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgb(var(--border))] last:border-0">
      <div className="flex items-start">
        <div className="mr-3 mt-0.5 text-[rgb(var(--primary))]">{icon}</div>
        <div>
          <h4 className="text-sm font-medium text-[rgb(var(--foreground))]">
            {title}
          </h4>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={cn(
          "text-xs font-medium px-3 py-1 rounded transition-colors",
          actionType === "manage"
            ? "text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-accent-background))]"
            : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]"
        )}
      >
        {actionType === "manage" ? "Manage" : "View"}
      </button>
    </div>
  );
};

export default SettingsView;
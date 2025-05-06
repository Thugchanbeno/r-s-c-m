"use client";

import { SettingsView } from "@/components/views/SettingsView";

export default function AdminSettingsPage() {
  return (
    <div className="admin-settings-container">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Administration Settings</h1>
        <p className="text-gray-600">
          Configure system-wide settings and permissions
        </p>
      </div>

      <SettingsView />
    </div>
  );
}

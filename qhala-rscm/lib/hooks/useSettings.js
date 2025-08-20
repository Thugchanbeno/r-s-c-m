import { useState, useEffect } from "react";

export const useSettings = () => {
  const [settings, setSettings] = useState({
    userRoles: [],
    departments: [],
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    notifications: {
      emailEnabled: true,
      inAppEnabled: true,
    },
    twoFactorAuth: {
      enabled: false,
      required: false,
    },
    backup: {
      frequency: "daily",
      retention: 30,
    },
  });

  const [loading, setLoading] = useState(false);

  const updateSetting = async (path, value) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSettings((prev) => {
        const newSettings = { ...prev };
        const keys = path.split(".");
        let current = newSettings;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        
        return newSettings;
      });
    } catch (error) {
      console.error("Failed to update setting:", error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, updateSetting, loading };
};
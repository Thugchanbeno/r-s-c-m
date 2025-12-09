import { useEnhancedNotifications } from './useEnhancedNotifications';

export const useNotificationCount = () => {
  const { unreadCount, loading, sessionStatus } = useEnhancedNotifications();
  
  return {
    count: unreadCount || 0,
    loading,
    sessionStatus
  };
};
import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      autoClose: true,
      ...notification,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Méthodes de convenance pour différents types de notifications
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      title: 'نجح',
      ...options,
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      title: 'خطأ',
      duration: 7000, // Plus long pour les erreurs
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      title: 'تحذير',
      ...options,
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      title: 'معلومات',
      ...options,
    });
  }, [addNotification]);

  const showConfirmDialog = useCallback((message, onConfirm, onCancel) => {
    const id = addNotification({
      type: 'warning',
      message,
      title: 'تأكيد',
      autoClose: false,
      duration: 0,
      actions: {
        confirm: {
          label: 'تأكيد',
          action: () => {
            onConfirm();
            removeNotification(id);
          },
          className: 'bg-danger-600 hover:bg-danger-700 text-white'
        },
        cancel: {
          label: 'إلغاء',
          action: () => {
            if (onCancel) onCancel();
            removeNotification(id);
          },
          className: 'bg-secondary-200 hover:bg-secondary-300 text-secondary-800'
        }
      }
    });
    return id;
  }, [addNotification, removeNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmDialog,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Rendu des notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

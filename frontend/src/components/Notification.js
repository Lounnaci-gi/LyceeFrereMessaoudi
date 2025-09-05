import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Notification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.autoClose !== false) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(notification.id), 300);
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-success-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-danger-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-warning-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-primary-600" />;
      default:
        return <Info className="w-6 h-6 text-secondary-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-success-50 border-success-200';
      case 'error':
        return 'bg-danger-50 border-danger-200';
      case 'warning':
        return 'bg-warning-50 border-warning-200';
      case 'info':
        return 'bg-primary-50 border-primary-200';
      default:
        return 'bg-secondary-50 border-secondary-200';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-success-800';
      case 'error':
        return 'text-danger-800';
      case 'warning':
        return 'text-warning-800';
      case 'info':
        return 'text-primary-800';
      default:
        return 'text-secondary-800';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg p-4`}
        >
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              {notification.title && (
                <h4 className={`text-sm font-medium ${getTextColor()} mb-1`}>
                  {notification.title}
                </h4>
              )}
              <p className={`text-sm ${getTextColor()}`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={handleClose}
              className={`flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-200 ${getTextColor()}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;

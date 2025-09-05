import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'تأكيد', cancelText = 'إلغاء' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-success-600" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-danger-600" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-warning-600" />;
      case 'info':
        return <Info className="w-8 h-8 text-primary-600" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-warning-600" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-success-600 hover:bg-success-700 text-white';
      case 'error':
        return 'bg-danger-600 hover:bg-danger-700 text-white';
      case 'warning':
        return 'bg-warning-600 hover:bg-warning-700 text-white';
      case 'info':
        return 'bg-primary-600 hover:bg-primary-700 text-white';
      default:
        return 'bg-danger-600 hover:bg-danger-700 text-white';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        
        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1 rounded-full hover:bg-secondary-100 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-secondary-500" />
          </button>

          {/* Content */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              {title}
            </h3>
            
            <p className="text-secondary-600 mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex space-x-3 space-x-reverse justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-secondary-200 hover:bg-secondary-300 text-secondary-800 rounded-lg transition-colors duration-200 font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${getConfirmButtonClass()}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;

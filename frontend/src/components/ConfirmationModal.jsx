import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-darkBg border border-gray-800 rounded-lg shadow-2xl max-w-md w-full"
        >
          <div className="p-6">
            {title && (
              <h2 className="text-2xl font-light text-textLight mb-4">
                {title}
              </h2>
            )}
            
            <p className="text-textLight mb-6 font-light">
              {message}
            </p>

            <div className="flex gap-3">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition"
              >
                {cancelText}
              </motion.button>
              <motion.button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 px-6 py-3 rounded-md font-medium transition ${
                  danger
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-netflixRed text-white hover:bg-netflixRed/90'
                }`}
              >
                {confirmText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


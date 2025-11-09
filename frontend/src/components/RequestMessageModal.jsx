import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../contexts/ToastContext";
import { api } from "../api/api";

export default function RequestMessageModal({ isOpen, onClose, idea, onRequestSent }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Debug logging
  console.log('🔔 RequestMessageModal render - isOpen:', isOpen, 'idea:', idea);
  console.log('Modal will render?', isOpen === true);
  
  // Force render test
  if (isOpen) {
    console.log('✅✅✅ MODAL IS OPEN - SHOULD BE VISIBLE ✅✅✅');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast("Please enter a message", "error");
      return;
    }

    setLoading(true);
    try {
      await api.createRequest(idea._id, message);
      showToast("Request sent!", "success");
      setMessage("");
      onRequestSent?.();
      onClose();
    } catch (error) {
      console.error("Failed to send request:", error);
      showToast(
        error.response?.data?.error || "Failed to send request. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Always render the AnimatePresence, but conditionally show content
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-darkBg/95 backdrop-blur-xl border border-gray-900 rounded-lg shadow-2xl max-w-md w-full p-6 pointer-events-auto">
              <h2 className="text-2xl font-light text-textLight mb-2">
                Send a Request
              </h2>
              <p className="text-textGray text-sm font-light mb-6">
                Send a message to the person who posted this idea
              </p>

              {/* Idea Info */}
              {idea && (
                <div className="mb-6 p-4 bg-black/50 rounded-md border border-gray-800">
                  <h3 className="text-textLight font-medium mb-1">{idea.name}</h3>
                  <p className="text-textGray text-sm font-light">{idea.oneLiner}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-textLight font-light mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell them why you're interested in this idea..."
                    className="w-full bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed/50 transition resize-none font-light"
                    rows="4"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-black/50 border border-gray-800 text-textLight py-3 rounded-md font-medium hover:bg-black/70 transition"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-netflixRed text-white py-3 rounded-md font-medium hover:bg-netflixRed/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Request"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


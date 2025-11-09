import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { api } from "../api/api";
import Avatar from "../components/Avatar";

export default function Requests() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await api.getRequests();
      // Backend returns { received: [], sent: [] }
      // We only show received requests (requests for your ideas)
      setRequests(response.data.received || []);
    } catch (error) {
      console.error("Failed to load requests:", error);
      showToast("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.acceptRequest(requestId);
      showToast("Request accepted! You have a new match.", "success");
      loadRequests();
    } catch (error) {
      console.error("Failed to accept request:", error);
      showToast("Failed to accept request", "error");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.rejectRequest(requestId);
      showToast("Request rejected", "info");
      loadRequests();
    } catch (error) {
      console.error("Failed to reject request:", error);
      showToast("Failed to reject request", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-2 border-netflixRed border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  return (
    <div className="min-h-screen bg-black pt-16 md:pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-light text-textLight mb-2 tracking-tight">
            Requests
          </h1>
          <p className="text-sm sm:text-base text-textGray font-light">
            People interested in your ideas
          </p>
        </motion.div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-light text-textLight mb-4">
              Pending ({pendingRequests.length})
            </h2>
            <div className="space-y-4">
              {pendingRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-darkBg/50 backdrop-blur-xl rounded-lg border border-gray-900 p-4 sm:p-6"
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <Link
                      to={`/profile/${request.requester?._id}`}
                      className="flex-shrink-0 hover:opacity-80 transition"
                    >
                      <Avatar
                        src={request.requester?.avatar}
                        name={request.requester?.name}
                        size="md"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${request.requester?._id}`}
                        className="text-textLight font-medium hover:text-netflixRed transition block mb-1"
                      >
                        {request.requester?.name}
                      </Link>
                      <p className="text-textGray text-sm font-light mb-2">
                        Interested in your idea
                      </p>
                      {request.idea && (
                        <div className="mb-3 p-3 bg-black/50 rounded-md border border-gray-800">
                          <h3 className="text-textLight font-medium text-sm mb-1">
                            {request.idea.name}
                          </h3>
                          <p className="text-textGray text-xs font-light">
                            {request.idea.oneLiner}
                          </p>
                        </div>
                      )}
                      <div className="p-3 bg-black/30 rounded-md border border-gray-900">
                        <p className="text-textLight text-sm font-light">
                          {request.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAccept(request._id)}
                      className="flex-1 bg-green-600 text-white py-2.5 rounded-md font-medium hover:bg-green-700 transition text-sm sm:text-base"
                    >
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReject(request._id)}
                      className="flex-1 bg-black/50 border border-gray-800 text-textGray py-2.5 rounded-md font-medium hover:bg-black/70 hover:text-textLight transition text-sm sm:text-base"
                    >
                      Reject
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Requests */}
        {acceptedRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-light text-textLight mb-4">
              Accepted ({acceptedRequests.length})
            </h2>
            <div className="space-y-4">
              {acceptedRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-darkBg/50 backdrop-blur-xl rounded-lg border border-green-900/30 p-4 sm:p-6"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Link
                      to={`/profile/${request.requester?._id}`}
                      className="flex-shrink-0 hover:opacity-80 transition"
                    >
                      <Avatar
                        src={request.requester?.avatar}
                        name={request.requester?.name}
                        size="md"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/profile/${request.requester?._id}`}
                        className="text-textLight font-medium hover:text-netflixRed transition block mb-1"
                      >
                        {request.requester?.name}
                      </Link>
                      <p className="text-textGray text-sm font-light">
                        Accepted - You're now matched!
                      </p>
                    </div>
                    <Link
                      to="/chat"
                      className="text-netflixRed text-xs sm:text-sm font-medium hover:underline flex-shrink-0"
                    >
                      View Match
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-light text-textGray mb-4">
              Rejected ({rejectedRequests.length})
            </h2>
            <div className="space-y-4">
              {rejectedRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-darkBg/30 backdrop-blur-xl rounded-lg border border-gray-900/50 p-4 sm:p-6 opacity-60"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <Avatar
                        src={request.requester?.avatar}
                        name={request.requester?.name}
                        size="md"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-textGray font-medium">
                        {request.requester?.name}
                      </p>
                      <p className="text-textGray text-sm font-light">
                        Request rejected
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && (
          <div className="text-center py-20">
            <p className="text-textGray text-lg font-light">
              No requests yet. Keep sharing ideas!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


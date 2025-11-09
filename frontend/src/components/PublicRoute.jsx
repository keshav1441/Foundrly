import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-netflixRed border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is logged in, redirect to swipe page
  if (user) {
    return <Navigate to="/swipe" replace />;
  }

  return children;
}


import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // avoid flashing a redirect while we check the token
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

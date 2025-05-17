import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ProgressSpinner } from 'primereact/progressspinner';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If the user is not an admin and trying to access the User Management page, redirect to dashboard
  if (!user.isAdmin && window.location.pathname.includes('/admin/users')) {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default AdminRoute;

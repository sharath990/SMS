import { Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/AdminDashboard';
import StudentManagement from '../pages/StudentManagement';
import ClassManagement from '../pages/ClassManagement';
import BatchManagement from '../pages/BatchManagement';
import SubjectManagement from '../pages/SubjectManagement';
import ClassTimingManagement from '../pages/ClassTimingManagement';
import MessageTemplateManagement from '../pages/MessageTemplateManagement';
import MessageSending from '../pages/MessageSending';
import UserManagement from '../pages/UserManagement';
import ResetPassword from '../pages/ResetPassword';
import NotFound from '../pages/NotFound';

// Layout components
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// Protection components
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

/**
 * Application routes configuration
 *
 * This file defines all the routes for the application, organized by section.
 * Each route has a path, element, and optional children for nested routes.
 */
const routes = [
  // Public routes
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      { path: '', element: <Login /> }
    ]
  },
  {
    path: '/reset-password/:token',
    element: <AuthLayout />,
    children: [
      { path: '', element: <ResetPassword /> }
    ]
  },

  // Redirect /dashboard to /admin
  {
    path: '/dashboard',
    element: <Navigate to="/admin" replace />,
  },

  // Admin routes
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      // Default admin route
      { path: '', element: <AdminDashboard /> },

      // Administration section
      { path: 'users', element: <UserManagement /> },

      // Academic section
      { path: 'students', element: <StudentManagement /> },
      { path: 'classes', element: <ClassManagement /> },
      { path: 'batches', element: <BatchManagement /> },
      { path: 'subjects', element: <SubjectManagement /> },
      { path: 'class-timings', element: <ClassTimingManagement /> },

      // Messaging section
      { path: 'messages', element: <MessageSending /> },
      { path: 'message-templates', element: <MessageTemplateManagement /> },
    ]
  },

  // 404 Not Found route
  {
    path: '*',
    element: <NotFound />,
  }
];

export default routes;

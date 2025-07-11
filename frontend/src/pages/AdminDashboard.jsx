import { useContext } from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import AuthContext from '../context/AuthContext';

/**
 * AdminDashboard component
 *
 * This is the main dashboard page for all users.
 * It provides a simple welcome message and navigation instructions.
 */
const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  // Home breadcrumb item
  const homeBreadcrumbItem = { icon: 'pi pi-home', url: '/admin' };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard' }
  ];

  return (
    <div className="dashboard-container">
      <BreadCrumb model={breadcrumbItems} home={homeBreadcrumbItem} className="mb-4 p-2 border-1 border-round surface-border" />

      <div className="card shadow-2 border-round-xl p-4">
        <div className="flex align-items-center mb-4">
          <i className="pi pi-home text-primary mr-2" style={{ fontSize: '1.5rem' }}></i>
          <h2 className="m-0">Welcome, {user?.firstName || 'Admin'}</h2>
        </div>

        <div className="mb-4">
          <p className="text-lg text-700 line-height-3">
            Welcome to the ChaitanyaConnect dashboard.<br />
            Use the sidebar menu to navigate to different sections of the application.
          </p>
          {user?.isAdmin ? (
            <p className="text-md text-blue-600 line-height-3">
              As an administrator, you have access to all features including User Management.
            </p>
          ) : (
            <p className="text-md text-blue-600 line-height-3">
              You have access to all features except User Management, which is restricted to administrators.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useContext } from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import AuthContext from '../context/AuthContext';

/**
 * AdminDashboard component
 *
 * This is the main dashboard page for administrators.
 * It provides a simple welcome message.
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
            Welcome to the MES Chaitanya SMS administration dashboard. Use the sidebar menu to navigate to different sections of the application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

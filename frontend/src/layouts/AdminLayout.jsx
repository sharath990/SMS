import { useState, useContext, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import AuthContext from '../context/AuthContext';
import '../styles/AdminDashboard.css';
import chaitanyaLogo from '../assets/image/chaitanya-logo.png';

/**
 * AdminLayout component
 *
 * This layout is used for all admin pages. It provides:
 * - Top navigation bar
 * - Sidebar menu
 * - Content area with the current route
 * - Toast notifications
 * - Logout confirmation
 */
const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useRef(null);

  // State for sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // State for expanded sections in the sidebar
  const [expandedSections, setExpandedSections] = useState({
    administration: true,
    academic: true,
    messaging: true
  });

  // Function to toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Show toast message
  const showToast = (severity, summary, detail, life = 3000) => {
    if (toast.current) {
      toast.current.show({
        severity,
        summary,
        detail,
        life,
        closable: true
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    confirmDialog({
      message: 'Are you sure you want to logout?',
      header: 'Logout Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-primary p-button-raised',
      rejectClassName: 'p-button-outlined p-button-secondary',
      acceptLabel: 'Logout',
      rejectLabel: 'Cancel',
      accept: () => {
        logout();
        navigate('/login');
        showToast('info', 'Logged Out', 'You have been successfully logged out');
      },
      style: { width: '450px' },
      contentStyle: { padding: '1.5rem' }
    });
  };

  // Check if a menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Menu items for the sidebar - ADMINISTRATION section
  const adminItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-fw pi-home',
      path: '/admin',
      active: isActive('/admin')
    },
    // Only show User Management for admin users
    ...(user?.isAdmin ? [
      {
        label: 'User Management',
        icon: 'pi pi-fw pi-users',
        path: '/admin/users',
        active: isActive('/admin/users')
      }
    ] : [])
  ];

  // Menu items for the sidebar - ACADEMIC section
  const academicItems = [
    {
      label: 'Student Management',
      icon: 'pi pi-fw pi-user',
      path: '/admin/students',
      active: isActive('/admin/students')
    },
    {
      label: 'Class Management',
      icon: 'pi pi-fw pi-book',
      path: '/admin/classes',
      active: isActive('/admin/classes')
    },
    {
      label: 'Batch Management',
      icon: 'pi pi-fw pi-calendar',
      path: '/admin/batches',
      active: isActive('/admin/batches')
    },
    {
      label: 'Subject Management',
      icon: 'pi pi-fw pi-bookmark',
      path: '/admin/subjects',
      active: isActive('/admin/subjects')
    },
    {
      label: 'Class Timing',
      icon: 'pi pi-fw pi-clock',
      path: '/admin/class-timings',
      active: isActive('/admin/class-timings')
    }
  ];

  // Menu items for the sidebar - MESSAGING section
  const messagingItems = [
    {
      label: 'Send Messages',
      icon: 'pi pi-fw pi-envelope',
      path: '/admin/messages',
      active: isActive('/admin/messages')
    },
    {
      label: 'Message Templates',
      icon: 'pi pi-fw pi-file',
      path: '/admin/message-templates',
      active: isActive('/admin/message-templates')
    }
  ];

  return (
    <div className="layout-wrapper">
      {/* PrimeReact Toast for notifications */}
      <Toast ref={toast} position="top-right" />

      {/* PrimeReact ConfirmDialog for logout confirmation */}
      <ConfirmDialog />

      {/* Modern Top Navigation Bar */}
      <div className="layout-topbar shadow-2">
        <div className="layout-topbar-left">
          <Link to="/admin" className="layout-topbar-logo flex align-items-center" style={{ textDecoration: 'none' }}>
            <img src={chaitanyaLogo} alt="Chaitanya Logo" style={{ height: '2.5rem', width: '2.5rem', marginRight: '0.75rem', objectFit: 'contain' }} />
            <div className="flex flex-column align-items-start">
              <span className="font-bold text-xl" style={{ color: '#4b5563' }}>ChaitanyaConnect</span>
              <span className="text-xs" style={{ color: '#4b5563' }}>Parent Messaging Platform</span>
            </div>
          </Link>
          <Button
            icon="pi pi-bars"
            onClick={() => setSidebarVisible(true)}
            className="p-button-rounded p-button-text p-button-plain layout-menu-button"
            aria-label="Menu"
          />
        </div>
        <div className="layout-topbar-right">
          <ul className="layout-topbar-actions p-0 m-0 list-none flex">
            <li className="layout-topbar-item layout-topbar-profile">
              <div className="flex align-items-center">
                <Avatar
                  image="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                  shape="circle"
                  className="mr-2"
                />
                <div className="flex flex-column">
                  <span className="font-bold text-900">{user?.firstName || 'Admin'} {user?.lastName || ''}</span>
                  <span className="text-sm text-500">{user?.mobileNumber || ''}</span>
                </div>
                <Button
                  icon="pi pi-power-off"
                  tooltip="Logout"
                  tooltipOptions={{ position: 'bottom' }}
                  className="p-button-rounded p-button-outlined p-button-danger ml-2"
                  onClick={handleLogout}
                  aria-label="Logout"
                  style={{ width: '2.5rem', height: '2.5rem' }}
                />
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Modern Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        className="layout-sidebar"
        showCloseIcon={false}
        baseZIndex={1000}
      >
        <div className="layout-sidebar-wrapper">
          {/* Sidebar Header */}
          <div className="layout-sidebar-header p-3 border-bottom-1 border-300 flex align-items-center justify-content-between">
            <div className="flex flex-column align-items-start">
              <span className="font-bold text-xl text-900">ChaitanyaConnect</span>
              <span className="text-xs text-500">Parent Messaging Platform</span>
            </div>
            <Button
              icon="pi pi-times"
              onClick={() => setSidebarVisible(false)}
              className="p-button-rounded p-button-text p-button-plain"
              aria-label="Close"
            />
          </div>

          {/* Sidebar Content */}
          <div className="layout-sidebar-content p-0">
            <div className="layout-menu-container">
              {/* Administration Section */}
              <div className="menu-category">
                <div
                  className="menu-category-header flex align-items-center justify-content-between cursor-pointer p-3 text-700 font-medium"
                  onClick={() => toggleSection('administration')}
                >
                  <span>ADMINISTRATION</span>
                  <i className={`pi ${expandedSections.administration ? 'pi-chevron-down' : 'pi-chevron-right'}`}></i>
                </div>
                {expandedSections.administration && (
                  <ul className="layout-menu list-none p-0 m-0">
                    {adminItems.map((item, index) => (
                      <li key={index} className="layout-menuitem">
                        <Link
                          to={item.path}
                          className={`layout-menuitem-link flex align-items-center cursor-pointer p-3 transition-colors transition-duration-150 ${item.active ? 'active-route' : ''}`}
                          onClick={() => setSidebarVisible(false)}
                          style={{ textDecoration: 'none' }}
                        >
                          <i className={`${item.icon} layout-menuitem-icon`}></i>
                          <span className="layout-menuitem-text">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Academic Section */}
              <div className="menu-category">
                <div
                  className="menu-category-header flex align-items-center justify-content-between cursor-pointer p-3 text-700 font-medium"
                  onClick={() => toggleSection('academic')}
                >
                  <span>ACADEMIC</span>
                  <i className={`pi ${expandedSections.academic ? 'pi-chevron-down' : 'pi-chevron-right'}`}></i>
                </div>
                {expandedSections.academic && (
                  <ul className="layout-menu list-none p-0 m-0">
                    {academicItems.map((item, index) => (
                      <li key={index} className="layout-menuitem">
                        <Link
                          to={item.path}
                          className={`layout-menuitem-link flex align-items-center cursor-pointer p-3 transition-colors transition-duration-150 ${item.active ? 'active-route' : ''}`}
                          onClick={() => setSidebarVisible(false)}
                          style={{ textDecoration: 'none' }}
                        >
                          <i className={`${item.icon} layout-menuitem-icon`}></i>
                          <span className="layout-menuitem-text">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Messaging Section */}
              <div className="menu-category">
                <div
                  className="menu-category-header flex align-items-center justify-content-between cursor-pointer p-3 text-700 font-medium"
                  onClick={() => toggleSection('messaging')}
                >
                  <span>MESSAGING</span>
                  <i className={`pi ${expandedSections.messaging ? 'pi-chevron-down' : 'pi-chevron-right'}`}></i>
                </div>
                {expandedSections.messaging && (
                  <ul className="layout-menu list-none p-0 m-0">
                    {messagingItems.map((item, index) => (
                      <li key={index} className="layout-menuitem">
                        <Link
                          to={item.path}
                          className={`layout-menuitem-link flex align-items-center cursor-pointer p-3 transition-colors transition-duration-150 ${item.active ? 'active-route' : ''}`}
                          onClick={() => setSidebarVisible(false)}
                          style={{ textDecoration: 'none' }}
                        >
                          <i className={`${item.icon} layout-menuitem-icon`}></i>
                          <span className="layout-menuitem-text">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="layout-sidebar-footer p-3 border-top-1 border-300 mt-auto">
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              className="p-button-danger p-button-raised w-full"
              onClick={handleLogout}
              style={{ padding: '0.75rem 1rem' }}
            />
          </div>
        </div>
      </Sidebar>

      {/* Main Content */}
      <div className="layout-main">
        <div className="layout-content p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

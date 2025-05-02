import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Avatar } from 'primereact/avatar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

// Import BreadCrumb with correct capitalization
import { BreadCrumb } from 'primereact/breadcrumb';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import StudentManagement from './StudentManagement';
import ClassManagement from './ClassManagement';
import BatchManagement from './BatchManagement';
import SubjectManagement from './SubjectManagement';
import ClassTimingManagement from './ClassTimingManagement';
import MessageTemplateManagement from './MessageTemplateManagement';
import MessageSending from './MessageSending';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useRef(null);

  // State variables
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeContent, setActiveContent] = useState('welcome');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    administration: true, // Start with administration section expanded
    academic: true, // Start with academic section expanded
    messaging: true // Start with messaging section expanded
  });
  const [newUser, setNewUser] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    isAdmin: true // All users are admins by default now
  });
  const [editUser, setEditUser] = useState({
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    isAdmin: true
  });
  const [formError, setFormError] = useState('');

  // Function to toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    // Redirect if not admin
    if (user && !user.isAdmin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Define fetchUsers function with useCallback
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      const res = await axios.get('http://localhost:5000/api/auth/users', config);
      setUsers(res.data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch users',
          life: 3000
        });
      }
    }
  }, [token, toast]);

  // Fetch users when "Manage Users" is clicked
  useEffect(() => {
    if (activeContent === 'manageUsers') {
      fetchUsers();
    }
  }, [activeContent, fetchUsers]);

  // Show enhanced toast message with PrimeReact styling
  const showToast = (severity, summary, detail, life = 3000) => {
    if (toast.current) {
      toast.current.show({
        severity,
        summary,
        detail,
        life,
        closable: true,
        className: `custom-toast-${severity}`,
        contentClassName: 'p-2',
        contentStyle: { border: '1px solid var(--surface-border)', borderRadius: '6px' },
        icon: getToastIcon(severity)
      });
    }
  };

  // Helper function to get appropriate icon for toast
  const getToastIcon = (severity) => {
    switch (severity) {
      case 'success':
        return 'pi pi-check-circle';
      case 'info':
        return 'pi pi-info-circle';
      case 'warn':
        return 'pi pi-exclamation-triangle';
      case 'error':
        return 'pi pi-times-circle';
      default:
        return 'pi pi-info-circle';
    }
  };

  // Validate user form data
  const validateUserForm = (userData, isPasswordRequired = true) => {
    // Check required fields
    if (!userData.username || !userData.firstName || !userData.lastName || !userData.email || !userData.mobileNumber || (isPasswordRequired && !userData.password)) {
      setFormError('Please fill in all required fields');
      return false;
    }

    // Username validation (at least 3 characters)
    if (userData.username.length < 3) {
      setFormError('Username must be at least 3 characters long');
      return false;
    }

    // First name validation
    if (userData.firstName.length < 2) {
      setFormError('First name must be at least 2 characters long');
      return false;
    }

    // Last name validation
    if (userData.lastName.length < 2) {
      setFormError('Last name must be at least 2 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }

    // Mobile number validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(userData.mobileNumber)) {
      setFormError('Please enter a valid 10-digit mobile number');
      return false;
    }

    // Password validation (at least 6 characters) - only if password is provided or required
    if ((isPasswordRequired || userData.password) && userData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    try {
      // Validate form
      if (!validateUserForm(newUser, true)) {
        return;
      }

      setLoading(true);
      console.log('Creating user with data:', { ...newUser, password: '***' });

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      const response = await axios.post(
        'http://localhost:5000/api/auth/users',
        newUser,
        config
      );

      console.log('User creation response:', response.data);

      setLoading(false);
      setShowCreateUserDialog(false);

      // Store the username before resetting the form
      const createdUsername = newUser.username;

      // Reset form
      setNewUser({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        password: '',
        isAdmin: true
      });
      setFormError('');

      // Show success message
      showToast(
        'success',
        'User Created',
        `User ${createdUsername} has been created successfully`
      );

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      setLoading(false);

      // Get detailed error message
      let errorMsg = 'Error creating user';

      if (error.response) {
        console.log('Error response:', error.response);
        errorMsg = error.response.data?.message || 'Server returned an error';
      } else if (error.request) {
        console.log('Error request:', error.request);
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        console.log('Error message:', error.message);
        errorMsg = error.message;
      }

      setFormError(errorMsg);

      // Show error toast
      showToast('error', 'Creation Failed', errorMsg);
    }
  };

  const handleEditUser = (rowData) => {
    setEditUser({
      id: rowData._id,
      username: rowData.username,
      firstName: rowData.firstName,
      lastName: rowData.lastName,
      email: rowData.email,
      mobileNumber: rowData.mobileNumber,
      password: '', // Password field is empty when editing
      isAdmin: rowData.isAdmin
    });
    setFormError('');
    setShowEditUserDialog(true);
  };

  const handleUpdateUser = async () => {
    try {
      // Validate form - password is not required for updates
      if (!validateUserForm(editUser, false)) {
        return;
      }

      setLoading(true);
      console.log('Updating user with data:', { ...editUser, password: editUser.password ? '***' : '' });

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      // Create a copy of editUser to send to the server
      const userDataToUpdate = { ...editUser };

      // Only include password if it's not empty
      if (!userDataToUpdate.password) {
        delete userDataToUpdate.password;
      }

      const response = await axios.put(
        `http://localhost:5000/api/auth/users/${editUser.id}`,
        userDataToUpdate,
        config
      );

      console.log('User update response:', response.data);

      setLoading(false);
      setShowEditUserDialog(false);

      // Reset form
      setEditUser({
        id: '',
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        password: '',
        isAdmin: true
      });
      setFormError('');

      // Show success message
      showToast(
        'success',
        'User Updated',
        `User ${response.data.user.username} has been updated successfully`
      );

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setLoading(false);

      // Get detailed error message
      let errorMsg = 'Error updating user';

      if (error.response) {
        console.log('Error response:', error.response);
        errorMsg = error.response.data?.message || 'Server returned an error';
      } else if (error.request) {
        console.log('Error request:', error.request);
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        console.log('Error message:', error.message);
        errorMsg = error.message;
      }

      setFormError(errorMsg);

      // Show error toast
      showToast('error', 'Update Failed', errorMsg);
    }
  };

  const confirmDeleteUser = (rowData) => {
    confirmDialog({
      message: `Are you sure you want to delete user "${rowData.username}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger p-button-raised',
      rejectClassName: 'p-button-outlined p-button-secondary',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => handleDeleteUser(rowData),
      style: { width: '450px' },
      contentStyle: { padding: '1.5rem' }
    });
  };

  const handleDeleteUser = async (rowData) => {
    try {
      setLoading(true);
      console.log('Deleting user with ID:', rowData._id);

      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      const response = await axios.delete(
        `http://localhost:5000/api/auth/users/${rowData._id}`,
        config
      );

      console.log('User deletion response:', response.data);

      setLoading(false);

      // Show success message
      showToast(
        'success',
        'User Deleted',
        `User ${rowData.username} has been deleted successfully`
      );

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setLoading(false);

      // Get detailed error message
      let errorMsg = 'Error deleting user';

      if (error.response) {
        console.log('Error response:', error.response);
        errorMsg = error.response.data?.message || 'Server returned an error';
      } else if (error.request) {
        console.log('Error request:', error.request);
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        console.log('Error message:', error.message);
        errorMsg = error.message;
      }

      // Show error toast
      showToast('error', 'Deletion Failed', errorMsg);
    }
  };

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

  // Menu items for the sidebar - ADMINISTRATION section
  const adminItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-fw pi-home',
      command: () => {
        setActiveContent('welcome');
        setSidebarVisible(false);
      }
    },
    {
      label: 'User Management',
      icon: 'pi pi-fw pi-users',
      command: () => {
        setActiveContent('manageUsers');
        setSidebarVisible(false);
      }
    }
  ];

  // Menu items for the sidebar - ACADEMIC section
  const academicItems = [
    {
      label: 'Student Management',
      icon: 'pi pi-fw pi-user',
      command: () => {
        setActiveContent('manageStudents');
        setSidebarVisible(false);
      }
    },
    {
      label: 'Class Management',
      icon: 'pi pi-fw pi-book',
      command: () => {
        setActiveContent('manageClasses');
        setSidebarVisible(false);
      }
    },
    {
      label: 'Batch Management',
      icon: 'pi pi-fw pi-calendar',
      command: () => {
        setActiveContent('manageBatches');
        setSidebarVisible(false);
      }
    },
    {
      label: 'Subject Management',
      icon: 'pi pi-fw pi-bookmark',
      command: () => {
        setActiveContent('manageSubjects');
        setSidebarVisible(false);
      }
    },
    {
      label: 'Class Timing',
      icon: 'pi pi-fw pi-clock',
      command: () => {
        setActiveContent('manageClassTimings');
        setSidebarVisible(false);
      }
    }
  ];

  // Menu items for the sidebar - MESSAGING section
  const messagingItems = [
    {
      label: 'Send Messages',
      icon: 'pi pi-fw pi-envelope',
      command: () => {
        setActiveContent('sendMessages');
        setSidebarVisible(false);
      }
    },
    {
      label: 'Message Templates',
      icon: 'pi pi-fw pi-file',
      command: () => {
        setActiveContent('messageTemplates');
        setSidebarVisible(false);
      }
    }
  ];

  // Home breadcrumb item
  const homeBreadcrumbItem = { icon: 'pi pi-home', url: '#' };

  // Render welcome content - empty dashboard as requested
  const renderWelcome = () => {
    const breadcrumbItems = [
      { label: 'Dashboard' }
    ];

    return (
      <div>
        <BreadCrumb model={breadcrumbItems} home={homeBreadcrumbItem} className="mb-3 p-2 border-1 border-round surface-border" />

        <div className="flex justify-content-between align-items-center mb-5">
          <h1 className="m-0 text-900 font-bold text-3xl">Dashboard</h1>
        </div>

        <div className="card shadow-1 p-5">
          <div className="flex flex-column align-items-center justify-content-center">
            <i className="pi pi-home text-primary mb-3" style={{ fontSize: '3rem' }}></i>
            <h2 className="text-900 font-medium mb-2">Welcome to the Admin Dashboard</h2>
            <p className="text-600 text-center mb-5">Use the sidebar menu to navigate through different sections.</p>
          </div>
        </div>
      </div>
    );
  };

  // Render users management content
  const renderUsersManagement = () => {
    const breadcrumbItems = [
      { label: 'Dashboard', url: '#', command: () => setActiveContent('welcome') },
      { label: 'User Management' }
    ];

    // We're removing the unused variables to fix the errors

    return (
      <div className="user-management-container">
        <BreadCrumb model={breadcrumbItems} home={homeBreadcrumbItem} className="mb-4 p-2 border-1 border-round surface-border" />

        <div className="card shadow-2 border-round-xl p-0 overflow-hidden">
          <DataTable
            value={users}
            paginator
            rows={10}
            loading={loading}
            emptyMessage="No users found"
            className="p-datatable-sm"
            header={
              <div className="flex justify-content-between align-items-center">
                <h3 className="m-0">User Management</h3>
                <Button
                  label="New User"
                  icon="pi pi-plus"
                  onClick={() => setShowCreateUserDialog(true)}
                  className="p-button-primary p-button-raised"
                  style={{ padding: '0.5rem 1rem' }}
                />
              </div>
            }
          >
            <Column field="username" header="Username" sortable />
            <Column field="firstName" header="First Name" sortable />
            <Column field="lastName" header="Last Name" sortable />
            <Column field="email" header="Email" sortable />
            <Column field="mobileNumber" header="Mobile Number" sortable />
            <Column
              field="createdAt"
              header="Created At"
              body={(rowData) => rowData.createdAt ? new Date(rowData.createdAt).toLocaleDateString() : 'N/A'}
              sortable
            />
            <Column
              header="Actions"
              body={(rowData) => (
                <div className="flex gap-2 justify-content-center">
                  <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-outlined p-button-success"
                    style={{ width: '2.5rem', height: '2.5rem' }}
                    onClick={() => handleEditUser(rowData)}
                    tooltip="Edit User"
                    tooltipOptions={{ position: 'top' }}
                  />
                  <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-outlined p-button-danger"
                    style={{ width: '2.5rem', height: '2.5rem' }}
                    onClick={() => confirmDeleteUser(rowData)}
                    tooltip="Delete User"
                    tooltipOptions={{ position: 'top' }}
                  />
                </div>
              )}
            />
          </DataTable>
        </div>
      </div>
    );
  };

  // Render create user dialog
  const renderCreateUserDialog = () => (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-user-plus text-primary text-xl"></i>
          <span className="font-bold text-xl">Create New User</span>
        </div>
      }
      visible={showCreateUserDialog}
      style={{ width: '500px' }}
      modal
      onHide={() => {
        setShowCreateUserDialog(false);
        setFormError('');
      }}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={() => {
              setShowCreateUserDialog(false);
              setFormError('');
            }}
            className="p-button-outlined p-button-secondary"
            style={{ padding: '0.5rem 1rem' }}
          />
          <Button
            label="Create User"
            icon="pi pi-check"
            onClick={handleCreateUser}
            loading={loading}
            autoFocus
            className="p-button-primary p-button-raised"
            style={{ padding: '0.5rem 1rem' }}
          />
        </div>
      }
    >
      {formError && <Message severity="error" text={formError} />}

      <div className="p-fluid mt-3 p-3">
        <div className="field">
          <label htmlFor="username" className="font-medium">Username*</label>
          <InputText
            id="username"
            value={newUser.username}
            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
            className="p-inputtext-lg"
            autoFocus
          />
          <small className="text-secondary">Enter a unique username for this user</small>
        </div>

        <div className="field">
          <label htmlFor="firstName" className="font-medium">First Name*</label>
          <InputText
            id="firstName"
            value={newUser.firstName}
            onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
            className="p-inputtext-lg"
          />
          <small className="text-secondary">Enter the user's first name</small>
        </div>

        <div className="field">
          <label htmlFor="lastName" className="font-medium">Last Name*</label>
          <InputText
            id="lastName"
            value={newUser.lastName}
            onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
            className="p-inputtext-lg"
          />
          <small className="text-secondary">Enter the user's last name</small>
        </div>

        <div className="field">
          <label htmlFor="email" className="font-medium">Email Address*</label>
          <InputText
            id="email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            className="p-inputtext-lg"
          />
          <small className="text-secondary">Enter a valid email address</small>
        </div>

        <div className="field">
          <label htmlFor="mobileNumber" className="font-medium">Mobile Number*</label>
          <InputText
            id="mobileNumber"
            value={newUser.mobileNumber}
            onChange={(e) => setNewUser({...newUser, mobileNumber: e.target.value})}
            className="p-inputtext-lg"
            keyfilter="pint" // Only allow positive integers
            maxLength={10}
          />
          <small className="text-secondary">Enter a 10-digit mobile number</small>
        </div>

        <div className="field">
          <label htmlFor="password" className="font-medium">Password*</label>
          <Password
            id="password"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            toggleMask
            feedback={true}
            className="p-inputtext-lg"
            inputClassName="w-full"
          />
          <small className="text-secondary">Password must be at least 6 characters long</small>
        </div>
      </div>
    </Dialog>
  );

  // Render edit user dialog
  const renderEditUserDialog = () => (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-user-edit text-primary text-xl"></i>
          <span className="font-bold text-xl">Edit User</span>
        </div>
      }
      visible={showEditUserDialog}
      style={{ width: '500px' }}
      modal
      onHide={() => {
        setShowEditUserDialog(false);
        setFormError('');
      }}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={() => {
              setShowEditUserDialog(false);
              setFormError('');
            }}
            className="p-button-outlined p-button-secondary"
            style={{ padding: '0.5rem 1rem' }}
          />
          <Button
            label="Update User"
            icon="pi pi-check"
            onClick={handleUpdateUser}
            loading={loading}
            autoFocus
            className="p-button-primary p-button-raised"
            style={{ padding: '0.5rem 1rem' }}
          />
        </div>
      }
    >
      {formError && <Message severity="error" text={formError} />}

      <div className="p-fluid mt-3 p-3">
        <div className="field">
          <label htmlFor="edit-username" className="font-medium">Username*</label>
          <InputText
            id="edit-username"
            value={editUser.username}
            onChange={(e) => setEditUser({...editUser, username: e.target.value})}
            className="p-inputtext-lg"
            autoFocus
          />
          <small className="text-secondary">Enter a unique username for this user</small>
        </div>

        <div className="field">
          <label htmlFor="edit-firstName" className="font-medium">First Name*</label>
          <InputText
            id="edit-firstName"
            value={editUser.firstName}
            onChange={(e) => setEditUser({...editUser, firstName: e.target.value})}
            className="p-inputtext-lg"
          />
          <small className="text-secondary">Enter the user's first name</small>
        </div>

        <div className="field">
          <label htmlFor="edit-lastName" className="font-medium">Last Name*</label>
          <InputText
            id="edit-lastName"
            value={editUser.lastName}
            onChange={(e) => setEditUser({...editUser, lastName: e.target.value})}
            className="p-inputtext-lg"
          />
          <small className="text-secondary">Enter the user's last name</small>
        </div>

        <div className="field">
          <label htmlFor="edit-email" className="font-medium">Email Address*</label>
          <InputText
            id="edit-email"
            type="email"
            value={editUser.email}
            onChange={(e) => setEditUser({...editUser, email: e.target.value})}
            className="p-inputtext-lg"
          />
          <small className="text-secondary">Enter a valid email address</small>
        </div>

        <div className="field">
          <label htmlFor="edit-mobileNumber" className="font-medium">Mobile Number*</label>
          <InputText
            id="edit-mobileNumber"
            value={editUser.mobileNumber}
            onChange={(e) => setEditUser({...editUser, mobileNumber: e.target.value})}
            className="p-inputtext-lg"
            keyfilter="pint" // Only allow positive integers
            maxLength={10}
          />
          <small className="text-secondary">Enter a 10-digit mobile number</small>
        </div>

        <div className="field">
          <label htmlFor="edit-password" className="font-medium">Password</label>
          <Password
            id="edit-password"
            value={editUser.password}
            onChange={(e) => setEditUser({...editUser, password: e.target.value})}
            toggleMask
            feedback={true}
            className="p-inputtext-lg"
            inputClassName="w-full"
          />
          <small className="text-secondary">Leave empty to keep current password, or enter a new password (min 6 characters)</small>
        </div>
      </div>
    </Dialog>
  );

  return (
    <div className="layout-wrapper">
      {/* PrimeReact Toast for notifications */}
      <Toast ref={toast} position="top-right" />

      {/* PrimeReact ConfirmDialog for logout confirmation */}
      <ConfirmDialog />

      {/* Modern Top Navigation Bar */}
      <div className="layout-topbar shadow-2">
        <div className="layout-topbar-left">
          <a className="layout-topbar-logo flex align-items-center">
            <i className="pi pi-bolt text-primary mr-2" style={{ fontSize: '2rem' }}></i>
            <span className="font-bold text-xl text-900">Admin Panel</span>
          </a>
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
            <div className="flex align-items-center">
              <i className="pi pi-bolt text-primary mr-2" style={{ fontSize: '1.5rem' }}></i>
              <span className="font-bold text-xl text-900">Admin Panel</span>
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
                        <a
                          className="layout-menuitem-link flex align-items-center cursor-pointer p-3 transition-colors transition-duration-150"
                          onClick={item.command}
                        >
                          <i className={`${item.icon} layout-menuitem-icon`}></i>
                          <span className="layout-menuitem-text">{item.label}</span>
                        </a>
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
                        <a
                          className="layout-menuitem-link flex align-items-center cursor-pointer p-3 transition-colors transition-duration-150"
                          onClick={item.command}
                        >
                          <i className={`${item.icon} layout-menuitem-icon`}></i>
                          <span className="layout-menuitem-text">{item.label}</span>
                        </a>
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
                        <a
                          className="layout-menuitem-link flex align-items-center cursor-pointer p-3 transition-colors transition-duration-150"
                          onClick={item.command}
                        >
                          <i className={`${item.icon} layout-menuitem-icon`}></i>
                          <span className="layout-menuitem-text">{item.label}</span>
                        </a>
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
          {activeContent === 'welcome' && renderWelcome()}
          {activeContent === 'manageUsers' && renderUsersManagement()}
          {activeContent === 'manageStudents' && <StudentManagement />}
          {activeContent === 'manageClasses' && <ClassManagement />}
          {activeContent === 'manageBatches' && <BatchManagement />}
          {activeContent === 'manageSubjects' && <SubjectManagement />}
          {activeContent === 'manageClassTimings' && <ClassTimingManagement />}
          {activeContent === 'messageTemplates' && <MessageTemplateManagement />}
          {activeContent === 'sendMessages' && <MessageSending />}
        </div>
      </div>

      {renderCreateUserDialog()}
      {renderEditUserDialog()}
    </div>
  );
};

export default AdminDashboard;

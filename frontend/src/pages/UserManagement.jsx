import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { BreadCrumb } from 'primereact/breadcrumb';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

/**
 * UserManagement component
 * 
 * This component handles the user management functionality:
 * - List all users
 * - Create new users
 * - Edit existing users
 * - Delete users
 */
const UserManagement = () => {
  const { token } = useContext(AuthContext);
  const toast = useRef(null);

  // State variables
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    isAdmin: true // All users are admins by default
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
  }, [token]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Show enhanced toast message with PrimeReact styling
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
        errorMsg = error.response.data?.message || 'Server returned an error';
      } else if (error.request) {
        errorMsg = 'No response from server. Please check your connection.';
      } else {
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
        errorMsg = error.response.data?.message || 'Server returned an error';
      } else if (error.request) {
        errorMsg = 'No response from server. Please check your connection.';
      } else {
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

      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      await axios.delete(
        `http://localhost:5000/api/auth/users/${rowData._id}`,
        config
      );

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
        errorMsg = error.response.data?.message || 'Server returned an error';
      } else if (error.request) {
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        errorMsg = error.message;
      }

      // Show error toast
      showToast('error', 'Deletion Failed', errorMsg);
    }
  };

  // Home breadcrumb item
  const homeBreadcrumbItem = { icon: 'pi pi-home', url: '/admin' };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Administration' },
    { label: 'User Management' }
  ];

  return (
    <div className="user-management-container">
      <Toast ref={toast} />
      <ConfirmDialog />

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

      {/* Create User Dialog */}
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

      {/* Edit User Dialog */}
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
    </div>
  );
};

export default UserManagement;

import { useState, useRef, useContext } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import AuthContext from '../context/AuthContext';
import { classService } from '../services';
import ClassList from '../components/classes/ClassList';
import ClassForm from '../components/classes/ClassForm';
import '../styles/ClassManagement.css';

const ClassManagement = () => {
  const { token } = useContext(AuthContext);
  const toast = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedClass, setSelectedClass] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', url: '/admin' },
    { label: 'Class Management' }
  ];

  const homeBreadcrumbItem = { icon: 'pi pi-home', url: '/admin' };

  // Handle add button click
  const handleAddClick = () => {
    setFormMode('add');
    setSelectedClass(null);
    setShowForm(true);
  };

  // Handle edit button click
  const handleEditClick = (classItem) => {
    setFormMode('edit');
    setSelectedClass(classItem);
    setShowForm(true);
  };

  // Handle save class
  const handleSaveClass = async (formData, mode) => {
    try {
      let response;

      if (mode === 'add') {
        // Create new class
        response = await classService.createClass(token, formData);

        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Class added successfully',
            life: 3000
          });
        } else {
          throw new Error(response.error.message || 'Failed to create class');
        }
      } else {
        // Update existing class
        response = await classService.updateClass(token, selectedClass._id, formData);

        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Class updated successfully',
            life: 3000
          });
        } else {
          throw new Error(response.error.message || 'Failed to update class');
        }
      }

      // Trigger list refresh
      setRefreshList(prev => !prev);

      return response.data;
    } catch (error) {
      console.error('Error saving class:', error);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to save class',
        life: 3000
      });

      throw error;
    }
  };

  return (
    <div className="class-management-container">
      <Toast ref={toast} />

      <BreadCrumb model={breadcrumbItems} home={homeBreadcrumbItem} className="mb-4 p-2 border-1 border-round surface-border" />

      <div className="card shadow-2 border-round-xl p-0 overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border flex justify-content-between align-items-center">
          <h3 className="m-0 font-semibold text-xl">Class Management</h3>
          <div className="flex gap-2">
            <Button
              label="New Class"
              icon="pi pi-plus"
              onClick={handleAddClick}
              className="p-button-primary p-button-raised"
              style={{ padding: '0.5rem 1rem' }}
            />
          </div>
        </div>
        <ClassList
          token={token}
          onEdit={handleEditClick}
          refreshList={refreshList}
        />
      </div>

      <ClassForm
        visible={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSaveClass}
        classItem={selectedClass}
        mode={formMode}
      />
    </div>
  );
};

export default ClassManagement;

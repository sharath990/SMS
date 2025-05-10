import { useState, useRef, useContext } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import AuthContext from '../context/AuthContext';
import { classTimingService } from '../services';
import ClassTimingList from '../components/classTimings/ClassTimingList';
import ClassTimingForm from '../components/classTimings/ClassTimingForm';
import ClassTimingView from '../components/classTimings/ClassTimingView';
import '../styles/ClassTimingManagement.css';

const ClassTimingManagement = () => {
  const { token } = useContext(AuthContext);
  const toast = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedClassTiming, setSelectedClassTiming] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', url: '/admin' },
    { label: 'Class Timing Management' }
  ];

  const homeBreadcrumbItem = { icon: 'pi pi-home', url: '/admin' };

  // Handle add button click
  const handleAddClick = () => {
    setFormMode('add');
    setSelectedClassTiming(null);
    setShowForm(true);
  };

  // Handle edit button click
  const handleEditClick = (classTiming) => {
    setFormMode('edit');
    setSelectedClassTiming(classTiming);
    setShowForm(true);
  };

  // Handle view button click
  const handleViewClick = (classTiming) => {
    setSelectedClassTiming(classTiming);
    setShowView(true);
  };

  // Handle save class timing
  const handleSaveClassTiming = async (formData, mode) => {
    try {
      let response;

      if (mode === 'add') {
        // Create new class timing
        response = await classTimingService.createClassTiming(token, formData);

        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Class timing added successfully',
            life: 3000
          });
        } else {
          throw new Error(response.error.message || 'Failed to create class timing');
        }
      } else {
        // Update existing class timing
        response = await classTimingService.updateClassTiming(token, selectedClassTiming._id, formData);

        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Class timing updated successfully',
            life: 3000
          });
        } else {
          throw new Error(response.error.message || 'Failed to update class timing');
        }
      }

      // Trigger list refresh
      setRefreshList(prev => !prev);

      return response.data;
    } catch (error) {
      console.error('Error saving class timing:', error);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to save class timing',
        life: 3000
      });

      throw error;
    }
  };

  return (
    <div className="class-timing-management-container">
      <Toast ref={toast} />

      <BreadCrumb model={breadcrumbItems} home={homeBreadcrumbItem} className="mb-4 p-2 border-1 border-round surface-border" />

      <div className="card shadow-2 border-round-xl p-0 overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border flex justify-content-between align-items-center">
          <h3 className="m-0 font-semibold text-xl">Class Timing Management</h3>
          <div className="flex gap-2">
            <Button
              label="New Class Timing"
              icon="pi pi-plus"
              onClick={handleAddClick}
              className="p-button-primary p-button-raised"
              style={{ padding: '0.5rem 1rem' }}
            />
          </div>
        </div>
        <ClassTimingList
          token={token}
          onEdit={handleEditClick}
          onView={handleViewClick}
          refreshList={refreshList}
        />
      </div>

      <ClassTimingForm
        visible={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSaveClassTiming}
        classTiming={selectedClassTiming}
        mode={formMode}
      />

      <ClassTimingView
        visible={showView}
        onHide={() => setShowView(false)}
        classTiming={selectedClassTiming}
        onEdit={handleEditClick}
      />
    </div>
  );
};

export default ClassTimingManagement;

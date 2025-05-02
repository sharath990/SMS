import { useState, useRef, useContext } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import BatchList from '../components/batches/BatchList';
import BatchForm from '../components/batches/BatchForm';
import '../styles/BatchManagement.css';

const BatchManagement = () => {
  const { token } = useContext(AuthContext);
  const toast = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', url: '/admin' },
    { label: 'Batch Management' }
  ];

  const homeBreadcrumbItem = { icon: 'pi pi-home', url: '/admin' };

  // Handle add button click
  const handleAddClick = () => {
    setFormMode('add');
    setSelectedBatch(null);
    setShowForm(true);
  };

  // Handle edit button click
  const handleEditClick = (batch) => {
    setFormMode('edit');
    setSelectedBatch(batch);
    setShowForm(true);
  };

  // Handle save batch
  const handleSaveBatch = async (formData, mode) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      let response;

      if (mode === 'add') {
        // Create new batch
        response = await axios.post('http://localhost:5000/api/batches', formData, config);

        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Batch added successfully',
          life: 3000
        });
      } else {
        // Update existing batch
        response = await axios.put(`http://localhost:5000/api/batches/${selectedBatch._id}`, formData, config);

        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Batch updated successfully',
          life: 3000
        });
      }

      // Trigger list refresh
      setRefreshList(prev => !prev);

      return response.data;
    } catch (error) {
      console.error('Error saving batch:', error);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to save batch',
        life: 3000
      });

      throw error;
    }
  };

  return (
    <div className="batch-management-container">
      <Toast ref={toast} />

      <BreadCrumb model={breadcrumbItems} home={homeBreadcrumbItem} className="mb-4 p-2 border-1 border-round surface-border" />

      <div className="card shadow-2 border-round-xl p-0 overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border flex justify-content-between align-items-center">
          <h3 className="m-0 font-semibold text-xl">Batch Management</h3>
          <div className="flex gap-2">
            <Button
              label="New Batch"
              icon="pi pi-plus"
              onClick={handleAddClick}
              className="p-button-primary p-button-raised"
              style={{ padding: '0.5rem 1rem' }}
            />
          </div>
        </div>
        <BatchList
          token={token}
          onEdit={handleEditClick}
          refreshList={refreshList}
        />
      </div>

      <BatchForm
        visible={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSaveBatch}
        batch={selectedBatch}
        mode={formMode}
      />
    </div>
  );
};

export default BatchManagement;

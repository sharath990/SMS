import { useState, useRef, useContext } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import SubjectList from '../components/subjects/SubjectList';
import SubjectForm from '../components/subjects/SubjectForm';
import '../styles/SubjectManagement.css';

const SubjectManagement = () => {
  const { token } = useContext(AuthContext);
  const toast = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', url: '/admin' },
    { label: 'Subject Management' }
  ];

  const homeBreadcrumbItem = { icon: 'pi pi-home', url: '/admin' };

  // Handle add button click
  const handleAddClick = () => {
    setFormMode('add');
    setSelectedSubject(null);
    setShowForm(true);
  };

  // Handle edit button click
  const handleEditClick = (subject) => {
    setFormMode('edit');
    setSelectedSubject(subject);
    setShowForm(true);
  };

  // Handle save subject
  const handleSaveSubject = async (formData, mode) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      let response;

      if (mode === 'add') {
        // Create new subject
        response = await axios.post('http://localhost:5000/api/subjects', formData, config);

        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Subject added successfully',
          life: 3000
        });
      } else {
        // Update existing subject
        response = await axios.put(`http://localhost:5000/api/subjects/${selectedSubject._id}`, formData, config);

        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Subject updated successfully',
          life: 3000
        });
      }

      // Trigger list refresh
      setRefreshList(prev => !prev);

      return response.data;
    } catch (error) {
      console.error('Error saving subject:', error);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to save subject',
        life: 3000
      });

      throw error;
    }
  };

  return (
    <div className="subject-management-container">
      <Toast ref={toast} />

      <BreadCrumb model={breadcrumbItems} home={homeBreadcrumbItem} className="mb-4 p-2 border-1 border-round surface-border" />

      <div className="card shadow-2 border-round-xl p-0 overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border flex justify-content-between align-items-center">
          <h3 className="m-0 font-semibold text-xl">Subject Management</h3>
          <div className="flex gap-2">
            <Button
              label="New Subject"
              icon="pi pi-plus"
              onClick={handleAddClick}
              className="p-button-primary p-button-raised"
              style={{ padding: '0.5rem 1rem' }}
            />
          </div>
        </div>
        <SubjectList
          token={token}
          onEdit={handleEditClick}
          refreshList={refreshList}
        />
      </div>

      <SubjectForm
        visible={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSaveSubject}
        subject={selectedSubject}
        mode={formMode}
      />
    </div>
  );
};

export default SubjectManagement;

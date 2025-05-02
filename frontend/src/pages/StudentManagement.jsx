import { useState, useRef, useContext } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import StudentList from '../components/students/StudentList';
import StudentForm from '../components/students/StudentForm';
import StudentView from '../components/students/StudentView';
import StudentImport from '../components/students/StudentImport';
import '../styles/StudentManagement.css';

const StudentManagement = () => {
  const { token } = useContext(AuthContext);
  const toast = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', url: '/admin' },
    { label: 'Student Management' }
  ];

  const homeBreadcrumbItem = { icon: 'pi pi-home', url: '/admin' };

  // Handle add button click
  const handleAddClick = () => {
    setFormMode('add');
    setSelectedStudent(null);
    setShowForm(true);
  };

  // Handle edit button click
  const handleEditClick = (student) => {
    setFormMode('edit');
    setSelectedStudent(student);
    setShowForm(true);
  };

  // Handle view button click
  const handleViewClick = (student) => {
    setSelectedStudent(student);
    setShowView(true);
  };

  // Handle import button click
  const handleImportClick = () => {
    setShowImport(true);
  };

  // Handle save student
  const handleSaveStudent = async (formData, mode) => {
    console.log('handleSaveStudent called with mode:', mode);
    console.log('Form data received:', formData);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      console.log('API request config:', config);
      let response;

      if (mode === 'add') {
        // Create new student
        // Convert string numeric values to numbers
        const processedData = {
          ...formData,
          rollNumber: formData.rollNumber ? parseInt(formData.rollNumber, 10) : undefined,
          batch: formData.batch ? parseInt(formData.batch, 10) : undefined
        };

        console.log('Attempting to create new student with POST request');
        console.log('Processed data:', processedData);
        response = await axios.post('http://localhost:5000/api/students', processedData, config);
        console.log('POST request successful:', response);

        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Student added successfully',
          life: 3000
        });
      } else {
        // Update existing student
        // Convert string numeric values to numbers
        const processedData = {
          ...formData,
          rollNumber: formData.rollNumber ? parseInt(formData.rollNumber, 10) : undefined,
          batch: formData.batch ? parseInt(formData.batch, 10) : undefined
        };

        console.log('Attempting to update student with PUT request');
        console.log('Processed data:', processedData);
        response = await axios.put(`http://localhost:5000/api/students/${selectedStudent._id}`, processedData, config);
        console.log('PUT request successful:', response);

        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Student updated successfully',
          life: 3000
        });
      }

      // Trigger list refresh
      setRefreshList(prev => !prev);

      return response.data;
    } catch (error) {
      console.error('Error saving student:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request
      });

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to save student',
        life: 3000
      });

      throw error;
    }
  };

  // Handle import complete
  const handleImportComplete = (results) => {
    toast.current.show({
      severity: 'success',
      summary: 'Import Complete',
      detail: `Successfully imported ${results.imported} students with ${results.errors.length} errors`,
      life: 3000
    });

    // Trigger list refresh
    setRefreshList(prev => !prev);
  };

  return (
    <div className="student-management-container">
      <Toast ref={toast} />

      <BreadCrumb model={breadcrumbItems} home={homeBreadcrumbItem} className="mb-4 p-2 border-1 border-round surface-border" />

      <div className="card shadow-2 border-round-xl p-0 overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border flex justify-content-between align-items-center">
          <h3 className="m-0 font-semibold text-xl">Student Management</h3>
          <div className="flex gap-2">
            <Button
              label="New Student"
              icon="pi pi-plus"
              onClick={handleAddClick}
              className="p-button-primary p-button-raised"
              style={{ padding: '0.5rem 1rem' }}
            />
            <Button
              label="Import"
              icon="pi pi-upload"
              onClick={handleImportClick}
              className="p-button-outlined p-button-secondary"
              style={{ padding: '0.5rem 1rem' }}
            />
          </div>
        </div>
        <StudentList
          token={token}
          onEdit={handleEditClick}
          onView={handleViewClick}
          refreshList={refreshList}
        />
      </div>

      <StudentForm
        visible={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSaveStudent}
        student={selectedStudent}
        mode={formMode}
      />

      <StudentView
        visible={showView}
        onHide={() => setShowView(false)}
        student={selectedStudent}
        onEdit={handleEditClick}
      />

      <StudentImport
        visible={showImport}
        onHide={() => setShowImport(false)}
        token={token}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default StudentManagement;

import { useState, useRef, useContext } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import AuthContext from '../context/AuthContext';
import { messageTemplateService } from '../services';
import MessageTemplateList from '../components/messaging/MessageTemplateList';
import MessageTemplateForm from '../components/messaging/MessageTemplateForm';
import '../styles/MessageManagement.css';

const MessageTemplateManagement = () => {
  const { token } = useContext(AuthContext);
  const toast = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', url: '/admin' },
    { label: 'Message Templates' }
  ];

  const homeBreadcrumbItem = { icon: 'pi pi-home', url: '/admin' };

  // Handle add button click
  const handleAddClick = () => {
    setFormMode('add');
    setSelectedTemplate(null);
    setShowForm(true);
  };

  // Handle edit button click
  const handleEditClick = (template) => {
    setFormMode('edit');
    setSelectedTemplate(template);
    setShowForm(true);
  };

  // Handle save template
  const handleSaveTemplate = async (formData, mode) => {
    try {
      let response;

      if (mode === 'add') {
        // Create new template
        response = await messageTemplateService.createMessageTemplate(token, formData);

        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Message template added successfully',
            life: 3000
          });
        } else {
          throw new Error(response.error.message || 'Failed to create message template');
        }
      } else {
        // Update existing template
        response = await messageTemplateService.updateMessageTemplate(token, selectedTemplate._id, formData);

        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Message template updated successfully',
            life: 3000
          });
        } else {
          throw new Error(response.error.message || 'Failed to update message template');
        }
      }

      // Trigger list refresh
      setRefreshList(prev => !prev);

      return response.data;
    } catch (error) {
      console.error('Error saving message template:', error);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to save message template',
        life: 3000
      });

      throw error;
    }
  };

  return (
    <div className="message-template-management-container">
      <Toast ref={toast} />

      <BreadCrumb model={breadcrumbItems} home={homeBreadcrumbItem} className="mb-4 p-2 border-1 border-round surface-border" />

      <div className="card shadow-2 border-round-xl p-0 overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border flex justify-content-between align-items-center">
          <h3 className="m-0 font-semibold text-xl">Message Templates</h3>
          <div className="flex gap-2">
            <Button
              label="New Template"
              icon="pi pi-plus"
              onClick={handleAddClick}
              className="p-button-primary p-button-raised"
              style={{ padding: '0.5rem 1rem' }}
            />
          </div>
        </div>
        <MessageTemplateList
          token={token}
          onEdit={handleEditClick}
          refreshList={refreshList}
        />
      </div>

      <MessageTemplateForm
        visible={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSaveTemplate}
        template={selectedTemplate}
        mode={formMode}
        token={token}
      />
    </div>
  );
};

export default MessageTemplateManagement;

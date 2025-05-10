import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';

const MessageTemplateForm = ({ visible, onHide, onSave, template, mode }) => {
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    content: '',
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Message type options
  const typeOptions = [
    { label: 'SMS', value: 'SMS' },
    { label: 'WhatsApp', value: 'WhatsApp' },
    { label: 'Both', value: 'Both' }
  ];

  // Category options
  const categoryOptions = [
    { label: 'Absence', value: 'Absence' },
    { label: 'Announcement', value: 'Announcement' },
    { label: 'Event', value: 'Event' },
    { label: 'Exam', value: 'Exam' },
    { label: 'Fee', value: 'Fee' },
    { label: 'Other', value: 'Other' }
  ];

  // Load template data when editing
  useEffect(() => {
    if (isEditMode && template) {
      setFormData({
        name: template.name || '',
        type: template.type || '',
        category: template.category || '',
        content: template.content || '',
        isActive: template.isActive !== undefined ? template.isActive : true
      });
    } else {
      // Reset form for new template
      setFormData({
        name: '',
        type: '',
        category: '',
        content: '',
        isActive: true
      });
    }

    // Clear errors when dialog opens/closes
    setFormErrors({});
  }, [isEditMode, template, visible]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle dropdown changes
  const handleDropdownChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.value
    });

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.checked
    });
  };

  // Insert placeholder into content
  const insertPlaceholder = (placeholder) => {
    const placeholderText = `[${placeholder}]`;
    const textArea = document.getElementById('content');

    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = formData.content;
      const newText = text.substring(0, start) + placeholderText + text.substring(end);

      setFormData({
        ...formData,
        content: newText
      });

      // Set focus back to textarea
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(start + placeholderText.length, start + placeholderText.length);
      }, 0);
    } else {
      // If no selection, append to the end
      setFormData({
        ...formData,
        content: formData.content + placeholderText
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Template name is required';
    }

    if (!formData.type) {
      errors.type = 'Message type is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.content) {
      errors.content = 'Content is required';
    }

    setFormErrors(errors);

    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    const isValid = validateForm();

    if (isValid) {
      setSubmitting(true);

      // Call the onSave function with form data
      onSave(formData, isEditMode ? 'edit' : 'add')
        .then(() => {
          setSubmitting(false);
          onHide();
        })
        .catch((error) => {
          console.error('API call failed:', error);
          setSubmitting(false);

          // Handle API validation errors
          const errorMessage = error.message || 'An error occurred while saving the template';

          // Try to extract field-specific errors
          if (errorMessage.includes('name')) {
            setFormErrors({
              ...formErrors,
              name: errorMessage
            });
          } else {
            // Set a general error
            setFormErrors({
              ...formErrors,
              general: errorMessage
            });
          }
        });
    }
  };

  // Render a form field with label and validation
  const renderFormField = (label, name, component, error) => {
    return (
      <div className="field">
        <label htmlFor={name} className={classNames({ 'p-error': error })}>
          {label} {name !== 'isActive' && <span className="text-danger">*</span>}
        </label>
        {component}
        {error && <small className="p-error">{error}</small>}
      </div>
    );
  };

  // Dialog footer with action buttons
  const renderFooter = () => {
    return (
      <div className="flex justify-content-end gap-2 p-3">
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={() => {
            onHide();
            setFormErrors({});
          }}
          className="p-button-outlined p-button-secondary"
          style={{ padding: '0.75rem 1.25rem' }}
        />
        <Button
          label={isEditMode ? 'Update Template' : 'Create Template'}
          icon="pi pi-check"
          onClick={handleSubmit}
          loading={submitting}
          autoFocus
          className="p-button-primary p-button-raised"
          style={{ padding: '0.75rem 1.25rem' }}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: '650px' }}
      header={
        <div className="flex align-items-center gap-2 p-3">
          <i className={`pi ${isEditMode ? 'pi-pencil' : 'pi-plus'} text-primary text-xl`}></i>
          <span className="font-bold text-xl">{isEditMode ? 'Edit Message Template' : 'Create New Message Template'}</span>
        </div>
      }
      modal
      className="p-fluid"
      footer={renderFooter()}
      onHide={onHide}
    >
      <div className="p-fluid p-4">
        {formErrors.general && (
          <Message severity="error" text={formErrors.general} className="mb-4 w-full" />
        )}

        <div className="grid">
          <div className="col-12">
            {renderFormField(
              'Template Name',
              'name',
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={classNames({ 'p-invalid': formErrors.name })}
              />,
              formErrors.name
            )}
          </div>

          <div className="col-12 md:col-6">
            {renderFormField(
              'Message Type',
              'type',
              <Dropdown
                id="type"
                value={formData.type}
                options={typeOptions}
                onChange={(e) => handleDropdownChange(e, 'type')}
                placeholder="Select Type"
                className={classNames({ 'p-invalid': formErrors.type })}
              />,
              formErrors.type
            )}
          </div>

          <div className="col-12 md:col-6">
            {renderFormField(
              'Category',
              'category',
              <Dropdown
                id="category"
                value={formData.category}
                options={categoryOptions}
                onChange={(e) => handleDropdownChange(e, 'category')}
                placeholder="Select Category"
                className={classNames({ 'p-invalid': formErrors.category })}
              />,
              formErrors.category
            )}
          </div>

          <div className="col-12">
            {renderFormField(
              'Content',
              'content',
              <div>
                <div className="placeholder-container">
                  <p className="placeholder-title">Student Placeholders:</p>
                  <div className="placeholder-grid">
                    <Button type="button" label="Student Name" icon="pi pi-user" className="p-button-outlined p-button-info" onClick={() => insertPlaceholder('STUDENT_NAME')} />
                    <Button type="button" label="Roll Number" icon="pi pi-id-card" className="p-button-outlined p-button-info" onClick={() => insertPlaceholder('ROLL_NUMBER')} />
                    <Button type="button" label="Class" icon="pi pi-book" className="p-button-outlined p-button-info" onClick={() => insertPlaceholder('CLASS')} />
                    <Button type="button" label="Section" icon="pi pi-users" className="p-button-outlined p-button-info" onClick={() => insertPlaceholder('SECTION')} />
                    <Button type="button" label="Parent Name" icon="pi pi-user" className="p-button-outlined p-button-info" onClick={() => insertPlaceholder('PARENT_NAME')} />
                    <Button type="button" label="Date" icon="pi pi-calendar" className="p-button-outlined p-button-info" onClick={() => insertPlaceholder('DATE')} />
                  </div>

                  <p className="placeholder-title mt-3">Subject & Class Timing Placeholders:</p>
                  <div className="placeholder-grid">
                    <Button type="button" label="Subject Name" icon="pi pi-book" className="p-button-outlined p-button-success" onClick={() => insertPlaceholder('SUBJECT_NAME')} />
                    <Button type="button" label="Subject Code" icon="pi pi-tag" className="p-button-outlined p-button-success" onClick={() => insertPlaceholder('SUBJECT_CODE')} />
                    <Button type="button" label="Period Number" icon="pi pi-hashtag" className="p-button-outlined p-button-success" onClick={() => insertPlaceholder('PERIOD_NUMBER')} />
                    <Button type="button" label="Period Time" icon="pi pi-clock" className="p-button-outlined p-button-success" onClick={() => insertPlaceholder('PERIOD_TIME')} />
                    <Button type="button" label="Class Timing Name" icon="pi pi-tag" className="p-button-outlined p-button-success" onClick={() => insertPlaceholder('CLASS_TIMING_NAME')} />
                    <Button type="button" label="Description" icon="pi pi-calendar" className="p-button-outlined p-button-success" onClick={() => insertPlaceholder('DAY_OF_WEEK')} />
                  </div>
                </div>
                <InputTextarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={5}
                  autoResize
                  className={classNames({ 'p-invalid': formErrors.content })}
                />
                <small className="text-secondary">
                  Click on a placeholder button above to insert it into your message.
                </small>
              </div>,
              formErrors.content
            )}
          </div>

          {isEditMode && (
            <div className="col-12 mt-3">
              {renderFormField(
                'Status',
                'isActive',
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleCheckboxChange(e, 'isActive')}
                  />
                  <label htmlFor="isActive" className="ml-2 font-medium">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </label>
                </div>,
                null
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default MessageTemplateForm;

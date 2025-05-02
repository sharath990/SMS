import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { ToggleButton } from 'primereact/togglebutton';
import { classNames } from 'primereact/utils';

const SubjectForm = ({ visible, onHide, onSave, subject, mode }) => {
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    stream: null,
    description: '',
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Stream options
  const streamOptions = [
    { label: 'Science', value: 'Science' },
    { label: 'Commerce', value: 'Commerce' },
    { label: 'Both', value: 'Both' }
  ];

  // Load subject data when editing
  useEffect(() => {
    if (isEditMode && subject) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        stream: subject.stream || null,
        description: subject.description || '',
        isActive: subject.isActive !== undefined ? subject.isActive : true
      });
    } else {
      // Reset form for new subject
      setFormData({
        name: '',
        code: '',
        stream: null,
        description: '',
        isActive: true
      });
    }

    // Clear errors when dialog opens/closes
    setFormErrors({});
    setSubmitted(false);
  }, [isEditMode, subject, visible]);

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

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Subject name is required';
    }

    if (!formData.code) {
      errors.code = 'Subject code is required';
    }

    if (!formData.stream) {
      errors.stream = 'Stream is required';
    }

    setFormErrors(errors);

    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    setSubmitted(true);

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
          if (error.response?.data?.message) {
            // Try to extract field-specific errors
            const message = error.response.data.message;
            
            if (message.includes('name')) {
              setFormErrors({
                ...formErrors,
                name: message
              });
            } else if (message.includes('code')) {
              setFormErrors({
                ...formErrors,
                code: message
              });
            } else if (message.includes('already exists')) {
              setFormErrors({
                ...formErrors,
                general: message
              });
            } else {
              // Set a general error
              setFormErrors({
                ...formErrors,
                general: message
              });
            }
          } else {
            // Set a general error for non-API errors
            setFormErrors({
              ...formErrors,
              general: 'An error occurred while saving the subject'
            });
          }
        });
    }
  };

  // Dialog footer with action buttons
  const renderFooter = () => {
    return (
      <div className="flex justify-content-end gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={() => {
            onHide();
            setFormErrors({});
          }}
          className="p-button-outlined p-button-secondary"
          style={{ padding: '0.5rem 1rem' }}
        />
        <Button
          label={isEditMode ? 'Update Subject' : 'Create Subject'}
          icon="pi pi-check"
          onClick={handleSubmit}
          loading={submitting}
          autoFocus
          className="p-button-primary p-button-raised"
          style={{ padding: '0.5rem 1rem' }}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: '550px' }}
      header={
        <div className="flex align-items-center gap-2">
          <i className={`pi ${isEditMode ? 'pi-pencil' : 'pi-plus'} text-primary text-xl`}></i>
          <span className="font-bold text-xl">{isEditMode ? 'Edit Subject' : 'Create New Subject'}</span>
        </div>
      }
      modal
      className="p-fluid"
      footer={renderFooter()}
      onHide={onHide}
    >
      <div className="p-fluid mt-3 p-3">
        {formErrors.general && (
          <div className="p-message p-message-error mb-3">
            <div className="p-message-wrapper">
              <span className="p-message-text">{formErrors.general}</span>
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="name" className={classNames({ 'p-error': submitted && !formData.name })}>
            Subject Name <span className="text-danger">*</span>
          </label>
          <InputText
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={classNames({ 'p-invalid': formErrors.name || (submitted && !formData.name) })}
          />
          {(formErrors.name || (submitted && !formData.name)) && (
            <small className="p-error">{formErrors.name || 'Subject name is required.'}</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="code" className={classNames({ 'p-error': submitted && !formData.code })}>
            Subject Code <span className="text-danger">*</span>
          </label>
          <InputText
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={classNames({ 'p-invalid': formErrors.code || (submitted && !formData.code) })}
          />
          {(formErrors.code || (submitted && !formData.code)) && (
            <small className="p-error">{formErrors.code || 'Subject code is required.'}</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="stream" className={classNames({ 'p-error': submitted && !formData.stream })}>
            Stream <span className="text-danger">*</span>
          </label>
          <Dropdown
            id="stream"
            value={formData.stream}
            options={streamOptions}
            onChange={(e) => handleDropdownChange(e, 'stream')}
            placeholder="Select Stream"
            className={classNames({ 'p-invalid': formErrors.stream || (submitted && !formData.stream) })}
          />
          {(formErrors.stream || (submitted && !formData.stream)) && (
            <small className="p-error">{formErrors.stream || 'Stream is required.'}</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {isEditMode && (
          <div className="field">
            <label htmlFor="isActive" className="mr-2">Active</label>
            <ToggleButton
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.value })}
              onLabel="Yes"
              offLabel="No"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
              style={{ width: '10em' }}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default SubjectForm;

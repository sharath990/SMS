import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { ToggleButton } from 'primereact/togglebutton';
import { classNames } from 'primereact/utils';
import axios from 'axios';

const ClassTimingForm = ({ visible, onHide, onSave, classTiming, mode }) => {
  const isEditMode = mode === 'edit';

  // Get token from localStorage
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    period: 1,
    startTime: '',
    endTime: '',
    name: '',
    description: '',
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Load class timing data when editing
  useEffect(() => {
    if (isEditMode && classTiming) {
      setFormData({
        period: classTiming.period || 1,
        startTime: classTiming.startTime || '',
        endTime: classTiming.endTime || '',
        name: classTiming.name || '',
        description: classTiming.description || '',
        isActive: classTiming.isActive !== undefined ? classTiming.isActive : true
      });
    } else {
      // Reset form for new class timing
      setFormData({
        period: 1,
        startTime: '',
        endTime: '',
        name: '',
        description: '',
        isActive: true
      });
    }

    // Clear errors when dialog opens/closes
    setFormErrors({});
    setSubmitted(false);
  }, [isEditMode, classTiming, visible]);

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

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.period) {
      errors.period = 'Period number is required';
    }

    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      errors.endTime = 'End time is required';
    }

    if (!formData.name) {
      errors.name = 'Name is required';
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

            // Set a general error
            setFormErrors({
              ...formErrors,
              general: message
            });
          } else {
            // Set a general error for non-API errors
            setFormErrors({
              ...formErrors,
              general: 'An error occurred while saving the class timing'
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
          label={isEditMode ? 'Update Timing' : 'Create Timing'}
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
          <span className="font-bold text-xl">{isEditMode ? 'Edit Class Timing' : 'Create New Class Timing'}</span>
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

        <div className="grid">
          <div className="col-12">
            <div className="field">
              <label htmlFor="name" className={classNames({ 'p-error': submitted && !formData.name })}>
                Name <span className="text-danger">*</span>
              </label>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Morning Assembly"
                required
                className={classNames({ 'p-invalid': formErrors.name || (submitted && !formData.name) })}
              />
              {(formErrors.name || (submitted && !formData.name)) && (
                <small className="p-error">{formErrors.name || 'Name is required.'}</small>
              )}
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field">
              <label htmlFor="period" className={classNames({ 'p-error': submitted && !formData.period })}>
                Period Number <span className="text-danger">*</span>
              </label>
              <InputNumber
                id="period"
                value={formData.period}
                onValueChange={(e) => setFormData({ ...formData, period: e.value })}
                min={1}
                max={10}
                required
                className={classNames({ 'p-invalid': formErrors.period || (submitted && !formData.period) })}
              />
              {(formErrors.period || (submitted && !formData.period)) && (
                <small className="p-error">{formErrors.period || 'Period number is required.'}</small>
              )}
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field">
              <label htmlFor="startTime" className={classNames({ 'p-error': submitted && !formData.startTime })}>
                Start Time <span className="text-danger">*</span>
              </label>
              <InputText
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                placeholder="e.g., 9:00 AM"
                required
                className={classNames({ 'p-invalid': formErrors.startTime || (submitted && !formData.startTime) })}
              />
              {(formErrors.startTime || (submitted && !formData.startTime)) && (
                <small className="p-error">{formErrors.startTime || 'Start time is required.'}</small>
              )}
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field">
              <label htmlFor="endTime" className={classNames({ 'p-error': submitted && !formData.endTime })}>
                End Time <span className="text-danger">*</span>
              </label>
              <InputText
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                placeholder="e.g., 10:00 AM"
                required
                className={classNames({ 'p-invalid': formErrors.endTime || (submitted && !formData.endTime) })}
              />
              {(formErrors.endTime || (submitted && !formData.endTime)) && (
                <small className="p-error">{formErrors.endTime || 'End time is required.'}</small>
              )}
            </div>
          </div>

          <div className="col-12">
            <div className="field">
              <label htmlFor="description">Description</label>
              <InputText
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Morning class for Science students"
              />
            </div>
          </div>

          {isEditMode && (
            <div className="col-12">
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
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ClassTimingForm;

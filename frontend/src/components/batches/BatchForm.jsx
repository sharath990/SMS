import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { batchService } from '../../services';

const BatchForm = ({ visible, onHide, onSave, batch, mode }) => {
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    name: '',
    isGraduated: false,
    graduationDate: null
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [existingYears, setExistingYears] = useState([]);

  // Fetch existing batch years
  useEffect(() => {
    if (visible) {
      const fetchBatches = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await batchService.getBatches(token);

          if (response.success && response.data && response.data.data) {
            // Extract years from all batches
            const years = response.data.data.map(b => b.year);
            setExistingYears(years);
          }
        } catch (error) {
          console.error('Error fetching batches:', error);
        }
      };

      fetchBatches();
    }
  }, [visible]);

  // Load batch data when editing
  useEffect(() => {
    if (isEditMode && batch) {
      setFormData({
        year: batch.year || new Date().getFullYear(),
        name: batch.name || '',
        isGraduated: batch.isGraduated !== undefined ? batch.isGraduated : false,
        graduationDate: batch.graduationDate ? new Date(batch.graduationDate) : null
      });
    } else {
      // Reset form for new batch
      const currentYear = new Date().getFullYear();
      setFormData({
        year: currentYear,
        name: `Batch ${currentYear}`,
        isGraduated: false,
        graduationDate: null
      });
    }

    // Clear errors when dialog opens/closes
    setFormErrors({});
  }, [isEditMode, batch, visible]);

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

  // Handle number input changes
  const handleNumberChange = (e) => {
    // InputNumber component doesn't provide a name in the event object
    // So we need to explicitly set it to 'year'
    const value = e.value;
    const fieldName = 'year'; // Hardcoded since we only have one InputNumber field

    setFormData({
      ...formData,
      [fieldName]: value
    });

    // Clear error for this field
    if (formErrors[fieldName]) {
      setFormErrors({
        ...formErrors,
        [fieldName]: null
      });
    }

    // If year changes, update name if it's not been manually edited
    if (value && formData.name === `Batch ${formData.year}`) {
      setFormData(prev => ({
        ...prev,
        name: `Batch ${value}`
      }));
    }

    // Validate year as it's being entered
    if (value) {
      // Check if year already exists (only for new batches or when changing year in edit mode)
      if (!isEditMode && existingYears.includes(value)) {
        setFormErrors(prev => ({
          ...prev,
          year: 'A batch with this year already exists. Please choose a different year.'
        }));
      } else if (isEditMode && batch && value !== batch.year && existingYears.includes(value)) {
        setFormErrors(prev => ({
          ...prev,
          year: 'A batch with this year already exists. Please choose a different year.'
        }));
      }
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e, field) => {
    const isChecked = e.checked;

    // If marking as graduated and no graduation date is set, set it to today
    if (field === 'isGraduated' && isChecked && !formData.graduationDate) {
      setFormData({
        ...formData,
        [field]: isChecked,
        graduationDate: new Date()
      });
    } else {
      setFormData({
        ...formData,
        [field]: isChecked
      });
    }
  };

  // Handle date changes
  const handleDateChange = (e, field) => {
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

    if (!formData.year) {
      errors.year = 'Year is required';
    }

    // Check if year already exists (only for new batches or when changing year in edit mode)
    if (formData.year && !isEditMode && existingYears.includes(formData.year)) {
      errors.year = 'A batch with this year already exists. Please choose a different year.';
    }

    // For edit mode, check if the year is changed and already exists
    if (formData.year && isEditMode && batch && formData.year !== batch.year && existingYears.includes(formData.year)) {
      errors.year = 'A batch with this year already exists. Please choose a different year.';
    }

    if (!formData.name) {
      errors.name = 'Batch name is required';
    }

    if (formData.isGraduated && !formData.graduationDate) {
      errors.graduationDate = 'Graduation date is required when marked as graduated';
    }

    // Check for any undefined properties in formData and remove them
    const cleanedFormData = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'undefined' && formData[key] !== undefined) {
        cleanedFormData[key] = formData[key];
      }
    });

    // Update formData with cleaned version
    setFormData(cleanedFormData);

    // Set form errors
    setFormErrors(errors);

    // Log the errors for debugging
    if (Object.keys(errors).length > 0) {
      console.log('Validation errors:', errors);
    }

    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log('Form submission attempted with data:', formData);

    // Clean up form data before validation
    const cleanedFormData = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'undefined' && formData[key] !== undefined) {
        cleanedFormData[key] = formData[key];
      }
    });

    // Update form data with cleaned version
    setFormData(cleanedFormData);

    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    console.log('Cleaned form data:', cleanedFormData);

    if (isValid) {
      setSubmitting(true);
      console.log('Calling onSave with mode:', isEditMode ? 'edit' : 'add');

      // Call the onSave function with cleaned form data
      onSave(cleanedFormData, isEditMode ? 'edit' : 'add')
        .then((response) => {
          console.log('API call successful:', response);
          setSubmitting(false);
          onHide();
        })
        .catch((error) => {
          console.error('API call failed:', error);
          console.log('Error response:', error.response);
          setSubmitting(false);

          // Handle API validation errors
          if (error.response?.data?.message) {
            // Try to extract field-specific errors
            const message = error.response?.data?.message;
            console.log('Error message from API:', message);

            // Direct check for the exact error message
            if (message === 'Batch with this year already exists') {
              setFormErrors({
                ...formErrors,
                year: 'A batch with this year already exists. Please choose a different year.'
              });
            } else if (message.includes('year')) {
              setFormErrors({
                ...formErrors,
                year: message
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
              general: 'An error occurred while saving the batch'
            });
          }
        });
    } else {
      console.log('Form validation failed with errors:', formErrors);
    }
  };

  // Render a form field with label and validation
  const renderFormField = (label, name, component, error) => {
    return (
      <div className="field">
        <label htmlFor={name} className={classNames({ 'p-error': error })}>
          {label} {(name === 'year' || name === 'name') && <span className="text-danger">*</span>}
        </label>
        {component}
        {error && <small className="p-error">{error}</small>}
      </div>
    );
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
          label={isEditMode ? 'Update Batch' : 'Create Batch'}
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
          <span className="font-bold text-xl">{isEditMode ? 'Edit Batch' : 'Create New Batch'}</span>
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
          <div className="col-12 md:col-6">
            {renderFormField(
              'Year',
              'year',
              <InputNumber
                id="year"
                value={formData.year}
                onValueChange={handleNumberChange}
                min={2000}
                max={2100}
                className={classNames({ 'p-invalid': formErrors.year })}
                useGrouping={false}
              />,
              formErrors.year
            )}
            <small className="text-secondary">Academic year (e.g., 2025)</small>
          </div>

          <div className="col-12 md:col-6">
            {renderFormField(
              'Batch Name',
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

          {isEditMode && (
            <>
              <div className="col-12 md:col-6">
                {renderFormField(
                  'Graduated',
                  'isGraduated',
                  <div className="flex align-items-center">
                    <Checkbox
                      inputId="isGraduated"
                      checked={formData.isGraduated}
                      onChange={(e) => handleCheckboxChange(e, 'isGraduated')}
                    />
                    <label htmlFor="isGraduated" className="ml-2">
                      {formData.isGraduated ? 'Graduated' : 'Not Graduated'}
                    </label>
                  </div>,
                  null
                )}
              </div>

              {formData.isGraduated && (
                <div className="col-12 md:col-6">
                  {renderFormField(
                    'Graduation Date',
                    'graduationDate',
                    <Calendar
                      id="graduationDate"
                      value={formData.graduationDate}
                      onChange={(e) => handleDateChange(e, 'graduationDate')}
                      showIcon
                      dateFormat="dd/mm/yy"
                      className={classNames({ 'p-invalid': formErrors.graduationDate })}
                    />,
                    formErrors.graduationDate
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default BatchForm;

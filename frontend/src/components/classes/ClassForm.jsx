import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { classNames } from 'primereact/utils';
import axios from 'axios';

const ClassForm = ({ visible, onHide, onSave, classItem, mode }) => {
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    name: '',
    stream: '',
    level: '',
    section: '',
    academicYear: '',
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  // Stream options
  const streamOptions = [
    { label: 'Science', value: 'Science' },
    { label: 'Commerce', value: 'Commerce' }
  ];

  // Level options
  const levelOptions = [
    { label: '1st PUC', value: '1st PUC' },
    { label: '2nd PUC', value: '2nd PUC' }
  ];

  // Fetch non-graduated batches for academic year dropdown
  useEffect(() => {
    if (visible) {
      const fetchBatches = async () => {
        try {
          const config = {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          };

          // Get only non-graduated batches
          const response = await axios.get('http://localhost:5000/api/batches?isGraduated=false', config);

          if (response.data && response.data.data) {
            // Map batches to dropdown options
            const options = response.data.data.map(batch => ({
              label: `${batch.name} (${batch.year})`,
              value: batch.name
            }));

            setAcademicYearOptions(options);
          }
        } catch (error) {
          console.error('Error fetching batches for academic year dropdown:', error);
        }
      };

      fetchBatches();
    }
  }, [visible]);

  // Load class data when editing
  useEffect(() => {
    if (isEditMode && classItem) {
      setFormData({
        name: classItem.name || '',
        stream: classItem.stream || '',
        level: classItem.level || '',
        section: classItem.section || '',
        academicYear: classItem.academicYear || '',
        isActive: classItem.isActive !== undefined ? classItem.isActive : true
      });
    } else {
      // Reset form for new class
      setFormData({
        name: '',
        stream: '',
        level: '',
        section: '',
        academicYear: '',
        isActive: true
      });
    }

    // Clear errors when dialog opens/closes
    setFormErrors({});
  }, [isEditMode, classItem, visible]);

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

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Class name is required';
    }

    if (!formData.stream) {
      errors.stream = 'Stream is required';
    }

    if (!formData.level) {
      errors.level = 'Level is required';
    }

    if (!formData.section) {
      errors.section = 'Section is required';
    }

    if (!formData.academicYear) {
      errors.academicYear = 'Academic year is required';
    }

    setFormErrors(errors);

    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log('Form submission attempted with data:', formData);

    const isValid = validateForm();
    console.log('Form validation result:', isValid);

    if (isValid) {
      setSubmitting(true);
      console.log('Calling onSave with mode:', isEditMode ? 'edit' : 'add');

      // Call the onSave function with form data
      onSave(formData, isEditMode ? 'edit' : 'add')
        .then((response) => {
          console.log('API call successful:', response);
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
            console.log('Error message from API:', message);

            if (message.includes('name')) {
              setFormErrors({
                ...formErrors,
                name: message
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
              general: 'An error occurred while saving the class'
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
          label={isEditMode ? 'Update Class' : 'Create Class'}
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
          <span className="font-bold text-xl">{isEditMode ? 'Edit Class' : 'Create New Class'}</span>
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
            {renderFormField(
              'Class Name',
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
              'Stream',
              'stream',
              <Dropdown
                id="stream"
                value={formData.stream}
                options={streamOptions}
                onChange={(e) => handleDropdownChange(e, 'stream')}
                placeholder="Select Stream"
                className={classNames({ 'p-invalid': formErrors.stream })}
              />,
              formErrors.stream
            )}
          </div>

          <div className="col-12 md:col-6">
            {renderFormField(
              'Level',
              'level',
              <Dropdown
                id="level"
                value={formData.level}
                options={levelOptions}
                onChange={(e) => handleDropdownChange(e, 'level')}
                placeholder="Select Level"
                className={classNames({ 'p-invalid': formErrors.level })}
              />,
              formErrors.level
            )}
          </div>

          <div className="col-12 md:col-6">
            {renderFormField(
              'Section',
              'section',
              <InputText
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className={classNames({ 'p-invalid': formErrors.section })}
              />,
              formErrors.section
            )}
          </div>

          <div className="col-12 md:col-6">
            {renderFormField(
              'Academic Year',
              'academicYear',
              <Dropdown
                id="academicYear"
                value={formData.academicYear}
                options={academicYearOptions}
                onChange={(e) => handleDropdownChange(e, 'academicYear')}
                placeholder="Select Academic Year"
                className={classNames({ 'p-invalid': formErrors.academicYear })}
                filter
                filterBy="label"
              />,
              formErrors.academicYear
            )}
          </div>

          {isEditMode && (
            <div className="col-12">
              {renderFormField(
                'Active',
                'isActive',
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleCheckboxChange(e, 'isActive')}
                  />
                  <label htmlFor="isActive" className="ml-2">
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

export default ClassForm;

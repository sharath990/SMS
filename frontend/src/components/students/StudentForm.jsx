import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';

const StudentForm = ({ visible, onHide, onSave, student, mode }) => {
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    rollNumber: '',
    firstName: '',
    lastName: '',
    stream: '',
    class: '',
    section: '',
    batch: String(new Date().getFullYear()),
    isActive: true,
    parentName: '',
    parentMobile: '',
    parentWhatsApp: '',
    parentEmail: '',
    address: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Options for dropdowns
  const streamOptions = [
    { label: 'Science', value: 'Science' },
    { label: 'Commerce', value: 'Commerce' }
  ];

  const classOptions = [
    { label: '1st PUC', value: '1st PUC' },
    { label: '2nd PUC', value: '2nd PUC' }
  ];

  // Load student data when editing
  useEffect(() => {
    if (isEditMode && student) {
      setFormData({
        rollNumber: student.rollNumber ? String(student.rollNumber) : '',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        stream: student.stream || '',
        class: student.class || '',
        section: student.section || '',
        batch: student.batch ? String(student.batch) : String(new Date().getFullYear()),
        isActive: student.isActive !== undefined ? student.isActive : true,
        parentName: student.parentName || '',
        parentMobile: student.parentMobile || '',
        parentWhatsApp: student.parentWhatsApp || '',
        parentEmail: student.parentEmail || '',
        address: student.address || ''
      });
    } else {
      // Reset form for new student
      setFormData({
        rollNumber: '',
        firstName: '',
        lastName: '',
        stream: '',
        class: '',
        section: '',
        batch: String(new Date().getFullYear()),
        isActive: true,
        parentName: '',
        parentMobile: '',
        parentWhatsApp: '',
        parentEmail: '',
        address: ''
      });
    }

    // Clear errors when dialog opens/closes
    setFormErrors({});
  }, [isEditMode, student, visible]);

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

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle dropdown changes
  const handleDropdownChange = (e) => {
    const { name, value } = e;
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

  // Note: We're now using InputText with handleChange for all numeric fields

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Roll number validation - check if it's empty
    if (!formData.rollNumber || formData.rollNumber.trim() === '') {
      errors.rollNumber = 'Roll number is required';
    }

    console.log('Roll number validation:', {
      rollNumber: formData.rollNumber,
      isEmpty: !formData.rollNumber || formData.rollNumber.trim() === '',
      type: typeof formData.rollNumber
    });

    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.stream) {
      errors.stream = 'Stream is required';
    }

    if (!formData.class) {
      errors.class = 'Class is required';
    }

    if (!formData.section) {
      errors.section = 'Section is required';
    }

    if (!formData.batch) {
      errors.batch = 'Batch year is required';
    }

    if (!formData.parentName) {
      errors.parentName = 'Parent name is required';
    }

    if (!formData.parentMobile) {
      errors.parentMobile = 'Parent mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.parentMobile)) {
      errors.parentMobile = 'Enter a valid 10-digit mobile number';
    }

    if (formData.parentWhatsApp && !/^[0-9]{10}$/.test(formData.parentWhatsApp)) {
      errors.parentWhatsApp = 'Enter a valid 10-digit WhatsApp number';
    }

    if (formData.parentEmail && !/^\S+@\S+\.\S+$/.test(formData.parentEmail)) {
      errors.parentEmail = 'Enter a valid email address';
    }

    setFormErrors(errors);
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

            if (message.includes('roll number')) {
              setFormErrors({
                ...formErrors,
                rollNumber: message
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
              general: 'An error occurred while saving the student'
            });
          }
        });
    } else {
      console.log('Form validation failed with errors:', formErrors);
    }
  };

  // Render form field with error message
  const renderFormField = (label, name, component, errorMsg) => {
    return (
      <div className="field">
        <label htmlFor={name} className="font-medium">
          {label}
          {name !== 'parentWhatsApp' && name !== 'parentEmail' && name !== 'address' && (
            <span className="text-red-500">*</span>
          )}
        </label>
        {component}
        {errorMsg && <small className="p-error">{errorMsg}</small>}
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
          label={isEditMode ? 'Update Student' : 'Create Student'}
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
          <i className={`pi ${isEditMode ? 'pi-user-edit' : 'pi-user-plus'} text-primary text-xl`}></i>
          <span className="font-bold text-xl">{isEditMode ? 'Edit Student' : 'Create New Student'}</span>
        </div>
      }
      modal
      className="p-fluid"
      footer={renderFooter()}
      onHide={onHide}
    >
      {formErrors.general && (
        <Message severity="error" text={formErrors.general} className="mb-3" />
      )}

      <div className="p-fluid mt-3 p-3">
        <div className="grid">
          <div className="col-12 md:col-6">
            {renderFormField(
              'Roll Number',
              'rollNumber',
              <InputText
                id="rollNumber"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={(e) => {
                  console.log('Roll number changed:', e.target.value);
                  handleChange(e);
                }}
                disabled={isEditMode}
                className="p-inputtext-lg"
                keyfilter="pint"
              />,
              formErrors.rollNumber
            )}
            <small className="text-secondary">Enter student roll number</small>
          </div>

        <div className="col-12 md:col-6">
          {isEditMode && renderFormField(
            'Status',
            'isActive',
            <div className="flex align-items-center">
              <Checkbox
                inputId="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="isActive" className="ml-2">
                Active
              </label>
            </div>,
            formErrors.isActive
          )}
        </div>

        <div className="col-12 md:col-6">
          {renderFormField(
            'First Name',
            'firstName',
            <InputText
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />,
            formErrors.firstName
          )}
        </div>

        <div className="col-12 md:col-6">
          {renderFormField(
            'Last Name',
            'lastName',
            <InputText
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />,
            formErrors.lastName
          )}
        </div>

        <div className="col-12 md:col-6">
          {renderFormField(
            'Stream',
            'stream',
            <Dropdown
              id="stream"
              name="stream"
              value={formData.stream}
              options={streamOptions}
              onChange={(e) => handleDropdownChange({ name: 'stream', value: e.value })}
              placeholder="Select Stream"
            />,
            formErrors.stream
          )}
        </div>

        <div className="col-12 md:col-6">
          {renderFormField(
            'Class',
            'class',
            <Dropdown
              id="class"
              name="class"
              value={formData.class}
              options={classOptions}
              onChange={(e) => handleDropdownChange({ name: 'class', value: e.value })}
              placeholder="Select Class"
            />,
            formErrors.class
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
            />,
            formErrors.section
          )}
        </div>

        <div className="col-12 md:col-6">
          {renderFormField(
            'Batch Year',
            'batch',
            <InputText
              id="batch"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              className="p-inputtext-lg"
              keyfilter="pint"
            />,
            formErrors.batch
          )}
          <small className="text-secondary">Enter academic year (e.g., 2025 for 2025-2026)</small>
        </div>

        <div className="col-12">
          {renderFormField(
            'Parent Name',
            'parentName',
            <InputText
              id="parentName"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
            />,
            formErrors.parentName
          )}
        </div>

        <div className="col-12 md:col-6">
          {renderFormField(
            'Parent Mobile',
            'parentMobile',
            <InputText
              id="parentMobile"
              name="parentMobile"
              value={formData.parentMobile}
              onChange={handleChange}
              keyfilter="pint"
              maxLength={10}
            />,
            formErrors.parentMobile
          )}
        </div>

        <div className="col-12 md:col-6">
          {renderFormField(
            'Parent WhatsApp',
            'parentWhatsApp',
            <InputText
              id="parentWhatsApp"
              name="parentWhatsApp"
              value={formData.parentWhatsApp}
              onChange={handleChange}
              keyfilter="pint"
              maxLength={10}
              placeholder="Same as mobile if empty"
            />,
            formErrors.parentWhatsApp
          )}
        </div>

        <div className="col-12">
          {renderFormField(
            'Parent Email',
            'parentEmail',
            <InputText
              id="parentEmail"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleChange}
              type="email"
            />,
            formErrors.parentEmail
          )}
        </div>

        <div className="col-12">
          {renderFormField(
            'Address',
            'address',
            <InputTextarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
            />,
            formErrors.address
          )}
        </div>
      </div>
      </div>
    </Dialog>
  );
};

export default StudentForm;

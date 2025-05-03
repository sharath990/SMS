import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
 

const MessageTypeSelection = ({ messageData, updateMessageData, templates, onNext }) => {
  const [selectedType, setSelectedType] = useState(messageData.messageType || null);
  const [selectedTemplate, setSelectedTemplate] = useState(messageData.templateId || null);
  const [errors, setErrors] = useState({});
  const [filteredTemplates, setFilteredTemplates] = useState([]);

  // Filter templates based on selected message type
  useEffect(() => {
    if (selectedType && templates.length > 0) {
      const filtered = templates.filter(template =>
        template.type === selectedType || template.type === 'Both'
      );

      setFilteredTemplates(filtered.map(template => ({
        label: template.name,
        value: template._id,
        category: template.category,
        content: template.content
      })));
    } else {
      setFilteredTemplates([]);
    }
  }, [selectedType, templates]);

  // Handle message type selection
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedTemplate(null);
    setErrors({});
  };

  // Handle template selection
  const handleTemplateSelect = (e) => {
    setSelectedTemplate(e.value);
    setErrors({});

    // Find the selected template
    const template = templates.find(t => t._id === e.value);
    if (template) {
      updateMessageData({
        templateId: e.value,
        content: template.content
      });
    }
  };

  // Handle next button click
  const handleNext = () => {
    const newErrors = {};

    if (!selectedType) {
      newErrors.type = 'Please select a message type';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateMessageData({
        messageType: selectedType,
        templateId: selectedTemplate
      });
      onNext();
    }
  };

  // Template option group template
  const groupedItemTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <span>{option.label}</span>
        <span className="ml-auto">
          <span className={`p-tag p-tag-${getCategoryColor(option.category)}`}>
            {option.category}
          </span>
        </span>
      </div>
    );
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Absence':
        return 'danger';
      case 'Announcement':
        return 'info';
      case 'Event':
        return 'success';
      case 'Exam':
        return 'warning';
      case 'Fee':
        return 'help';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="message-type-selection">
      <div className="grid">
        <div className="col-12 md:col-6">
          <Card className="h-full">
            <h3 className="text-xl font-semibold mb-4">Select Message Type</h3>

            <div className="field-radiobutton mb-4">
              <RadioButton
                inputId="sms"
                name="messageType"
                value="SMS"
                onChange={() => handleTypeSelect('SMS')}
                checked={selectedType === 'SMS'}
              />
              <label htmlFor="sms" className="ml-2 font-medium">SMS</label>
            </div>

            <div className="field-radiobutton mb-4">
              <RadioButton
                inputId="whatsapp"
                name="messageType"
                value="WhatsApp"
                onChange={() => handleTypeSelect('WhatsApp')}
                checked={selectedType === 'WhatsApp'}
              />
              <label htmlFor="whatsapp" className="ml-2 font-medium">WhatsApp</label>
            </div>

            <div className="field-radiobutton mb-4">
              <RadioButton
                inputId="both"
                name="messageType"
                value="Both"
                onChange={() => handleTypeSelect('Both')}
                checked={selectedType === 'Both'}
              />
              <label htmlFor="both" className="ml-2 font-medium">Both SMS & WhatsApp</label>
            </div>

            {errors.type && <small className="p-error block mt-2">{errors.type}</small>}

            <div className="mt-4">
              <p className="text-secondary">
                <i className="pi pi-info-circle mr-2"></i>
                Select the type of message you want to send. SMS messages are sent directly to mobile numbers, while WhatsApp messages are sent to WhatsApp numbers.
              </p>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6">
          <Card className="h-full">
            <h3 className="text-xl font-semibold mb-4">Select Template (Optional)</h3>

            <div className="field">
              <Dropdown
                value={selectedTemplate}
                options={filteredTemplates}
                onChange={handleTemplateSelect}
                placeholder="Select a template"
                className="w-full"
                disabled={!selectedType}
                itemTemplate={groupedItemTemplate}
                filter
                filterBy="label"
              />

              <small className="text-secondary block mt-2">
                <i className="pi pi-info-circle mr-2"></i>
                Templates help you send consistent messages. You can also create a message without using a template.
              </small>
            </div>

            {selectedType && filteredTemplates.length === 0 && (
              <div className="p-message p-message-info mt-3">
                <div className="p-message-wrapper">
                  <span className="p-message-icon pi pi-info-circle"></span>
                  <span className="p-message-text">No templates available for {selectedType}. You can still create a custom message.</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="message-navigation-buttons">
        <div></div> {/* Empty div to maintain space-between alignment */}
        <Button
          label="Next"
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={handleNext}
          className="p-button-primary p-button-raised"
        />
      </div>
    </div>
  );
};

export default MessageTypeSelection;

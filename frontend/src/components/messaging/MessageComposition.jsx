import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import axios from 'axios';

const MessageComposition = ({ messageData, updateMessageData, templates, token, onNext, onPrevious, setPreviewData }) => {
  const toast = useRef(null);
  const [content, setContent] = useState(messageData.content || '');
  const [selectedTemplate, setSelectedTemplate] = useState(messageData.templateId || null);
  const [errors, setErrors] = useState({});
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [previewRecipients, setPreviewRecipients] = useState([]);
  const [characterCount, setCharacterCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filter templates based on message type
  useEffect(() => {
    if (messageData.messageType && templates.length > 0) {
      const filtered = templates.filter(template =>
        template.type === messageData.messageType || template.type === 'Both'
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
  }, [messageData.messageType, templates]);

  // Fetch preview recipients
  useEffect(() => {
    fetchPreviewRecipients();
    setCharacterCount(content.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, messageData.targetType, messageData.targetDetails, messageData.recipientIds, content]);

  // Fetch preview recipients
  const fetchPreviewRecipients = async () => {
    try {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      let recipients = [];

      if (messageData.targetType === 'Individual' && messageData.recipientIds.length > 0) {
        // Fetch individual students
        const response = await axios.get('http://localhost:5000/api/students', config);
        const allStudents = response.data.data;
        recipients = allStudents.filter(student => messageData.recipientIds.includes(student._id));
      } else {
        // Build filter for finding students
        const params = new URLSearchParams();
        params.append('isActive', 'true');
        params.append('limit', '5'); // Just get a few for preview

        if (messageData.targetType === 'Section') {
          params.append('stream', messageData.targetDetails.stream);
          params.append('class', messageData.targetDetails.class);
          params.append('section', messageData.targetDetails.section);
        } else if (messageData.targetType === 'Class') {
          params.append('stream', messageData.targetDetails.stream);
          params.append('class', messageData.targetDetails.class);
        } else if (messageData.targetType === 'Stream') {
          params.append('stream', messageData.targetDetails.stream);
        } else if (messageData.targetType === 'Batch') {
          params.append('batch', messageData.targetDetails.batch);
        }

        const response = await axios.get(`http://localhost:5000/api/students?${params.toString()}`, config);
        recipients = response.data.data;
      }

      setPreviewRecipients(recipients);
    } catch (error) {
      console.error('Error fetching preview recipients:', error);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (e) => {
    setSelectedTemplate(e.value);

    // Find the selected template
    const template = templates.find(t => t._id === e.value);
    if (template) {
      setContent(template.content);
      setCharacterCount(template.content.length);
    }
  };

  // Handle content change
  const handleContentChange = (e) => {
    setContent(e.target.value);
    setCharacterCount(e.target.value.length);

    // Clear error
    if (errors.content) {
      setErrors({
        ...errors,
        content: null
      });
    }
  };

  // Insert placeholder into content
  const insertPlaceholder = (placeholder) => {
    const placeholderText = `[${placeholder}]`;
    const textArea = document.getElementById('content');

    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = content;
      const newText = text.substring(0, start) + placeholderText + text.substring(end);

      setContent(newText);
      setCharacterCount(newText.length);

      // Set focus back to textarea
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(start + placeholderText.length, start + placeholderText.length);
      }, 0);
    } else {
      // If no selection, append to the end
      const newText = content + placeholderText;
      setContent(newText);
      setCharacterCount(newText.length);
    }
  };

  // Generate preview messages
  const generatePreview = () => {
    // Generate preview messages for the first few recipients
    const previews = previewRecipients.slice(0, 3).map(recipient => {
      let previewContent = content;

      // Replace placeholders with actual values
      previewContent = previewContent.replace(/\[STUDENT_NAME\]/g, `${recipient.firstName} ${recipient.lastName}`);
      previewContent = previewContent.replace(/\[ROLL_NUMBER\]/g, recipient.rollNumber);
      previewContent = previewContent.replace(/\[CLASS\]/g, recipient.class);
      previewContent = previewContent.replace(/\[SECTION\]/g, recipient.section);
      previewContent = previewContent.replace(/\[PARENT_NAME\]/g, recipient.parentName);
      previewContent = previewContent.replace(/\[DATE\]/g, new Date().toLocaleDateString());

      // Subject placeholders (will be replaced with actual values in the backend)
      previewContent = previewContent.replace(/\[SUBJECT_NAME\]/g, '[Subject Name]');
      previewContent = previewContent.replace(/\[SUBJECT_CODE\]/g, '[Subject Code]');

      // Class timing placeholders (will be replaced with actual values in the backend)
      previewContent = previewContent.replace(/\[PERIOD_NUMBER\]/g, '[Period Number]');
      previewContent = previewContent.replace(/\[PERIOD_TIME\]/g, '[Period Time]');
      previewContent = previewContent.replace(/\[DAY_OF_WEEK\]/g, '[Description]');
      previewContent = previewContent.replace(/\[CLASS_TIMING_NAME\]/g, '[Class Timing Name]');

      return {
        recipient: `${recipient.firstName} ${recipient.lastName} (${recipient.rollNumber})`,
        content: previewContent,
        mobile: messageData.messageType === 'SMS' ? recipient.parentMobile : recipient.parentWhatsApp
      };
    });

    return {
      previews,
      totalRecipients: previewRecipients.length,
      messageType: messageData.messageType
    };
  };

  // Handle next button click
  const handleNext = async () => {
    const newErrors = {};

    if (!content.trim()) {
      newErrors.content = 'Please enter message content';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateMessageData({
        content,
        templateId: selectedTemplate
      });

      try {
        setLoading(true);

        const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        };

        // Fetch subject details if selected
        let subjectData = null;
        if (messageData.subjectId) {
          try {
            const subjectResponse = await axios.get(`http://localhost:5000/api/subjects/${messageData.subjectId}`, config);
            subjectData = subjectResponse.data.data;
          } catch (error) {
            console.error('Error fetching subject details:', error);
          }
        }

        // Fetch class timing details if selected
        let classTimingData = null;
        if (messageData.classTimingId) {
          try {
            const classTimingResponse = await axios.get(`http://localhost:5000/api/class-timings/${messageData.classTimingId}`, config);
            classTimingData = classTimingResponse.data.data;
          } catch (error) {
            console.error('Error fetching class timing details:', error);
          }
        }

        // Generate preview data
        const previewData = generatePreview();

        // Add subject and class timing details
        previewData.subject = subjectData;
        previewData.classTiming = classTimingData;

        setPreviewData(previewData);
        setLoading(false);
        onNext();
      } catch (error) {
        console.error('Error preparing preview:', error);
        setLoading(false);

        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to prepare preview',
          life: 3000
        });
      }
    }
  };

  // Template option template
  const templateOptionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <span>{option.label}</span>
        <span className="ml-auto">
          <span className="p-tag p-tag-rounded p-tag-info">
            {option.category}
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="message-composition">
      <Toast ref={toast} />
      <Card className="shadow-2 border-round-xl">
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Compose Message</h3>

          <div className="field mb-4">
            <label htmlFor="template" className="font-medium block mb-2">Select a Template (Optional)</label>
            <Dropdown
              id="template"
              value={selectedTemplate}
              options={filteredTemplates}
              onChange={handleTemplateSelect}
              placeholder="Choose a template"
              className="w-full"
              itemTemplate={templateOptionTemplate}
              filter
              filterBy="label"
            />
            <small className="text-secondary">
              Templates provide pre-written messages that you can use or modify
            </small>
          </div>

          <div className="field mb-4">
            <label htmlFor="content" className={classNames("font-medium block mb-2", { 'p-error': errors.content })}>
              Message Content <span className="text-danger">*</span>
            </label>

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
              value={content}
              onChange={handleContentChange}
              rows={6}
              autoResize
              className={classNames('w-full', { 'p-invalid': errors.content })}
            />
            {errors.content && <small className="p-error block mt-1">{errors.content}</small>}

            <div className="flex justify-content-between align-items-center mt-2">
              <small className="text-secondary">
                Click on a placeholder button above to insert it into your message
              </small>
              <small className={`${characterCount > 160 ? 'text-orange-500 font-medium' : 'text-secondary'}`}>
                Characters: {characterCount} {characterCount > 160 && messageData.messageType === 'SMS' && '(May be sent as multiple messages)'}
              </small>
            </div>
          </div>

          <div className="mt-4">
            <Message
              severity="info"
              text={`This message will be sent to ${previewRecipients.length} recipients via ${messageData.messageType}.`}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      <div className="message-navigation-buttons">
        <Button
          label="Previous"
          icon="pi pi-arrow-left"
          onClick={onPrevious}
          className="p-button-outlined p-button-secondary"
        />

        <Button
          label="Next"
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-arrow-right"}
          iconPos="right"
          onClick={handleNext}
          className="p-button-primary p-button-raised"
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default MessageComposition;

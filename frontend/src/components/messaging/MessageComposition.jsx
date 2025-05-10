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

  // State to track the total number of recipients
  const [totalRecipientCount, setTotalRecipientCount] = useState(0);

  // Fetch preview recipients
  const fetchPreviewRecipients = async () => {
    try {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      let recipients = [];
      let totalCount = 0;

      if (messageData.targetType === 'Individual' && messageData.recipientIds.length > 0) {
        // For individual selection, we need to fetch each student by ID to ensure we get all data
        try {
          console.log('Fetching individual students for preview:', messageData.recipientIds);

          // Get the first 3 students for preview
          const previewIds = messageData.recipientIds.slice(0, 3);

          // Fetch each student individually to ensure we get complete data
          const studentPromises = previewIds.map(id =>
            axios.get(`http://localhost:5000/api/students/${id}`, config)
          );

          const studentResponses = await Promise.all(studentPromises);
          recipients = studentResponses.map(response => response.data.data);

          console.log('Fetched individual students for preview:', recipients);

          // Set the total count to the total number of selected students
          totalCount = messageData.recipientIds.length;
        } catch (error) {
          console.error('Error fetching individual students:', error);

          // Fallback to the old method if individual fetching fails
          console.log('Falling back to fetching all students');
          const response = await axios.get('http://localhost:5000/api/students', config);
          const allStudents = response.data.data;
          recipients = allStudents.filter(student => messageData.recipientIds.includes(student._id));
          totalCount = messageData.recipientIds.length;
        }
      } else {
        // First, get the total count without limit
        const countParams = new URLSearchParams();
        countParams.append('isActive', 'true');
        countParams.append('count', 'true'); // Just get the count

        // Add target-specific filters
        if (messageData.targetType === 'Section') {
          countParams.append('stream', messageData.targetDetails.stream);
          countParams.append('class', messageData.targetDetails.class);
          countParams.append('section', messageData.targetDetails.section);
        } else if (messageData.targetType === 'Class') {
          countParams.append('stream', messageData.targetDetails.stream);
          countParams.append('class', messageData.targetDetails.class);
        } else if (messageData.targetType === 'Stream') {
          countParams.append('stream', messageData.targetDetails.stream);
        } else if (messageData.targetType === 'Batch') {
          countParams.append('batch', messageData.targetDetails.batch);
        } else if (messageData.targetType === 'MultipleStreams' && messageData.targetDetails.streams) {
          // For multiple streams, we need to make separate count requests
          if (messageData.targetDetails.streams.length > 0) {
            const streamCounts = await Promise.all(
              messageData.targetDetails.streams.map(async (stream) => {
                const streamParams = new URLSearchParams();
                streamParams.append('isActive', 'true');
                streamParams.append('count', 'true');
                streamParams.append('stream', stream);
                const response = await axios.get(`http://localhost:5000/api/students?${streamParams.toString()}`, config);
                return response.data.total || 0;
              })
            );
            totalCount = streamCounts.reduce((sum, count) => sum + count, 0);
          }
        } else if (messageData.targetType === 'MultipleClasses' && messageData.targetDetails.classes) {
          // For multiple classes, we need to make separate count requests
          if (messageData.targetDetails.classes.length > 0) {
            const classCounts = await Promise.all(
              messageData.targetDetails.classes.map(async (className) => {
                const classParams = new URLSearchParams();
                classParams.append('isActive', 'true');
                classParams.append('count', 'true');
                classParams.append('stream', messageData.targetDetails.stream);
                classParams.append('class', className);
                const response = await axios.get(`http://localhost:5000/api/students?${classParams.toString()}`, config);
                return response.data.total || 0;
              })
            );
            totalCount = classCounts.reduce((sum, count) => sum + count, 0);
          }
        } else if (messageData.targetType === 'MultipleSections' && messageData.targetDetails.sections) {
          // For multiple sections, we need to make separate count requests
          if (messageData.targetDetails.sections.length > 0) {
            const sectionCounts = await Promise.all(
              messageData.targetDetails.sections.map(async (section) => {
                const sectionParams = new URLSearchParams();
                sectionParams.append('isActive', 'true');
                sectionParams.append('count', 'true');
                sectionParams.append('stream', messageData.targetDetails.stream);
                sectionParams.append('class', messageData.targetDetails.class);
                sectionParams.append('section', section);
                const response = await axios.get(`http://localhost:5000/api/students?${sectionParams.toString()}`, config);
                return response.data.total || 0;
              })
            );
            totalCount = sectionCounts.reduce((sum, count) => sum + count, 0);
          }
        } else if (messageData.targetType === 'MultipleBatches' && messageData.targetDetails.batches) {
          // For multiple batches, we need to make separate count requests
          if (messageData.targetDetails.batches.length > 0) {
            const batchCounts = await Promise.all(
              messageData.targetDetails.batches.map(async (batch) => {
                const batchParams = new URLSearchParams();
                batchParams.append('isActive', 'true');
                batchParams.append('count', 'true');
                batchParams.append('batch', batch);
                const response = await axios.get(`http://localhost:5000/api/students?${batchParams.toString()}`, config);
                return response.data.total || 0;
              })
            );
            totalCount = batchCounts.reduce((sum, count) => sum + count, 0);
          }
        } else if (messageData.targetType === 'College') {
          // For entire college, just get the total count of active students
          const response = await axios.get(`http://localhost:5000/api/students?${countParams.toString()}`, config);
          totalCount = response.data.total || 0;
        }

        // Now get a few sample recipients for preview
        const previewParams = new URLSearchParams();
        previewParams.append('isActive', 'true');
        previewParams.append('limit', '5'); // Just get a few for preview

        if (messageData.targetType === 'Section') {
          previewParams.append('stream', messageData.targetDetails.stream);
          previewParams.append('class', messageData.targetDetails.class);
          previewParams.append('section', messageData.targetDetails.section);
        } else if (messageData.targetType === 'Class') {
          previewParams.append('stream', messageData.targetDetails.stream);
          previewParams.append('class', messageData.targetDetails.class);
        } else if (messageData.targetType === 'Stream') {
          previewParams.append('stream', messageData.targetDetails.stream);
        } else if (messageData.targetType === 'Batch') {
          previewParams.append('batch', messageData.targetDetails.batch);
        } else if (messageData.targetType === 'MultipleStreams' && messageData.targetDetails.streams) {
          // For multiple streams, just get a sample from the first stream
          if (messageData.targetDetails.streams.length > 0) {
            previewParams.append('stream', messageData.targetDetails.streams[0]);
          }
        } else if (messageData.targetType === 'MultipleClasses' && messageData.targetDetails.classes) {
          previewParams.append('stream', messageData.targetDetails.stream);
          // For multiple classes, just get a sample from the first class
          if (messageData.targetDetails.classes.length > 0) {
            previewParams.append('class', messageData.targetDetails.classes[0]);
          }
        } else if (messageData.targetType === 'MultipleSections' && messageData.targetDetails.sections) {
          previewParams.append('stream', messageData.targetDetails.stream);
          previewParams.append('class', messageData.targetDetails.class);
          // For multiple sections, just get a sample from the first section
          if (messageData.targetDetails.sections.length > 0) {
            previewParams.append('section', messageData.targetDetails.sections[0]);
          }
        } else if (messageData.targetType === 'MultipleBatches' && messageData.targetDetails.batches) {
          // For multiple batches, just get a sample from the first batch
          if (messageData.targetDetails.batches.length > 0) {
            previewParams.append('batch', messageData.targetDetails.batches[0]);
          }
        }

        // Get sample recipients for preview
        const response = await axios.get(`http://localhost:5000/api/students?${previewParams.toString()}`, config);
        recipients = response.data.data;

        // If we didn't get a total count from the specific target type handlers above,
        // use the total from the response
        if (totalCount === 0 && response.data.total) {
          totalCount = response.data.total;
        }
      }

      console.log(`Total recipient count: ${totalCount}, Preview recipients: ${recipients.length}`);
      setTotalRecipientCount(totalCount);
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
  const generatePreview = (recipientsToUse = previewRecipients) => {
    // Check if we have any recipients to preview
    if (!recipientsToUse || recipientsToUse.length === 0) {
      console.log('No recipients available for preview');
      return {
        previews: [],
        totalRecipients: totalRecipientCount || 0,
        messageType: messageData.messageType
      };
    }

    // Generate preview messages for the first few recipients
    const previews = recipientsToUse.slice(0, 3).map(recipient => {
      let previewContent = content;

      console.log('Generating preview for recipient:', recipient);

      // Replace placeholders with actual values
      previewContent = previewContent.replace(/\[STUDENT_NAME\]/g, `${recipient.firstName} ${recipient.lastName}`);
      previewContent = previewContent.replace(/\[ROLL_NUMBER\]/g, recipient.rollNumber || '');
      previewContent = previewContent.replace(/\[CLASS\]/g, recipient.class || '');
      previewContent = previewContent.replace(/\[SECTION\]/g, recipient.section || '');

      // Use the actual parent name from the student record
      if (recipient.parentName) {
        previewContent = previewContent.replace(/\[PARENT_NAME\]/g, recipient.parentName);
      } else {
        // Fallback if parentName is not available
        previewContent = previewContent.replace(/\[PARENT_NAME\]/g, 'Parent');
      }

      previewContent = previewContent.replace(/\[DATE\]/g, new Date().toLocaleDateString());

      // Subject placeholders - use actual values if available
      if (recipient.subjectName) {
        previewContent = previewContent.replace(/\[SUBJECT_NAME\]/g, recipient.subjectName);
      } else {
        previewContent = previewContent.replace(/\[SUBJECT_NAME\]/g, '[Subject Name]');
      }

      if (recipient.subjectCode) {
        previewContent = previewContent.replace(/\[SUBJECT_CODE\]/g, recipient.subjectCode);
      } else {
        previewContent = previewContent.replace(/\[SUBJECT_CODE\]/g, '[Subject Code]');
      }

      // Class timing placeholders - use actual values if available
      if (recipient.periodNumber) {
        previewContent = previewContent.replace(/\[PERIOD_NUMBER\]/g, recipient.periodNumber);
      } else {
        previewContent = previewContent.replace(/\[PERIOD_NUMBER\]/g, '[Period Number]');
      }

      if (recipient.periodTime) {
        previewContent = previewContent.replace(/\[PERIOD_TIME\]/g, recipient.periodTime);
      } else {
        previewContent = previewContent.replace(/\[PERIOD_TIME\]/g, '[Period Time]');
      }

      if (recipient.dayOfWeek) {
        previewContent = previewContent.replace(/\[DAY_OF_WEEK\]/g, recipient.dayOfWeek);
      } else {
        previewContent = previewContent.replace(/\[DAY_OF_WEEK\]/g, '[Description]');
      }

      if (recipient.classTimingName) {
        previewContent = previewContent.replace(/\[CLASS_TIMING_NAME\]/g, recipient.classTimingName);
      } else {
        previewContent = previewContent.replace(/\[CLASS_TIMING_NAME\]/g, '[Class Timing Name]');
      }

      return {
        recipient: `${recipient.firstName} ${recipient.lastName} (${recipient.rollNumber || 'No Roll Number'})`,
        content: previewContent,
        mobile: messageData.messageType === 'SMS' ? recipient.parentMobile : recipient.parentWhatsApp
      };
    });

    return {
      previews,
      totalRecipients: totalRecipientCount || previewRecipients.length,
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

        // Apply subject and class timing details to preview content
        let updatedPreviewRecipients = [...previewRecipients];

        // If we have subject or class timing data, update the preview content with actual values
        if (subjectData || classTimingData) {
          console.log('Applying subject/class timing data to previews:', {
            subject: subjectData,
            classTiming: classTimingData
          });

          // Create a new array with updated content
          updatedPreviewRecipients = previewRecipients.map(recipient => {
            // Start with the original recipient
            const updatedRecipient = { ...recipient };

            // Add subject and class timing properties that will be used in the preview
            if (subjectData) {
              updatedRecipient.subjectName = subjectData.name;
              updatedRecipient.subjectCode = subjectData.code;
            }

            if (classTimingData) {
              updatedRecipient.periodNumber = classTimingData.period;
              updatedRecipient.periodTime = `${classTimingData.startTime} - ${classTimingData.endTime}`;
              updatedRecipient.dayOfWeek = classTimingData.description || '';
              updatedRecipient.classTimingName = classTimingData.name;
            }

            return updatedRecipient;
          });

          // Update the preview recipients with the enhanced data
          setPreviewRecipients(updatedPreviewRecipients);
        }

        // Generate preview data with the updated recipients
        const previewData = generatePreview(updatedPreviewRecipients);

        // Add subject and class timing details to the preview data
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
              content={
                <div className="flex align-items-center">
                  <i className="pi pi-info-circle mr-2 text-lg"></i>
                  <span>
                    This message will be sent to <strong>{totalRecipientCount || previewRecipients.length}</strong> recipients
                    via <strong>{messageData.messageType === 'Both' ? 'SMS and WhatsApp' : messageData.messageType}</strong>.
                  </span>
                </div>
              }
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

import { useState, useRef, useContext, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import AuthContext from '../context/AuthContext';
import { messageTemplateService, messageService } from '../services';
import MessageTypeSelection from '../components/messaging/MessageTypeSelection';
import RecipientSelection from '../components/messaging/RecipientSelection';
import SubjectSelection from '../components/messaging/SubjectSelection';
import MessageComposition from '../components/messaging/MessageComposition';
import MessagePreview from '../components/messaging/MessagePreview';
import '../styles/MessageManagement.css';

const MessageSending = () => {
  const { token } = useContext(AuthContext);
  const toast = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [messageData, setMessageData] = useState({
    messageType: null,
    templateId: null,
    content: '',
    targetType: null,
    targetDetails: {},
    recipientIds: [],
    subjectId: null,
    classTimingId: null
  });
  const [templates, setTemplates] = useState([]);
  const [sending, setSending] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', url: '/admin' },
    { label: 'Send Messages' }
  ];

  const homeBreadcrumbItem = { icon: 'pi pi-home', url: '/admin' };

  // Steps for the message sending process
  const steps = [
    { label: 'Message Type' },
    { label: 'Select Recipients' },
    { label: 'Subject & Timing' },
    { label: 'Compose Message' },
    { label: 'Preview & Send' }
  ];

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, [token]);

  const fetchTemplates = async () => {
    try {
      const filters = { isActive: true };
      const response = await messageTemplateService.getMessageTemplates(token, filters);

      if (response.success) {
        setTemplates(response.data.data);
      } else {
        console.error('Error fetching templates:', response.error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to load message templates',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching templates:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while loading templates',
        life: 3000
      });
    }
  };

  // Handle next step
  const handleNext = () => {
    setActiveIndex(prevIndex => prevIndex + 1);
  };

  // Handle previous step
  const handlePrevious = () => {
    setActiveIndex(prevIndex => prevIndex - 1);
  };

  // Update message data
  const updateMessageData = (data) => {
    setMessageData(prevData => ({
      ...prevData,
      ...data
    }));
  };

  // Handle send message
  const handleSendMessage = async () => {
    try {
      setSending(true);

      const response = await messageService.sendMessage(token, messageData);

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: `Message sent successfully to ${response.data.data.recipientCount} recipients`,
          life: 5000
        });

        // Reset form
        setMessageData({
          messageType: null,
          templateId: null,
          content: '',
          targetType: null,
          targetDetails: {},
          recipientIds: [],
          subjectId: null,
          classTimingId: null
        });
        setActiveIndex(0);
      } else {
        console.error('Error sending message:', response.error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to send message',
          life: 3000
        });
      }

      setSending(false);
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      setSending(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while sending message',
        life: 3000
      });
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (activeIndex) {
      case 0:
        return (
          <MessageTypeSelection
            messageData={messageData}
            updateMessageData={updateMessageData}
            templates={templates}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <RecipientSelection
            messageData={messageData}
            updateMessageData={updateMessageData}
            token={token}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <>
            <SubjectSelection
              messageData={messageData}
              updateMessageData={updateMessageData}
              token={token}
            />
            <div className="message-navigation-buttons">
              <Button
                label="Previous"
                icon="pi pi-arrow-left"
                onClick={handlePrevious}
                className="p-button-outlined p-button-secondary"
              />
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={handleNext}
                className="p-button-primary p-button-raised"
              />
            </div>
          </>
        );
      case 3:
        return (
          <MessageComposition
            messageData={messageData}
            updateMessageData={updateMessageData}
            templates={templates}
            token={token}
            onNext={handleNext}
            onPrevious={handlePrevious}
            setPreviewData={setPreviewData}
          />
        );
      case 4:
        return (
          <MessagePreview
            messageData={messageData}
            previewData={previewData}
            onSend={handleSendMessage}
            onPrevious={handlePrevious}
            sending={sending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="message-sending-container">
      <Toast ref={toast} />

      <BreadCrumb model={breadcrumbItems} home={homeBreadcrumbItem} className="mb-4 p-2 border-1 border-round surface-border" />

      <Card className="shadow-2 border-round-xl p-0 overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border">
          <h3 className="m-0 font-semibold text-xl">Send Messages</h3>
        </div>

        <div className="p-4">
          <Steps model={steps} activeIndex={activeIndex} readOnly className="mb-5" />

          <div className="step-content p-2">
            {renderStepContent()}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MessageSending;

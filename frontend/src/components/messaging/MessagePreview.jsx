import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';

const MessagePreview = ({ messageData, previewData, onSend, onPrevious, sending }) => {
  // Get target description
  const getTargetDescription = () => {
    switch (messageData.targetType) {
      case 'College':
        return 'All students in the college';
      case 'Stream':
        return `All students in ${messageData.targetDetails.stream} stream`;
      case 'Class':
        return `All students in ${messageData.targetDetails.stream} stream, ${messageData.targetDetails.class} class`;
      case 'Section':
        return `All students in ${messageData.targetDetails.stream} stream, ${messageData.targetDetails.class} class, Section ${messageData.targetDetails.section}`;
      case 'Batch':
        return `All students in ${messageData.targetDetails.batch} batch`;
      case 'Individual':
        return `${messageData.recipientIds.length} selected students`;
      default:
        return 'Unknown target';
    }
  };

  return (
    <div className="message-preview">
      <Card className="shadow-2 border-round-xl">
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Preview & Send</h3>

          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="field">
                <label className="font-medium block mb-2">Message Type:</label>
                <Tag
                  value={messageData.messageType}
                  severity={messageData.messageType === 'SMS' ? 'info' : 'success'}
                  className="text-base"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label className="font-medium block mb-2">Recipients:</label>
                <div className="flex align-items-center">
                  <i className="pi pi-users mr-2 text-primary"></i>
                  <span className="font-medium">{getTargetDescription()}</span>
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {(messageData.subjectId || messageData.classTimingId) && (
            <>
              <div className="grid">
                {previewData?.subject && (
                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label className="font-medium block mb-2">Subject:</label>
                      <div className="flex align-items-center">
                        <i className="pi pi-book mr-2 text-primary"></i>
                        <span className="font-medium">{previewData.subject.name} ({previewData.subject.code})</span>
                      </div>
                    </div>
                  </div>
                )}

                {previewData?.classTiming && (
                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label className="font-medium block mb-2">Class Timing:</label>
                      <div className="flex align-items-center">
                        <i className="pi pi-clock mr-2 text-primary"></i>
                        <span className="font-medium">
                          {previewData.classTiming.name}, Period {previewData.classTiming.period}
                          ({previewData.classTiming.startTime} - {previewData.classTiming.endTime})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Divider />
            </>
          )}

          <div className="field mb-4">
            <label className="font-medium block mb-2">Message Content:</label>
            <div className="p-4 border-1 border-round surface-border bg-gray-50 whitespace-pre-line">
              {messageData.content}
            </div>
          </div>

          <Divider />

          <div className="field">
            <label className="font-medium block mb-2">Preview (How it will appear to recipients):</label>

            {previewData && previewData.previews.map((preview, index) => (
              <div key={index} className="mb-3 p-3 border-1 border-round surface-border shadow-1">
                <div className="flex justify-content-between mb-2">
                  <span className="font-medium text-primary">{preview.recipient}</span>
                  <span className="text-500 font-medium">{preview.mobile || 'No mobile number'}</span>
                </div>
                <div className="p-4 border-1 border-round surface-border bg-gray-50 whitespace-pre-line">
                  {preview.content}
                </div>
              </div>
            ))}

            {previewData && previewData.totalRecipients > previewData.previews.length && (
              <Message
                severity="info"
                text={`... and ${previewData.totalRecipients - previewData.previews.length} more recipients`}
                className="w-full mt-3"
              />
            )}
          </div>

          <Message
            severity="warn"
            className="w-full mt-4"
            content={
              <div className="flex align-items-center">
                <i className="pi pi-exclamation-triangle mr-2 text-xl"></i>
                <span>
                  You are about to send this message to <strong>{previewData ? previewData.totalRecipients : 0} recipients</strong>.
                  Please review the content carefully before sending.
                </span>
              </div>
            }
          />
        </div>
      </Card>

      <div className="message-navigation-buttons">
        <Button
          label="Previous"
          icon="pi pi-arrow-left"
          onClick={onPrevious}
          className="p-button-outlined p-button-secondary"
          disabled={sending}
        />

        <Button
          label="Send Message"
          icon="pi pi-send"
          onClick={onSend}
          loading={sending}
          loadingIcon="pi pi-spin pi-spinner"
          className="p-button-success p-button-raised"
        />
      </div>
    </div>
  );
};

export default MessagePreview;

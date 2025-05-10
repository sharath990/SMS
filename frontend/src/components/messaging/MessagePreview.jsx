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
      case 'MultipleStreams':
        if (messageData.targetDetails.streams && messageData.targetDetails.streams.length > 0) {
          return `All students in ${messageData.targetDetails.streams.length} selected streams`;
        }
        return 'Selected streams';
      case 'Class':
        return `All students in ${messageData.targetDetails.stream} stream, ${messageData.targetDetails.class} class`;
      case 'MultipleClasses':
        if (messageData.targetDetails.classes && messageData.targetDetails.classes.length > 0) {
          return `All students in ${messageData.targetDetails.stream} stream, ${messageData.targetDetails.classes.length} selected classes`;
        }
        return 'Selected classes';
      case 'Section':
        return `All students in ${messageData.targetDetails.stream} stream, ${messageData.targetDetails.class} class, Section ${messageData.targetDetails.section}`;
      case 'MultipleSections':
        if (messageData.targetDetails.sections && messageData.targetDetails.sections.length > 0) {
          return `All students in ${messageData.targetDetails.stream} stream, ${messageData.targetDetails.class} class, ${messageData.targetDetails.sections.length} selected sections`;
        }
        return 'Selected sections';
      case 'Batch':
        return `All students in ${messageData.targetDetails.batch} batch`;
      case 'MultipleBatches':
        if (messageData.targetDetails.batches && messageData.targetDetails.batches.length > 0) {
          return `All students in ${messageData.targetDetails.batches.length} selected batches`;
        }
        return 'Selected batches';
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

            {previewData && previewData.previews && previewData.previews.length > 0 ? (
              <>
                {previewData.previews.map((preview, index) => (
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

                {previewData.totalRecipients > previewData.previews.length && (
                  <Message
                    severity="info"
                    text={`... and ${previewData.totalRecipients - previewData.previews.length} more recipients`}
                    className="w-full mt-3"
                  />
                )}
              </>
            ) : (
              <Message
                severity="warn"
                text="No preview available. This may happen when selecting individual students. The message will still be sent to all selected recipients."
                className="w-full mt-3"
              />
            )}
          </div>

          <div className="p-3 border-1 border-round surface-border bg-yellow-50">
            <div className="flex align-items-center">
              <i className="pi pi-exclamation-triangle mr-2 text-xl text-yellow-700"></i>
              <div>
                <p className="font-medium text-yellow-700 m-0">Important</p>
                <p className="m-0 mt-1">
                  You are about to send this message to <strong>{previewData ? previewData.totalRecipients : 0} recipients</strong> via
                  <strong> {messageData.messageType === 'Both' ? 'SMS and WhatsApp' : messageData.messageType}</strong>.
                  Please review the content carefully before sending.
                </p>
              </div>
            </div>
          </div>
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

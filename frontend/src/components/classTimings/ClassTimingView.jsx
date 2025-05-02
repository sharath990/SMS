import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const ClassTimingView = ({ visible, onHide, classTiming, onEdit }) => {
  if (!classTiming) {
    return null;
  }

  // Format time range display
  const formatTimeRange = () => {
    return `${classTiming.startTime} - ${classTiming.endTime}`;
  };

  // Render a field with label and value
  const renderField = (label, value, isHighlighted = false) => {
    return (
      <div className="field mb-3">
        <label className="font-medium block mb-1">{label}</label>
        <div className={`p-2 border-1 border-round surface-border ${isHighlighted ? 'surface-200' : 'surface-50'}`}>
          {value || 'N/A'}
        </div>
      </div>
    );
  };

  // Dialog footer with action buttons
  const renderFooter = () => {
    return (
      <div className="flex justify-content-end gap-2">
        <Button
          label="Close"
          icon="pi pi-times"
          onClick={onHide}
          className="p-button-outlined p-button-secondary"
          style={{ padding: '0.5rem 1rem' }}
        />
        <Button
          label="Edit"
          icon="pi pi-pencil"
          onClick={() => {
            onHide();
            onEdit(classTiming);
          }}
          className="p-button-primary"
          style={{ padding: '0.5rem 1rem' }}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: '600px' }}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-calendar text-primary text-xl"></i>
          <span className="font-bold text-xl">Class Timing Details</span>
        </div>
      }
      modal
      footer={renderFooter()}
      onHide={onHide}
      dismissableMask
    >
      <div className="p-3">
        <div className="grid">
          <div className="col-12">
            {renderField('Name', classTiming.name, true)}
          </div>
          <div className="col-12 md:col-6">
            {renderField('Period', classTiming.period)}
          </div>
          <div className="col-12 md:col-6">
            {renderField('Time Range', formatTimeRange(), true)}
          </div>
          <div className="col-12">
            {renderField('Description', classTiming.description || 'No description provided')}
          </div>
          <div className="col-12">
            {renderField('Status', classTiming.isActive ? 'Active' : 'Inactive', classTiming.isActive)}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ClassTimingView;

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';

const StudentView = ({ visible, onHide, student, onEdit }) => {
  if (!student) {
    return null;
  }

  // Dialog footer with action buttons
  const renderFooter = () => {
    return (
      <div className="flex justify-content-end gap-2">
        <Button
          label="Close"
          icon="pi pi-times"
          className="p-button-outlined p-button-secondary"
          style={{ padding: '0.5rem 1rem' }}
          onClick={onHide}
        />
        <Button
          label="Edit Student"
          icon="pi pi-pencil"
          className="p-button-primary p-button-raised"
          style={{ padding: '0.5rem 1rem' }}
          onClick={() => {
            onHide();
            onEdit(student);
          }}
        />
      </div>
    );
  };

  // Render a field with label and value
  const renderField = (label, value, icon) => {
    return (
      <div className="field">
        <label className="text-sm text-600 block mb-2 font-medium">{label}</label>
        <div className="flex align-items-center gap-2 p-2 surface-100 border-round">
          {icon && <i className={`${icon} text-primary`} style={{ width: '1.5rem' }}></i>}
          <span className="font-medium">{value || 'N/A'}</span>
        </div>
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: '800px' }}
      contentStyle={{ padding: 0 }}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-user text-primary text-xl"></i>
          <span className="font-bold text-xl">Student Details</span>
        </div>
      }
      modal
      footer={renderFooter()}
      onHide={onHide}
      className="student-view-dialog"
    >
      <div className="p-3">
        <Card className="mb-4 border-round-xl shadow-3">
          <div className="card-container">
            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center p-2">
              <div className="flex align-items-center mb-3 md:mb-0">
                <div className="flex justify-content-center align-items-center bg-primary border-circle mr-3"
                    style={{ width: '3.5rem', height: '3.5rem' }}>
                  <span className="text-white font-bold text-xl">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="m-0 text-2xl font-bold text-900">
                    {student.firstName} {student.lastName}
                  </h2>
                  <div className="flex align-items-center mt-2">
                    <i className="pi pi-id-card text-primary mr-2"></i>
                    <span className="text-600 font-medium">Roll Number: {student.rollNumber}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-column align-items-center md:align-items-end">
                <Tag
                  severity={student.isActive ? 'success' : 'danger'}
                  value={student.isActive ? 'Active' : 'Inactive'}
                  className="px-3 py-2 mb-2"
                  style={{ fontSize: '1rem' }}
                />
                <span className="text-500">
                  <i className="pi pi-calendar mr-1"></i>
                  Batch: {student.batch}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-4 border-round-xl">
          <div className="card-container">
            <div className="flex align-items-center mb-3">
              <div className="flex justify-content-center align-items-center bg-blue-100 border-round mr-3"
                  style={{ width: '2.5rem', height: '2.5rem' }}>
                <i className="pi pi-book text-blue-600 text-xl"></i>
              </div>
              <span className="font-bold text-lg text-900">Academic Information</span>
            </div>
            <Divider className="my-3" />

            <div className="grid">
              <div className="col-12 md:col-6 lg:col-3 p-2">
                {renderField('Stream', student.stream, 'pi pi-tag')}
              </div>

              <div className="col-12 md:col-6 lg:col-3 p-2">
                {renderField('Class', student.class, 'pi pi-list')}
              </div>

              <div className="col-12 md:col-6 lg:col-3 p-2">
                {renderField('Section', student.section, 'pi pi-id-card')}
              </div>

              <div className="col-12 md:col-6 lg:col-3 p-2">
                {renderField('Batch', student.batch, 'pi pi-calendar')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-round-xl">
          <div className="card-container">
            <div className="flex align-items-center mb-3">
              <div className="flex justify-content-center align-items-center bg-green-100 border-round mr-3"
                  style={{ width: '2.5rem', height: '2.5rem' }}>
                <i className="pi pi-users text-green-600 text-xl"></i>
              </div>
              <span className="font-bold text-lg text-900">Parent Information</span>
            </div>
            <Divider className="my-3" />

            <div className="grid">
              <div className="col-12 md:col-6 p-2">
                {renderField('Parent Name', student.parentName, 'pi pi-user')}
              </div>

              <div className="col-12 md:col-6 p-2">
                {renderField('Mobile Number', student.parentMobile, 'pi pi-mobile')}
              </div>

              <div className="col-12 md:col-6 p-2">
                {renderField('WhatsApp Number', student.parentWhatsApp, 'pi pi-whatsapp')}
              </div>

              <div className="col-12 md:col-6 p-2">
                {renderField('Email', student.parentEmail, 'pi pi-envelope')}
              </div>

              <div className="col-12 p-2">
                {renderField('Address', student.address, 'pi pi-map-marker')}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Dialog>
  );
};

export default StudentView;

import { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Message } from 'primereact/message';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import axios from 'axios';

const StudentImport = ({ visible, onHide, token, onImportComplete }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);

  const fileUploadRef = useRef(null);

  // Handle file selection
  const onFileSelect = (e) => {
    const file = e.files[0];
    setUploadedFile(file);
    setError(null);
    setImportResults(null);
  };

  // Handle file upload and import
  const handleImport = async () => {
    if (!uploadedFile) {
      setError('Please select a file to import');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Create form data
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Set up request config
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      // Send import request
      const response = await axios.post('http://localhost:5000/api/import/students', formData, config);

      // Set import results
      setImportResults(response.data);

      // Reset file upload
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }

      setUploadedFile(null);

      // Notify parent component
      if (onImportComplete) {
        onImportComplete(response.data);
      }
    } catch (error) {
      console.error('Error importing students:', error);
      setError(error.response?.data?.message || 'Failed to import students');
    } finally {
      setUploading(false);
    }
  };

  // Handle template download
  const handleDownloadTemplate = async (format) => {
    try {
      const config = {
        headers: {
          'x-auth-token': token
        },
        responseType: 'blob'
      };

      const response = await axios.get(`http://localhost:5000/api/import/template?format=${format}`, config);

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_import_template.${format}`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading template:', error);
      setError('Failed to download template');
    }
  };

  // Render error severity tag
  const errorSeverityTemplate = (rowData) => {
    return <Tag severity="error" value="Error" />;
  };

  // Dialog footer with action buttons
  const renderFooter = () => {
    return (
      <div className="flex justify-content-end gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          className="p-button-outlined p-button-secondary"
          style={{ padding: '0.5rem 1rem' }}
          onClick={onHide}
        />
        <Button
          label="Import Students"
          icon="pi pi-upload"
          loading={uploading}
          disabled={!uploadedFile || uploading}
          onClick={handleImport}
          className="p-button-primary p-button-raised"
          style={{ padding: '0.5rem 1rem' }}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: '700px' }}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-upload text-primary text-xl"></i>
          <span className="font-bold text-xl">Import Students</span>
        </div>
      }
      modal
      className="p-fluid"
      footer={renderFooter()}
      onHide={onHide}
    >
      <div className="grid">
        <div className="col-12">
          <div className="flex align-items-center justify-content-between mb-3">
            <h5 className="m-0">Upload CSV or Excel File</h5>
            <div className="flex gap-2">
              <Button
                label="CSV Template"
                icon="pi pi-download"
                className="p-button-outlined p-button-sm"
                onClick={() => handleDownloadTemplate('csv')}
              />
              <Button
                label="Excel Template"
                icon="pi pi-download"
                className="p-button-outlined p-button-sm"
                onClick={() => handleDownloadTemplate('excel')}
              />
            </div>
          </div>

          <FileUpload
            ref={fileUploadRef}
            mode="basic"
            name="file"
            url="/"
            accept=".csv,.xlsx,.xls"
            maxFileSize={10000000}
            customUpload
            uploadHandler={onFileSelect}
            chooseLabel="Select File"
            className="mb-3"
          />

          {uploadedFile && (
            <div className="flex align-items-center gap-2 mb-3">
              <i className="pi pi-file" />
              <span>{uploadedFile.name}</span>
              <Tag value={Math.round(uploadedFile.size / 1024) + ' KB'} />
            </div>
          )}

          {error && (
            <Message severity="error" text={error} className="mb-3" />
          )}

          {uploading && (
            <div className="mb-3">
              <ProgressBar value={uploadProgress} showValue />
            </div>
          )}

          {importResults && (
            <div className="mt-4">
              <h5>Import Results</h5>
              <div className="flex gap-3 mb-3">
                <div className="flex align-items-center gap-2">
                  <Tag severity="success" value={importResults.imported} />
                  <span>Students imported successfully</span>
                </div>
                <div className="flex align-items-center gap-2">
                  <Tag severity="danger" value={importResults.errors.length} />
                  <span>Errors</span>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <DataTable
                  value={importResults.errors}
                  scrollable
                  scrollHeight="200px"
                  className="p-datatable-sm"
                >
                  <Column field="row" header="Row" style={{ width: '5rem' }} />
                  <Column field="error" header="Error" />
                  <Column body={errorSeverityTemplate} header="Severity" style={{ width: '8rem' }} />
                </DataTable>
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default StudentImport;

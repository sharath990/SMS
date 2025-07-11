import { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Message } from 'primereact/message';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { studentService } from '../../services';
import axios from 'axios'; // Still needed for template download
import { API_BASE_URL } from '../../config/api.config';
import '../../styles/StudentImport.css';

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
      setError(null); // Clear any previous errors

      // Note: Progress tracking is handled internally by the service

      // Send import request using the service
      console.log('Sending import request with file:', uploadedFile.name);

      // We need to use the raw axios call here because our service doesn't support progress tracking
      // This is a special case for file uploads with progress tracking
      const response = await studentService.importStudents(token, uploadedFile);

      console.log('Import response:', response);

      if (response.success) {
        // Set import results
        setImportResults(response.data);

        // Only reset the file upload if there were no errors
        if (response.data.errors.length === 0) {
          if (fileUploadRef.current) {
            fileUploadRef.current.clear();
          }
          setUploadedFile(null);
        }

        // Notify parent component
        if (onImportComplete) {
          onImportComplete(response.data);
        }
      } else {
        // Handle error from service
        const errorMessage = response.error.message || 'Failed to import students';

        setError(errorMessage);

        // Set empty import results to show the error
        setImportResults({
          imported: 0,
          errors: [
            {
              row: 'N/A',
              error: errorMessage,
              severity: 'error'
            }
          ]
        });

        // Call the onImportComplete callback with the error
        if (onImportComplete) {
          onImportComplete({
            imported: 0,
            errors: [{ row: 'N/A', error: errorMessage }]
          });
        }
      }
    } catch (error) {
      console.error('Unexpected error importing students:', error);

      // Create a more detailed error message
      const errorMessage = 'An unexpected error occurred during import';

      setError(errorMessage);

      // Set empty import results to show the error
      setImportResults({
        imported: 0,
        errors: [
          {
            row: 'N/A',
            error: errorMessage,
            severity: 'error'
          }
        ]
      });

      // Call the onImportComplete callback with the error
      if (onImportComplete) {
        onImportComplete({
          imported: 0,
          errors: [{ row: 'N/A', error: errorMessage }]
        });
      }
    } finally {
      setUploading(false);
    }
  };

  // Handle template download
  const handleDownloadTemplate = async (format) => {
    try {
      // For now, we'll keep using axios directly for this function
      // In the future, we could add a downloadTemplate method to the studentService
      const config = {
        headers: {
          'x-auth-token': token
        },
        responseType: 'blob'
      };

      const response = await axios.get(`${API_BASE_URL}/import/template?format=${format}`, config);

      // Get the correct file extension based on format
      const fileExtension = format === 'excel' ? 'xlsx' : 'csv';

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_import_template.${fileExtension}`);
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
  const errorSeverityTemplate = () => {
    return <Tag severity="error" value="Error" />;
  };

  // Dialog footer with action buttons
  const renderFooter = () => {
    return (
      <div className="import-dialog-footer">
        <Button
          label="Cancel"
          icon="pi pi-times"
          className="p-button-outlined p-button-secondary"
          style={{ padding: '0.5rem 1.5rem' }}
          onClick={onHide}
        />
        <Button
          label="Import Students"
          icon="pi pi-upload"
          loading={uploading}
          disabled={!uploadedFile || uploading}
          onClick={handleImport}
          className="p-button-primary p-button-raised"
          style={{ padding: '0.5rem 1.5rem' }}
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
      contentClassName="p-4" // Added padding to the content
      footer={renderFooter()}
      onHide={onHide}
    >
      <div className="grid">
        <div className="col-12">
          <div className="flex flex-column md:flex-row align-items-start md:align-items-center justify-content-between mb-4 gap-3">
            <h5 className="m-0 text-lg font-medium">Upload CSV or Excel File</h5>
            <div className="flex gap-2">
              <Button
                label="CSV Template"
                icon="pi pi-download"
                className="p-button-outlined p-button-secondary template-download-btn"
                onClick={() => handleDownloadTemplate('csv')}
              />
              <Button
                label="Excel Template"
                icon="pi pi-download"
                className="p-button-outlined p-button-secondary template-download-btn"
                onClick={() => handleDownloadTemplate('excel')}
              />
            </div>
          </div>

          <div className="p-field mb-4">
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
              className="mb-3 custom-file-upload"
              style={{
                width: '100%'
              }}
              chooseOptions={{
                className: 'p-button-primary',
                style: {
                  padding: '0.5rem 1.5rem',
                  height: '2.5rem'
                }
              }}
            />
            <small className="text-secondary block mt-1">
              Supported formats: CSV, Excel (.xlsx, .xls) - Max size: 10MB
            </small>
            <div className="mt-3 p-3 border-1 border-round surface-border bg-yellow-50">
              <p className="m-0 text-yellow-800">
                <i className="pi pi-info-circle mr-2"></i>
                <strong>Note:</strong> All fields are required except for Parent Email and Address.
              </p>
            </div>
          </div>

          {uploadedFile && (
            <div className="flex align-items-center gap-2 p-3 border-1 surface-border border-round mb-4 bg-gray-50">
              <i className="pi pi-file text-primary" />
              <span className="font-medium">{uploadedFile.name}</span>
              <Tag value={Math.round(uploadedFile.size / 1024) + ' KB'} severity="info" />
            </div>
          )}

          {error && (
            <Message severity="error" text={error} className="mb-4 w-full" />
          )}

          {uploading && (
            <div className="mb-4">
              <label className="block font-medium mb-2">Uploading...</label>
              <ProgressBar value={uploadProgress} showValue className="h-2rem" />
            </div>
          )}

          {importResults && (
            <div className="mt-4 p-3 border-1 surface-border border-round">
              <div className="flex justify-content-between align-items-center mb-3">
                <h5 className="text-lg font-medium m-0">Import Results</h5>
                <Button
                  icon="pi pi-times"
                  className="p-button-rounded p-button-text p-button-plain"
                  onClick={() => setImportResults(null)}
                  aria-label="Close"
                />
              </div>

              <div className="flex flex-column md:flex-row gap-3 mb-4">
                <div className="flex align-items-center gap-2 p-2 border-round bg-green-50">
                  <Tag severity="success" value={importResults.imported} className="text-base" />
                  <span className="font-medium">Students imported successfully</span>
                </div>
                <div className="flex align-items-center gap-2 p-2 border-round bg-red-50">
                  <Tag severity="danger" value={importResults.errors.length} className="text-base" />
                  <span className="font-medium">Errors</span>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="card p-0">
                  <h6 className="font-medium mb-2">Error Details:</h6>
                  <DataTable
                    value={importResults.errors}
                    scrollable
                    scrollHeight="200px"
                    className="p-datatable-sm"
                    rowHover
                    stripedRows
                  >
                    <Column field="row" header="Row" style={{ width: '5rem' }} />
                    <Column field="error" header="Error" />
                    <Column body={errorSeverityTemplate} header="Severity" style={{ width: '8rem' }} />
                  </DataTable>
                </div>
              )}

              <div className="flex justify-content-end mt-3">
                <Button
                  label="Close"
                  icon="pi pi-times"
                  className="p-button-outlined p-button-secondary"
                  onClick={() => setImportResults(null)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default StudentImport;

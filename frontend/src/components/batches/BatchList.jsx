import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { batchService } from '../../services';

const BatchList = ({ token, onEdit, refreshList }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: null,
    isGraduated: null,
    search: ''
  });

  // Options for dropdowns
  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Graduated', value: true },
    { label: 'Not Graduated', value: false }
  ];

  const toast = useRef(null);

  // Load batches on component mount and when filters or refreshList changes
  useEffect(() => {
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, refreshList]);

  const loadBatches = async () => {
    try {
      setLoading(true);

      // Prepare filter object for the service
      const filterParams = {};

      if (filters.year) filterParams.year = filters.year;
      if (filters.isGraduated !== null) filterParams.isGraduated = filters.isGraduated;
      if (filters.search) filterParams.search = filters.search;

      const response = await batchService.getBatches(token, filterParams);

      if (response.success) {
        setBatches(response.data.data);
      } else {
        console.error('Error loading batches:', response.error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to load batches',
          life: 3000
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Unexpected error loading batches:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while loading batches',
        life: 3000
      });
    }
  };

  // Handle filter changes
  const onFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Handle delete confirmation
  const confirmDelete = (batch) => {
    confirmDialog({
      message: `Are you sure you want to delete ${batch.name} (${batch.year})?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteBatch(batch._id)
    });
  };

  // Delete batch
  const deleteBatch = async (id) => {
    try {
      setLoading(true);

      const response = await batchService.deleteBatch(token, id);

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Batch deleted successfully',
          life: 3000
        });

        // Reload batches
        loadBatches();
      } else {
        console.error('Error deleting batch:', response.error);
        setLoading(false);

        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to delete batch',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Unexpected error deleting batch:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while deleting batch',
        life: 3000
      });
    }
  };

  // Action buttons template
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2 justify-content-center">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-outlined p-button-success"
          style={{ width: '2.5rem', height: '2.5rem' }}
          onClick={() => onEdit(rowData)}
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-outlined p-button-danger"
          style={{ width: '2.5rem', height: '2.5rem' }}
          onClick={() => confirmDelete(rowData)}
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  // Status template
  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`p-tag p-tag-${rowData.isGraduated ? 'warning' : 'info'}`}>
        {rowData.isGraduated ? 'Graduated' : 'Not Graduated'}
      </span>
    );
  };

  // Graduation date template
  const graduationDateTemplate = (rowData) => {
    if (!rowData.graduationDate) return 'N/A';
    return new Date(rowData.graduationDate).toLocaleDateString();
  };

  // Header template with filters
  const renderHeader = () => {
    return (
      <div className="flex justify-content-between align-items-center p-2">
        <div className="p-inputgroup search-input-group" style={{ maxWidth: '250px' }}>
          <span className="p-inputgroup-addon">
            <i className="pi pi-search" style={{ fontSize: '1rem' }}></i>
          </span>
          <InputText
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search"
            style={{ width: '100%' }}
          />
        </div>

        <div className="flex align-items-center gap-2">
          <InputText
            value={filters.year}
            onChange={(e) => onFilterChange('year', e.target.value)}
            placeholder="Year"
            keyfilter="pint"
            style={{ width: '100px' }}
          />

          <Dropdown
            value={filters.isGraduated}
            options={statusOptions}
            onChange={(e) => onFilterChange('isGraduated', e.value)}
            placeholder="Status"
            style={{ width: '140px' }}
          />

          <div className="flex gap-1">
            <Button
              icon="pi pi-check-circle"
              className={`p-button-rounded p-button-sm ${filters.isGraduated === false ? 'p-button-info' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isGraduated', false)}
              tooltip="Not Graduated"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-flag"
              className={`p-button-rounded p-button-sm ${filters.isGraduated === true ? 'p-button-warning' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isGraduated', true)}
              tooltip="Graduated"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-users"
              className={`p-button-rounded p-button-sm ${filters.isGraduated === null ? 'p-button-help' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isGraduated', null)}
              tooltip="All Batches"
              tooltipOptions={{ position: 'top' }}
            />
          </div>

          <Button
            icon="pi pi-filter-slash"
            className="p-button-outlined p-button-secondary p-button-sm"
            onClick={() => {
              setFilters({
                year: null,
                isGraduated: null,
                search: ''
              });
              // Trigger immediate reload with cleared filters
              loadBatches();
            }}
            tooltip="Clear Filters"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <DataTable
        value={batches}
        loading={loading}
        header={renderHeader()}
        emptyMessage="No batches found"
        className="p-datatable-sm"
        tableStyle={{ minWidth: '50rem' }}
        sortField="year"
        sortOrder={-1}
      >
        <Column field="year" header="Year" sortable />
        <Column field="name" header="Batch Name" sortable />
        <Column field="isGraduated" header="Status" body={statusBodyTemplate} sortable />
        <Column field="graduationDate" header="Graduation Date" body={graduationDateTemplate} sortable />
        <Column field="createdAt" header="Created" body={(rowData) => new Date(rowData.createdAt).toLocaleDateString()} sortable />
        <Column body={actionBodyTemplate} header="Actions" style={{ width: '10rem' }} />
      </DataTable>
    </div>
  );
};

export default BatchList;

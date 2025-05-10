import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { subjectService } from '../../services';

const SubjectList = ({ token, onEdit, refreshList }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'name',
    sortOrder: 1
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    stream: null,
    isActive: true
  });

  // Options for dropdowns
  const streamOptions = [
    { label: 'Science', value: 'Science' },
    { label: 'Commerce', value: 'Commerce' },
    { label: 'Both', value: 'Both' }
  ];

  const toast = useRef(null);

  // Load subjects on component mount and when params change or refreshList changes
  useEffect(() => {
    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyParams, filters, refreshList]);

  const loadSubjects = async () => {
    try {
      setLoading(true);

      // Prepare filter object for the service
      const filterParams = { ...filters };

      // Convert sortOrder to match API expectations
      const sortOrderValue = lazyParams.sortOrder === 1 ? 1 : -1;

      const response = await subjectService.getSubjects(
        token,
        filterParams,
        lazyParams.page,
        lazyParams.rows,
        lazyParams.sortField,
        sortOrderValue
      );

      if (response.success) {
        setSubjects(response.data.data);
        setTotalRecords(response.data.total);
      } else {
        console.error('Error loading subjects:', response.error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to load subjects',
          life: 3000
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Unexpected error loading subjects:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while loading subjects',
        life: 3000
      });
    }
  };

  // Handle pagination and sorting
  const onPage = (event) => {
    setLazyParams({
      ...lazyParams,
      first: event.first,
      rows: event.rows,
      page: event.page + 1
    });
  };

  const onSort = (event) => {
    setLazyParams({
      ...lazyParams,
      sortField: event.sortField,
      sortOrder: event.sortOrder
    });
  };

  // Handle filter changes
  const onFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });

    // Reset pagination when filters change
    setLazyParams({
      ...lazyParams,
      first: 0,
      page: 1
    });
  };

  // Handle delete confirmation
  const confirmDelete = (subject) => {
    confirmDialog({
      message: `Are you sure you want to delete the subject "${subject.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteSubject(subject._id)
    });
  };

  // Delete subject
  const deleteSubject = async (id) => {
    try {
      setLoading(true);

      const response = await subjectService.deleteSubject(token, id);

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Subject deleted successfully',
          life: 3000
        });

        // Reload subjects
        loadSubjects();
      } else {
        console.error('Error deleting subject:', response.error);
        setLoading(false);

        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to delete subject',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Unexpected error deleting subject:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while deleting subject',
        life: 3000
      });
    }
  };

  // Toggle subject active status
  const toggleActiveStatus = async (subject) => {
    try {
      const updatedSubject = {
        ...subject,
        isActive: !subject.isActive
      };

      const response = await subjectService.updateSubject(token, subject._id, updatedSubject);

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: `Subject ${updatedSubject.isActive ? 'activated' : 'deactivated'} successfully`,
          life: 3000
        });

        loadSubjects();
      } else {
        console.error('Error toggling subject status:', response.error);

        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to update subject status',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Unexpected error toggling subject status:', error);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while updating subject status',
        life: 3000
      });
    }
  };

  // Render stream badge
  const streamBodyTemplate = (rowData) => {
    return (
      <span className={`p-badge p-badge-${rowData.stream === 'Science' ? 'info' : rowData.stream === 'Commerce' ? 'warning' : 'success'}`}>
        {rowData.stream}
      </span>
    );
  };

  // Render active status badge
  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`p-badge p-badge-${rowData.isActive ? 'success' : 'danger'}`}>
        {rowData.isActive ? 'Active' : 'Inactive'}
      </span>
    );
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
          icon={rowData.isActive ? 'pi pi-times' : 'pi pi-check'}
          className={`p-button-rounded p-button-outlined ${rowData.isActive ? 'p-button-warning' : 'p-button-success'}`}
          style={{ width: '2.5rem', height: '2.5rem' }}
          onClick={() => toggleActiveStatus(rowData)}
          tooltip={rowData.isActive ? 'Deactivate' : 'Activate'}
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

        <div className="flex gap-2">
          <Dropdown
            value={filters.stream}
            options={[{ label: 'All Streams', value: null }, ...streamOptions]}
            onChange={(e) => onFilterChange('stream', e.value)}
            placeholder="Stream"
            className="p-inputtext-sm"
          />

          <div className="flex gap-1">
            <Button
              icon="pi pi-check"
              className={`p-button-sm ${filters.isActive === true ? 'p-button-success' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', true)}
              tooltip="Active Subjects"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-times"
              className={`p-button-sm ${filters.isActive === false ? 'p-button-danger' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', false)}
              tooltip="Inactive Subjects"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-bars"
              className={`p-button-sm ${filters.isActive === null ? 'p-button-info' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', null)}
              tooltip="All Subjects"
              tooltipOptions={{ position: 'top' }}
            />
          </div>

          <Button
            icon="pi pi-filter-slash"
            className="p-button-outlined p-button-secondary p-button-sm"
            onClick={() => {
              setFilters({
                stream: null,
                isActive: true,
                search: ''
              });
              // Trigger immediate reload with cleared filters
              loadSubjects();
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
        value={subjects}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        onPage={onPage}
        onSort={onSort}
        sortField={lazyParams.sortField}
        sortOrder={lazyParams.sortOrder}
        loading={loading}
        header={renderHeader()}
        emptyMessage="No subjects found"
        className="p-datatable-sm"
        rowHover
        showGridlines
        stripedRows
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="name" header="Subject Name" sortable style={{ minWidth: '200px' }} />
        <Column field="code" header="Code" sortable style={{ minWidth: '120px' }} />
        <Column field="stream" header="Stream" body={streamBodyTemplate} sortable style={{ minWidth: '120px' }} />
        <Column field="description" header="Description" style={{ minWidth: '250px' }} />
        <Column field="isActive" header="Status" body={statusBodyTemplate} sortable style={{ minWidth: '100px' }} />
        <Column body={actionBodyTemplate} header="Actions" style={{ minWidth: '150px', textAlign: 'center' }} />
      </DataTable>
    </div>
  );
};

export default SubjectList;

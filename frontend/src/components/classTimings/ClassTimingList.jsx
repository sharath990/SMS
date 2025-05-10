import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { classTimingService } from '../../services';

const ClassTimingList = ({ token, onEdit, onView, refreshList }) => {
  const [classTimings, setClassTimings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'dayOfWeek',
    sortOrder: 1
  });

  // Filters
  const [filters, setFilters] = useState({
    isActive: true,
    search: ''
  });

  const toast = useRef(null);

  // Load class timings on component mount and when params change or refreshList changes
  useEffect(() => {
    loadClassTimings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyParams, filters, refreshList]);

  const loadClassTimings = async () => {
    try {
      setLoading(true);

      // Prepare filter object for the service
      const filterParams = { ...filters };

      // Convert sortOrder to match API expectations
      const sortOrderValue = lazyParams.sortOrder === 1 ? 1 : -1;

      const response = await classTimingService.getClassTimings(
        token,
        filterParams,
        lazyParams.page,
        lazyParams.rows,
        lazyParams.sortField,
        sortOrderValue
      );

      if (response.success) {
        setClassTimings(response.data.data);
        setTotalRecords(response.data.total);
      } else {
        console.error('Error loading class timings:', response.error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to load class timings',
          life: 3000
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Unexpected error loading class timings:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while loading class timings',
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
  const confirmDelete = (classTiming) => {
    confirmDialog({
      message: `Are you sure you want to delete this class timing?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteClassTiming(classTiming._id)
    });
  };

  // Delete class timing
  const deleteClassTiming = async (id) => {
    try {
      setLoading(true);

      const response = await classTimingService.deleteClassTiming(token, id);

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Class timing deleted successfully',
          life: 3000
        });

        // Reload class timings
        loadClassTimings();
      } else {
        console.error('Error deleting class timing:', response.error);
        setLoading(false);

        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to delete class timing',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Unexpected error deleting class timing:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while deleting class timing',
        life: 3000
      });
    }
  };

  // Toggle class timing active status
  const toggleActiveStatus = async (classTiming) => {
    try {
      const updatedClassTiming = {
        ...classTiming,
        isActive: !classTiming.isActive
      };

      const response = await classTimingService.updateClassTiming(token, classTiming._id, updatedClassTiming);

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: `Class timing ${updatedClassTiming.isActive ? 'activated' : 'deactivated'} successfully`,
          life: 3000
        });

        loadClassTimings();
      } else {
        console.error('Error toggling class timing status:', response.error);

        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to update class timing status',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Unexpected error toggling class timing status:', error);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while updating class timing status',
        life: 3000
      });
    }
  };

  // Render time range
  const timeRangeBodyTemplate = (rowData) => {
    return `${rowData.startTime} - ${rowData.endTime}`;
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
        {onView && (
          <Button
            icon="pi pi-eye"
            className="p-button-rounded p-button-outlined p-button-info"
            style={{ width: '2.5rem', height: '2.5rem' }}
            onClick={() => onView(rowData)}
            tooltip="View"
            tooltipOptions={{ position: 'top' }}
          />
        )}
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
          <div className="flex gap-1">
            <Button
              icon="pi pi-check"
              className={`p-button-sm ${filters.isActive === true ? 'p-button-success' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', true)}
              tooltip="Active Timings"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-times"
              className={`p-button-sm ${filters.isActive === false ? 'p-button-danger' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', false)}
              tooltip="Inactive Timings"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-bars"
              className={`p-button-sm ${filters.isActive === null ? 'p-button-info' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', null)}
              tooltip="All Timings"
              tooltipOptions={{ position: 'top' }}
            />
          </div>

          <Button
            icon="pi pi-filter-slash"
            className="p-button-outlined p-button-secondary p-button-sm"
            onClick={() => {
              setFilters({
                isActive: true,
                search: ''
              });
              // Trigger immediate reload with cleared filters
              loadClassTimings();
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
        value={classTimings}
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
        emptyMessage="No class timings found"
        className="p-datatable-sm"
        rowHover
        showGridlines
        stripedRows
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="name" header="Name" sortable style={{ minWidth: '200px' }} />
        <Column field="period" header="Period" sortable style={{ minWidth: '80px' }} />
        <Column field="timeRange" header="Time" body={timeRangeBodyTemplate} sortable style={{ minWidth: '150px' }} />
        <Column field="description" header="Description" sortable style={{ minWidth: '250px' }} />
        <Column field="isActive" header="Status" body={statusBodyTemplate} sortable style={{ minWidth: '100px' }} />
        <Column body={actionBodyTemplate} header="Actions" style={{ minWidth: '150px', textAlign: 'center' }} />
      </DataTable>
    </div>
  );
};

export default ClassTimingList;

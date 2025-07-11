import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { classService, batchService } from '../../services';

const ClassList = ({ token, onEdit, refreshList }) => {
  const [classes, setClasses] = useState([]);
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
    stream: null,
    level: null,
    section: null,
    academicYear: null,
    isActive: null,
    search: ''
  });

  // Academic year options
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  // Options for dropdowns
  const streamOptions = [
    { label: 'Science', value: 'Science' },
    { label: 'Commerce', value: 'Commerce' }
  ];

  const levelOptions = [
    { label: '1st PUC', value: '1st PUC' },
    { label: '2nd PUC', value: '2nd PUC' }
  ];

  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  // Fetch batches for academic year dropdown
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await batchService.getBatches(token);

        if (response.success && response.data && response.data.data) {
          // Map batches to dropdown options
          const options = response.data.data.map(batch => ({
            label: `${batch.name} (${batch.year})`,
            value: batch.name
          }));

          setAcademicYearOptions(options);
        }
      } catch (error) {
        console.error('Error fetching batches for academic year dropdown:', error);
      }
    };

    fetchBatches();
  }, [token]);

  const toast = useRef(null);

  // Load classes on component mount and when params change or refreshList changes
  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyParams, filters, refreshList]);

  const loadClasses = async () => {
    try {
      setLoading(true);

      // Prepare filter object for the service
      const filterParams = { ...filters };

      // Convert sortOrder to match API expectations
      const sortOrderValue = lazyParams.sortOrder === 1 ? 1 : -1;

      const response = await classService.getClasses(
        token,
        filterParams,
        lazyParams.page,
        lazyParams.rows,
        lazyParams.sortField,
        sortOrderValue
      );

      if (response.success) {
        setClasses(response.data.data);
        setTotalRecords(response.data.total);
      } else {
        console.error('Error loading classes:', response.error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to load classes',
          life: 3000
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Unexpected error loading classes:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while loading classes',
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
  const confirmDelete = (classItem) => {
    confirmDialog({
      message: `Are you sure you want to delete ${classItem.name}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteClass(classItem._id)
    });
  };

  // Delete class
  const deleteClass = async (id) => {
    try {
      setLoading(true);

      const response = await classService.deleteClass(token, id);

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Class deleted successfully',
          life: 3000
        });

        // Reload classes
        loadClasses();
      } else {
        console.error('Error deleting class:', response.error);
        setLoading(false);

        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to delete class',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Unexpected error deleting class:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while deleting class',
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
      <span className={`p-tag p-tag-${rowData.isActive ? 'success' : 'danger'}`}>
        {rowData.isActive ? 'Active' : 'Inactive'}
      </span>
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

        <div className="flex align-items-center gap-2">
          <Dropdown
            value={filters.stream}
            options={streamOptions}
            onChange={(e) => onFilterChange('stream', e.value)}
            placeholder="Stream"
            style={{ width: '140px' }}
          />

          <Dropdown
            value={filters.level}
            options={levelOptions}
            onChange={(e) => onFilterChange('level', e.value)}
            placeholder="Level"
            style={{ width: '140px' }}
          />

          <InputText
            value={filters.section}
            onChange={(e) => onFilterChange('section', e.target.value)}
            placeholder="Section"
            style={{ width: '90px' }}
          />

          <Dropdown
            value={filters.academicYear}
            options={academicYearOptions}
            onChange={(e) => onFilterChange('academicYear', e.value)}
            placeholder="Academic Year"
            style={{ width: '180px' }}
            filter
            filterBy="label"
          />

          <Dropdown
            value={filters.isActive}
            options={statusOptions}
            onChange={(e) => onFilterChange('isActive', e.value)}
            placeholder="Status"
            style={{ width: '120px' }}
          />

          <div className="flex gap-1">
            <Button
              icon="pi pi-check-circle"
              className={`p-button-rounded p-button-sm ${filters.isActive === true ? 'p-button-success' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', true)}
              tooltip="Active Classes"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-times-circle"
              className={`p-button-rounded p-button-sm ${filters.isActive === false ? 'p-button-danger' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', false)}
              tooltip="Inactive Classes"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-users"
              className={`p-button-rounded p-button-sm ${filters.isActive === null ? 'p-button-info' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', null)}
              tooltip="All Classes"
              tooltipOptions={{ position: 'top' }}
            />
          </div>

          <Button
            icon="pi pi-filter-slash"
            className="p-button-outlined p-button-secondary p-button-sm"
            onClick={() => {
              setFilters({
                stream: null,
                level: null,
                section: null,
                academicYear: null,
                isActive: null,
                search: ''
              });
              // Trigger immediate reload with cleared filters
              loadClasses();
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

      <DataTable
        value={classes}
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
        emptyMessage="No classes found"
        className="p-datatable-sm"
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="name" header="Class Name" sortable />
        <Column field="stream" header="Stream" sortable />
        <Column field="level" header="Level" sortable />
        <Column field="section" header="Section" sortable />
        <Column field="academicYear" header="Academic Year" sortable />
        <Column field="isActive" header="Status" body={statusBodyTemplate} sortable />
        <Column body={actionBodyTemplate} header="Actions" style={{ width: '10rem' }} />
      </DataTable>
    </div>
  );
};

export default ClassList;

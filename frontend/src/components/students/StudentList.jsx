import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { studentService } from '../../services';

const StudentList = ({ token, onEdit, onView, headerTemplate, refreshList }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'rollNumber',
    sortOrder: 1
  });

  // Filters
  const [filters, setFilters] = useState({
    stream: null,
    class: null,
    section: null,
    batch: null,
    isActive: null, // Changed from true to null to show all students (active and inactive)
    search: ''
  });

  // Options for dropdowns
  const streamOptions = [
    { label: 'Science', value: 'Science' },
    { label: 'Commerce', value: 'Commerce' }
  ];

  const classOptions = [
    { label: '1st PUC', value: '1st PUC' },
    { label: '2nd PUC', value: '2nd PUC' }
  ];

  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  const toast = useRef(null);

  // Load students on component mount and when params change or refreshList changes
  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyParams, filters, refreshList]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      // Prepare filter object for the service
      const filterParams = {
        ...filters
      };

      // Convert sortOrder to match API expectations
      const sortOrderValue = lazyParams.sortOrder === 1 ? 1 : -1;

      const response = await studentService.getStudents(
        token,
        filterParams,
        lazyParams.page,
        lazyParams.rows,
        lazyParams.sortField,
        sortOrderValue
      );

      if (response.success) {
        setStudents(response.data.data);
        setTotalRecords(response.data.total);
      } else {
        console.error('Error loading students:', response.error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to load students',
          life: 3000
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Unexpected error loading students:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while loading students',
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
  const confirmDelete = (student) => {
    confirmDialog({
      message: `Are you sure you want to delete ${student.firstName} ${student.lastName}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteStudent(student._id)
    });
  };

  // Delete student
  const deleteStudent = async (id) => {
    try {
      setLoading(true);

      const response = await studentService.deleteStudent(token, id);

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Student deleted successfully',
          life: 3000
        });

        // Reload students
        loadStudents();
      } else {
        console.error('Error deleting student:', response.error);
        setLoading(false);

        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: response.error.message || 'Failed to delete student',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Unexpected error deleting student:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred while deleting student',
        life: 3000
      });
    }
  };

  // Action buttons template
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2 justify-content-center">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-outlined p-button-info"
          style={{ width: '2.5rem', height: '2.5rem' }}
          onClick={() => onView(rowData)}
          tooltip="View Details"
          tooltipOptions={{ position: 'top' }}
        />
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
            value={filters.class}
            options={classOptions}
            onChange={(e) => onFilterChange('class', e.value)}
            placeholder="Class"
            style={{ width: '140px' }}
          />

          <InputText
            value={filters.section}
            onChange={(e) => onFilterChange('section', e.target.value)}
            placeholder="Section"
            style={{ width: '90px' }}
          />

          <InputText
            value={filters.batch}
            onChange={(e) => onFilterChange('batch', e.target.value)}
            placeholder="Batch"
            keyfilter="pint"
            style={{ width: '90px' }}
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
              tooltip="Active Students"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-times-circle"
              className={`p-button-rounded p-button-sm ${filters.isActive === false ? 'p-button-danger' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', false)}
              tooltip="Inactive Students"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-users"
              className={`p-button-rounded p-button-sm ${filters.isActive === null ? 'p-button-info' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => onFilterChange('isActive', null)}
              tooltip="All Students"
              tooltipOptions={{ position: 'top' }}
            />
          </div>

          <Button
            icon="pi pi-filter-slash"
            className="p-button-outlined p-button-secondary p-button-sm"
            onClick={() => {
              setFilters({
                stream: null,
                class: null,
                section: null,
                batch: null,
                isActive: null, // Show all students (active and inactive)
                search: ''
              });
              // Trigger immediate reload with cleared filters
              loadStudents();
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
        value={students}
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
        header={headerTemplate || renderHeader()}
        emptyMessage="No students found"
        className="p-datatable-sm"
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="rollNumber" header="Roll No" sortable />
        <Column field="firstName" header="First Name" sortable />
        <Column field="lastName" header="Last Name" sortable />
        <Column field="stream" header="Stream" sortable />
        <Column field="class" header="Class" sortable />
        <Column field="section" header="Section" sortable />
        <Column field="batch" header="Batch" sortable />
        <Column field="parentMobile" header="Parent Mobile" />
        <Column field="isActive" header="Status" body={statusBodyTemplate} sortable />
        <Column body={actionBodyTemplate} header="Actions" style={{ width: '10rem' }} />
      </DataTable>
    </div>
  );
};

export default StudentList;

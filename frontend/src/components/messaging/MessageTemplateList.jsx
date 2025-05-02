import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import axios from 'axios';

const MessageTemplateList = ({ token, onEdit, refreshList }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'createdAt',
    sortOrder: -1
  });

  // Filters
  const [filters, setFilters] = useState({
    type: null,
    category: null,
    isActive: null,
    search: ''
  });

  // Options for dropdowns
  const typeOptions = [
    { label: 'All Types', value: null },
    { label: 'SMS', value: 'SMS' },
    { label: 'WhatsApp', value: 'WhatsApp' },
    { label: 'Both', value: 'Both' }
  ];

  const categoryOptions = [
    { label: 'All Categories', value: null },
    { label: 'Absence', value: 'Absence' },
    { label: 'Announcement', value: 'Announcement' },
    { label: 'Event', value: 'Event' },
    { label: 'Exam', value: 'Exam' },
    { label: 'Fee', value: 'Fee' },
    { label: 'Other', value: 'Other' }
  ];

  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  const toast = useRef(null);

  // Load templates on component mount and when params change or refreshList changes
  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyParams, filters, refreshList]);

  const loadTemplates = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', lazyParams.page);
      params.append('limit', lazyParams.rows);
      params.append('sortField', lazyParams.sortField);
      params.append('sortOrder', lazyParams.sortOrder === 1 ? 'asc' : 'desc');

      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.isActive !== null) params.append('isActive', filters.isActive.toString());
      if (filters.search) params.append('search', filters.search);

      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      const response = await axios.get(`http://localhost:5000/api/message-templates?${params.toString()}`, config);

      setTemplates(response.data.data);
      setTotalRecords(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error loading templates:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load message templates',
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
  const confirmDelete = (template) => {
    confirmDialog({
      message: `Are you sure you want to delete the template "${template.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteTemplate(template._id)
    });
  };

  // Delete template
  const deleteTemplate = async (id) => {
    try {
      setLoading(true);

      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      await axios.delete(`http://localhost:5000/api/message-templates/${id}`, config);

      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Message template deleted successfully',
        life: 3000
      });

      // Reload templates
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      setLoading(false);

      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to delete template',
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

  // Type template
  const typeBodyTemplate = (rowData) => {
    let severity;
    switch (rowData.type) {
      case 'SMS':
        severity = 'info';
        break;
      case 'WhatsApp':
        severity = 'success';
        break;
      case 'Both':
        severity = 'warning';
        break;
      default:
        severity = 'info';
    }
    return <Tag value={rowData.type} severity={severity} />;
  };

  // Category template
  const categoryBodyTemplate = (rowData) => {
    let severity;
    switch (rowData.category) {
      case 'Absence':
        severity = 'danger';
        break;
      case 'Announcement':
        severity = 'info';
        break;
      case 'Event':
        severity = 'success';
        break;
      case 'Exam':
        severity = 'warning';
        break;
      case 'Fee':
        severity = 'help';
        break;
      default:
        severity = 'secondary';
    }
    return <Tag value={rowData.category} severity={severity} />;
  };

  // Status template
  const statusBodyTemplate = (rowData) => {
    return (
      <Tag 
        value={rowData.isActive ? 'Active' : 'Inactive'} 
        severity={rowData.isActive ? 'success' : 'danger'} 
      />
    );
  };

  // Content template with truncation
  const contentBodyTemplate = (rowData) => {
    const maxLength = 50;
    const content = rowData.content;
    
    if (content.length <= maxLength) {
      return content;
    }
    
    return (
      <div className="flex flex-column">
        <span>{content.substring(0, maxLength)}...</span>
        <Button
          label="View Full"
          className="p-button-text p-button-sm p-0 mt-1"
          onClick={(e) => {
            e.stopPropagation();
            toast.current.show({
              severity: 'info',
              summary: 'Template Content',
              detail: content,
              life: 5000,
              sticky: true
            });
          }}
        />
      </div>
    );
  };

  // Created by template
  const createdByBodyTemplate = (rowData) => {
    if (!rowData.createdBy) return 'N/A';
    return `${rowData.createdBy.firstName} ${rowData.createdBy.lastName}`;
  };

  // Date template
  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.createdAt).toLocaleDateString();
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
            placeholder="Search templates"
            style={{ width: '100%' }}
          />
        </div>

        <div className="flex align-items-center gap-2">
          <Dropdown
            value={filters.type}
            options={typeOptions}
            onChange={(e) => onFilterChange('type', e.value)}
            placeholder="Message Type"
            style={{ width: '140px' }}
          />

          <Dropdown
            value={filters.category}
            options={categoryOptions}
            onChange={(e) => onFilterChange('category', e.value)}
            placeholder="Category"
            style={{ width: '140px' }}
          />

          <Dropdown
            value={filters.isActive}
            options={statusOptions}
            onChange={(e) => onFilterChange('isActive', e.value)}
            placeholder="Status"
            style={{ width: '120px' }}
          />

          <Button
            icon="pi pi-filter-slash"
            className="p-button-outlined p-button-secondary p-button-sm"
            onClick={() => {
              setFilters({
                type: null,
                category: null,
                isActive: null,
                search: ''
              });
              // Trigger immediate reload with cleared filters
              loadTemplates();
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
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog />

      <DataTable
        value={templates}
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
        emptyMessage="No message templates found"
        className="p-datatable-sm"
        tableStyle={{ minWidth: '50rem' }}
        rowHover
      >
        <Column field="name" header="Template Name" sortable />
        <Column field="type" header="Type" body={typeBodyTemplate} sortable />
        <Column field="category" header="Category" body={categoryBodyTemplate} sortable />
        <Column field="content" header="Content" body={contentBodyTemplate} />
        <Column field="isActive" header="Status" body={statusBodyTemplate} sortable />
        <Column field="createdBy" header="Created By" body={createdByBodyTemplate} sortable />
        <Column field="createdAt" header="Created" body={dateBodyTemplate} sortable />
        <Column body={actionBodyTemplate} header="Actions" style={{ width: '10rem' }} />
      </DataTable>
    </div>
  );
};

export default MessageTemplateList;

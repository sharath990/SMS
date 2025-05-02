import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import axios from 'axios';

const RecipientSelection = ({ messageData, updateMessageData, token, onNext, onPrevious }) => {
  const [targetType, setTargetType] = useState(messageData.targetType || 'College');
  const [targetDetails, setTargetDetails] = useState(messageData.targetDetails || {});
  const [errors, setErrors] = useState({});

  const [streams, setStreams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);

  // For multiple selections
  const [selectedStreams, setSelectedStreams] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    stream: null,
    class: null,
    section: null,
    batch: null
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchStreams();
    fetchBatches();

    // Set selected students if they exist in messageData
    if (messageData.recipientIds && messageData.recipientIds.length > 0) {
      fetchSelectedStudents(messageData.recipientIds);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch streams
  const fetchStreams = async () => {
    try {
      // In a real implementation, you would have an API endpoint for this
      // For now, we'll use hardcoded values
      setStreams([
        { label: 'Science', value: 'Science' },
        { label: 'Commerce', value: 'Commerce' }
      ]);
    } catch (error) {
      console.error('Error fetching streams:', error);
    }
  };

  // Fetch classes based on selected stream
  const fetchClasses = async (stream) => {
    try {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      const response = await axios.get(`http://localhost:5000/api/classes?stream=${stream}&isActive=true`, config);

      // Extract unique class names
      const uniqueClasses = [...new Set(response.data.data.map(c => c.level))];
      setClasses(uniqueClasses.map(c => ({ label: c, value: c })));
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // Fetch sections based on selected stream and class
  const fetchSections = async (stream, className) => {
    try {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      const response = await axios.get(`http://localhost:5000/api/classes?stream=${stream}&level=${className}&isActive=true`, config);

      // Extract unique section names
      const uniqueSections = [...new Set(response.data.data.map(c => c.section))];
      setSections(uniqueSections.map(s => ({ label: s, value: s })));
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  // Fetch batches
  const fetchBatches = async () => {
    try {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      const response = await axios.get('http://localhost:5000/api/batches?isGraduated=false', config);
      setBatches(response.data.data.map(batch => ({
        label: `${batch.name} (${batch.year})`,
        value: batch.name
      })));
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  // Fetch students based on filters
  const fetchStudents = async () => {
    try {
      setLoading(true);

      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      // Build query parameters
      const params = new URLSearchParams();
      params.append('isActive', 'true');

      if (filters.search) params.append('search', filters.search);
      if (filters.stream) params.append('stream', filters.stream);
      if (filters.class) params.append('class', filters.class);
      if (filters.section) params.append('section', filters.section);
      if (filters.batch) params.append('batch', filters.batch);

      const response = await axios.get(`http://localhost:5000/api/students?${params.toString()}`, config);
      setStudents(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  // Fetch selected students by IDs
  const fetchSelectedStudents = async (ids) => {
    try {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      // In a real implementation, you would have an API endpoint for this
      // For now, we'll fetch all students and filter them
      const response = await axios.get('http://localhost:5000/api/students', config);
      const allStudents = response.data.data;

      const selected = allStudents.filter(student => ids.includes(student._id));
      setSelectedStudents(selected);
    } catch (error) {
      console.error('Error fetching selected students:', error);
    }
  };

  // Handle target type selection
  const handleTargetTypeSelect = (type) => {
    setTargetType(type);
    setTargetDetails({});

    // Reset multiple selections when changing target type
    setSelectedStreams([]);
    setSelectedClasses([]);
    setSelectedSections([]);
    setSelectedBatches([]);

    setErrors({});

    // If selecting a multiple option, fetch the appropriate data
    if (type === 'MultipleStreams') {
      fetchStreams();
    } else if (type === 'MultipleBatches') {
      fetchBatches();
    }
  };

  // Handle target detail change
  const handleTargetDetailChange = (field, value) => {
    setTargetDetails({
      ...targetDetails,
      [field]: value
    });

    // Clear errors
    setErrors({
      ...errors,
      [field]: null
    });

    // Fetch dependent data
    if (field === 'stream') {
      fetchClasses(value);
      setTargetDetails(prev => ({
        ...prev,
        class: null,
        section: null
      }));
    } else if (field === 'class') {
      fetchSections(targetDetails.stream, value);
      setTargetDetails(prev => ({
        ...prev,
        section: null
      }));
    }
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });

    // Fetch dependent data
    if (field === 'stream') {
      fetchClasses(value);
      setFilters(prev => ({
        ...prev,
        class: null,
        section: null
      }));
    } else if (field === 'class') {
      fetchSections(filters.stream, value);
      setFilters(prev => ({
        ...prev,
        section: null
      }));
    }
  };

  // Handle search button click
  const handleSearch = () => {
    setSearchPerformed(true);
    fetchStudents();
  };

  // Handle multiple selection changes
  const handleMultipleSelectionChange = (field, value) => {
    switch (field) {
      case 'streams':
        setSelectedStreams(value);
        setTargetDetails({
          ...targetDetails,
          streams: value
        });
        break;
      case 'classes':
        setSelectedClasses(value);
        setTargetDetails({
          ...targetDetails,
          classes: value
        });
        break;
      case 'sections':
        setSelectedSections(value);
        setTargetDetails({
          ...targetDetails,
          sections: value
        });
        break;
      case 'batches':
        setSelectedBatches(value);
        setTargetDetails({
          ...targetDetails,
          batches: value
        });
        break;
      default:
        break;
    }
  };

  // Handle next button click
  const handleNext = () => {
    const newErrors = {};

    if (!targetType) {
      newErrors.targetType = 'Please select a target type';
    }

    // Validate single selections
    if (targetType === 'Stream' && !targetDetails.stream) {
      newErrors.stream = 'Please select a stream';
    }

    if (targetType === 'Class') {
      if (!targetDetails.stream) newErrors.stream = 'Please select a stream';
      if (!targetDetails.class) newErrors.class = 'Please select a class';
    }

    if (targetType === 'Section') {
      if (!targetDetails.stream) newErrors.stream = 'Please select a stream';
      if (!targetDetails.class) newErrors.class = 'Please select a class';
      if (!targetDetails.section) newErrors.section = 'Please select a section';
    }

    if (targetType === 'Batch' && !targetDetails.batch) {
      newErrors.batch = 'Please select a batch';
    }

    // Validate multiple selections
    if (targetType === 'MultipleStreams' && (!targetDetails.streams || targetDetails.streams.length === 0)) {
      newErrors.streams = 'Please select at least one stream';
    }

    if (targetType === 'MultipleClasses') {
      if (!targetDetails.stream) newErrors.stream = 'Please select a stream';
      if (!targetDetails.classes || targetDetails.classes.length === 0) newErrors.classes = 'Please select at least one class';
    }

    if (targetType === 'MultipleSections') {
      if (!targetDetails.stream) newErrors.stream = 'Please select a stream';
      if (!targetDetails.class) newErrors.class = 'Please select a class';
      if (!targetDetails.sections || targetDetails.sections.length === 0) newErrors.sections = 'Please select at least one section';
    }

    if (targetType === 'MultipleBatches' && (!targetDetails.batches || targetDetails.batches.length === 0)) {
      newErrors.batches = 'Please select at least one batch';
    }

    if (targetType === 'Individual' && selectedStudents.length === 0) {
      newErrors.students = 'Please select at least one student';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateMessageData({
        targetType,
        targetDetails,
        recipientIds: targetType === 'Individual' ? selectedStudents.map(s => s._id) : []
      });
      onNext();
    }
  };

  // Render target selection based on target type
  const renderTargetSelection = () => {
    switch (targetType) {
      case 'College':
        return (
          <div className="p-message p-message-info mt-3">
            <div className="p-message-wrapper">
              <span className="p-message-icon pi pi-info-circle"></span>
              <span className="p-message-text">Message will be sent to all active students in the college.</span>
            </div>
          </div>
        );

      case 'Stream':
        return (
          <div className="field mt-3">
            <label htmlFor="stream" className={classNames({ 'p-error': errors.stream })}>
              Stream <span className="text-danger">*</span>
            </label>
            <Dropdown
              id="stream"
              value={targetDetails.stream}
              options={streams}
              onChange={(e) => handleTargetDetailChange('stream', e.value)}
              placeholder="Select Stream"
              className={classNames('w-full', { 'p-invalid': errors.stream })}
            />
            {errors.stream && <small className="p-error">{errors.stream}</small>}
          </div>
        );

      case 'MultipleStreams':
        return (
          <div className="field mt-3">
            <label htmlFor="streams" className={classNames({ 'p-error': errors.streams })}>
              Select Streams <span className="text-danger">*</span>
            </label>
            <MultiSelect
              id="streams"
              value={selectedStreams}
              options={streams}
              onChange={(e) => handleMultipleSelectionChange('streams', e.value)}
              placeholder="Select Multiple Streams"
              className={classNames('w-full', { 'p-invalid': errors.streams })}
              display="chip"
              filter
            />
            {errors.streams && <small className="p-error">{errors.streams}</small>}

            {selectedStreams.length > 0 && (
              <div className="selection-summary">
                <i className="pi pi-check-circle"></i>
                <span>Selected {selectedStreams.length} stream{selectedStreams.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        );

      case 'Class':
        return (
          <div className="grid mt-3">
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="stream" className={classNames({ 'p-error': errors.stream })}>
                  Stream <span className="text-danger">*</span>
                </label>
                <Dropdown
                  id="stream"
                  value={targetDetails.stream}
                  options={streams}
                  onChange={(e) => handleTargetDetailChange('stream', e.value)}
                  placeholder="Select Stream"
                  className={classNames('w-full', { 'p-invalid': errors.stream })}
                />
                {errors.stream && <small className="p-error">{errors.stream}</small>}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="class" className={classNames({ 'p-error': errors.class })}>
                  Class <span className="text-danger">*</span>
                </label>
                <Dropdown
                  id="class"
                  value={targetDetails.class}
                  options={classes}
                  onChange={(e) => handleTargetDetailChange('class', e.value)}
                  placeholder="Select Class"
                  className={classNames('w-full', { 'p-invalid': errors.class })}
                  disabled={!targetDetails.stream}
                />
                {errors.class && <small className="p-error">{errors.class}</small>}
              </div>
            </div>
          </div>
        );

      case 'MultipleClasses':
        return (
          <div className="grid mt-3">
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="stream" className={classNames({ 'p-error': errors.stream })}>
                  Stream <span className="text-danger">*</span>
                </label>
                <Dropdown
                  id="stream"
                  value={targetDetails.stream}
                  options={streams}
                  onChange={(e) => {
                    handleTargetDetailChange('stream', e.value);
                    setSelectedClasses([]);
                    fetchClasses(e.value);
                  }}
                  placeholder="Select Stream"
                  className={classNames('w-full', { 'p-invalid': errors.stream })}
                />
                {errors.stream && <small className="p-error">{errors.stream}</small>}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="classes" className={classNames({ 'p-error': errors.classes })}>
                  Classes <span className="text-danger">*</span>
                </label>
                <MultiSelect
                  id="classes"
                  value={selectedClasses}
                  options={classes}
                  onChange={(e) => handleMultipleSelectionChange('classes', e.value)}
                  placeholder="Select Multiple Classes"
                  className={classNames('w-full', { 'p-invalid': errors.classes })}
                  disabled={!targetDetails.stream}
                  display="chip"
                />
                {errors.classes && <small className="p-error">{errors.classes}</small>}
              </div>
            </div>

            {selectedClasses.length > 0 && (
              <div className="col-12">
                <div className="selection-summary">
                  <i className="pi pi-check-circle"></i>
                  <span>Selected {selectedClasses.length} class{selectedClasses.length > 1 ? 'es' : ''}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'Section':
        return (
          <div className="grid mt-3">
            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="stream" className={classNames({ 'p-error': errors.stream })}>
                  Stream <span className="text-danger">*</span>
                </label>
                <Dropdown
                  id="stream"
                  value={targetDetails.stream}
                  options={streams}
                  onChange={(e) => handleTargetDetailChange('stream', e.value)}
                  placeholder="Select Stream"
                  className={classNames('w-full', { 'p-invalid': errors.stream })}
                />
                {errors.stream && <small className="p-error">{errors.stream}</small>}
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="class" className={classNames({ 'p-error': errors.class })}>
                  Class <span className="text-danger">*</span>
                </label>
                <Dropdown
                  id="class"
                  value={targetDetails.class}
                  options={classes}
                  onChange={(e) => handleTargetDetailChange('class', e.value)}
                  placeholder="Select Class"
                  className={classNames('w-full', { 'p-invalid': errors.class })}
                  disabled={!targetDetails.stream}
                />
                {errors.class && <small className="p-error">{errors.class}</small>}
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="section" className={classNames({ 'p-error': errors.section })}>
                  Section <span className="text-danger">*</span>
                </label>
                <Dropdown
                  id="section"
                  value={targetDetails.section}
                  options={sections}
                  onChange={(e) => handleTargetDetailChange('section', e.value)}
                  placeholder="Select Section"
                  className={classNames('w-full', { 'p-invalid': errors.section })}
                  disabled={!targetDetails.class}
                />
                {errors.section && <small className="p-error">{errors.section}</small>}
              </div>
            </div>
          </div>
        );

      case 'MultipleSections':
        return (
          <div className="grid mt-3">
            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="stream" className={classNames({ 'p-error': errors.stream })}>
                  Stream <span className="text-danger">*</span>
                </label>
                <Dropdown
                  id="stream"
                  value={targetDetails.stream}
                  options={streams}
                  onChange={(e) => {
                    handleTargetDetailChange('stream', e.value);
                    setSelectedSections([]);
                  }}
                  placeholder="Select Stream"
                  className={classNames('w-full', { 'p-invalid': errors.stream })}
                />
                {errors.stream && <small className="p-error">{errors.stream}</small>}
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="class" className={classNames({ 'p-error': errors.class })}>
                  Class <span className="text-danger">*</span>
                </label>
                <Dropdown
                  id="class"
                  value={targetDetails.class}
                  options={classes}
                  onChange={(e) => {
                    handleTargetDetailChange('class', e.value);
                    setSelectedSections([]);
                    fetchSections(targetDetails.stream, e.value);
                  }}
                  placeholder="Select Class"
                  className={classNames('w-full', { 'p-invalid': errors.class })}
                  disabled={!targetDetails.stream}
                />
                {errors.class && <small className="p-error">{errors.class}</small>}
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="sections" className={classNames({ 'p-error': errors.sections })}>
                  Sections <span className="text-danger">*</span>
                </label>
                <MultiSelect
                  id="sections"
                  value={selectedSections}
                  options={sections}
                  onChange={(e) => handleMultipleSelectionChange('sections', e.value)}
                  placeholder="Select Multiple Sections"
                  className={classNames('w-full', { 'p-invalid': errors.sections })}
                  disabled={!targetDetails.class}
                  display="chip"
                />
                {errors.sections && <small className="p-error">{errors.sections}</small>}
              </div>
            </div>

            {selectedSections.length > 0 && (
              <div className="col-12">
                <div className="selection-summary">
                  <i className="pi pi-check-circle"></i>
                  <span>Selected {selectedSections.length} section{selectedSections.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'Batch':
        return (
          <div className="field mt-3">
            <label htmlFor="batch" className={classNames({ 'p-error': errors.batch })}>
              Batch <span className="text-danger">*</span>
            </label>
            <Dropdown
              id="batch"
              value={targetDetails.batch}
              options={batches}
              onChange={(e) => handleTargetDetailChange('batch', e.value)}
              placeholder="Select Batch"
              className={classNames('w-full', { 'p-invalid': errors.batch })}
              filter
              filterBy="label"
            />
            {errors.batch && <small className="p-error">{errors.batch}</small>}
          </div>
        );

      case 'MultipleBatches':
        return (
          <div className="field mt-3">
            <label htmlFor="batches" className={classNames({ 'p-error': errors.batches })}>
              Select Batches <span className="text-danger">*</span>
            </label>
            <MultiSelect
              id="batches"
              value={selectedBatches}
              options={batches}
              onChange={(e) => handleMultipleSelectionChange('batches', e.value)}
              placeholder="Select Multiple Batches"
              className={classNames('w-full', { 'p-invalid': errors.batches })}
              filter
              filterBy="label"
              display="chip"
            />
            {errors.batches && <small className="p-error">{errors.batches}</small>}

            {selectedBatches.length > 0 && (
              <div className="selection-summary">
                <i className="pi pi-check-circle"></i>
                <span>Selected {selectedBatches.length} batch{selectedBatches.length > 1 ? 'es' : ''}</span>
              </div>
            )}
          </div>
        );

      case 'Individual':
        return (
          <div className="mt-3">
            <div className="card p-4 mb-4 shadow-1 student-search-container">
              <h4 className="m-0 mb-3 text-lg font-semibold">Search Students</h4>

              <div className="grid">
                <div className="col-12 md:col-4">
                  <div className="p-inputgroup">
                    <span className="p-inputgroup-addon">
                      <i className="pi pi-search"></i>
                    </span>
                    <InputText
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search by name or roll number"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="col-12 md:col-2">
                  <Dropdown
                    value={filters.stream}
                    options={streams}
                    onChange={(e) => handleFilterChange('stream', e.value)}
                    placeholder="Stream"
                    className="w-full"
                  />
                </div>

                <div className="col-12 md:col-2">
                  <Dropdown
                    value={filters.class}
                    options={classes}
                    onChange={(e) => handleFilterChange('class', e.value)}
                    placeholder="Class"
                    className="w-full"
                    disabled={!filters.stream}
                  />
                </div>

                <div className="col-12 md:col-2">
                  <Dropdown
                    value={filters.section}
                    options={sections}
                    onChange={(e) => handleFilterChange('section', e.value)}
                    placeholder="Section"
                    className="w-full"
                    disabled={!filters.class}
                  />
                </div>

                <div className="col-12 md:col-2">
                  <Button
                    label="Search"
                    icon="pi pi-search"
                    onClick={handleSearch}
                    className="p-button-primary p-button-raised w-full"
                    style={{ height: '42px' }}
                    tooltip="Search for students"
                    tooltipOptions={{ position: 'top' }}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {searchPerformed && (
              <div className="mb-3 flex align-items-center">
                <span className="font-medium mr-2">Search Results:</span>
                <span className="p-tag p-tag-info">
                  {loading ? 'Searching...' : `${students.length} student${students.length !== 1 ? 's' : ''} found`}
                </span>
              </div>
            )}

            <DataTable
              value={students}
              selection={selectedStudents}
              onSelectionChange={(e) => setSelectedStudents(e.value)}
              selectionMode="multiple"
              dataKey="_id"
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25]}
              loading={loading}
              emptyMessage={searchPerformed ? "No students found matching your criteria" : "Use the search above to find students"}
              className="p-datatable-sm"
              rowHover
              showGridlines
              stripedRows
              scrollable
              scrollHeight="400px"
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
              <Column field="rollNumber" header="Roll Number" sortable style={{ width: '120px' }} />
              <Column field="firstName" header="First Name" sortable />
              <Column field="lastName" header="Last Name" sortable />
              <Column field="stream" header="Stream" sortable style={{ width: '120px' }} />
              <Column field="class" header="Class" sortable style={{ width: '100px' }} />
              <Column field="section" header="Section" sortable style={{ width: '100px' }} />
              <Column field="parentMobile" header="Mobile" sortable style={{ width: '150px' }} />
            </DataTable>

            {errors.students && <small className="p-error">{errors.students}</small>}

            <div className="selection-summary">
              <i className="pi pi-check-circle"></i>
              <span>Selected {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="recipient-selection">
      <Card className="shadow-2 border-round-xl">
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Select Recipients</h3>

        <div className="grid">
          <div className="col-12 md:col-4">
            <div className="field-radiobutton mb-3">
              <RadioButton
                inputId="college"
                name="targetType"
                value="College"
                onChange={() => handleTargetTypeSelect('College')}
                checked={targetType === 'College'}
              />
              <label htmlFor="college" className="ml-2 font-medium">Entire College</label>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field-radiobutton mb-3">
              <RadioButton
                inputId="stream"
                name="targetType"
                value="Stream"
                onChange={() => handleTargetTypeSelect('Stream')}
                checked={targetType === 'Stream'}
              />
              <label htmlFor="stream" className="ml-2 font-medium">Single Stream</label>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field-radiobutton mb-3">
              <RadioButton
                inputId="multipleStreams"
                name="targetType"
                value="MultipleStreams"
                onChange={() => handleTargetTypeSelect('MultipleStreams')}
                checked={targetType === 'MultipleStreams'}
              />
              <label htmlFor="multipleStreams" className="ml-2 font-medium">Multiple Streams</label>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field-radiobutton mb-3">
              <RadioButton
                inputId="class"
                name="targetType"
                value="Class"
                onChange={() => handleTargetTypeSelect('Class')}
                checked={targetType === 'Class'}
              />
              <label htmlFor="class" className="ml-2 font-medium">Single Class</label>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field-radiobutton mb-3">
              <RadioButton
                inputId="multipleClasses"
                name="targetType"
                value="MultipleClasses"
                onChange={() => handleTargetTypeSelect('MultipleClasses')}
                checked={targetType === 'MultipleClasses'}
              />
              <label htmlFor="multipleClasses" className="ml-2 font-medium">Multiple Classes</label>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field-radiobutton mb-3">
              <RadioButton
                inputId="section"
                name="targetType"
                value="Section"
                onChange={() => handleTargetTypeSelect('Section')}
                checked={targetType === 'Section'}
              />
              <label htmlFor="section" className="ml-2 font-medium">Single Section</label>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field-radiobutton mb-3">
              <RadioButton
                inputId="multipleSections"
                name="targetType"
                value="MultipleSections"
                onChange={() => handleTargetTypeSelect('MultipleSections')}
                checked={targetType === 'MultipleSections'}
              />
              <label htmlFor="multipleSections" className="ml-2 font-medium">Multiple Sections</label>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field-radiobutton mb-3">
              <RadioButton
                inputId="batch"
                name="targetType"
                value="Batch"
                onChange={() => handleTargetTypeSelect('Batch')}
                checked={targetType === 'Batch'}
              />
              <label htmlFor="batch" className="ml-2 font-medium">Single Batch</label>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field-radiobutton mb-3">
              <RadioButton
                inputId="multipleBatches"
                name="targetType"
                value="MultipleBatches"
                onChange={() => handleTargetTypeSelect('MultipleBatches')}
                checked={targetType === 'MultipleBatches'}
              />
              <label htmlFor="multipleBatches" className="ml-2 font-medium">Multiple Batches</label>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="field-radiobutton mb-3">
              <RadioButton
                inputId="individual"
                name="targetType"
                value="Individual"
                onChange={() => handleTargetTypeSelect('Individual')}
                checked={targetType === 'Individual'}
              />
              <label htmlFor="individual" className="ml-2 font-medium">Individual Students</label>
            </div>
          </div>
        </div>

        {errors.targetType && <small className="p-error block mb-3">{errors.targetType}</small>}

        {renderTargetSelection()}
        </div>
      </Card>

      <div className="message-navigation-buttons">
        <Button
          label="Previous"
          icon="pi pi-arrow-left"
          onClick={onPrevious}
          className="p-button-outlined p-button-secondary"
        />

        <Button
          label="Next"
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={handleNext}
          className="p-button-primary p-button-raised"
        />
      </div>
    </div>
  );
};

export default RecipientSelection;

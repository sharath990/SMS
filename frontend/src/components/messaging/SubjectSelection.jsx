import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import { subjectService, classTimingService } from '../../services';

const SubjectSelection = ({ messageData, updateMessageData, token }) => {
  const [subjects, setSubjects] = useState([]);
  const [classTimings, setClassTimings] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(messageData.subjectId || null);
  const [selectedClassTiming, setSelectedClassTiming] = useState(messageData.classTimingId || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch class timings when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchClassTimings();
    } else {
      setClassTimings([]);
      setSelectedClassTiming(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, token]);

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      setLoading(true);

      const filters = { isActive: true };
      const response = await subjectService.getSubjects(token, filters);

      if (response.success) {
        // Format subjects for dropdown
        const formattedSubjects = response.data.data.map(subject => ({
          label: `${subject.name} (${subject.code})`,
          value: subject._id,
          stream: subject.stream
        }));

        setSubjects(formattedSubjects);
      } else {
        console.error('Error fetching subjects:', response.error);
      }

      setLoading(false);
    } catch (error) {
      console.error('Unexpected error fetching subjects:', error);
      setLoading(false);
    }
  };

  // Fetch class timings
  const fetchClassTimings = async () => {
    try {
      setLoading(true);

      // Note: The API no longer filters by subject since we've removed that field
      // Instead, we'll fetch all active class timings
      const filters = { isActive: true };
      const response = await classTimingService.getClassTimings(token, filters);

      if (response.success) {
        // Format class timings for dropdown
        const formattedClassTimings = response.data.data.map(timing => ({
          label: `${timing.name}: Period ${timing.period} (${timing.startTime} - ${timing.endTime})`,
          value: timing._id,
          name: timing.name,
          period: timing.period,
          startTime: timing.startTime,
          endTime: timing.endTime,
          description: timing.description
        }));

        setClassTimings(formattedClassTimings);
      } else {
        console.error('Error fetching class timings:', response.error);
      }

      setLoading(false);
    } catch (error) {
      console.error('Unexpected error fetching class timings:', error);
      setLoading(false);
    }
  };

  // Handle subject selection
  const handleSubjectChange = (e) => {
    setSelectedSubject(e.value);
    setSelectedClassTiming(null);

    // Update message data
    updateMessageData({
      subjectId: e.value,
      classTimingId: null
    });

    // Clear errors
    if (errors.subject) {
      setErrors({
        ...errors,
        subject: null
      });
    }
  };

  // Handle class timing selection
  const handleClassTimingChange = (e) => {
    setSelectedClassTiming(e.value);

    // Update message data
    updateMessageData({
      classTimingId: e.value
    });

    // Clear errors
    if (errors.classTiming) {
      setErrors({
        ...errors,
        classTiming: null
      });
    }
  };

  return (
    <Card className="shadow-2 border-round-xl mb-4">
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-4">Subject & Class Timing (Optional)</h3>

        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="subject" className="font-medium block mb-2">
                Subject
              </label>
              <Dropdown
                id="subject"
                value={selectedSubject}
                options={subjects}
                onChange={handleSubjectChange}
                placeholder="Select a Subject"
                className={classNames('w-full', { 'p-invalid': errors.subject })}
                filter
                filterBy="label"
                loading={loading}
                emptyMessage="No subjects found"
                emptyFilterMessage="No subjects found"
              />
              {errors.subject && <small className="p-error">{errors.subject}</small>}

              {selectedSubject && (
                <div className="mt-2">
                  <Message
                    severity="info"
                    text="This will add subject information to your message"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="classTiming" className="font-medium block mb-2">
                Class Timing
              </label>
              <Dropdown
                id="classTiming"
                value={selectedClassTiming}
                options={classTimings}
                onChange={handleClassTimingChange}
                placeholder={selectedSubject ? "Select a Class Timing" : "Select a Subject first"}
                className={classNames('w-full', { 'p-invalid': errors.classTiming })}
                filter
                filterBy="label"
                loading={loading}
                disabled={!selectedSubject || classTimings.length === 0}
                emptyMessage={selectedSubject ? "No class timings found for this subject" : "Select a subject first"}
                emptyFilterMessage="No class timings found"
              />
              {errors.classTiming && <small className="p-error">{errors.classTiming}</small>}

              {selectedClassTiming && (
                <div className="mt-2">
                  <Message
                    severity="info"
                    text="This will add period and timing information to your message"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {!selectedSubject && !selectedClassTiming && (
          <Message
            severity="info"
            text="Adding subject and class timing information is optional but useful for absence notifications or subject-specific announcements"
            className="w-full mt-3"
          />
        )}
      </div>
    </Card>
  );
};

export default SubjectSelection;

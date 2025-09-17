import { GraduationCap, Plus } from 'lucide-react';
import type { CV, Education } from '../../services/cvs-service';
import { FormattedMessage, useIntl } from 'react-intl';

interface EducationTabProps {
  isEditing: boolean;
  education: Education[];
  setEducation: (edu: Education[]) => void;
  cv: CV | null;
}

export function EducationTab({ isEditing, education, setEducation, cv }: EducationTabProps) {
  const intl = useIntl();

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      location: '',
    };
    setEducation([...education, newEdu]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu)));
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5" />
          <h3 className="font-semibold text-lg"><FormattedMessage id="dashboard.education" defaultMessage="Education" /></h3>
        </div>
        <div className="space-y-6">
          {isEditing ? (
            <>
              {education.map((edu, index) => (
                <div
                  key={edu.id}
                  className="space-y-4 p-4 border rounded-lg transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold"><FormattedMessage id="dashboard.education" defaultMessage="Education" /> {index + 1}</h3>
                    {education.length > 1 && (
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="bg-red-100 text-red-600 px-2 py-1 rounded"
                      >
                        <FormattedMessage id="dashboard.remove" defaultMessage="Remove" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor={`institution-${edu.id}`}><FormattedMessage id="dashboard.institution" defaultMessage="Institution" />*</label>
                      <input
                        id={`institution-${edu.id}`}
                        required
                        value={edu.institution}
                        onChange={e => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder={intl.formatMessage({ id: "dashboard.institution", defaultMessage: "Institution" })}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`degree-${edu.id}`}><FormattedMessage id="dashboard.degree" defaultMessage="Degree" />*</label>
                      <input
                        id={`degree-${edu.id}`}
                        required
                        value={edu.degree}
                        onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder={intl.formatMessage({ id: "dashboard.degree", defaultMessage: "Degree" })}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`field-${edu.id}`}><FormattedMessage id="dashboard.fieldOfStudy" defaultMessage="Field of Study" /></label>
                      <input
                        id={`field-${edu.id}`}
                        value={edu.field}
                        onChange={e => updateEducation(edu.id, 'field', e.target.value)}
                        placeholder={intl.formatMessage({ id: "dashboard.fieldOfStudy", defaultMessage: "Field of Study" })}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`gpa-${edu.id}`}><FormattedMessage id="dashboard.grade" defaultMessage="Grade" /></label>
                      <input
                        id={`gpa-${edu.id}`}
                        type="number"
                        value={edu.gpa}
                        onChange={e => updateEducation(edu.id, 'gpa', e.target.value)}
                        placeholder={intl.formatMessage({ id: "dashboard.grade", defaultMessage: "Grade" })}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`location-${edu.id}`}><FormattedMessage id="dashboard.location" defaultMessage="Location" />*</label>
                      <input
                        id={`location-${edu.id}`}
                        required
                        value={edu.location}
                        onChange={e => updateEducation(edu.id, 'location', e.target.value)}
                        placeholder={intl.formatMessage({ id: "dashboard.location.placeholder.work", defaultMessage: "City, State/Country" })}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`startDate-${edu.id}`}><FormattedMessage id="dashboard.startDate" defaultMessage="Start Date" />*</label>
                      <input
                        id={`startDate-${edu.id}`}
                        required
                        type="date"
                        value={edu.startDate}
                        onChange={e => updateEducation(edu.id, 'startDate', e.target.value)}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`endDate-${edu.id}`}><FormattedMessage id="dashboard.endDate" defaultMessage="End Date" /></label>
                      <input
                        id={`endDate-${edu.id}`}
                        type="date"
                        value={edu.endDate}
                        onChange={e => updateEducation(edu.id, 'endDate', e.target.value)}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addEducation}
                className="bg-green-100 text-green-600 px-4 py-2 rounded btn-custom"
              >
                <Plus className="h-4 w-4 mr-2 inline-block" />
                <FormattedMessage id="dashboard.addEducation" defaultMessage="Add Education" />
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {cv?.education.length === 0 ? (
                <p className="text-muted-foreground text-center py-8"><FormattedMessage id="dashboard.noEducation" defaultMessage="No education added yet" /></p>
              ) : (
                cv?.education.map((edu: Education) => (
                  <div key={edu.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                        </h3>
                        <p className="text-muted-foreground">{edu.institution}</p>
                        {edu.location && (
                          <p className="text-sm text-muted-foreground">{edu.location}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="bg-gray-100 px-2 py-1 rounded">
                          {edu.startDate} - {edu.endDate || <FormattedMessage id="dashboard.present" defaultMessage="Present" />}
                        </div>
                        {edu.gpa && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <FormattedMessage id="dashboard.grade" defaultMessage="Grade" />: {edu.gpa}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

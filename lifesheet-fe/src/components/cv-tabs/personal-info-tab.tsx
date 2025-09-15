import { GraduationCap } from 'lucide-react';
import type { CV, PersonalInfo } from '../../services/cvs-service';
import { FormattedMessage, useIntl } from 'react-intl';

interface PersonalInfoTabProps {
  isEditing: boolean;
  personalInfo: PersonalInfo;
  setPersonalInfo: (info: PersonalInfo) => void;
  cv: CV | null;
}

export function PersonalInfoTab({
  isEditing,
  personalInfo,
  setPersonalInfo,
  cv,
}: PersonalInfoTabProps) {
  const intl = useIntl();

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5" />
          <h3 className="font-semibold text-lg">
            <FormattedMessage id="dashboard.personalInformation" defaultMessage="Personal Information" />
          </h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="fullName">
                <FormattedMessage id="dashboard.fullName" defaultMessage="Full Name" />*
              </label>
              {isEditing ? (
                <input
                  id="fullName"
                  required
                  value={personalInfo.fullName}
                  onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  placeholder={intl.formatMessage({ id: "dashboard.fullName.placeholder", defaultMessage: "John Doe" })}
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {cv?.personal_info?.fullName || intl.formatMessage({ id: "dashboard.notProvided", defaultMessage: "Not provided" })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="title">
                <FormattedMessage id="dashboard.title" defaultMessage="Title" />
              </label>
              {isEditing ? (
                <input
                  id="title"
                  value={personalInfo.title || ''}
                  onChange={e => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                  placeholder={intl.formatMessage({ id: "dashboard.title.placeholder", defaultMessage: "Software Engineer" })}
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {cv?.personal_info?.title || intl.formatMessage({ id: "dashboard.notProvided", defaultMessage: "Not provided" })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="email">
                <FormattedMessage id="dashboard.email" defaultMessage="Email" />*
              </label>
              {isEditing ? (
                <input
                  id="email"
                  type="email"
                  required
                  value={personalInfo.email}
                  onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  placeholder={intl.formatMessage({ id: "dashboard.email.placeholder", defaultMessage: "john@example.com" })}
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {cv?.personal_info?.email || intl.formatMessage({ id: "dashboard.notProvided", defaultMessage: "Not provided" })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="phone">
                <FormattedMessage id="dashboard.phone" defaultMessage="Phone" />
              </label>
              {isEditing ? (
                <input
                  id="phone"
                  value={personalInfo.phone || ''}
                  onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  placeholder={intl.formatMessage({ id: "dashboard.phone.placeholder", defaultMessage: "+1 (555) 123-4567" })}
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {cv?.personal_info?.phone || intl.formatMessage({ id: "dashboard.notProvided", defaultMessage: "Not provided" })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="location">
                <FormattedMessage id="dashboard.location" defaultMessage="Location" />
              </label>
              {isEditing ? (
                <input
                  id="location"
                  value={personalInfo.location || ''}
                  onChange={e => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  placeholder={intl.formatMessage({ id: "dashboard.location.placeholder", defaultMessage: "New York, NY" })}
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {cv?.personal_info?.location || intl.formatMessage({ id: "dashboard.notProvided", defaultMessage: "Not provided" })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="linkedIn">
                <FormattedMessage id="dashboard.linkedin" defaultMessage="LinkedIn" />
              </label>
              {isEditing ? (
                <input
                  id="linkedIn"
                  value={personalInfo.linkedIn || ''}
                  onChange={e => setPersonalInfo({ ...personalInfo, linkedIn: e.target.value })}
                  placeholder={intl.formatMessage({ id: "dashboard.linkedin.placeholder", defaultMessage: "linkedin.com/in/johndoe" })}
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {cv?.personal_info?.linkedIn || intl.formatMessage({ id: "dashboard.notProvided", defaultMessage: "Not provided" })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="website">
                <FormattedMessage id="dashboard.website" defaultMessage="Website" />
                (<FormattedMessage id="dashboard.optional" defaultMessage="optional" />)
              </label>
              {isEditing ? (
                <input
                  id="website"
                  value={personalInfo.website || ''}
                  onChange={e => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                  placeholder={intl.formatMessage({ id: "dashboard.website.placeholder", defaultMessage: "www.johndoe.com" })}
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {cv?.personal_info?.website || intl.formatMessage({ id: "dashboard.notProvided", defaultMessage: "Not provided" })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="github">
                <FormattedMessage id="dashboard.github" defaultMessage="GitHub" />
                (<FormattedMessage id="dashboard.optional" defaultMessage="optional" />)
              </label>
              {isEditing ? (
                <input
                  id="github"
                  value={personalInfo.github || ''}
                  onChange={e => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                  placeholder={intl.formatMessage({ id: "dashboard.github.placeholder", defaultMessage: "github.com/johndoe" })}
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {cv?.personal_info?.github || intl.formatMessage({ id: "dashboard.notProvided", defaultMessage: "Not provided" })}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="summary">
              <FormattedMessage id="dashboard.professionalSummary" defaultMessage="Professional Summary" />
            </label>
            <br />
            {isEditing ? (
              <textarea
                id="summary"
                value={personalInfo.summary}
                onChange={e => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                placeholder={intl.formatMessage({ id: "dashboard.professionalSummary.placeholder", defaultMessage: "Brief professional summary highlighting your key achievements and career objectives..." })}
                rows={6}
                className="border rounded-lg p-2 w-full placeholder-gray-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded min-h-[100px]">
                {cv?.personal_info?.summary || intl.formatMessage({ id: "dashboard.noSummary", defaultMessage: "No summary provided" })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { GraduationCap } from "lucide-react"
import type { CV, PersonalInfo } from "../../services/cvs-service"

interface PersonalInfoTabProps {
  isEditing: boolean
  personalInfo: PersonalInfo
  setPersonalInfo: (info: PersonalInfo) => void
  cv: CV
}

export function PersonalInfoTab({ isEditing, personalInfo, setPersonalInfo, cv }: PersonalInfoTabProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Personal Information</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="fullName">Full Name</label>
              {isEditing ? (
                <input
                  id="fullName"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{cv?.personal_info?.fullName || "Not provided"}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="title">Title (Optional)</label>
              {isEditing ? (
                <input
                  id="title"
                  value={personalInfo.title || ""}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                  placeholder="Software Engineer"
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{cv?.personal_info?.title || "Not provided"}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              {isEditing ? (
                <input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  placeholder="john@example.com"
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{cv?.personal_info?.email || "Not provided"}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="phone">Phone</label>
              {isEditing ? (
                <input
                  id="phone"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{cv?.personal_info?.phone || "Not provided"}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="location">Location</label>
              {isEditing ? (
                <input
                  id="location"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  placeholder="New York, NY"
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{cv?.personal_info?.location || "Not provided"}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="linkedIn">LinkedIn</label>
              {isEditing ? (
                <input
                  id="linkedIn"
                  value={personalInfo.linkedIn}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, linkedIn: e.target.value })}
                  placeholder="linkedin.com/in/johndoe"
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{cv?.personal_info?.linkedIn || "Not provided"}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="website">Website (optional)</label>
              {isEditing ? (
                <input
                  id="website"
                  value={personalInfo.website}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                  placeholder="www.johndoe.com"
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{cv?.personal_info?.website || "Not provided"}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="github">GitHub (optional)</label>
              {isEditing ? (
                <input
                  id="github"
                  value={personalInfo.github || ""}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                  placeholder="github.com/johndoe"
                  className="border rounded-lg p-2 placeholder-gray-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{cv?.personal_info?.github || "Not provided"}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="summary">Professional Summary</label><br />
            {isEditing ? (
              <textarea
                id="summary"
                value={personalInfo.summary}
                onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                placeholder="Brief professional summary highlighting your key achievements and career objectives..."
                rows={6}
                className="border rounded-lg p-2 w-full placeholder-gray-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded min-h-[100px]">
                {cv?.personal_info?.summary || "No summary provided"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

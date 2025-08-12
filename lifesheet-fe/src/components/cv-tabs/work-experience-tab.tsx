import { Briefcase, Plus } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { CV, WorkExperience } from "../../services/cvs-service"

interface WorkExperienceTabProps {
  isEditing: boolean
  workExperience: WorkExperience[]
  setWorkExperience: (exp: WorkExperience[]) => void
  cv: CV | null
}

export function WorkExperienceTab({ isEditing, workExperience, setWorkExperience, cv }: WorkExperienceTabProps) {
  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      location: "",
      achievements: [],
    }
    setWorkExperience([...workExperience, newExp])
  }

  const removeWorkExperience = (id: string) => {
    setWorkExperience(workExperience.filter((exp) => exp.id !== id))
  }

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: WorkExperience[keyof WorkExperience]) => {
    setWorkExperience(workExperience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  const addAchievement = (expId: string) => {
    setWorkExperience(workExperience.map((exp) =>
      exp.id === expId
        ? { ...exp, achievements: [...(exp.achievements || []), ""] }
        : exp
    ))
  }

  const updateAchievement = (expId: string, achievementIndex: number, value: string) => {
    setWorkExperience(workExperience.map((exp) =>
      exp.id === expId
        ? {
          ...exp,
          achievements: exp.achievements?.map((ach, idx) =>
            idx === achievementIndex ? value : ach
          ) || []
        }
        : exp
    ))
  }

  const removeAchievement = (expId: string, achievementIndex: number) => {
    setWorkExperience(workExperience.map((exp) =>
      exp.id === expId
        ? {
          ...exp,
          achievements: exp.achievements?.filter((_, idx) => idx !== achievementIndex) || []
        }
        : exp
    ))
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Work Experience</h3>
        </div>
        <div className="space-y-6">
          {isEditing ? (
            <>
              {workExperience.map((exp, index) => (
                <div key={exp.id} className="space-y-4 p-4 border rounded-lg transition-all hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Experience {index + 1}</h3>
                    {workExperience.length > 1 && (
                      <button
                        onClick={() => removeWorkExperience(exp.id)}
                        className="bg-red-100 text-red-600 px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label>Company</label>
                      <input
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(exp.id, "company", e.target.value)}
                        placeholder="Company Name"
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Position</label>
                      <input
                        value={exp.position}
                        onChange={(e) => updateWorkExperience(exp.id, "position", e.target.value)}
                        placeholder="Job Title"
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Location</label>
                      <input
                        value={exp.location || ""}
                        onChange={(e) => updateWorkExperience(exp.id, "location", e.target.value)}
                        placeholder="City, State/Country"
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateWorkExperience(exp.id, "startDate", e.target.value)}
                        className="border rounded-lg p-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateWorkExperience(exp.id, "endDate", e.target.value)}
                        disabled={exp.current}
                        className="border rounded-lg p-2"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onChange={(e) => updateWorkExperience(exp.id, "current", e.target.checked)}
                    />
                    <label htmlFor={`current-${exp.id}`}>Currently working here</label>
                  </div>
                  <div className="space-y-2">
                    <label>Job Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(exp.id, "description", e.target.value)}
                      placeholder="Describe your responsibilities and achievements..."
                      rows={3}
                      className="block w-full border rounded-lg p-2 h-48 placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Key Achievements (Optional)</label>
                    <div className="space-y-2">
                      {(exp.achievements || []).map((achievement, achIndex) => (
                        <div key={achIndex} className="flex gap-2">
                          <input
                            value={achievement}
                            onChange={(e) => updateAchievement(exp.id, achIndex, e.target.value)}
                            placeholder="Describe a key achievement..."
                            className="flex-1 border rounded-lg p-2 placeholder-gray-500"
                          />
                          <button
                            onClick={() => removeAchievement(exp.id, achIndex)}
                            className="bg-red-100 text-red-600 px-3 py-2 rounded"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addAchievement(exp.id)}
                        className="bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm"
                      >
                        + Add Achievement
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addWorkExperience} className="bg-green-100 text-green-600 px-4 py-2 rounded btn-custom">
                <Plus className="h-4 w-4 mr-2 inline-block" />
                Add Work Experience
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {cv?.work_experience.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No work experience added yet</p>
              ) : (
                cv?.work_experience.map((exp: WorkExperience) => (
                  <div key={exp.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{exp.position}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                        {exp.location && (
                          <p className="text-sm text-muted-foreground">{exp.location}</p>
                        )}
                      </div>
                      <div className="bg-gray-100 px-2 py-1 rounded">
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </div>
                    </div>
                    <div className="text-sm mt-2 text-left">
                      <ReactMarkdown>{exp.description}</ReactMarkdown>
                    </div>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-medium text-sm mb-2">Key Achievements:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {exp.achievements.map((achievement, achIndex) => (
                            <li key={achIndex} className="text-sm text-muted-foreground">
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

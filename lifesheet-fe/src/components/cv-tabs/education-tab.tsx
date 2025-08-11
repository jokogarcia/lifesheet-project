import { GraduationCap, Plus } from "lucide-react"
import type { Education } from "../../services/cvs-service"

interface EducationTabProps {
  isEditing: boolean
  education: Education[]
  setEducation: (edu: Education[]) => void
  cv: any
}

export function EducationTab({ isEditing, education, setEducation, cv }: EducationTabProps) {
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      location: "",
    }
    setEducation([...education, newEdu])
  }

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)))
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Education</h3>
        </div>
        <div className="space-y-6">
          {isEditing ? (
            <>
              {education.map((edu, index) => (
                <div key={edu.id} className="space-y-4 p-4 border rounded-lg transition-all hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Education {index + 1}</h3>
                    {education.length > 1 && (
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="bg-red-100 text-red-600 px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label>Institution</label>
                      <input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                        placeholder="University Name"
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Degree</label>
                      <input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        placeholder="Bachelor's, Master's, etc."
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Field of Study</label>
                      <input
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                        placeholder="Computer Science, Business, etc."
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>GPA (Optional)</label>
                      <input
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                        placeholder="3.8/4.0"
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addEducation} className="bg-green-100 text-green-600 px-4 py-2 rounded btn-custom">
                <Plus className="h-4 w-4 mr-2 inline-block" />
                Add Education
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {cv?.education.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No education added yet</p>
              ) : (
                cv?.education.map((edu: Education) => (
                  <div key={edu.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {edu.degree} in {edu.field}
                        </h3>
                        <p className="text-muted-foreground">{edu.institution}</p>
                      </div>
                      <div className="text-right">
                        <div className="bg-gray-100 px-2 py-1 rounded">
                          {edu.startDate} - {edu.endDate}
                        </div>
                        {edu.gpa && <p className="text-sm text-muted-foreground mt-1">GPA: {edu.gpa}</p>}
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
  )
}

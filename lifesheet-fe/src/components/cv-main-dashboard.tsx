"use client"
import ReactMarkdown from "react-markdown"
import { useState, useEffect, use } from "react"
import { Button } from "../components/ui/button"
import {
  Upload,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  LogOut,
  Save,
  Edit,
  AlertCircle,
} from "lucide-react"
import { useUserCV } from "../hooks/use-cv"
import type { PersonalInfo, WorkExperience, Education, Skill, LanguageSkill } from "../services/cvs-service"
import { useAuth0 } from "@auth0/auth0-react"
import { useNavigate } from "react-router-dom"
import userService from "../services/user-service"
import { constants } from "../constants"
import LogoutButton from "./logout-button"

interface CVMainDashboardProps {
  user: any
  onSignOut: () => void
}

export function CVMainDashboard() {
  const { logout, user } = useAuth0()
  const navigate = useNavigate()

  const { cv, isLoading, isSaving, error, saveCV, deleteCV } = useUserCV()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [pictures, setPictures] = useState<string[]>([])
  const [isUploadingPicture, setIsUploadingPicture] = useState(false)
  const onSignOut = () => { logout() }
  // Form state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    title: "",
    profilePictureUrl: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    website: "",
    github: "",
    summary: "",
  })

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([
    {
      id: "1",
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      location: "",
      achievements: [],
    },
  ])

  const [education, setEducation] = useState<Education[]>([
    {
      id: "1",
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      location: "",
    },
  ])

  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState({ name: "", level: "Intermediate" })
  const [languageSkills, setLanguageSkills] = useState<LanguageSkill[]>([])
  const [newLanguageSkill, setNewLanguageSkill] = useState({ language: "", level: "Intermediate" })

  // Initialize form data when CV is loaded or when entering edit mode
  useEffect(() => {
    if (cv && isEditing) {
      setPersonalInfo(cv.personal_info)
      setWorkExperience(cv.work_experience)
      setEducation(cv.education)
      setSkills(cv.skills)
      setLanguageSkills(cv.language_skills || [])
    }
  }, [cv, isEditing])

  // Load user pictures
  useEffect(() => {
    const loadPictures = async () => {
      try {
        const userPictures = await userService.getUserPictures()
        setPictures(userPictures)
      } catch (error) {
        console.error("Error loading pictures:", error)
      }
    }
    loadPictures()
  }, [])



  const handleStartEditing = () => {
    if (cv) {
      setPersonalInfo(cv.personal_info)
      setWorkExperience(cv.work_experience)
      setEducation(cv.education)
      setSkills(cv.skills)
      setLanguageSkills(cv.language_skills || [])
    }
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    setIsEditing(false)
    setSaveMessage(null)
  }

  const handleSave = async () => {
    try {
      await saveCV({
        personal_info: personalInfo,
        work_experience: workExperience,
        education: education,
        skills: skills,
        language_skills: languageSkills,
      })
      setIsEditing(false)
      setSaveMessage("CV saved successfully!")
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error("Error saving CV:", error)
    }
  }


  // Work Experience handlers
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

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setWorkExperience(workExperience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  // Achievements handlers
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

  // Education handlers
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

  // Skills handlers
  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name,
        level: newSkill.level,
      }
      setSkills([...skills, skill])
      setNewSkill({ name: "", level: "Intermediate" })
    }
  }

  const removeSkill = (id: string) => {
    setSkills(skills.filter((skill) => skill.id !== id))
  }

  // Language Skills handlers
  const addLanguageSkill = () => {
    if (newLanguageSkill.language.trim()) {
      const languageSkill: LanguageSkill = {
        id: Date.now().toString(),
        language: newLanguageSkill.language,
        level: newLanguageSkill.level,
      }
      setLanguageSkills([...languageSkills, languageSkill])
      setNewLanguageSkill({ language: "", level: "Intermediate" })
    }
  }

  const removeLanguageSkill = (id: string) => {
    setLanguageSkills(languageSkills.filter((langSkill) => langSkill.id !== id))
  }

  // Picture management handlers
  const handlePictureUpload = async (event: any) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploadingPicture(true)
      try {
        const pictureId = await userService.uploadPicture(file)
        // Reload pictures to get the updated list
        const updatedPictures = await userService.getUserPictures()
        setPictures(updatedPictures)
        console.log("Picture uploaded successfully:", pictureId)
      } catch (error) {
        console.error("Error uploading picture:", error)
      } finally {
        setIsUploadingPicture(false)
      }
    }
  }

  const handleDeletePicture = async (pictureId: string) => {
    try {
      await userService.deletePicture(pictureId)
      // Remove the picture from state
      setPictures(pictures.filter(id => id !== pictureId))
    } catch (error) {
      console.error("Error deleting picture:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading your CV...</p>
        </div>
      </div>
    )
  }
  console.log("CV data:", cv)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-gradient">My CV Data</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || user?.email}</p>
        </div>
        <div className="flex gap-2">
          {!isEditing && cv && (
            <>
              <Button onClick={handleStartEditing} variant="outline" className="btn-custom">
                <Edit className="h-4 w-4 mr-2" />
                Edit CV
              </Button>
              <Button onClick={() => navigate("/tailor-cv")} variant="outline" className="btn-custom">
                <Briefcase className="h-4 w-4 mr-2" />
                Tailor to a Job
              </Button>
            </>
          )}
          <LogoutButton />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="border-red-500 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {saveMessage && (
        <div className="border-green-500 p-4 rounded-lg flex items-center gap-2">
          <p className="text-green-600">{saveMessage}</p>
        </div>
      )}

      {/* No CV State */}
      {!cv && !isEditing && (
        <div className="text-center py-12 border rounded-lg p-6 bg-gradient-subtle card-hover">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No CV data</h3>
          <p className="text-muted-foreground mb-4">Enter your CV data to get started</p>
          <Button onClick={handleStartEditing} className="btn-custom">
            <Plus className="h-4 w-4 mr-2" />
            Input your data
          </Button>
        </div>
      )}

      {/* CV Content */}
      {(cv || isEditing) && (
        <>
          {/* Action Buttons for Edit Mode */}
          {isEditing && (
            <div className="flex justify-center gap-4 mb-6">
              <Button onClick={handleCancelEditing} variant="outline" size="lg">
                Cancel
              </Button>
              <Button onClick={handleSave} size="lg" className="px-8" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="w-full">
            <div className="grid grid-cols-5 mb-4">
              <div onClick={() => setActiveTab("personal")} className="flex items-center gap-2 cursor-pointer">
                <GraduationCap className="h-4 w-4" />
                Personal
              </div>
              <div onClick={() => setActiveTab("experience")} className="flex items-center gap-2 cursor-pointer">
                <Briefcase className="h-4 w-4" />
                Experience
              </div>
              <div onClick={() => setActiveTab("education")} className="flex items-center gap-2 cursor-pointer">
                <GraduationCap className="h-4 w-4" />
                Education
              </div>
              <div onClick={() => setActiveTab("skills")} className="flex items-center gap-2 cursor-pointer">
                <Award className="h-4 w-4" />
                Skills
              </div>
              <div onClick={() => setActiveTab("pictures")} className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Pictures
              </div>
            </div>

            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Personal Information</h3>
                    {!isEditing && <div className="bg-gray-100 px-2 py-1 rounded">View Mode</div>}
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
                            className="border rounded-lg p-2"
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
                            className="border rounded-lg p-2"
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
                            className="border rounded-lg p-2"
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
                            className="border rounded-lg p-2"
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
                            className="border rounded-lg p-2"
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
                            className="border rounded-lg p-2"
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{cv?.personal_info?.linkedIn || "Not provided"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="website">Website</label>
                        {isEditing ? (
                          <input
                            id="website"
                            value={personalInfo.website}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                            placeholder="www.johndoe.com"
                            className="border rounded-lg p-2"
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{cv?.personal_info?.website || "Not provided"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="github">GitHub (Optional)</label>
                        {isEditing ? (
                          <input
                            id="github"
                            value={personalInfo.github || ""}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                            placeholder="github.com/johndoe"
                            className="border rounded-lg p-2"
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
                          rows={4}
                          className="border rounded-lg p-2"
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
            )}

            {/* Work Experience Tab */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Work Experience</h3>
                    {!isEditing && <div className="bg-gray-100 px-2 py-1 rounded">View Mode</div>}
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
                                  className="border rounded-lg p-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label>Position</label>
                                <input
                                  value={exp.position}
                                  onChange={(e) => updateWorkExperience(exp.id, "position", e.target.value)}
                                  placeholder="Job Title"
                                  className="border rounded-lg p-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label>Location</label>
                                <input
                                  value={exp.location || ""}
                                  onChange={(e) => updateWorkExperience(exp.id, "location", e.target.value)}
                                  placeholder="City, State/Country"
                                  className="border rounded-lg p-2"
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
                                className="block w-full border rounded-lg p-2 h-48"
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
                                      className="flex-1 border rounded-lg p-2"
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
                          cv?.work_experience.map((exp, index) => (
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
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Education</h3>
                    {!isEditing && <div className="bg-gray-100 px-2 py-1 rounded">View Mode</div>}
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
                                  className="border rounded-lg p-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label>Degree</label>
                                <input
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                  placeholder="Bachelor's, Master's, etc."
                                  className="border rounded-lg p-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label>Field of Study</label>
                                <input
                                  value={edu.field}
                                  onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                                  placeholder="Computer Science, Business, etc."
                                  className="border rounded-lg p-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label>GPA (Optional)</label>
                                <input
                                  value={edu.gpa}
                                  onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                                  placeholder="3.8/4.0"
                                  className="border rounded-lg p-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label>Start Date</label>
                                <input
                                  type="date"
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                                  className="border rounded-lg p-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label>End Date</label>
                                <input
                                  type="date"
                                  value={edu.endDate}
                                  onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                                  className="border rounded-lg p-2"
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
                          cv?.education.map((edu, index) => (
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
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Skills</h3>
                    {!isEditing && <div className="bg-gray-100 px-2 py-1 rounded">View Mode</div>}
                  </div>
                  <div className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            value={newSkill.name}
                            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                            placeholder="Skill name (e.g., JavaScript, Project Management)"
                            className="flex-1 border rounded-lg p-2"
                          />
                          <select
                            value={newSkill.level}
                            onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                            className="px-3 py-2 border rounded-md"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                          <button onClick={addSkill} className="bg-green-100 text-green-600 px-4 py-2 rounded btn-custom">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {skills.length > 0 && (
                          <div className="space-y-2">
                            <label>Your Skills</label>
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill) => (
                                <div key={skill.id} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2 transition-colors hover:bg-gray-200">
                                  {skill.name} ({skill.level})
                                  <button onClick={() => removeSkill(skill.id)} className="ml-1 hover:text-destructive">
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Language Skills Section */}
                        <div className="border-t pt-4 mt-6">
                          <h4 className="font-semibold text-lg mb-4">Language Skills</h4>
                          <div className="flex gap-2 mb-4">
                            <input
                              value={newLanguageSkill.language}
                              onChange={(e) => setNewLanguageSkill({ ...newLanguageSkill, language: e.target.value })}
                              placeholder="Language (e.g., English, Spanish, French)"
                              className="flex-1 border rounded-lg p-2"
                            />
                            <select
                              value={newLanguageSkill.level}
                              onChange={(e) => setNewLanguageSkill({ ...newLanguageSkill, level: e.target.value })}
                              className="px-3 py-2 border rounded-md"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                              <option value="Native">Native</option>
                              <option value="Fluent">Fluent</option>
                            </select>
                            <button onClick={addLanguageSkill} className="bg-green-100 text-green-600 px-4 py-2 rounded btn-custom">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {languageSkills.length > 0 && (
                            <div className="space-y-2">
                              <label>Your Languages</label>
                              <div className="flex flex-wrap gap-2">
                                {languageSkills.map((langSkill) => (
                                  <div key={langSkill.id} className="bg-blue-50 px-2 py-1 rounded flex items-center gap-2 transition-colors hover:bg-blue-100">
                                    {langSkill.language} ({langSkill.level})
                                    <button onClick={() => removeLanguageSkill(langSkill.id)} className="ml-1 hover:text-destructive">
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        {cv?.skills.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No skills added yet</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {cv?.skills.map((skill) => (
                              <div key={skill.id} className="bg-gray-100 px-2 py-1 rounded transition-colors hover:bg-gray-200">
                                {skill.name} ({skill.level})
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Language Skills Display */}
                        {cv?.language_skills && cv.language_skills.length > 0 && (
                          <div className="border-t pt-4 mt-6">
                            <h4 className="font-semibold text-lg mb-4">Language Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {cv.language_skills.map((langSkill) => (
                                <div key={langSkill.id} className="bg-blue-50 px-2 py-1 rounded transition-colors hover:bg-blue-100">
                                  {langSkill.language} ({langSkill.level})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pictures Tab */}
            {activeTab === "pictures" && (
              <div className="space-y-4">
                <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Profile Pictures</h3>
                  </div>

                  {/* Upload Section */}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center mb-6">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="space-y-2">
                      <label htmlFor="picture-upload" className="cursor-pointer">
                        <span className="text-lg font-medium">Click to upload a picture</span>
                        <p className="text-sm text-muted-foreground">or drag and drop</p>
                      </label>
                      <input
                        id="picture-upload"
                        type="file"
                        accept=".png,.jpg,.jpeg,.gif,.webp"
                        onChange={handlePictureUpload}
                        className="hidden"
                        disabled={isUploadingPicture}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: PNG, JPG, JPEG, GIF, WebP (Max 5MB)
                    </p>
                    {isUploadingPicture && (
                      <div className="mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                      </div>
                    )}
                  </div>

                  {/* Pictures Grid */}
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Your Pictures ({pictures.length})</h4>
                    {pictures.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No pictures uploaded yet</p>
                        <p className="text-sm text-muted-foreground">Upload your first picture above</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {pictures.map((pictureId, index) => (
                          <div
                            key={pictureId}
                            className="relative group border rounded-lg overflow-hidden bg-gray-50 aspect-square"
                          >
                            <SecureImg
                              pictureId={pictureId}
                              alt={`Profile picture ${index + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                              <button
                                onClick={() => handleDeletePicture(pictureId)}
                                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                                title="Delete picture"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Buttons for Edit Mode */}
          {isEditing && (
            <>
              <div className="border-t mt-6"></div>
              <div className="flex justify-center gap-4 mt-6">
                <button onClick={handleCancelEditing} className="bg-gray-100 text-gray-600 px-8 py-2 rounded">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-100 text-blue-600 px-8 py-2 rounded"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2 inline-block" />
                      Save CV
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function SecureImg({ pictureId, alt, className }: { pictureId: string; alt?: string; className?: string }) {
  const [error, setError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!pictureId) {
      setError(true)
    }

    userService.getPicture(pictureId)
      .then((blob) => {
        if (blob) {
          setBlobUrl(blob);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      });
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };

  }, [pictureId])
  const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5QzEwLjM0MzEgOSA5IDEwLjM0MzEgOSAxMkM5IDEzLjY1NjkgMTAuMzQzMSAxNSAxMkM5IDE1IDEwLjM0MzEgMTMgMTUgMTVDMTMuNjU2OSAxNSAxNSAxMy42NTY5IDE1IDEyQzE1IDEwLjM0MzEgMTMuNjU2OSAxMiAxMiAxMkM5IDEzLjY1NjkgOSA5LjM0MzEgOSA5WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4='
  const _src = error || !blobUrl ? placeholder : blobUrl;
  return (
    <img
      src={_src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}

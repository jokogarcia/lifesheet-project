import { Button } from "./ui/button";
import { StepProgressIndicator } from "./ui/step-progress-indicator";
import { useUserCV } from "@/hooks/use-cv";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  PersonalInfoTab,
  WorkExperienceTab,
  EducationTab,
  SkillsTab,
  PicturesTab
} from "./cv-tabs"
import type { PersonalInfo, WorkExperience, Education, Skill, LanguageSkill } from "@/services/cvs-service";
import userService from "@/services/user-service";

export const Onboarding = () => {
  const navigate = useNavigate();
  const { cv, isLoading: isLoadingCV, saveCV } = useUserCV();
  const steps = ['Personal Information', 'Work Experience', 'Education', 'Skills', 'Profile Photo'];
  const [currentStep, setCurrentStep] = useState(0);

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSave();
      await navigate("/dashboard");
    }
  };
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

  ])

  const [education, setEducation] = useState<Education[]>([

  ])

  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState({ name: "", level: "Intermediate" })
  const [languageSkills, setLanguageSkills] = useState<LanguageSkill[]>([])
  const [newLanguageSkill, setNewLanguageSkill] = useState({ language: "", level: "Intermediate" })
  const [pictures, setPictures] = useState<string[]>([])
  const [isUploadingPicture, setIsUploadingPicture] = useState(false)
  const [canClickNext, setCanClickNext] = useState(false)

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
  useEffect(() => {
    if (cv) {
      setPersonalInfo(cv.personal_info)
      setWorkExperience(cv.work_experience)
      setEducation(cv.education)
      setSkills(cv.skills)
      setLanguageSkills(cv.language_skills)
    }
  }, [cv])
  useEffect(() => {
    console.log("Can click next:", canClickNext)
  }, [canClickNext])
  useEffect(() => {
    let valid = false;
    switch (currentStep) {
      case 0:
        valid = !!personalInfo.fullName && !!personalInfo.email;
        console.log("Step 0 valid:", valid);
        break;
      case 1:
        valid = workExperience.every(exp => !!exp.company && !!exp.position && !!exp.startDate );
        console.log("Step 1 valid:", valid);
        break;
      case 2:
        valid = education.every(edu => !!edu.institution && !!edu.degree && !!edu.startDate);
        console.log("Step 2 valid:", valid);
        break;
      case 3:
        valid = skills.every(skill => !!skill.name);
        console.log("Step 3 valid:", valid);
        break;
      case 4:
        valid = pictures.length > 0;
        console.log("Step 4 valid:", valid);
        break;
      default:
        valid = true;
    }
    setCanClickNext(valid);
  }, [currentStep, personalInfo, workExperience, education, skills, pictures])
  // Picture management handlers
  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleSave = async () => {
    try {
      await saveCV({
        personal_info: personalInfo,
        work_experience: workExperience,
        education: education,
        skills: skills,
        language_skills: languageSkills,
      })
    } catch (error) {
      console.error("Error saving CV:", error)
    }
  }
  if (isLoadingCV) {
    return <p>Loading...</p>
  }
  return (
    <div>
      <h1>Onboarding</h1>
      <StepProgressIndicator steps={steps} currentStep={currentStep}  /><br></br>
      <div id="stepContainer" className="max-w-6xl mx-auto p-6 space-y-6">
        {(() => {
          switch (currentStep) {
            case 0:
              return <PersonalInfoTab isEditing={true} cv={cv} personalInfo={personalInfo} setPersonalInfo={setPersonalInfo} />;
            case 1:
              return <WorkExperienceTab isEditing={true} cv={cv} workExperience={workExperience} setWorkExperience={setWorkExperience} />;
            case 2:
              return <EducationTab isEditing={true} cv={cv} education={education} setEducation={setEducation} />;
            case 3:
              return <SkillsTab isEditing={true} cv={cv} skills={skills} setSkills={setSkills} newSkill={newSkill} setNewSkill={setNewSkill} languageSkills={languageSkills} setLanguageSkills={setLanguageSkills} newLanguageSkill={newLanguageSkill} setNewLanguageSkill={setNewLanguageSkill} />;
            case 4:
              return <PicturesTab pictures={pictures}
                isUploadingPicture={isUploadingPicture}
                handlePictureUpload={handlePictureUpload}
                handleDeletePicture={handleDeletePicture} />;
            default:
              return null;
          }
        })()}
      </div>
      <div id="buttonContainer" className="flex justify-between max-w-6xl mx-auto p-6 space-y-6 mb-10">
        <Button variant="default" disabled={currentStep === 0} onClick={handleBack}>Back</Button>
        <Button variant="default" disabled={!canClickNext} onClick={handleNext}>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</Button>
      </div>
    </div>
  );
};

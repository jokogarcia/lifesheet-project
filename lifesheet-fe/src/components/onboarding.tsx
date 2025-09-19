import { Button } from './ui/button';
import { StepProgressIndicator } from './ui/step-progress-indicator';
import { useUserCV } from '@/hooks/use-cv';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  PersonalInfoTab,
  WorkExperienceTab,
  EducationTab,
  SkillsTab,
  PicturesTab,
} from './cv-tabs';
import type {
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  LanguageSkill,
} from '@/services/cvs-service';
import userService from '@/services/user-service';
import { LoadingIndicator } from './ui/loading-indicator';
import { FormattedMessage, useIntl } from 'react-intl';
import posthog from 'posthog-js';

export const Onboarding = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { cv, isLoading: isLoadingCV, saveCV } = useUserCV();
  const steps = [
    intl.formatMessage({ id: 'onboarding.step.personalInfo', defaultMessage: 'Personal Information' }),
    intl.formatMessage({ id: 'onboarding.step.workExperience', defaultMessage: 'Work Experience' }),
    intl.formatMessage({ id: 'onboarding.step.education', defaultMessage: 'Education' }),
    intl.formatMessage({ id: 'onboarding.step.skills', defaultMessage: 'Skills' }),
    intl.formatMessage({ id: 'onboarding.step.profilePhoto', defaultMessage: 'Profile Photo' })
  ];
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
      posthog.capture('onboarding_completed', { step: currentStep });
      await handleSave();
      await navigate('/plans');
    }
  };
  // Form state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    title: '',
    profilePictureUrl: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    website: '',
    github: '',
    summary: '',
  });

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);

  const [education, setEducation] = useState<Education[]>([]);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermediate' });
  const [languageSkills, setLanguageSkills] = useState<LanguageSkill[]>([]);
  const [newLanguageSkill, setNewLanguageSkill] = useState({ language: '', level: 'Intermediate' });
  const [pictures, setPictures] = useState<string[]>([]);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [canClickNext, setCanClickNext] = useState(false);

  // Load user pictures
  useEffect(() => {
    const loadPictures = async () => {
      try {
        const userPictures = await userService.getUserPictures();
        setPictures(userPictures);
      } catch (error) {
        console.error(intl.formatMessage({
          id: 'onboarding.error.loadingPictures',
          defaultMessage: 'Error loading pictures:'
        }), error);
      }
    };
    loadPictures();
  }, [intl]);
  useEffect(() => {
    if (cv) {
      setPersonalInfo(cv.personal_info);
      setWorkExperience(cv.work_experience);
      setEducation(cv.education);
      setSkills(cv.skills);
      setLanguageSkills(cv.language_skills);
    }
  }, [cv]);
  useEffect(() => {

  }, [canClickNext]);
  useEffect(() => {
    posthog.capture('onboarding_started');
  }, []);
  useEffect(() => {
    let valid = false;
    switch (currentStep) {
      case 0:
        valid = !!personalInfo.fullName && !!personalInfo.email;
        break;
      case 1:
        valid = workExperience.every(exp => !!exp.company && !!exp.position && !!exp.startDate);

        break;
      case 2:
        valid = education.every(edu => !!edu.institution && !!edu.degree && !!edu.startDate);

        break;
      case 3:
        valid = skills.every(skill => !!skill.name);

        break;
      case 4:
        valid = true;// picture is optional

        break;
      default:
        valid = true;
    }

    setCanClickNext(valid);
  }, [currentStep, personalInfo, workExperience, education, skills, pictures, steps, intl]);
  // Picture management handlers
  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];
    if (file) {
      setIsUploadingPicture(true);
      try {
        const pictureId = await userService.uploadPicture(file);
        console.log('Uploaded picture ID:', pictureId);
        // Reload pictures to get the updated list
        const updatedPictures = await userService.getUserPictures();
        setPictures(updatedPictures);

      } catch (error) {
        console.error(intl.formatMessage({
          id: 'onboarding.error.pictureUpload',
          defaultMessage: 'Error uploading picture:'
        }), error);
      } finally {
        setIsUploadingPicture(false);
      }
    }
  };

  const handleDeletePicture = async (pictureId: string) => {
    try {
      await userService.deletePicture(pictureId);
      // Remove the picture from state
      setPictures(pictures.filter(id => id !== pictureId));
    } catch (error) {
      console.error(intl.formatMessage({
        id: 'onboarding.error.pictureDelete',
        defaultMessage: 'Error deleting picture:'
      }), error);
    }
  };
  const handleSave = async () => {
    try {
      if (!cv) {
        throw new Error(intl.formatMessage({
          id: 'cvData.noCvToSave',
          defaultMessage: 'No CV to save'
        }));
      }
      await saveCV(cv._id, {
        personal_info: personalInfo,
        work_experience: workExperience,
        education: education,
        skills: skills,
        language_skills: languageSkills,
      });

    } catch (error) {
      console.error(intl.formatMessage({
        id: 'onboarding.error.savingCV',
        defaultMessage: 'Error saving CV:'
      }), error);
    }
  };
  if (isLoadingCV) {
    return <LoadingIndicator />;
  }
  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-6">
        <FormattedMessage id="onboarding.title" defaultMessage="Set Up Your CV" />
      </h1>
      <p className="text-center text-gray-600 mb-8">
        <FormattedMessage id="onboarding.subtitle" defaultMessage="Let's set up your CV step by step" />
      </p>
      <StepProgressIndicator steps={steps} currentStep={currentStep} />
      <br></br>
      <div id="stepContainer" className="max-w-6xl mx-auto p-6 space-y-6">
        {(() => {
          switch (currentStep) {
            case 0:
              return (
                <PersonalInfoTab
                  isEditing={true}
                  cv={cv}
                  personalInfo={personalInfo}
                  setPersonalInfo={setPersonalInfo}
                />
              );
            case 1:
              return (
                <WorkExperienceTab
                  isEditing={true}
                  cv={cv}
                  workExperience={workExperience}
                  setWorkExperience={setWorkExperience}
                />
              );
            case 2:
              return (
                <EducationTab
                  isEditing={true}
                  cv={cv}
                  education={education}
                  setEducation={setEducation}
                />
              );
            case 3:
              return (
                <SkillsTab
                  isEditing={true}
                  cv={cv}
                  skills={skills}
                  setSkills={setSkills}
                  newSkill={newSkill}
                  setNewSkill={setNewSkill}
                  languageSkills={languageSkills}
                  setLanguageSkills={setLanguageSkills}
                  newLanguageSkill={newLanguageSkill}
                  setNewLanguageSkill={setNewLanguageSkill}
                />
              );
            case 4:
              return (
                <PicturesTab
                  pictures={pictures}
                  isUploadingPicture={isUploadingPicture}
                  handlePictureUpload={handlePictureUpload}
                  handleDeletePicture={handleDeletePicture}
                />
              );
            default:
              return null;
          }
        })()}
      </div>
      <div
        id="buttonContainer"
        className="flex justify-between max-w-6xl mx-auto p-6 space-y-6 mb-10"
      >
        <Button variant="default" disabled={currentStep === 0} onClick={handleBack}>
          <FormattedMessage id="onboarding.button.back" defaultMessage="Back" />
        </Button>
        <Button variant="default" disabled={!canClickNext} onClick={handleNext}>
          {currentStep === steps.length - 1 ?
            <FormattedMessage id="onboarding.button.finish" defaultMessage="Finish" /> :
            <FormattedMessage id="onboarding.button.next" defaultMessage="Next" />
          }
        </Button>
      </div>
    </div>
  );
};

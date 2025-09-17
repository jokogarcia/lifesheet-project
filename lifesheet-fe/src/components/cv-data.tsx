'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Save,
  AlertCircle,
  Plus,
  ArrowLeft,
  ImageIcon,
  User,
} from 'lucide-react';
import { useUserCV } from '../hooks/use-cv';
import type {
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  LanguageSkill,
} from '../services/cvs-service';
import { useAuth } from '@/hooks/auth-hook';
import { useLocation, useNavigate } from 'react-router-dom';
import userService from '../services/user-service';
import {
  PersonalInfoTab,
  WorkExperienceTab,
  EducationTab,
  SkillsTab,
  PicturesTab,
} from './cv-tabs';
import { CoverLetterTab } from './cv-tabs/cover-letter-tab';
import { FormattedMessage, useIntl } from 'react-intl';

export function CVData() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const intl = useIntl();
  const queryParams = new URLSearchParams(useLocation().search);
  const givenCvId = queryParams.get('cvId') || undefined;
  const jumpToTab = queryParams.get('tab') || undefined;
  const qIsEditing = queryParams.get('edit') === 'true';
  const { cv, isLoading, isSaving, error, saveCV } = useUserCV(givenCvId);
  const [isEditing, setIsEditing] = useState(qIsEditing);
  const [activeTab, setActiveTab] = useState(jumpToTab || 'personal');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [pictures, setPictures] = useState<string[]>([]);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
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

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([
    {
      id: '1',
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      location: '',
      achievements: [],
    },
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      id: '1',
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      location: '',
    },
  ]);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermediate' });
  const [languageSkills, setLanguageSkills] = useState<LanguageSkill[]>([]);
  const [newLanguageSkill, setNewLanguageSkill] = useState({ language: '', level: 'Intermediate' });

  // Initialize form data when CV is loaded or when entering edit mode
  useEffect(() => {
    if (cv && isEditing) {
      setPersonalInfo(cv.personal_info);
      setWorkExperience(cv.work_experience);
      setEducation(cv.education);
      setSkills(cv.skills);
      setLanguageSkills(cv.language_skills || []);
    }
  }, [cv, isEditing]);
  useEffect(() => {
    const isMainCv = !givenCvId;
    if (!isMainCv) setIsEditing(true);
  }, [givenCvId]);

  // Load user pictures
  useEffect(() => {
    const loadPictures = async () => {
      try {
        const userPictures = await userService.getUserPictures();
        setPictures(userPictures);
      } catch (error) {
        console.error(intl.formatMessage(
          { id: 'cvData.loadPicturesError', defaultMessage: 'Error loading pictures:' }),
          error
        );
      }
    };
    loadPictures();
  }, []);

  const handleStartEditing = () => {
    if (cv) {
      setPersonalInfo(cv.personal_info);
      setWorkExperience(cv.work_experience);
      setEducation(cv.education);
      setSkills(cv.skills);
      setLanguageSkills(cv.language_skills || []);
    }
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setSaveMessage(null);
    if (!isMainCv) navigate(-1);
  };

  const handleSave = async () => {
    try {
      if (!cv) {
        throw new Error(intl.formatMessage({ id: 'cvData.noCvToSave', defaultMessage: 'No CV to save' }));
      }
      await saveCV(cv._id, {
        personal_info: personalInfo,
        work_experience: workExperience,
        education: education,
        skills: skills,
        language_skills: languageSkills,
        tailored: cv.tailored,
      });

      setIsEditing(false);
      setSaveMessage(intl.formatMessage({ id: 'cvData.saveSuccess', defaultMessage: 'CV saved successfully!' }));
      setTimeout(() => {
        setSaveMessage(null);
        if (!isMainCv) navigate(-1);
      }, 700);
    } catch (error) {
      console.error(intl.formatMessage({ id: 'cvData.errorSaving', defaultMessage: 'Error saving CV:' }), error);
    }
  };

  // Picture management handlers
  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploadingPicture(true);
      try {
        const pictureId = await userService.uploadPicture(file);
        // Reload pictures to get the updated list
        const updatedPictures = await userService.getUserPictures();
        setPictures(updatedPictures);
        console.log(intl.formatMessage(
          { id: 'cvData.pictureUploadSuccess', defaultMessage: 'Picture uploaded successfully:' }),
          pictureId
        );
      } catch (error) {
        console.error(intl.formatMessage(
          { id: 'cvData.pictureUploadError', defaultMessage: 'Error uploading picture:' }),
          error
        );
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
      console.error(intl.formatMessage(
        { id: 'cvData.pictureDeleteError', defaultMessage: 'Error deleting picture:' }),
        error
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">
            <FormattedMessage id="cvData.loading" defaultMessage="Loading your CV..." />
          </p>
        </div>
      </div>
    );
  }
  const isMainCv = !givenCvId;


  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        {isMainCv && <div>
          <h1 className="text-3xl text-gradient">
            <FormattedMessage id="cvData.myCvData" defaultMessage="My CV Data" />
          </h1>
          <p className="text-muted-foreground">
            <FormattedMessage
              id="cvData.welcomeBack"
              defaultMessage="Welcome back, {name}"
              values={{ name: user?.name || user?.email }}
            />
          </p>
        </div>}
        {
          !isMainCv && <div>
            <h1 className="text-3xl text-gradient">
              <FormattedMessage id="cvData.tailoredCvData" defaultMessage="Tailored CV Data" />
            </h1>
            <p className="text-muted-foreground">
              <FormattedMessage
                id="cvData.tailoredCvDescription"
                defaultMessage="You are viewing a tailored version of your CV. Changes here will not affect your main CV."
              />
            </p>
          </div>
        }
        <div className="flex gap-2">
          {isMainCv && <Button onClick={() => navigate('/')} variant="outline" className="btn-custom">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <FormattedMessage id="cvData.backToDashboard" defaultMessage="Back to Dashboard" />
          </Button>}
          {isEditing ? <div className="flex justify-center gap-4">
            <button
              onClick={handleCancelEditing}
              className="bg-gray-100 text-gray-600 px-8 py-2 rounded"
            >
              <FormattedMessage id="cvData.cancel" defaultMessage="Cancel" />
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-100 text-blue-600 px-8 py-2 rounded"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  <FormattedMessage id="cvData.saving" defaultMessage="Saving..." />
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2 inline-block" />
                  <FormattedMessage id="cvData.saveCV" defaultMessage="Save CV" />
                </>
              )}
            </button>
          </div> : <Button onClick={isEditing ? handleCancelEditing : handleStartEditing} className="btn-custom">
            <FormattedMessage id="cvData.editCV" defaultMessage="Edit CV" />
          </Button>}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="border-red-500 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p className="text-red-600">
            <FormattedMessage id="cvData.error" defaultMessage="Error: {error}" values={{ error }} />
          </p>
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
          <h3 className="text-lg font-semibold mb-2">
            <FormattedMessage id="cvData.noCvData" defaultMessage="No CV data" />
          </h3>
          <p className="text-muted-foreground mb-4">
            <FormattedMessage id="cvData.enterCvData" defaultMessage="Enter your CV data to get started" />
          </p>
          <Button onClick={handleStartEditing} className="btn-custom">
            <Plus className="h-4 w-4 mr-2" />
            <FormattedMessage id="cvData.inputData" defaultMessage="Input your data" />
          </Button>
        </div>
      )}

      {/* CV Content */}
      {(cv || isEditing) && (
        <>
          {/* Action Buttons for Edit Mode */}


          <div className="w-full text-left">
            <div className="grid grid-cols-5 mb-4">
              <div
                onClick={() => setActiveTab('personal')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <User className="h-4 w-4" />
                <FormattedMessage id="cvData.tab.personal" defaultMessage="Personal" />
              </div>
              <div
                onClick={() => setActiveTab('experience')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Briefcase className="h-4 w-4" />
                <FormattedMessage id="cvData.tab.experience" defaultMessage="Experience" />
              </div>
              <div
                onClick={() => setActiveTab('education')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="h-4 w-4" />
                <FormattedMessage id="cvData.tab.education" defaultMessage="Education" />
              </div>
              <div
                onClick={() => setActiveTab('skills')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Award className="h-4 w-4" />
                <FormattedMessage id="cvData.tab.skills" defaultMessage="Skills" />
              </div>
              <div
                onClick={() => setActiveTab('pictures')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ImageIcon className="h-4 w-4" />
                <FormattedMessage id="cvData.tab.pictures" defaultMessage="Pictures" />
              </div>
              {cv?.tailored?.coverLetter && <div
                onClick={() => setActiveTab('coverLetter')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                <FormattedMessage id="cvData.tab.coverLetter" defaultMessage="Cover Letter" />
              </div>}
            </div>

            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <PersonalInfoTab
                isEditing={isEditing}
                personalInfo={personalInfo}
                setPersonalInfo={setPersonalInfo}
                cv={cv}
              />
            )}

            {/* Work Experience Tab */}
            {activeTab === 'experience' && (
              <WorkExperienceTab
                isEditing={isEditing}
                workExperience={workExperience}
                setWorkExperience={setWorkExperience}
                cv={cv}
              />
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <EducationTab
                isEditing={isEditing}
                education={education}
                setEducation={setEducation}
                cv={cv}
              />
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <SkillsTab
                isEditing={isEditing}
                skills={skills}
                setSkills={setSkills}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
                languageSkills={languageSkills}
                setLanguageSkills={setLanguageSkills}
                newLanguageSkill={newLanguageSkill}
                setNewLanguageSkill={setNewLanguageSkill}
                cv={cv}
              />
            )}

            {/* Pictures Tab */}
            {activeTab === 'pictures' && (
              <PicturesTab
                pictures={pictures}
                isUploadingPicture={isUploadingPicture}
                handlePictureUpload={handlePictureUpload}
                handleDeletePicture={handleDeletePicture}
              />
            )}
            {/* Cover Letter Tab */}
            {activeTab === 'coverLetter' && cv?.tailored?.coverLetter && (
              <CoverLetterTab
                isEditing={isEditing}
                coverLetter={cv.tailored.coverLetter}
                setCoverLetter={(newContent: string) => {
                  cv.tailored!.coverLetter = newContent;
                }}
                cv={cv}
              />
            )}

          </div>

          {/* Bottom Action Buttons for Edit Mode */}
          {isEditing && (
            <>
              <div className="border-t mt-6"></div>

            </>
          )}
        </>
      )}
    </div>
  );

}

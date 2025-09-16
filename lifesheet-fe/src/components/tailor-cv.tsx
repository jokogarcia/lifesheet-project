'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Wand2 } from 'lucide-react';
import { useUserCV } from '@/hooks/use-cv';
import { useNavigate } from 'react-router-dom';
import cvsService from '@/services/cvs-service';
import { useSaaSActiveSubscription } from '@/hooks/use-saas';
import RichTextEditor from './ui/editor';
import { LoadingIndicator } from './ui/loading-indicator';
import { FormattedMessage, useIntl } from 'react-intl';


export function TailorCV() {
  const intl = useIntl();
  const { cv, isLoading } = useUserCV();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const { canUseAI, isLoading: isLoadingSubscription } = useSaaSActiveSubscription();
  const [translateTo, setTranslateTo] = useState('none');
  const handleTailorCV = async () => {
    if (!canUseAI) {
      alert(intl.formatMessage({
        id: 'tailorCV.error.usageLimits',
        defaultMessage: 'You have reached your usage limits for this feature.'
      }));
      navigate('/plans');
      return;
    }
    if (!jobDescription.trim()) return;

    setIsTailoring(true);

    try {
      // Call the real API endpoint to tailor the CV
      const { cvId: tailoredCVId } = await cvsService.tailorCV(
        jobDescription,
        companyName,
        includeCoverLetter,
        true,
        translateTo
      );
      await navigate(`/export-pdf?cvId=${tailoredCVId}`);
    } catch (error) {
      console.error(intl.formatMessage({
        id: 'tailorCV.error.tailoringFailed',
        defaultMessage: 'Error tailoring CV:'
      }), error);
      // Show error message to user
      alert(intl.formatMessage({
        id: 'tailorCV.error.tryAgain',
        defaultMessage: 'Failed to tailor CV. Please try again.'
      }));
    } finally {
      setIsTailoring(false);
    }
  };
  const handleManualTailoring = async () => {
    setIsTailoring(true);

    try {
      // Call the real API endpoint to tailor the CV
      const { cvId: tailoredCVId } = await cvsService.tailorCV(
        jobDescription,
        companyName,
        includeCoverLetter,
        false,
        translateTo
      );
      await navigate(`/export-pdf?cvId=${tailoredCVId}`);
    } catch (error) {
      console.error(intl.formatMessage({
        id: 'tailorCV.error.tailoringFailed',
        defaultMessage: 'Error tailoring CV:'
      }), error);
      // Show error message to user
      alert(intl.formatMessage({
        id: 'tailorCV.error.tryAgain',
        defaultMessage: 'Failed to tailor CV. Please try again.'
      }));
    } finally {
      setIsTailoring(false);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className="pl-12 pr-12 mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-gradient">
            <FormattedMessage id="tailorCV.title" defaultMessage="Tailor CV to Job" />
          </h1>
          <p className="text-muted-foreground">
            <FormattedMessage id="tailorCV.subtitle" defaultMessage="Customize your CV for a specific job application" />
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/')} variant="outline" className="btn-custom">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <FormattedMessage id="tailorCV.backToDashboard" defaultMessage="Back to Dashboard" />
          </Button>
        </div>
      </div>

      {!cv ? (
        <div className="text-center py-12 border rounded-lg p-6">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            <FormattedMessage id="tailorCV.noCvData" defaultMessage="No CV data available" />
          </h3>
          <p className="text-muted-foreground mb-4">
            <FormattedMessage
              id="tailorCV.createCvFirst"
              defaultMessage="Please create your CV first before tailoring it to a job"
            />
          </p>
          <Button onClick={() => navigate('/')}>
            <FormattedMessage id="tailorCV.goToDashboard" defaultMessage="Go to Dashboard" />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 col-span-2">
            <div className="border rounded-lg p-6 space-y-4 card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">
                    <FormattedMessage id="tailorCV.companyName" defaultMessage="Company name" />
                  </h3>
                </div>
              </div>
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder={intl.formatMessage({ id: 'tailorCV.companyNamePlaceholder', defaultMessage: 'Company Name' })}
                className="w-full border rounded-lg p-4 font-mono"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">
                    <FormattedMessage id="tailorCV.jobDescription" defaultMessage="Job Description" />
                  </h3>
                </div>
              </div>
              <RichTextEditor
                content={jobDescription}
                onContentUpdate={setJobDescription}
                style={{ height: '30em' }}
              />


            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-6 card-hover">
              <div className="border pb-4 mb-4">
                <span>
                  <input
                    type="checkbox"
                    checked={includeCoverLetter}
                    onChange={e => setIncludeCoverLetter(e.target.checked)}
                    className="mt-4 mr-2"
                  />
                  <FormattedMessage id="tailorCV.includeCoverLetter" defaultMessage="Include Cover Letter" />
                </span>
                <div>
                  <label className="ml-4" htmlFor='translateTo'>
                    <FormattedMessage id="tailorCV.translateTo" defaultMessage="Use Translation" />
                  </label>
                  <select id='translateTo' className="ml-2 border rounded-lg p-1" onChange={e => setTranslateTo(e.target.value)}>
                    <option value="none" selected={translateTo === 'none'}>{intl.formatMessage({ id: 'tailorCV.noTranslation', defaultMessage: 'No Translation' })}</option>
                    <option value="es" selected={translateTo === 'es'}>{intl.formatMessage({ id: 'tailorCV.spanish', defaultMessage: 'Translate to Spanish' })}</option>
                    <option value="en" selected={translateTo === 'en'}>{intl.formatMessage({ id: 'tailorCV.english', defaultMessage: 'Translate to English' })}</option>
                    <option value="de" selected={translateTo === 'de'}>{intl.formatMessage({ id: 'tailorCV.german', defaultMessage: 'Translate to German' })}</option>
                  </select>
                </div>

                {/* Tailor Button */}
                <div className="space-y-3 m-4">
                  <Button
                    onClick={handleTailorCV}
                    disabled={
                      !jobDescription.trim() || isTailoring || isLoadingSubscription || !companyName
                    }
                    className="w-full"
                  >
                    {isTailoring ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <FormattedMessage id="tailorCV.tailoring" defaultMessage="Tailoring..." />
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        <FormattedMessage id="tailorCV.tailorUsingAI" defaultMessage="Tailor using AI" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <Button className={`mt-6 cursor-pointer ${!jobDescription.trim() || isLoadingSubscription || !companyName
                ? "hidden" : ""}`} variant="link" onClick={handleManualTailoring} disabled={isTailoring}  >
                {includeCoverLetter && translateTo === 'none' ?
                  <FormattedMessage
                    id="tailorCV.continueWithoutAI.coverLetter"
                    defaultMessage="Continue without AI Tailoring. Use AI only for the cover letter"
                  /> : includeCoverLetter && translateTo !== 'none' ?
                    <FormattedMessage
                      id="tailorCV.continueWithoutAi.coverLetterAndTranslation"
                      defaultMessage="Continue without AI Tailoring. Use AI for the cover letter and translation"
                    /> :
                    !includeCoverLetter && translateTo !== 'none' ?
                      <FormattedMessage
                        id="tailorCV.continueWithoutAi.translation"
                        defaultMessage="Continue without AI Tailoring. Use AI for the translation"
                      /> :
                      <FormattedMessage
                        id="tailorCV.continueWithoutAI"
                        defaultMessage="Continue without AI Tailoring"
                      />
                }
              </Button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}


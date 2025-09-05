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

export function TailorCV() {
  const { cv, isLoading } = useUserCV();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [useAiTailoring, setUseAiTailoring] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const { canUseAI, isLoading: isLoadingSubscription } = useSaaSActiveSubscription();

  const handleTailorCV = async () => {
    if (!canUseAI) {
      alert('You have reached your usage limits for this feature.');
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
        useAiTailoring
      );
      await navigate(`/export-pdf?cvId=${tailoredCVId}`);
    } catch (error) {
      console.error('Error tailoring CV:', error);
      // Show error message to user
      alert('Failed to tailor CV. Please try again.');
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-gradient">Tailor CV to Job</h1>
          <p className="text-muted-foreground">Customize your CV for a specific job application</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/')} variant="outline" className="btn-custom">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {!cv ? (
        <div className="text-center py-12 border rounded-lg p-6">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No CV data available</h3>
          <p className="text-muted-foreground mb-4">
            Please create your CV first before tailoring it to a job
          </p>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border rounded-lg p-6 space-y-4 card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Company name</h3>
                </div>
              </div>
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Company Name"
                className="w-full border rounded-lg p-4 font-mono"
              />
              <div className="flex items-center gap-6">
                <span>
                  <input
                    type="checkbox"
                    checked={includeCoverLetter}
                    onChange={e => setIncludeCoverLetter(e.target.checked)}
                    className="mt-4 mr-2"
                  />
                  Include Cover Letter
                </span>
                <span>
                  <input
                    type="checkbox"
                    checked={useAiTailoring}
                    onChange={e => setUseAiTailoring(e.target.checked)}
                    className="mt-4 mr-2"
                  />
                  Tailor using AI
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Job Description</h3>
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
              <p className="mb-6">
                Click the button below to tailor your CV. You will be able to further customize it
                in the next step.
              </p>
              {/* Tailor Button */}
              <div className="space-y-3">
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
                      Tailoring...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Tailor My CV
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

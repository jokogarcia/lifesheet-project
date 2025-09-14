'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Wand2, X, ArrowUpRight } from 'lucide-react';
import { useUserCV } from '@/hooks/use-cv';
import { useNavigate } from 'react-router-dom';
import cvsService from '@/services/cvs-service';
import { useSaaSActiveSubscription } from '@/hooks/use-saas';
import RichTextEditor from './ui/editor';
import { LoadingIndicator } from './ui/loading-indicator';

// Advertisement component that shows to free tier users
function AdvertisementModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gradient mb-2">Upgrade to Premium</h2>
          <p className="text-gray-600">Enhance your CV with premium features</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Wand2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Unlimited AI Tailoring</h3>
              <p className="text-sm text-gray-600">Customize your CV for any job without limits</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Advanced CV Templates</h3>
              <p className="text-sm text-gray-600">Stand out with professional designs</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <ArrowUpRight className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Higher Success Rate</h3>
              <p className="text-sm text-gray-600">Premium users get 3x more interviews</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <Button onClick={() => window.location.href = '/plans'} className="w-full">
            Upgrade Now
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full">
            Continue with Free Plan
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TailorCV() {
  const { cv, isLoading } = useUserCV();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const { activeSubscription, isLoading: isLoadingSubscription, canUseAI } = useSaaSActiveSubscription();
  const [showAd, setShowAd] = useState(false);

  // Check if user is on free plan
  const isFreePlan = !isLoadingSubscription && (!activeSubscription || activeSubscription.planId === 'free');

  const handleTailorCV = async () => {
    if (!canUseAI) {
      alert('You have reached your usage limits for this feature.');
      navigate('/plans');
      return;
    }

    if (!jobDescription.trim()) return;

    // Show ad for free tier users before starting the tailoring process
    if (isFreePlan) {
      setShowAd(true);
      return;
    }

    startTailoring(true);
  };

  // Function to actually start the tailoring process
  const startTailoring = async (useAI: boolean) => {
    setIsTailoring(true);

    try {
      // Call the real API endpoint to tailor the CV
      const { cvId: tailoredCVId } = await cvsService.tailorCV(
        jobDescription,
        companyName,
        includeCoverLetter,
        useAI
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

  const handleManualTailoring = async () => {
    startTailoring(false);
  };

  // Close ad and proceed with tailoring
  const handleAdClose = () => {
    setShowAd(false);
    startTailoring(true);
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
      {/* Advertisement Modal */}
      {showAd && <AdvertisementModal onClose={handleAdClose} />}

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 col-span-2">
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
              <div className="border pb-4 mb-4">
                <span>
                  <input
                    type="checkbox"
                    checked={includeCoverLetter}
                    onChange={e => setIncludeCoverLetter(e.target.checked)}
                    className="mt-4 mr-2"
                  />
                  Include Cover Letter
                </span>

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
                        Tailoring...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Tailor using AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <Button className={`mt-6 cursor-pointer ${!jobDescription.trim() || isLoadingSubscription || !companyName
                ? "hidden" : ""}`} variant="link" onClick={handleManualTailoring} disabled={isTailoring}  >
                {includeCoverLetter ? "Continue without AI Tailoring.   Use AI only for the cover letter" : "Continue without AI Tailoring"}
              </Button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}


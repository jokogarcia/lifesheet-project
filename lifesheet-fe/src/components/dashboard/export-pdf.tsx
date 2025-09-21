import { useUserCV } from '@/hooks/use-cv';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowDown, ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  getPDFv2,
  defaultLeftColumnSections,
  defaultPdfOptions,
  defaultSectionOrder,
  type CV,
  type TailoredData,
} from '@/services/cvs-service';
import { CVPreviewer } from '@/cv-printer/cv-previewer';
import ReactMarkdown from 'react-markdown';
import { EditableCV } from '../ui/editable-cv';
import { FormattedMessage, useIntl } from 'react-intl';
import posthog from 'posthog-js';
import { useAuth } from '@/hooks/auth-hook';

export function ExportPdf() {
  const intl = useIntl();
  const queryParams = new URLSearchParams(useLocation().search);
  const {
    cv: originalCV,
    isLoading,
    error: cvError,
    saveCV,
  } = useUserCV(queryParams.get('cvId') || undefined);
  const navigate = useNavigate();
  const [cv, setCV] = useState<CV | null>(originalCV);
  const [printMode, setPrintMode] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isCoverLetterVisible, setIsCoverLetterVisible] = useState(true);
  const pdfOptions = cv?.tailored?.pdfOptions || defaultPdfOptions;
  const { getAccessTokenSilently } = useAuth();

  useEffect(() => {
    if (!originalCV) return;
    const tailored: TailoredData = originalCV.tailored ?? {
      jobDescription_id: '',
      coverLetter: '',
      tailoredDate: '',
      updatedByUser: true,
      sectionOrder: defaultSectionOrder,
      leftColumnSections: defaultLeftColumnSections,
      pdfOptions: defaultPdfOptions
    };
    if (!originalCV.tailored?.sectionOrder || originalCV.tailored.sectionOrder.length === 0) {
      tailored.sectionOrder = defaultSectionOrder;
    }
    setCV({ ...originalCV, tailored });
    if (originalCV.tailored?.coverLetter) {
      setCoverLetter(originalCV.tailored.coverLetter);
    } else {
      setIsCoverLetterVisible(false);
    }
  }, [originalCV]);

  useEffect(() => {
    setCV(prevCv => {
      if (prevCv?.tailored) {
        // Avoid a re-render if the cover letter content hasn't actually changed
        const newCoverLetter = isCoverLetterVisible ? coverLetter : '';
        if (prevCv.tailored.coverLetter === newCoverLetter) {
          return prevCv;
        }
        return { ...prevCv, tailored: { ...prevCv.tailored, coverLetter: newCoverLetter } };
      }
      return prevCv;
    });
  }, [coverLetter, isCoverLetterVisible]);

  const previewRef = useRef<HTMLDivElement>(null);

  async function handleSave() {
    setPrintMode(true);
    if (!cv) return;
    await saveCV(cv._id, cv);
    try {
      console.log(intl.formatMessage({ id: 'exportPdf.generatingPdf', defaultMessage: 'Generating PDF...' }));
      const html = document.getElementById('rendered-cv-container')?.outerHTML;

      if (!html) throw new Error(intl.formatMessage({ id: 'exportPdf.errorGettingHtml', defaultMessage: 'Error getting raw HTML' }));

      const token = await getAccessTokenSilently();
      const pdfBlob = await getPDFv2(
        token,
        html,
        pdfOptions.pictureId,
        originalCV?.personal_info.fullName + '- CV'
      );
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.target = "_blank"
      document.body.appendChild(a);
      //a.download = `${originalCV?.personal_info.fullName || 'my-cv'}.pdf`;

      a.click();
      document.body.removeChild(a);
      posthog.capture('cv_pdf_exported');
    } catch (error) {
      console.error(intl.formatMessage({ id: 'exportPdf.errorGeneratingPdf', defaultMessage: 'Error generating PDF:' }), error);
    } finally {
      setPrintMode(false);
    }
  }


  if (cvError) {
    return (
      <div>
        <div className="text-sm text-red-500">
          <FormattedMessage id="exportPdf.unableToLoad" defaultMessage="Unable to load this CV" />
        </div>
        <Button onClick={() => navigate('/')} variant="outline" className="btn-custom">
          <FormattedMessage id="exportPdf.goBack" defaultMessage="Go back" />
        </Button>
      </div>
    );
  }
  if (isLoading || !cv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">
            <FormattedMessage id="exportPdf.loadingCV" defaultMessage="Loading your CV data..." />
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-align-left">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-gradient">
            <FormattedMessage id="exportPdf.title" defaultMessage="Export your CV as PDF" />
          </h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/')} variant="outline" className="btn-custom">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <FormattedMessage id="exportPdf.backToDashboard" defaultMessage="Back to Dashboard" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs" style={{ textAlign: 'left' }}>
        <div className="card-hover bg-gradient-subtle">

          <EditableCV cv={cv} setCV={setCV} />
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-6 space-y-4 card-hover bg-gradient-subtle">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              <FormattedMessage id="exportPdf.preview" defaultMessage="Preview" />
            </h3>{' '}
            <Button onClick={handleSave} variant="default" className="btn-custom h-8">
              <ArrowDown className="h-4 w-4 mr-2" />
              <FormattedMessage id="exportPdf.download" defaultMessage="Download" />
            </Button>
          </div>
          <div
            style={{
              width: '115mm',
              height: `${297 / 2}mm`,
              overflowY: 'visible',
              overflowX: 'hidden',
              border: '1px solid lightgray',
            }}
          >
            <div
              ref={previewRef}
              style={{
                border: '1px solid #eee',
                borderRadius: '0.5rem',
                margin: '1rem',
                width: '450px',
                height: '634px',
                transformOrigin: '0 0',
                transform: 'scale(0.5)',
              }}
            >
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2">
                    <FormattedMessage id="exportPdf.loadingPreview" defaultMessage="Loading preview..." />
                  </p>
                </div>
              ) : (
                <CVPreviewer cvData={cv!} printMode={printMode} />
              )}
            </div>
          </div>
        </div>
      </div>
      {cv.tailored && <TailoredForSection data={cv.tailored}></TailoredForSection>}
    </div >
  );
}

function TailoredForSection({ data }: { data: TailoredData }) {
  if (!data || !data.jobDescription_id || typeof data.jobDescription_id === 'string') return null;
  return (
    <div className="border-t border-gray-200 pt-4 text-left">
      <h3 className="text-lg font-medium">
        <FormattedMessage
          id="exportPdf.tailoredFor"
          defaultMessage="Tailored For {company}"
          values={{ company: data.jobDescription_id.companyName }}
        />
      </h3>
      <p className="text-sm text-muted-foreground">
        <FormattedMessage
          id="exportPdf.tailoredOn"
          defaultMessage="On {date}"
          values={{ date: new Date(data.tailoredDate).toLocaleDateString() }}
        />
      </p>
      <p className="text-sm text-muted-foreground">
        <FormattedMessage id="exportPdf.jobDescription" defaultMessage="Job Description:" />
      </p>
      <div className="border-l-2 border-gray-200 pl-4">
        <ReactMarkdown>{data.jobDescription_id.content}</ReactMarkdown>
      </div>
    </div>
  );
}
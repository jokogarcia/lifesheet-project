import { useUserCV } from '@/hooks/use-cv';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowDown, ArrowLeft, ChevronDown, File, FileX, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  cvsService,
  defaultLeftColumnSections,
  defaultPdfOptions,
  defaultSectionOrder,
  type CV,
  type CVToPDFOptions,
  type TailoredData,
} from '@/services/cvs-service';
import PictureSelector from '@/components/export/picture-selector';
import { CVPreviewer } from '@/cv-printer/cv-previewer';
import userService from '@/services/user-service';
import RichTextEditor from './ui/editor';
import ReactMarkdown from 'react-markdown';
import { TabContainer } from './ui/tab-container';
import { EditableCV } from './ui/editable-cv';
export function ExportPdf() {
  const queryParams = new URLSearchParams(useLocation().search);
  const {
    cv: originalCV,
    isLoading,
    error: cvError,
  } = useUserCV(queryParams.get('cvId') || undefined);
  const navigate = useNavigate();
  const [cv, setCV] = useState<CV | null>(originalCV);
  const [printMode, setPrintMode] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isCoverLetterVisible, setIsCoverLetterVisible] = useState(true);
  // const [pdfOptions, setPdfOptions] = useState<CVToPDFOptions>({
  //   primaryColorOverride: '#3b82f6',
  //   secondaryColorOverride: '#f97316',
  //   textColorOverride: '#111827',
  //   text2ColorOverride: '#4b5563',
  //   backgroundColorOverride: '#ffffff',
  //   template: 'single-column-1',
  //   includeAddress: true,
  //   includePhone: true,
  // });
  function setPdfOptions(options: CVToPDFOptions) {
    if (!cv?.tailored) return;
    const newCv = { ...cv, tailored: { ...cv.tailored, pdfOptions: options } };
    setCV(newCv);
  }
  const pdfOptions = cv?.tailored?.pdfOptions || defaultPdfOptions;
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
    if (!originalCV.tailored?.sectionOrder) {
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
    try {
      const html = document.getElementById('rendered-cv-container')?.outerHTML;
      if (!html) throw new Error('Error getting raw HTML');
      const pdfBlob = await cvsService.getPDFv2(
        html,
        pdfOptions.pictureId,
        originalCV?.personal_info.fullName + '- CV'
      );
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      //a.download = "cv.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPrintMode(false);
    }
  }

  async function handlePictureSelected(pictureId: string | undefined): Promise<void> {
    setPdfOptions({ pictureId, ...pdfOptions });
    if (cv) {
      const shareUrl = pictureId ? await userService.getPictureShareLink(pictureId) : '';
      setCV({ ...cv, personal_info: { ...cv.personal_info, profilePictureUrl: shareUrl } });
      console.log('Got picture URL:', shareUrl);
    }
  }
  if (cvError) {
    return (
      <div>
        <div className="text-sm text-red-500">Unable to load this CV</div>
        <Button onClick={() => navigate('/')} variant="outline" className="btn-custom">
          Go back
        </Button>
      </div>
    );
  }
  if (isLoading || !cv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading your CV data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-align-left">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-gradient">Export your CV as PDF</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/')} variant="outline" className="btn-custom">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs" style={{ textAlign: 'left' }}>
        <div className="card-hover bg-gradient-subtle">

          <EditableCV cv={cv} reRender={() => { console.log("updating...."); setCV({ ...cv }) }} />
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-6 space-y-4 card-hover bg-gradient-subtle">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Preview</h3>{' '}
            <Button onClick={handleSave} variant="default" className="btn-custom h-8">
              <ArrowDown className="h-4 w-4 mr-2" />
              Download
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
                  <p className="mt-2">Loading preview...</p>
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
      <h3 className="text-lg font-medium">Tailored For {data.jobDescription_id.companyName}</h3>
      <p className="text-sm text-muted-foreground">
        On {new Date(data.tailoredDate).toLocaleDateString()}
      </p>
      <p className="text-sm text-muted-foreground">Job Description:</p>
      <div className="border-l-2 border-gray-200 pl-4">
        <ReactMarkdown>{data.jobDescription_id.content}</ReactMarkdown>
      </div>
    </div>
  );
}

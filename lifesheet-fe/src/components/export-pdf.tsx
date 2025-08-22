import { useUserCV } from "@/hooks/use-cv"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { ArrowDown, ArrowLeft, ChevronDown, Settings } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cvsService, type CV, type CVToPDFOptions } from "@/services/cvs-service"
import PictureSelector from "@/components/export/picture-selector"
import { CVPreviewer } from "@/cv-printer/cv-previewer"
import userService from "@/services/user-service"

export function ExportPdf() {
    const [isSettingsVisible, setIsSettingsVisible] = useState(false)
    const { cv: originalCV, isLoading } = useUserCV()
    const navigate = useNavigate()
    const [cv, setCV] = useState<CV | null>(originalCV)
    const [printMode, setPrintMode] = useState(false)
    const [pdfOptions, setPdfOptions] = useState<CVToPDFOptions>({
        primaryColorOverride: "#3b82f6",
        secondaryColorOverride: "#f97316",
        textColorOverride: "#111827",
        text2ColorOverride: "#4b5563",
        backgroundColorOverride: "#ffffff",
        template: "single-column-1",
        includeAddress: true,
        includePhone: true,

    })
    useEffect(() => {
        setCV(originalCV);
    }, [originalCV]);
    const previewRef = useRef<HTMLDivElement>(null)

    async function handleSave() {
        setPrintMode(true);
        try {
            const html = document.getElementById("rendered-cv-container")?.outerHTML;
            if (!html) throw new Error("Error getting raw HTML")
            const pdfBlob = await cvsService.getPDFv2(html, pdfOptions.pictureId, originalCV?.personal_info.fullName + "- CV");
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = url;
            //a.download = "cv.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (error) {
            console.error("Error generating PDF:", error);
        }
        finally {
            setPrintMode(false);
        }
    }
    if (isLoading || !cv) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2">Loading your CV data...</p>
                </div>
            </div>
        )
    }
    async function handlePictureSelected(pictureId: string | undefined): Promise<void> {
        setPdfOptions({ pictureId, ...pdfOptions });
        if (cv) {
            const shareUrl = pictureId ? await userService.getPictureShareLink(pictureId) : "";
            setCV({ ...cv, personal_info: { ...cv.personal_info, profilePictureUrl: shareUrl } });
            console.log("Got picture URL:", shareUrl)
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 text-align-left">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl text-gradient">Export your CV as PDF</h1>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate("/")} variant="outline" className="btn-custom">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs" style={{ textAlign: "left" }}>
                <div className="border rounded-lg p-4 card-hover bg-gradient-subtle">
                    <div className="flex items-center gap-3 mb-2 hover:cursor-pointer hover:bg-gray-100"
                            onClick={() => setIsSettingsVisible(!isSettingsVisible)}>
                        <Settings className="h-5 w-5 text-gray-600" />
                        <h3 className="text-base font-medium">Customize</h3>
                        <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${isSettingsVisible ? "rotate-180" : ""}`} />
                    </div>
                    <div className={`space-y-3 ${isSettingsVisible ? "block" : "hidden"}`}>{/*accordion content*/}
                        <div>
                            <div className="mb-1 font-medium">Template</div>
                            <div className="flex gap-3 ml-5">
                                <label className="inline-flex items-center ">
                                    <input type="radio" name="template" value="two-column-1" checked={pdfOptions.template === "two-column-1"} onChange={() => setPdfOptions({ ...pdfOptions, template: "two-column-1" })} className="form-radio" />
                                    <span className="ml-2">Two column</span>
                                </label>
                                <label className="inline-flex items-center ">
                                    <input type="radio" name="template" value="single-column-1" checked={pdfOptions.template === "single-column-1"} onChange={() => setPdfOptions({ ...pdfOptions, template: "single-column-1" })} className="form-radio" />
                                    <span className="ml-2">Single column</span>
                                </label>
                            </div>
                        </div>
                        <PictureSelector onPictureSelected={handlePictureSelected} />


                        <div>
                            <div className="mb-1 font-medium">Personal info</div>
                            <div className="grid grid-cols-2 gap-2 ml-5">
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={!!cv?.personal_info.email && (pdfOptions.includeEmail ?? true)} disabled={!cv?.personal_info.email} onChange={(e) => setPdfOptions({ ...pdfOptions, includeEmail: e.target.checked })} className="form-checkbox" />
                                    <span>Include email</span>
                                </label>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={!!cv?.personal_info.phone && (pdfOptions.includePhone ?? true)} disabled={!cv?.personal_info.phone} onChange={(e) => setPdfOptions({ ...pdfOptions, includePhone: e.target.checked })} className="form-checkbox" />
                                    <span>Include phone</span>
                                </label>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={!!cv?.personal_info.location && (pdfOptions.includeAddress ?? true)} disabled={!cv?.personal_info.location} onChange={(e) => setPdfOptions({ ...pdfOptions, includeAddress: e.target.checked })} className="form-checkbox" />
                                    <span>Include address</span>
                                </label>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={!!cv?.personal_info.dateOfBirth && (pdfOptions.includeDateOfBirth ?? true)} disabled={!cv?.personal_info.dateOfBirth} onChange={(e) => setPdfOptions({ ...pdfOptions, includeDateOfBirth: e.target.checked })} className="form-checkbox" />
                                    <span>Include DOB</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 font-medium">Colors</div>
                            <div className="grid grid-cols-2 gap-2 ml-5">
                                <div className="flex ">
                                    <input type="color" value={pdfOptions.primaryColorOverride} onChange={(e) => setPdfOptions({ ...pdfOptions, primaryColorOverride: e.target.value })} className="h-6 w-6 p-0" />
                                    <span className="ml-2">Primary</span>

                                </div>
                                <div className="flex ">
                                    <input type="color" value={pdfOptions.secondaryColorOverride} onChange={(e) => setPdfOptions({ ...pdfOptions, secondaryColorOverride: e.target.value })} className="h-6 w-6 p-0" />
                                    <span className="ml-2">Secondary</span>

                                </div>
                                <div className="flex ">
                                    <input type="color" value={pdfOptions.textColorOverride} onChange={(e) => setPdfOptions({ ...pdfOptions, textColorOverride: e.target.value })} className="h-6 w-6 p-0" />
                                    <span className="ml-2">Text</span>

                                </div>
                                <div className="flex ">
                                    <input type="color" value={pdfOptions.backgroundColorOverride} onChange={(e) => setPdfOptions({ ...pdfOptions, backgroundColorOverride: e.target.value })} className="h-6 w-6 p-0" />
                                    <span className="ml-2">Background</span>

                                </div>
                            </div>
                        </div>


                    </div>
                </div>
                {/* Preview */}
                <div className="border rounded-lg p-6 space-y-4 card-hover bg-gradient-subtle">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Preview</h3> <Button onClick={handleSave} variant="default" className="btn-custom h-8">
                            <ArrowDown className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>
                    <div style={{ width: '115mm', height: `${297 / 2}mm`, overflowY: 'visible', overflowX: 'hidden', border: '1px solid lightgray' }}>
                        <div ref={previewRef} style={{
                            border: '1px solid #eee',
                            borderRadius: '0.5rem',
                            margin: '1rem',
                            width: '450px',
                            height: '634px',
                            transformOrigin: '0 0',
                            transform: 'scale(0.5)'
                        }}>{isLoading ? (
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="mt-2">Loading preview...</p>
                            </div>
                        ) : <CVPreviewer cvData={cv!} options={pdfOptions} printMode={printMode} />}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )

}




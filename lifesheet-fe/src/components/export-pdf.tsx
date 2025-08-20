import { useUserCV } from "@/hooks/use-cv"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cvsService, type CVToPDFOptions } from "@/services/cvs-service"
import PictureSelector from "@/components/export/picture-selector"
import { CVPreviewer } from "@/cv-printer/cv-previewer"
export function ExportPdf() {
    const { cv, isLoading } = useUserCV()
    const navigate = useNavigate()
    const [pictures] = useState<string[]>([])
    const [isLoadingPictures] = useState(false)
    const [pdfOptions, setPdfOptions] = useState<CVToPDFOptions>({
        primaryColorOverride:"#3b82f6",
        secondaryColorOverride:"#f97316",
        textColorOverride:"#111827",
        text2ColorOverride:"#4b5563",
        backgroundColorOverride:"#ffffff",
        includeAddress: true,
        includePhone: true,

    })
    
    const previewRef = useRef<HTMLDivElement>(null)
    

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
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6 space-y-4 card-hover bg-gradient-subtle">
                    <div className="flex items-center justify-between">
                        {/* Cusomize form */}
                        <div className="flex  gap-2 flex-col">
                            <div className="flex items-align-center"><Settings className="h-3 w-3 mr-2" />
                            <h4 className="font-semibold text-lg">Customize</h4>
                            </div>
                            <div className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium">Template Style</h4>
                                    <div className="flex gap-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="template"
                                                value="two-column-1"
                                                checked={pdfOptions.template === "two-column-1"}
                                                onChange={() => setPdfOptions({ ...pdfOptions, template: "two-column-1" })}
                                                className="form-radio"
                                            />
                                            <span>Two Column</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="template"
                                                value="single-column-1"
                                                checked={pdfOptions.template === "single-column-1"}
                                                onChange={() => setPdfOptions({ ...pdfOptions, template: "single-column-1" })}
                                                className="form-radio"
                                            />
                                            <span>Single Column</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium">Color Scheme</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm">Primary Color</label>
                                            <input
                                                type="color"
                                                value={pdfOptions.primaryColorOverride}
                                                onChange={(e) => setPdfOptions({ ...pdfOptions, primaryColorOverride: e.target.value })}
                                                className="block w-full h-8 mt-1 rounded cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm">Secondary Color</label>
                                            <input
                                                type="color"
                                                value={pdfOptions.secondaryColorOverride}
                                                onChange={(e) => setPdfOptions({ ...pdfOptions, secondaryColorOverride: e.target.value })}
                                                className="block w-full h-8 mt-1 rounded cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm">Text Color</label>
                                            <input
                                                type="color"
                                                value={pdfOptions.textColorOverride}
                                                onChange={(e) => setPdfOptions({ ...pdfOptions, textColorOverride: e.target.value })}
                                                className="block w-full h-8 mt-1 rounded cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm">Background Color</label>
                                            <input
                                                type="color"
                                                value={pdfOptions.backgroundColorOverride}
                                                onChange={(e) => setPdfOptions({ ...pdfOptions, backgroundColorOverride: e.target.value })}
                                                className="block w-full h-8 mt-1 rounded cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm">Accent Color</label>
                                            <input
                                                type="color"
                                                value={pdfOptions.text2ColorOverride}
                                                onChange={(e) => setPdfOptions({ ...pdfOptions, text2ColorOverride: e.target.value })}
                                                className="block w-full h-8 mt-1 rounded cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3>Personal Information</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!cv?.personal_info.email && (pdfOptions.includeEmail ?? true)}
                                                disabled={!cv?.personal_info.email}
                                                onChange={(e) => setPdfOptions({ ...pdfOptions, includeEmail: e.target.checked })}
                                                className="form-checkbox"
                                            />
                                            <span>Include Email</span>
                                        </label>

                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!cv?.personal_info.phone && (pdfOptions.includePhone ?? true)}
                                                disabled={!cv?.personal_info.phone}
                                                onChange={(e) => setPdfOptions({ ...pdfOptions, includePhone: e.target.checked })}
                                                className="form-checkbox"
                                            />
                                            <span>Include Phone Number</span>
                                        </label>

                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!cv?.personal_info.location && (pdfOptions.includeAddress ?? true)}
                                                disabled={!cv?.personal_info.location}
                                                onChange={(e) => setPdfOptions({ ...pdfOptions, includeAddress: e.target.checked })}
                                                className="form-checkbox"
                                            />
                                            <span>Include Address</span>
                                        </label>

                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!cv?.personal_info.dateOfBirth && (pdfOptions.includeDateOfBirth ?? true)}
                                                disabled={!cv?.personal_info.dateOfBirth}
                                                onChange={(e) => setPdfOptions({ ...pdfOptions, includeDateOfBirth: e.target.checked })}
                                                className="form-checkbox"
                                            />
                                            <span>Include Date of Birth</span>
                                        </label>
                                    </div>
                                </div>
                                <PictureSelector
                                    pictures={pictures}
                                    isLoadingPictures={isLoadingPictures}
                                    pdfOptions={pdfOptions}
                                    setPdfOptions={setPdfOptions}
                                />
                            </div>
                        </div> {/* END Cusomize form */}

                    </div>
                </div>
                {/* Preview */}
                <div className="border rounded-lg p-6 space-y-4 card-hover bg-gradient-subtle">
                    <h3 className="text-lg font-medium">Preview</h3>
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
                        ) : <CVPreviewer cvData={cv!} options={pdfOptions} printMode={false} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}
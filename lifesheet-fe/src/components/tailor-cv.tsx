"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Wand2, Maximize, Printer, User, Check } from "lucide-react"
import { useUserCV } from "@/hooks/use-cv"
import { useNavigate } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import cvsService from "@/services/cvs-service"
import userService from "@/services/user-service"
import { SecureImg } from "@/components/ui/secure-img"

export function TailorCV() {
  const { cv, isLoading } = useUserCV()
  const navigate = useNavigate()
  const [jobDescription, setJobDescription] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [tailoredCVPDF, setTailoredCVPDF] = useState<Blob | null>(null)
  const [isTailoring, setIsTailoring] = useState(false)
  const [pictures, setPictures] = useState<string[]>([])
  const [selectedPictureId, setSelectedPictureId] = useState<string | null>(null)
  const [isLoadingPictures, setIsLoadingPictures] = useState(false)

  // Load user pictures
  useEffect(() => {
    const loadPictures = async () => {
      setIsLoadingPictures(true)
      try {
        const userPictures = await userService.getUserPictures()
        setPictures(userPictures)
      } catch (error) {
        console.error("Error loading pictures:", error)
      } finally {
        setIsLoadingPictures(false)
      }
    }
    loadPictures()
  }, [])

  const handleTailorCV = async () => {
    if (!jobDescription.trim()) return

    setIsTailoring(true)

    try {
      // Call the real API endpoint to tailor the CV
      const tailoredResult = await cvsService.tailorCV(jobDescription, selectedPictureId || undefined);
      const pdfBlob = await cvsService.getCVPDF(tailoredResult.cvId, selectedPictureId || undefined);
      setTailoredCVPDF(pdfBlob);
    } catch (error) {
      console.error("Error tailoring CV:", error);
      // Show error message to user
      alert("Failed to tailor CV. Please try again.");
    } finally {
      setIsTailoring(false);
    }
  }

  if (isLoading) {
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
          <h1 className="text-3xl text-gradient">Tailor CV to Job</h1>
          <p className="text-muted-foreground">Customize your CV for a specific job application</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/")} variant="outline" className="btn-custom">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {!cv ? (
        <div className="text-center py-12 border rounded-lg p-6">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No CV data available</h3>
          <p className="text-muted-foreground mb-4">Please create your CV first before tailoring it to a job</p>
          <Button onClick={() => navigate("/")}>
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border rounded-lg p-6 space-y-4 card-hover bg-gradient-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Job Description</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPreviewMode(!previewMode)}
                    variant="outline"
                    size="sm"
                    className="btn-custom"
                  >
                    {previewMode ? "Edit" : "Preview"}
                  </Button>
                </div>
              </div>

              {previewMode ? (
                <div className="border rounded-lg p-4 min-h-[300px] prose max-w-none">
                  <ReactMarkdown>{jobDescription}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here... Markdown formatting is supported."
                  rows={12}
                  className="w-full border rounded-lg p-4 font-mono"
                />
              )}

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Supports Markdown formatting for better organization
                </p>
              </div>
            </div>

            {/* Picture Selection Section */}
            <div className="border rounded-lg p-6 space-y-4 card-hover bg-gradient-subtle">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Profile Picture (Optional)</h3>
              </div>

              {isLoadingPictures ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading pictures...</p>
                </div>
              ) : pictures.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No pictures uploaded yet</p>
                  <p className="text-sm text-muted-foreground">Upload pictures in your CV dashboard first</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Choose a picture to include in your tailored CV
                  </p>
                  
                  {/* No Picture Option */}
                  <div
                    onClick={() => setSelectedPictureId(null)}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedPictureId === null
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">No picture</p>
                      <p className="text-sm text-muted-foreground">Don't include a profile picture</p>
                    </div>
                    {selectedPictureId === null && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>

                  {/* Picture Options */}
                  <div className="grid grid-cols-1 gap-2">
                    {pictures.map((pictureId, index) => (
                      <div
                        key={pictureId}
                        onClick={() => setSelectedPictureId(pictureId)}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedPictureId === pictureId
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 bg-gray-100">
                          <SecureImg
                            pictureId={pictureId}
                            alt={`Profile picture ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Picture {index + 1}</p>
                          <p className="text-sm text-muted-foreground">Profile picture option</p>
                        </div>
                        {selectedPictureId === pictureId && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tailor Button */}
            <div className="space-y-3">
              {/* Summary of selected options */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">CV Configuration:</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    Picture: {selectedPictureId ? `Picture ${pictures.indexOf(selectedPictureId) + 1}` : "No picture"}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleTailorCV}
                disabled={!jobDescription.trim() || isTailoring}
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

          <div className="space-y-4">
            <div className="border rounded-lg p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Tailored CV Preview</h3>
                </div>
                {tailoredCVPDF && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Maximize className="h-4 w-4 mr-2" />
                      Full Screen
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                )}
              </div>

              {tailoredCVPDF ? (
                <div className="space-y-4">
                  <iframe
                    src={URL.createObjectURL(tailoredCVPDF)}
                    className="w-full h-[500px] border rounded-lg"
                    title="Tailored CV Preview"
                  ></iframe>

                 

                  <Button className="w-full">
                    Download Tailored CV
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Your tailored CV will appear here after you click "Tailor My CV"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

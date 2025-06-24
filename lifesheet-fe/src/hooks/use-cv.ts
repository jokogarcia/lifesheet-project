"use client"

import { useState, useEffect, useCallback } from "react"
import cvsService, { type CV, type CreateOrUpdateCVRequest } from "../services/cvs-service"

export function useUserCV() {
  const [cv, setCV] = useState<CV | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fetchCV = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedCV = await cvsService.getUserCV()
      setCV(fetchedCV)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch CV"
      setError(errorMessage)
      console.error("Error fetching CV:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveCV = async (cvData: CreateOrUpdateCVRequest): Promise<CV> => {
    try {
      setIsSaving(true)
      setError(null)
      const savedCV = await cvsService.createOrUpdateCV(cvData)
      setCV(savedCV)
      return savedCV
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save CV"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteCV = async (): Promise<void> => {
    try {
      setError(null)
      await cvsService.deleteCV()
      setCV(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete CV"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchCV()
  }, [fetchCV])

  return {
    cv,
    isLoading,
    isSaving,
    error,
    saveCV,
    deleteCV,
    refetch: fetchCV,
  }
}

"use client";
import { useState } from "react";
import { rscmApi } from "@/lib/rscm-api";
import { toast } from "sonner";

export const useOnboarding = (onSuccess) => {
  const [step, setStep] = useState("upload"); // upload | review | saving
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  // Step 1: Handle File Upload
  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    try {
      const result = await rscmApi.parseCv(file);

      // Transform backend response to form state
      const raw = result.extracted || {};
      const profile = raw.candidate_profile || {};

      setExtractedData({
        name: profile.name || "",
        email: profile.email || "",
        role: "employee", // Default
        department: "Engineering", // Default
        bio: raw.summary_bio || "",
        skills: raw.skills || [],
      });

      setStep("review");
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse resume");
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Handle Final Submission
  const handleFinalize = async (finalData) => {
    setIsProcessing(true);
    try {
      await rscmApi.finalizeUser(finalData);
      toast.success(`${finalData.name} onboarded successfully`);

      // Reset flow
      setStep("upload");
      setExtractedData(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelReview = () => {
    setStep("upload");
    setExtractedData(null);
  };

  return {
    step,
    isProcessing,
    extractedData,
    handleFileUpload,
    handleFinalize,
    cancelReview,
  };
};

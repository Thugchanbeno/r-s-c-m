"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/user/ProfileComponents";

export const CVUploader = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);

      try {
        const apiKey = process.env.NEXT_PUBLIC_LLAMA_CLOUD_API_KEY;
        if (!apiKey) {
          throw new Error("NEXT_PUBLIC_LLAMA_CLOUD_API_KEY is not set");
        }

        setLoadingMessage("Uploading document to LlamaParse...");

        const formData = new FormData();
        formData.append("file", file, file.name);

        const baseUrl = "https://api.cloud.llamaindex.ai/api/parsing";
        const uploadUrl = `${baseUrl}/upload`;

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(
            `Upload failed: ${uploadResponse.status} - ${errorText}`
          );
        }

        const uploadResult = await uploadResponse.json();
        const jobId = uploadResult.id;
        if (!jobId) {
          throw new Error("No job ID returned from upload");
        }

        const statusUrl = `${baseUrl}/job/${jobId}`;
        setLoadingMessage("Processing document...");

        let jobCompleted = false;
        let attempts = 0;
        const maxAttempts = 60;

        while (!jobCompleted && attempts < maxAttempts) {
          attempts++;

          const statusResponse = await fetch(statusUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          });

          if (!statusResponse.ok) {
            const errorText = await statusResponse.text();
            throw new Error(
              `Status check failed: ${statusResponse.status} - ${errorText}`
            );
          }

          const statusData = await statusResponse.json();
          const status = statusData.status;

          if (status === "SUCCESS") {
            jobCompleted = true;
          } else if (status === "ERROR" || status === "FAILED") {
            const errorMsg =
              statusData.error || statusData.message || "Unknown error";
            throw new Error(
              `Job failed with status: ${status}. Error: ${errorMsg}`
            );
          } else if (status === "PENDING" || status === "RUNNING") {
            setLoadingMessage(
              `Processing document... (${attempts}/${maxAttempts}) - Status: ${status}`
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            setLoadingMessage(
              `Processing document... (${attempts}/${maxAttempts}) - Status: ${status}`
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        if (!jobCompleted) {
          throw new Error(
            "Timeout waiting for document processing. Please try again."
          );
        }

        setLoadingMessage("Retrieving processed text...");
        const resultType = "text";
        const resultUrl = `${baseUrl}/job/${jobId}/result/${resultType}`;

        const resultResponse = await fetch(resultUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!resultResponse.ok) {
          const errorText = await resultResponse.text();
          throw new Error(
            `Failed to get results: ${resultResponse.status} - ${errorText}`
          );
        }

        const resultData = await resultResponse.json();
        const rawText = resultData[resultType] || resultData.text || "";

        if (!rawText) {
          throw new Error(
            "LlamaParse could not extract text from the document."
          );
        }

        setLoadingMessage("Extracting data from CV...");

        const backendPayload = {
          text: rawText,
          fileName: file.name,
          cacheResult: true,
        };

        const response = await fetch("/api/cv/extract-entities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backendPayload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Backend failed to extract data.");
        }

        const entityData = result.data || {};
        const skills = entityData.skills || [];
        const personalInfo = entityData.personal_info || {};
        const experience = entityData.experience || [];
        const education = entityData.education || [];

        const finalData = {
          prepopulatedData: {
            name: personalInfo.name || null,
            email: personalInfo.email || null,
            phone: personalInfo.phone || null,
            skills: skills,
            experience: experience,
            education: education,
          },
          rawEntities: entityData,
        };

        onSuccess(finalData);
      } catch (err) {
        console.error("CV Upload Error:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300",
          "border-muted-foreground/50 bg-background",
          isDragActive
            ? "border-primary bg-primary/10"
            : "hover:border-primary/70 hover:bg-muted"
        )}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="text-center">
            <LoadingSpinner size={32} />
            <p className="mt-4 text-muted-foreground">{loadingMessage}</p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <UploadCloud className="mx-auto h-10 w-10 mb-3 text-primary" />
            <p className="font-semibold text-foreground">
              Drop CV here or click to upload
            </p>
            <p className="text-xs mt-1">PDF or DOCX format recommended</p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}
    </motion.div>
  );
};

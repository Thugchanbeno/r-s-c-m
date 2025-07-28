"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { LlamaParse } from "llama-parse";
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
        setLoadingMessage("Parsing document with LlamaParse...");
        const parser = new LlamaParse({
          apiKey: process.env.NEXT_PUBLIC_LLAMA_CLOUD_API_KEY,
          resultType: "text",
        });

        const documents = await parser.loadData(file);
        const rawText = documents[0]?.text || "";

        if (!rawText) {
          throw new Error(
            "LlamaParse could not extract text from the document."
          );
        }

        setLoadingMessage("Extracting and normalizing skills...");
        const response = await fetch("/api/recommendations/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: rawText,
            fileName: file.name,
            cacheResult: true,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Backend failed to extract skills.");
        }

        const skills = result.data || [];
        const emailMatch = rawText.match(/[\w\.-]+@[\w\.-]+/);
        const phoneMatch = rawText.match(
          /(\(?\d{3}\)?[\s\.-]?)?\d{3}[\s\.-]?\d{4}/
        );

        const finalData = {
          prepopulatedData: {
            name: null,
            email: emailMatch ? emailMatch[0] : null,
            phone: phoneMatch ? phoneMatch[0] : null,
            skills: skills,
          },
        };

        onSuccess(finalData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
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
            <p className="text-xs mt-1">PDF format recommended</p>
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

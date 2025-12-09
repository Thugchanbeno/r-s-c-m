"use client";
import { useState, useRef } from "react";
import { UploadCloud, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CvUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      toast.success("CV processed and user created successfully!");
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (error) {
      console.error(error);
      toast.error("Failed to process CV. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-[#3d2346] mb-1">Upload CV</h2>
      <p className="text-sm text-gray-500 mb-4">
        Upload a resume to automatically extract skills and onboard a user.
      </p>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors text-center ${
          isDragging
            ? "border-[#3d2346] bg-purple-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">PDF only (max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
            />
          </>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              disabled={isUploading}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-4">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 bg-[#3d2346] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#2a1830] transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Process & Onboard
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

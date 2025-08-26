"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FileUpload({
  onFileSelect,
  accept = "*",
  disabled = false,
  className = "",
  children,
}) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled}
        className={className}
      >
        {children || (
          <>
            <Upload className="h-4 w-4 mr-1" />
            Upload File
          </>
        )}
      </Button>
    </>
  );
}

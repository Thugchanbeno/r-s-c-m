"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, UploadCloud, ArrowLeft } from "lucide-react";
import { ProfileHeader } from "@/components/user/ProfileComponents"; // Adjust this import path if needed
import { CVUploader } from "@/components/admin/CVUploader"; // We will create this
import { UserCreationForm } from "@/components/admin/UserCreationForm"; // We will create this
import Button from "@/components/common/Button";
import { fadeIn } from "@/lib/animations";

export default function CreateUserPage() {
  const [view, setView] = useState("selection"); // 'selection', 'manual', 'cvUploader', 'cvForm'
  const [prefilledData, setPrefilledData] = useState(null);

  const handleParseSuccess = (data) => {
    setPrefilledData(data.prepopulatedData);
    setView("cvForm");
  };

  const resetView = () => {
    setView("selection");
    setPrefilledData(null);
  };

  const renderContent = () => {
    switch (view) {
      case "manual":
        return <UserCreationForm onBack={resetView} />;
      case "cvUploader":
        return <CVUploader onSuccess={handleParseSuccess} onBack={resetView} />;
      case "cvForm":
        return (
          <UserCreationForm initialData={prefilledData} onBack={resetView} />
        );
      case "selection":
      default:
        return (
          <motion.div
            variants={fadeIn}
            className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView("manual")}
              className="w-64 h-16 text-base"
            >
              <UserPlus className="mr-3 h-6 w-6" />
              Create Manually
            </Button>
            <Button
              size="lg"
              onClick={() => setView("cvUploader")}
              className="w-64 h-16 text-base"
            >
              <UploadCloud className="mr-3 h-6 w-6" />
              Create from CV
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <ProfileHeader
        title="Create New User"
        description="Add a new member to your team by filling out their details manually or by uploading their CV."
      />
      {view !== "selection" && (
        <Button
          variant="ghost"
          onClick={resetView}
          className="mb-6 text-muted-foreground"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Selection
        </Button>
      )}
      {renderContent()}
    </div>
  );
}

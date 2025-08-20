"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { CVUploader } from "@/components/admin/CVUploader";
import { UserCreationForm } from "@/components/admin/UserCreationForm";
import { CachedCVs } from "@/components/admin/CachedCVs";
import { Button } from "@/components/ui/button";

export const CreateUserFlow = ({ onClose, onUserCreated }) => {
  const [view, setView] = useState("selection");
  const [prefilledData, setPrefilledData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCvSelect = (cvData) => {
    setPrefilledData(cvData.prepopulatedData);
    setView("form");
  };

  const handleUploadSuccess = (data) => {
    setPrefilledData(data.prepopulatedData);
    setView("form");
    setRefreshKey((prev) => prev + 1);
  };

  const handleManualCreate = () => {
    setPrefilledData(null);
    setView("form");
  };

  if (view === "form") {
    return (
      <UserCreationForm
        initialData={prefilledData}
        onBack={() => setView("selection")}
        onSuccess={onUserCreated}
      />
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">
        Upload a new CV, select a previously processed CV, or create a user
        manually.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Upload New CV
            </h3>
            <CVUploader onSuccess={handleUploadSuccess} />
          </div>
          <div className="flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 px-4 text-xs text-muted-foreground">
              OR
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          <div>
            <Button
              size="lg"
              variant="outline"
              onClick={handleManualCreate}
              className="w-full h-16 text-base"
            >
              <UserPlus className="mr-3 h-6 w-6" />
              Create User Manually
            </Button>
          </div>
        </div>

        <div className="lg:border-l lg:pl-8">
          <CachedCVs key={refreshKey} onSelectCv={handleCvSelect} />
        </div>
      </div>
    </div>
  );
};

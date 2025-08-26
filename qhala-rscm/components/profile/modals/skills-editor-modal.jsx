"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link as LinkIcon, FileText, CheckCircle } from "lucide-react";
import {
  CurrentSkillsEditor,
  DesiredSkillsEditor,
} from "@/components/user/ProfileComponents";
import FileUpload from "@/components/common/FileUpload";
import { toast } from "sonner";

export function CurrentSkillsModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  groupedSkillsTaxonomy,
  expandedCurrentSkillCategories,
  toggleCurrentSkillCategory,
  selectedCurrentSkillsMap,
  handleToggleCurrentSkill,
  handleSetProficiency,
  loadingTaxonomy,
  handleUploadProof,
  handleAddProofUrl,
  handleUploadCV,
  userSkills = [],
}) {
  const [urlInputs, setUrlInputs] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const [cvUploaded, setCvUploaded] = useState(false);

  const isOnboarding = userSkills.length === 0;
  const showSkillsEditor = !isOnboarding || cvUploaded;

  const handleUrlChange = (skillId, value) => {
    setUrlInputs((prev) => ({ ...prev, [skillId]: value }));
  };

  const handleFileUpload = async (skillId, file, proofType) => {
    const uploadId = `${skillId}-${Date.now()}`;
    setUploadingFiles((prev) => new Set([...prev, uploadId]));

    try {
      if (skillId === "onboarding") {
        const success = await handleUploadCV(file);
        if (success) {
          setCvUploaded(true);
        }
      } else {
        await handleUploadProof(skillId, file, proofType);
      }
      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload file");
      console.error("Upload error:", error);
    } finally {
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uploadId);
        return newSet;
      });
    }
  };

  const handleAddUrl = async (skillId) => {
    const url = urlInputs[skillId];
    if (!url) return;

    try {
      await handleAddProofUrl(skillId, url);
      handleUrlChange(skillId, "");
      toast.success("Proof link added successfully!");
    } catch (error) {
      toast.error("Failed to add proof link");
      console.error("Add URL error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      {/* 👇 only change: max-w-7xl → max-w-4xl */}
      <DialogContent
        size="4xl"
        className="max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isOnboarding && !cvUploaded
              ? "Complete Onboarding"
              : "Edit Current Skills"}
          </DialogTitle>
          <DialogDescription>
            {isOnboarding && !cvUploaded
              ? "Upload your CV to get started, then add additional skills manually."
              : "Update your current skills, set proficiency levels, and attach proof for verification."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isOnboarding && !cvUploaded ? (
            <div className="p-8 border-2 border-dashed border-primary/20 rounded-lg text-center bg-primary/5">
              <div className="max-w-md mx-auto">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Your CV</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload your CV to get started. After upload, you can add
                  additional skills manually.
                </p>
                <FileUpload
                  accept=".pdf,.doc,.docx"
                  onFileSelect={(file) =>
                    handleFileUpload("onboarding", file, "cv")
                  }
                  disabled={uploadingFiles.size > 0}
                  className="w-full"
                >
                  {uploadingFiles.size > 0 ? (
                    <>Uploading CV...</>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Choose CV File
                    </>
                  )}
                </FileUpload>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: PDF, DOC, DOCX
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border rounded-lg p-4">
                <CurrentSkillsEditor
                  groupedSkillsTaxonomy={groupedSkillsTaxonomy}
                  expandedCategories={expandedCurrentSkillCategories}
                  toggleCategory={toggleCurrentSkillCategory}
                  selectedCurrentSkillsMap={selectedCurrentSkillsMap}
                  handleToggleCurrentSkill={handleToggleCurrentSkill}
                  handleSetProficiency={handleSetProficiency}
                  isSaving={isSaving}
                  loadingTaxonomy={loadingTaxonomy}
                />
              </div>

              {Array.from(selectedCurrentSkillsMap.keys()).length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    Skill Verification
                  </h4>
                  {Array.from(selectedCurrentSkillsMap.keys()).map(
                    (skillId) => {
                      const existingSkill = userSkills.find(
                        (s) =>
                          s.skillId?._id === skillId || s.skillId === skillId
                      );
                      const skillName =
                        existingSkill?.skillName ||
                        Object.values(groupedSkillsTaxonomy || {})
                          .flat()
                          .find((s) => s._id === skillId)?.name ||
                        "Unknown Skill";

                      const hasProof =
                        existingSkill?.proofDocuments?.length > 0;
                      const isVerified = existingSkill?.proofDocuments?.some(
                        (doc) => doc.verificationStatus === "approved"
                      );

                      return (
                        <div
                          key={skillId}
                          className="p-4 border rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium flex items-center gap-2">
                              {skillName}
                              {isVerified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </h5>
                            {hasProof && (
                              <span className="text-xs text-muted-foreground">
                                {isVerified
                                  ? "Verified"
                                  : "Pending verification"}
                              </span>
                            )}
                          </div>

                          {!hasProof && (
                            <>
                              <p className="text-sm text-muted-foreground mb-3">
                                Add proof to verify this skill with your line
                                manager.
                              </p>

                              <div className="flex gap-2 mb-3">
                                <Input
                                  type="url"
                                  placeholder="Link to certificate, badge, or portfolio"
                                  value={urlInputs[skillId] || ""}
                                  onChange={(e) =>
                                    handleUrlChange(skillId, e.target.value)
                                  }
                                  className="flex-1"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddUrl(skillId)}
                                  disabled={!urlInputs[skillId]}
                                >
                                  <LinkIcon className="h-4 w-4 mr-1" />
                                  Add Link
                                </Button>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  or
                                </span>
                                <FileUpload
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onFileSelect={(file) =>
                                    handleFileUpload(
                                      skillId,
                                      file,
                                      "certification"
                                    )
                                  }
                                  disabled={uploadingFiles.size > 0}
                                >
                                  Upload Document
                                </FileUpload>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {showSkillsEditor && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving || uploadingFiles.size > 0}
            >
              {isSaving ? "Saving..." : "Save Skills"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function DesiredSkillsModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  groupedSkillsTaxonomy,
  expandedDesiredSkillCategories,
  toggleDesiredSkillCategory,
  selectedDesiredSkillIds,
  handleToggleDesiredSkill,
  loadingTaxonomy,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      {/* 👇 only change: max-w-4xl */}
      <DialogContent
        size="4xl"
        className=" w-full max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Desired Skills
          </DialogTitle>
          <DialogDescription>
            Select the skills you want to learn or improve. No proof is required
            for desired skills.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <DesiredSkillsEditor
            groupedSkillsTaxonomy={groupedSkillsTaxonomy}
            expandedCategories={expandedDesiredSkillCategories}
            toggleCategory={toggleDesiredSkillCategory}
            selectedDesiredSkillIds={selectedDesiredSkillIds}
            handleToggleDesiredSkill={handleToggleDesiredSkill}
            loadingTaxonomy={loadingTaxonomy}
            isSaving={isSaving}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Skills"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import {
  CurrentSkillsEditor,
  DesiredSkillsEditor,
} from "@/components/user/ProfileComponents";
import { Upload, Link as LinkIcon, Trash2 } from "lucide-react";

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
  handleRemoveProof,
  userSkills = [],
}) {
  const [urlInputs, setUrlInputs] = useState({});

  const handleUrlChange = (skillId, value) => {
    setUrlInputs((prev) => ({ ...prev, [skillId]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <DialogContent className="max-w-5xl w-full rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <DialogHeader>
          <DialogTitle>Edit Current Skills</DialogTitle>
          <DialogDescription>
            Update your current skills, set proficiency levels, and attach proof
            documents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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

          {/* Proof section for each selected current skill */}
          {Array.from(selectedCurrentSkillsMap.keys()).map((skillId) => {
            const skill = userSkills.find((s) => s.skillId?._id === skillId);
            return (
              <div
                key={skillId}
                className="mt-4 p-3 border rounded-md bg-muted/30"
              >
                <h5 className="text-sm font-medium mb-2">
                  Proof for {skill?.skillId?.name || "Skill"}
                </h5>

                {/* URL input */}
                <div className="flex gap-2 mb-2">
                  <Input
                    type="url"
                    placeholder="Link to certificate or badge"
                    value={urlInputs[skillId] || ""}
                    onChange={(e) => handleUrlChange(skillId, e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (urlInputs[skillId]) {
                        handleAddProofUrl(skillId, urlInputs[skillId]);
                        handleUrlChange(skillId, "");
                      }
                    }}
                  >
                    <LinkIcon className="h-4 w-4 mr-1" /> Add Link
                  </Button>
                </div>

                {/* File upload */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUploadProof(skillId)}
                >
                  <Upload className="h-4 w-4 mr-1" /> Upload File
                </Button>

                {/* Existing proofs */}
                <ul className="mt-3 space-y-1 text-xs">
                  {skill?.proofDocuments?.length > 0 ? (
                    skill.proofDocuments.map((doc, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center border-b pb-1"
                      >
                        <span>
                          {doc.url
                            ? doc.url
                            : doc.fileName || "Unnamed proof"}
                        </span>
                        <span className="italic text-muted-foreground">
                          {doc.verificationStatus}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveProof(skillId, doc.documentStorageId)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </li>
                    ))
                  ) : (
                    <li className="italic text-muted-foreground">
                      No proof added yet
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
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
      <DialogContent className="max-w-4xl w-full rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <DialogHeader>
          <DialogTitle>Edit Desired Skills</DialogTitle>
          <DialogDescription>
            Select the skills you want to learn or improve.
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
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
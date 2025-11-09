"use client";
import { useState } from "react";
import { X, Plus, Trash2, Link as LinkIcon, ChevronDown, ChevronRight, FileText, Upload } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const SkillsEditorModal = ({ isOpen, onClose, userEmail, mode = "current" }) => {
  const [selectedSkills, setSelectedSkills] = useState(new Map()); // Map of skillId -> { proficiency, yearsOfExperience, proofUrl }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [cvUploaded, setCvUploaded] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);

  const createUserSkill = useMutation(api.userSkills.createUserSkill);
  const updateUserSkills = useMutation(api.userSkills.updateForCurrentUser);
  const uploadProofDocument = useMutation(api.skills.uploadProofDocument);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const allSkills = useQuery(api.skills.getAll);
  const userSkills = useQuery(
    api.userSkills.getForCurrentUser,
    userEmail ? { email: userEmail } : "skip"
  );

  const currentUserSkills = userSkills?.filter((s) => 
    mode === "current" ? s.isCurrent : s.isDesired
  ) || [];

  // Check if user is onboarding (no current skills)
  const isOnboarding = mode === "current" && currentUserSkills.length === 0;

  // Group skills by category
  const groupedSkills = {};
  allSkills?.forEach((skill) => {
    const category = skill.category || "Other";
    if (!groupedSkills[category]) {
      groupedSkills[category] = [];
    }
    groupedSkills[category].push(skill);
  });

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleSkillSelection = (skillId) => {
    setSelectedSkills((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(skillId)) {
        newMap.delete(skillId);
      } else {
        newMap.set(skillId, {
          proficiency: 3,
          proofUrl: "",
        });
      }
      return newMap;
    });
  };

  const updateSkillDetails = (skillId, field, value) => {
    setSelectedSkills((prev) => {
      const newMap = new Map(prev);
      const skillData = newMap.get(skillId) || { proficiency: 3, proofUrl: "" };
      newMap.set(skillId, { ...skillData, [field]: value });
      return newMap;
    });
  };

  const handleCVUpload = async (file) => {
    if (!file) return;
    
    setIsUploadingCV(true);
    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl({ email: userEmail });

      // Upload the file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.storageId) {
        throw new Error("No storage ID returned from upload");
      }

      setCvUploaded(true);
      toast.success("CV uploaded successfully!", {
        description: "You can now add skills manually while we process your CV.",
      });
    } catch (error) {
      console.error("CV upload error:", error);
      toast.error("CV upload failed", {
        description: error.message || "Unknown error occurred",
      });
    } finally {
      setIsUploadingCV(false);
    }
  };

  const handleAddSkills = async () => {
    if (selectedSkills.size === 0) {
      toast.error("Please select at least one skill");
      return;
    }

    // For current skills, require proof document (URL or file)
    if (mode === "current") {
      const skillsWithoutProof = [];
      for (const [skillId, details] of selectedSkills.entries()) {
        if (!details.proofUrl || details.proofUrl.trim() === "") {
          const skill = allSkills?.find((s) => s._id === skillId);
          skillsWithoutProof.push(skill?.name || "Unknown");
        }
      }
      
      if (skillsWithoutProof.length > 0) {
        toast.error(
          "Proof required",
          {
            description: `Please provide proof documents for: ${skillsWithoutProof.join(", ")}`,
          }
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      for (const [skillId, details] of selectedSkills.entries()) {
        // Create the user skill
        const userSkillId = await createUserSkill({
          email: userEmail,
          skillId,
          isCurrent: mode === "current",
          isDesired: mode === "desired",
          proficiency: mode === "current" ? parseInt(details.proficiency) : undefined,
        });

        // For current skills with proof URL, upload the proof document
        if (mode === "current" && details.proofUrl && details.proofUrl.trim() !== "") {
          await uploadProofDocument({
            email: userEmail,
            userSkillId,
            fileName: details.proofUrl,
            proofType: "link",
            url: details.proofUrl,
          });
        }
      }

      if (mode === "current") {
        toast.success(
          `${selectedSkills.size} skill(s) submitted for verification`,
          {
            description: "Your line manager will review and approve your skills",
          }
        );
      } else {
        toast.success(`${selectedSkills.size} learning goal(s) added successfully`);
      }
      
      setSelectedSkills(new Map());
    } catch (error) {
      toast.error(error.message || "Failed to add skills");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSkill = async (userSkillId) => {
    try {
      // Get current user skills, filter out the one to remove, and update
      const currentUserSkillsList = currentUserSkills.filter(us => us._id !== userSkillId);
      
      if (mode === "current") {
        const skillsToKeep = currentUserSkillsList.map(us => ({
          skillId: us.skillId._id || us.skillId,
          proficiency: us.proficiency || 3,
        }));
        await updateUserSkills({
          email: userEmail,
          currentSkills: skillsToKeep,
        });
      } else {
        const skillIdsToKeep = currentUserSkillsList.map(us => us.skillId._id || us.skillId);
        await updateUserSkills({
          email: userEmail,
          desiredSkillIds: skillIdsToKeep,
        });
      }
      
      toast.success("Skill removed");
    } catch (error) {
      toast.error(error.message || "Failed to remove skill");
    }
  };

  if (!isOpen) return null;

  const proficiencyLevels = [
    { value: 1, label: "Beginner" },
    { value: 2, label: "Intermediate" },
    { value: 3, label: "Advanced" },
    { value: 4, label: "Expert" },
    { value: 5, label: "Master" },
  ];

  const categories = Object.keys(groupedSkills).sort();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-rscm-dark-purple">
              {mode === "current" ? "Manage skills" : "Manage learning goals"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === "current" 
                ? "Add skills you currently have with proficiency levels"
                : "Add skills you want to learn or develop"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="px-8 pb-8 space-y-6">
          {/* CV Upload for Onboarding */}
          {isOnboarding && !cvUploaded && (
            <div className="p-8 border-2 border-dashed border-rscm-violet/30 rounded-lg bg-rscm-violet/5">
              <div className="max-w-md mx-auto text-center">
                <FileText className="h-12 w-12 text-rscm-violet mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-rscm-dark-purple mb-2">
                  Upload Your CV
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Upload your CV to get started. After upload, you can add additional skills manually.
                </p>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-rscm-violet text-white rounded-lg font-medium cursor-pointer hover:bg-rscm-plum transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCVUpload(file);
                    }}
                    disabled={isUploadingCV}
                    className="hidden"
                  />
                  {isUploadingCV ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading CV...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Choose CV File
                    </>
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-3">
                  Supported formats: PDF, DOC, DOCX
                </p>
                {!cvUploaded && (
                  <button
                    onClick={() => setCvUploaded(true)}
                    className="mt-4 text-sm text-rscm-violet hover:text-rscm-plum underline"
                  >
                    Skip and add skills manually
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Browse Skills by Category */}
          {(!isOnboarding || cvUploaded) && (
          <div>
            <h3 className="text-sm font-semibold text-rscm-dark-purple mb-3">
              Browse skills by category
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No skills available
                </p>
              ) : (
                categories.map((category) => {
                  const categorySkills = groupedSkills[category].filter(
                    (skill) => !currentUserSkills.some((us) => us.skillId?._id === skill._id)
                  );
                  
                  if (categorySkills.length === 0) return null;
                  
                  return (
                    <div key={category} className="rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="text-sm font-medium text-rscm-dark-purple">
                          {category}
                        </h4>
                        {expandedCategories[category] ? (
                          <ChevronDown size={16} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                      </button>
                      {expandedCategories[category] && (
                        <div className="px-3 pb-3 space-y-1">
                          {categorySkills.map((skill) => {
                            const isSelected = selectedSkills.has(skill._id);
                            return (
                              <button
                                key={skill._id}
                                type="button"
                                onClick={() => toggleSkillSelection(skill._id)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                  isSelected
                                    ? "bg-rscm-violet text-white"
                                    : "hover:bg-gray-100 text-rscm-dark-purple"
                                }`}
                              >
                                {skill.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          )}

          {/* Selected Skills Details */}
          {(!isOnboarding || cvUploaded) && selectedSkills.size > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-rscm-dark-purple">
                  Selected skills ({selectedSkills.size})
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedSkills(new Map())}
                  className="text-xs text-gray-500 hover:text-rscm-plum transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Array.from(selectedSkills.keys()).map((skillId) => {
                  const skill = allSkills?.find((s) => s._id === skillId);
                  const details = selectedSkills.get(skillId);
                  if (!skill) return null;

                  return (
                    <div key={skillId} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-rscm-dark-purple">
                          {skill.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => toggleSkillSelection(skillId)}
                          className="p-1 text-gray-400 hover:text-rscm-plum rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {mode === "current" && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Proficiency level
                            </label>
                            <select
                              value={details.proficiency}
                              onChange={(e) => updateSkillDetails(skillId, "proficiency", e.target.value)}
                              className="w-full px-3 py-2 bg-white rounded text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet shadow-sm"
                            >
                              {proficiencyLevels.map((level) => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Proof URL <span className="text-rscm-plum">(required)</span>
                            </label>
                            <input
                              type="url"
                              value={details.proofUrl}
                              onChange={(e) => updateSkillDetails(skillId, "proofUrl", e.target.value)}
                              placeholder="https://linkedin.com/..., certificate URL, etc."
                              className="w-full px-3 py-2 bg-white rounded text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet shadow-sm"
                              required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Provide a link to your portfolio, certificate, LinkedIn profile, or any proof of this skill.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddSkills}
                disabled={isSubmitting}
                className="w-full px-5 py-2.5 text-sm font-medium bg-rscm-violet text-white hover:bg-rscm-plum rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                {isSubmitting ? "Adding..." : `Add ${selectedSkills.size} skill${selectedSkills.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {/* Current Skills List */}
          {(!isOnboarding || cvUploaded) && (
          <div>
            <h3 className="text-sm font-semibold text-rscm-dark-purple mb-3">
              {mode === "current" ? "Current skills" : "Learning goals"}
            </h3>
            {currentUserSkills.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No skills added yet
              </p>
            ) : (
              <div className="space-y-2">
                {currentUserSkills.map((userSkill) => (
                  <div
                    key={userSkill._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-rscm-dutch-white/30 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-rscm-dark-purple">
                        {userSkill.skillId?.name || "Unknown Skill"}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        {mode === "current" && userSkill.proficiency && (
                          <span className="text-xs text-gray-600">
                            {proficiencyLevels.find((l) => l.value === userSkill.proficiency)?.label}
                          </span>
                        )}
                        {userSkill.yearsOfExperience && (
                          <span className="text-xs text-gray-600">
                            {userSkill.yearsOfExperience}y experience
                          </span>
                        )}
                        {userSkill.proofUrl && (
                          <a
                            href={userSkill.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-rscm-violet hover:text-rscm-plum flex items-center gap-1"
                          >
                            <LinkIcon size={12} />
                            Proof
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSkill(userSkill._id)}
                      className="p-2 text-gray-400 hover:text-rscm-plum hover:bg-rscm-plum/10 rounded-lg transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium bg-rscm-violet text-white hover:bg-rscm-plum rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsEditorModal;

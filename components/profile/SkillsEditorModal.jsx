"use client";
import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Link as LinkIcon,
  ChevronDown,
  ChevronRight,
  FileText,
  Upload,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const SkillsEditorModal = ({
  isOpen,
  onClose,
  userEmail,
  mode = "current",
}) => {
  const [selectedSkills, setSelectedSkills] = useState(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [cvUploaded, setCvUploaded] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [uploadedCvName, setUploadedCvName] = useState("");

  const createUserSkill = useMutation(api.userSkills.createUserSkill);
  const updateUserSkills = useMutation(api.userSkills.updateForCurrentUser);
  const allSkills = useQuery(api.skills.getAll);
  const userData = useQuery(api.users.getUserByEmail, {
    email: userEmail || "",
  });
  const userSkills = useQuery(
    api.userSkills.getForCurrentUser,
    userEmail ? { email: userEmail } : "skip"
  );
  const currentUserSkills =
    userSkills?.filter((s) =>
      mode === "current" ? s.isCurrent : s.isDesired
    ) || [];

  const isOnboarding = mode === "current" && currentUserSkills.length === 0;

  const refreshEmbedding = useAction(api.api.refreshUserEmbedding);

  const handleCVUpload = async (file) => {
    if (!file) return;
    if (!userData?._id) {
      toast.error("User profile not found");
      return;
    }

    setIsUploadingCV(true);
    setUploadedCvName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userData._id);

      const response = await fetch("/api/cv/extract-entities", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to extract skills");
      }

      const result = await response.json();
      const extractedSkills = result.extractedSkills || [];

      if (extractedSkills.length === 0) {
        toast.warning("No skills found in CV");
        setIsUploadingCV(false);
        return;
      }

      const newSelection = new Map(selectedSkills);
      let matchCount = 0;

      extractedSkills.forEach((extracted) => {
        const skillName =
          typeof extracted === "string" ? extracted : extracted?.name;

        if (!skillName) return;

        const matchedDbSkill = allSkills?.find(
          (dbSkill) => dbSkill.name.toLowerCase() === skillName.toLowerCase()
        );

        if (matchedDbSkill) {
          const prof = extracted.proficiencyLevel || extracted.proficiency || 3;
          newSelection.set(matchedDbSkill._id, {
            proficiency: parseInt(prof),
            proofType: "cv",
            fileName: file.name,
            proofUrl: "",
          });
          matchCount++;
        }
      });

      setSelectedSkills(newSelection);
      setCvUploaded(true);
      toast.success(`Found ${matchCount} skills`, {
        description: "Proficiency levels set from CV.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze CV");
    } finally {
      setIsUploadingCV(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleSkillSelection = (skillId) => {
    setSelectedSkills((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(skillId)) {
        newMap.delete(skillId);
      } else {
        newMap.set(skillId, {
          proficiency: 3,
          proofType: isOnboarding && cvUploaded ? "cv" : "link",
          fileName: isOnboarding && cvUploaded ? uploadedCvName : "",
          proofUrl: "",
        });
      }
      return newMap;
    });
  };

  const updateSkillDetails = (skillId, field, value) => {
    setSelectedSkills((prev) => {
      const newMap = new Map(prev);
      const data = newMap.get(skillId);
      newMap.set(skillId, { ...data, [field]: value });
      return newMap;
    });
  };

  const handleAddSkills = async () => {
    if (selectedSkills.size === 0) {
      toast.error("Please select at least one skill");
      return;
    }

    if (mode === "current") {
      const skillsWithoutProof = [];
      for (const [skillId, details] of selectedSkills.entries()) {
        const isCvProof = details.proofType === "cv";
        const hasUrl = details.proofUrl && details.proofUrl.trim() !== "";

        if (!isCvProof && !hasUrl) {
          const skill = allSkills?.find((s) => s._id === skillId);
          skillsWithoutProof.push(skill?.name || "Unknown");
        }
      }

      if (skillsWithoutProof.length > 0) {
        toast.error("Proof required", {
          description: `Please provide a URL for: ${skillsWithoutProof.join(", ")}`,
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Save all skills to Convex
      for (const [skillId, details] of selectedSkills.entries()) {
        await createUserSkill({
          email: userEmail,
          skillId,
          isCurrent: mode === "current",
          isDesired: mode === "desired",
          proficiency: parseInt(details.proficiency),
          initialProof:
            mode === "current"
              ? {
                  proofType: details.proofType,
                  fileName: details.fileName,
                  url: details.proofUrl,
                }
              : undefined,
        });
      }

      // 2. Trigger Embedding Refresh (NEW LOGIC)
      if (userData?._id) {
        await refreshEmbedding({ userId: userData._id });
      }

      toast.success(
        mode === "current"
          ? "Skills submitted & profile updated"
          : "Learning goals added"
      );
      setSelectedSkills(new Map());
      if (isOnboarding && onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save skills");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSkill = async (userSkillId) => {
    try {
      const currentUserSkillsList = currentUserSkills.filter(
        (us) => us._id !== userSkillId
      );

      // 1. Update DB
      if (mode === "current") {
        const skillsToKeep = currentUserSkillsList.map((us) => ({
          skillId: us.skillId._id || us.skillId,
          proficiency: us.proficiency || 3,
        }));
        await updateUserSkills({
          email: userEmail,
          currentSkills: skillsToKeep,
        });
      } else {
        const skillIdsToKeep = currentUserSkillsList.map(
          (us) => us.skillId._id || us.skillId
        );
        await updateUserSkills({
          email: userEmail,
          desiredSkillIds: skillIdsToKeep,
        });
      }

      // 2. Trigger Embedding Refresh (NEW LOGIC)
      if (userData?._id) {
        await refreshEmbedding({ userId: userData._id });
      }

      toast.success("Skill removed & profile updated");
    } catch (error) {
      toast.error("Failed to remove skill");
    }
  };

  if (!isOpen) return null;

  const groupedSkills = {};
  allSkills?.forEach((skill) => {
    const category = skill.category || "Other";
    if (!groupedSkills[category]) groupedSkills[category] = [];
    groupedSkills[category].push(skill);
  });
  const categories = Object.keys(groupedSkills).sort();

  const proficiencyLevels = [
    { value: 1, label: "Beginner" },
    { value: 2, label: "Elementary" },
    { value: 3, label: "Intermediate" },
    { value: 4, label: "Advanced" },
    { value: 5, label: "Expert" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-[#251323]">
              {mode === "current" ? "Manage skills" : "Manage learning goals"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === "current"
                ? "Add skills you currently have"
                : "Add skills you want to learn"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          {isOnboarding && !cvUploaded && (
            <div className="p-8 border-2 border-dashed border-[#4a2545]/30 rounded-lg bg-[#4a2545]/5 text-center">
              <FileText className="h-12 w-12 text-[#4a2545] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#251323] mb-2">
                Upload Your CV
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                We will extract skills and proficiency automatically.
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#4a2545] text-white rounded-lg font-medium cursor-pointer hover:bg-[#251323] transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    e.target.files?.[0] && handleCVUpload(e.target.files[0])
                  }
                  disabled={isUploadingCV}
                  className="hidden"
                />
                {isUploadingCV ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {isUploadingCV ? "Analyzing..." : "Choose File"}
              </label>
              <button
                onClick={() => setCvUploaded(true)}
                className="block w-full mt-4 text-sm text-[#4a2545] hover:underline"
              >
                Skip to manual entry
              </button>
            </div>
          )}

          {(!isOnboarding || cvUploaded) && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2 mb-6 border border-gray-100">
                {categories.map((cat) => (
                  <div key={cat}>
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center justify-between w-full p-2 text-sm font-medium text-[#251323] hover:bg-gray-100 rounded"
                    >
                      {cat}{" "}
                      {expandedCategories[cat] ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </button>
                    {expandedCategories[cat] && (
                      <div className="pl-4 mt-1 space-y-1">
                        {groupedSkills[cat].map((s) => {
                          const isSelected = selectedSkills.has(s._id);
                          const isExisting = currentUserSkills.some(
                            (us) => us.skillId?._id === s._id
                          );
                          if (isExisting) return null;

                          return (
                            <button
                              key={s._id}
                              onClick={() => toggleSkillSelection(s._id)}
                              className={`block w-full text-left text-xs p-2 rounded transition-colors ${isSelected ? "bg-[#4a2545] text-white" : "text-gray-600 hover:bg-gray-200"}`}
                            >
                              {s.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedSkills.size > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#251323]">
                    Selected Skills ({selectedSkills.size})
                  </h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {Array.from(selectedSkills.keys()).map((skillId) => {
                      const skill = allSkills?.find((s) => s._id === skillId);
                      const details = selectedSkills.get(skillId);
                      if (!skill) return null;

                      return (
                        <div
                          key={skillId}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-[#251323] text-sm">
                              {skill.name}
                            </h4>
                            <button
                              onClick={() => toggleSkillSelection(skillId)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                                Level
                              </label>
                              <select
                                value={details.proficiency}
                                onChange={(e) =>
                                  updateSkillDetails(
                                    skillId,
                                    "proficiency",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-2 outline-none focus:border-[#4a2545]"
                              >
                                {proficiencyLevels.map((level) => (
                                  <option key={level.value} value={level.value}>
                                    {level.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {mode === "current" && (
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                                  Proof Source
                                </label>
                                {isOnboarding &&
                                cvUploaded &&
                                details.proofType === "cv" ? (
                                  <div className="flex items-center gap-2 text-xs text-gray-700 bg-white border border-gray-200 rounded px-3 py-2 h-[34px]">
                                    <FileText
                                      size={12}
                                      className="text-[#4a2545]"
                                    />
                                    <span className="truncate">
                                      {uploadedCvName || "Resume.pdf"}
                                    </span>
                                  </div>
                                ) : (
                                  <select
                                    value={details.proofType}
                                    onChange={(e) =>
                                      updateSkillDetails(
                                        skillId,
                                        "proofType",
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-2 outline-none focus:border-[#4a2545]"
                                  >
                                    <option value="link">Link / URL</option>
                                    <option value="certification">
                                      Certificate
                                    </option>
                                    <option value="portfolio">Portfolio</option>
                                    <option value="badge">Badge</option>
                                  </select>
                                )}
                              </div>
                            )}
                          </div>

                          {mode === "current" && details.proofType !== "cv" && (
                            <div>
                              <input
                                type="url"
                                placeholder="https://..."
                                value={details.proofUrl}
                                onChange={(e) =>
                                  updateSkillDetails(
                                    skillId,
                                    "proofUrl",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs bg-white border border-gray-200 rounded px-3 py-2 outline-none focus:border-[#4a2545]"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleAddSkills}
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#4a2545] text-white rounded-lg font-bold text-sm hover:bg-[#251323] transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Save Skills
                  </button>
                </div>
              )}

              {currentUserSkills.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-[#251323] mb-3">
                    {mode === "current" ? "Current skills" : "Learning goals"}
                  </h3>
                  <div className="space-y-2">
                    {currentUserSkills.map((userSkill) => (
                      <div
                        key={userSkill._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[#251323]">
                            {userSkill.skillId?.name || "Unknown Skill"}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            {mode === "current" && userSkill.proficiency && (
                              <span className="text-xs text-gray-500">
                                {
                                  proficiencyLevels.find(
                                    (l) => l.value === userSkill.proficiency
                                  )?.label
                                }
                              </span>
                            )}
                            {userSkill.proofDocuments &&
                              userSkill.proofDocuments.length > 0 && (
                                <span className="text-xs text-[#4a2545] flex items-center gap-1">
                                  <LinkIcon size={10} />
                                  {userSkill.proofDocuments[0].proofType ===
                                  "cv"
                                    ? "Verified by CV"
                                    : "Proof Attached"}
                                </span>
                              )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSkill(userSkill._id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsEditorModal;

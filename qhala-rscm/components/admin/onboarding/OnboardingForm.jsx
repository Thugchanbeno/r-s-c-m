"use client";
import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Loader2,
  Save,
  X,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  Sparkles,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function OnboardingForm({ selectedUser, onUserCreated }) {
  const [mode, setMode] = useState("idle"); // 'idle' | 'review' | 'view'
  const [formData, setFormData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const finalizeUser = useAction(api.api.finalizeOnboarding);

  useEffect(() => {
    if (selectedUser) {
      setMode("view");
    } else if (mode === "view") {
      setMode("idle");
    }
  }, [selectedUser]);

  const handleUpload = async (file) => {
    setIsProcessing(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/cv", { method: "POST", body: uploadData });
      const result = await res.json();
      const raw = result.extracted || {};
      const profile = raw.candidate_profile || {};

      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        role: "employee",
        department: "Engineering",
        bio: raw.summary_bio || "",
        skills: raw.skills || [],
        employeeType: "permanent",
        weeklyHours: 40,
        annualLeaveEntitlement: 21,
        startDate: new Date().toISOString().split("T")[0],
      });
      setMode("review");
    } catch (error) {
      toast.error("Failed to parse PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      await finalizeUser(formData);
      toast.success(`${formData.name} onboarded!`);
      if (onUserCreated) onUserCreated(formData);
      setMode("idle");
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setIsProcessing(false);
    }
  };

  //IDLE (Upload Hero)
  if (mode === "idle") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-gray-50/30">
        <div className="w-20 h-20 bg-[#4a2545]/5 rounded-3xl flex items-center justify-center mb-6 border border-[#4a2545]/10">
          <UploadCloud className="text-[#4a2545]" size={32} />
        </div>
        <h3 className="text-xl font-bold text-[#251323]">
          Add New Team Member
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mt-2 mb-8 leading-relaxed">
          Upload a resume (PDF) to auto-extract skills, bio, and experience data
          using AI.
        </p>

        <button
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          disabled={isProcessing}
          className="px-6 py-3 bg-[#4a2545] text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-[#251323] transition-all flex items-center gap-2"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <UploadCloud className="w-4 h-4" />
          )}
          {isProcessing ? "Analyzing..." : "Upload Resume"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && handleUpload(e.target.files[0])
          }
        />
      </div>
    );
  }

  // REVIEW FORM
  if (mode === "review") {
    const inputClass =
      "w-full text-sm text-[#251323] bg-white border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4a2545]/10 focus:border-[#4a2545] transition-all outline-none";
    const labelClass =
      "block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5";

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode("idle")}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-[#251323]">
                Review Profile
              </h2>
              <p className="text-xs text-gray-500">Verify extracted data</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-[#4a2545] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#251323] transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Confirm & Save
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
          {/* Identity Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
            <div className="w-20 h-20 bg-[#4a2545] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
              {formData.name?.[0]}
            </div>
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  className={inputClass}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  className={inputClass}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>AI Summary</label>
                <textarea
                  rows={2}
                  className={`${inputClass} resize-none`}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Employment Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-[#4a2545]/5 rounded-md">
                <Briefcase size={14} className="text-[#4a2545]" />
              </div>
              <h3 className="text-sm font-bold text-[#251323]">
                Employment Details
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Department</label>
                <select
                  className={inputClass}
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                >
                  <option>Engineering</option>
                  <option>Product</option>
                  <option>Design</option>
                  <option>Data & AI</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select
                  className={inputClass}
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="employee">Employee</option>
                  <option value="line_manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  className={inputClass}
                  value={formData.employeeType}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeType: e.target.value })
                  }
                >
                  <option value="permanent">Permanent</option>
                  <option value="consultancy">Consultancy</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Hours/Week</label>
                <input
                  type="number"
                  className={inputClass}
                  value={formData.weeklyHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weeklyHours: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Skills Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#4a2545]/5 rounded-md">
                  <Sparkles size={14} className="text-[#4a2545]" />
                </div>
                <h3 className="text-sm font-bold text-[#251323]">
                  Extracted Skills
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                {formData.skills.length} Detected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all group"
                >
                  {skill.name}
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-xs text-gray-400">{skill.level}</span>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        skills: formData.skills.filter((_, i) => i !== idx),
                      })
                    }
                    className="ml-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PROFILE VIEW
  if (mode === "view" && selectedUser) {
    return (
      <div className="h-full flex flex-col bg-gray-50/30">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Header Card (Matches Screenshot Header) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#251323] flex items-center justify-center text-white text-2xl font-bold">
              {selectedUser.name?.[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#251323]">
                {selectedUser.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-[#4a2545] text-white hover:bg-[#4a2545] border-none">
                  {selectedUser.role}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-gray-500 border-gray-200 bg-gray-50"
                >
                  {selectedUser.department}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <Mail size={12} /> {selectedUser.email}
              </div>
            </div>

            {/* Stats (Matches "Capacity/Hours" in Screenshot) */}
            <div className="flex gap-4">
              <div className="text-center px-6 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xl font-bold text-[#251323]">
                  {selectedUser.weeklyHours || 40}h
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Weekly
                </div>
              </div>
              <div className="text-center px-6 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xl font-bold text-[#251323]">
                  {selectedUser.annualLeaveEntitlement || 0}
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Leave Days
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary Card */}
          {selectedUser.bio && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
                Professional Summary
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedUser.bio}
              </p>
            </div>
          )}

          {/* Skills Grid */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider flex justify-between items-center">
              Current Skills
              <span className="text-[#4a2545] text-[10px] bg-[#4a2545]/5 px-2 py-1 rounded-md">
                {selectedUser.extractedSkills?.length || 0} Verified
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedUser.extractedSkills?.map((skill, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-[#251323]">
                      {skill.name}
                    </span>
                    <CheckCircle
                      size={14}
                      className="text-[#4a2545] opacity-20"
                    />
                  </div>
                  <Badge
                    className={`w-fit text-[10px] border-none ${
                      skill.level === "Expert"
                        ? "bg-[#4a2545] text-white"
                        : skill.level === "Advanced"
                          ? "bg-[#824c71] text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {skill.level}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

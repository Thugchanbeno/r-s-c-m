"use client";
import {
  X,
  Mail,
  Building2,
  Briefcase,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

export default function CandidateDetailPanel({ user, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    toast.success("Email copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
      {/* Rich Header */}
      <div className="relative h-32 bg-gradient-to-br from-[#251323] to-[#4a2545]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
        >
          <X size={16} />
        </button>
        <div className="absolute -bottom-10 left-6">
          <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
            <div className="w-full h-full rounded-xl bg-[#c398b5]/20 flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-2xl font-bold text-[#4a2545]">
                  {user.name?.[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-12 px-6 pb-6">
        {/* Identity */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-[#251323]">{user.name}</h2>
              <p className="text-sm text-[#4a2545] font-medium">
                {user.role || "Employee"}
              </p>
            </div>
            <Badge className="bg-green-50 text-green-700 border-green-200 shadow-none">
              {(user._score * 100).toFixed(0)}% Match
            </Badge>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail size={14} className="text-[#c398b5]" />
              {user.email}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Building2 size={14} className="text-[#c398b5]" />
              {user.department || "General Pool"}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={14} className="text-[#c398b5]" />
              Added{" "}
              {new Date(user._creationTime || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* AI Bio */}
        <div className="bg-[#4a2545]/5 rounded-xl p-4 border border-[#4a2545]/10 mb-6">
          <h4 className="text-[10px] font-bold text-[#4a2545] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={12} /> AI Summary
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            {user.bio || "No summary available."}
          </p>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            Extracted Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.extractedSkills?.map((skill, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-white border-gray-200 text-gray-600 font-normal px-2.5 py-1"
              >
                {skill.name}
                <span className="ml-1.5 pl-1.5 border-l border-gray-200 text-[#c398b5] text-[10px] font-medium">
                  {skill.level}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
        <Button
          variant="outline"
          onClick={handleCopy}
          className="flex-1 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 h-10"
        >
          {copied ? (
            <Check size={16} className="mr-2" />
          ) : (
            <Copy size={16} className="mr-2" />
          )}
          {copied ? "Copied" : "Copy Email"}
        </Button>
        <Button
          className="flex-1 bg-[#4a2545] hover:bg-[#251323] text-white h-10"
          onClick={() => window.open(`/users/${user._id}`, "_blank")}
        >
          View Profile <ExternalLink size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

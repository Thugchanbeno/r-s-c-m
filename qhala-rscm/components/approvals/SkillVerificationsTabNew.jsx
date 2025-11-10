"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  User,
  Award,
  FileText,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function SkillVerificationsTabNew({ user }) {
  const { data: session } = useSession();
  const [processingSkillId, setProcessingSkillId] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});

  const pendingVerifications = useQuery(
    api.skills.getPendingVerifications,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  const verifySkill = useMutation(api.skills.verifyUserSkill);

  const loading = pendingVerifications === undefined;
  const verifications = pendingVerifications || [];

  const handleVerify = async (userSkillId, action) => {
    setProcessingSkillId(userSkillId);
    try {
      const reason =
        action === "reject"
          ? rejectionReasons[userSkillId] || "Not verified"
          : "Verified by line manager";

      if (action === "reject" && !rejectionReasons[userSkillId]?.trim()) {
        toast.error("Please provide a reason for rejection");
        setProcessingSkillId(null);
        return;
      }

      await verifySkill({
        email: session.user.email,
        userSkillId,
        action,
        reason,
      });

      toast.success(
        `Skill ${action === "approve" ? "approved" : "rejected"} successfully`
      );
      setRejectionReasons((prev) => {
        const updated = { ...prev };
        delete updated[userSkillId];
        return updated;
      });
    } catch (error) {
      console.error("Error verifying skill:", error);
      toast.error(error.message || "Failed to verify skill");
    } finally {
      setProcessingSkillId(null);
    }
  };

  const getProofTypeBadge = (proofType) => {
    const config = {
      cv: { label: "CV", bg: "bg-blue-100", text: "text-blue-700" },
      certification: {
        label: "Certificate",
        bg: "bg-green-100",
        text: "text-green-700",
      },
      badge: { label: "Badge", bg: "bg-yellow-100", text: "text-yellow-700" },
      document: { label: "Document", bg: "bg-gray-100", text: "text-gray-700" },
      portfolio: {
        label: "Portfolio",
        bg: "bg-purple-100",
        text: "text-purple-700",
      },
      link: { label: "Link", bg: "bg-rscm-lilac/20", text: "text-rscm-plum" },
    };
    const { label, bg, text } = config[proofType] || {
      label: proofType,
      bg: "bg-gray-100",
      text: "text-gray-700",
    };
    return (
      <span className={`${bg} ${text} px-2 py-1 rounded text-xs font-medium`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] bg-white rounded-lg shadow-sm">
        <LoadingSpinner width={200} height={4} />
        <p className="mt-4 text-sm text-gray-600">
          Loading skill verifications...
        </p>
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm px-6 py-12 text-center">
        <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-sm font-semibold text-rscm-dark-purple mb-1">
          All caught up!
        </h3>
        <p className="text-xs text-gray-600">
          No pending skill verifications to review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {verifications.map((verification) => {
        const isProcessing = processingSkillId === verification._id;
        const pendingProofs =
          verification.proofDocuments?.filter(
            (doc) => doc.verificationStatus === "pending"
          ) || [];

        return (
          <div
            key={verification._id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 hover:border-rscm-violet/30 transition-all hover:shadow-md px-5 py-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {verification.userAvatarUrl ? (
                  <Image
                    src={verification.userAvatarUrl}
                    alt={verification.userName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-rscm-lilac/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-rscm-violet" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-rscm-dark-purple">
                    {verification.userName || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {verification.userEmail}
                  </p>
                </div>
              </div>
              {verification.skillCategory && (
                <span className="bg-rscm-lilac/20 text-rscm-plum px-2 py-1 rounded-full text-xs font-medium">
                  {verification.skillCategory}
                </span>
              )}
            </div>

            {/* Skill Details */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-rscm-violet/10 px-3 py-2 rounded-lg">
                <Award className="w-4 h-4 text-rscm-violet" />
                <p className="font-medium text-rscm-violet text-sm">
                  {verification.skillName || "Unknown Skill"}
                </p>
              </div>
              {verification.proficiency && (
                <div className="text-sm">
                  <span className="text-gray-500">Level:</span>{" "}
                  <span className="font-medium text-rscm-dark-purple">
                    {verification.proficiency}/5
                  </span>
                </div>
              )}
            </div>

            {/* Proof Documents */}
            {pendingProofs.length > 0 && (
              <div className="mb-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Proof Documents ({pendingProofs.length})
                </p>
                <div className="space-y-2">
                  {pendingProofs.map((proof, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        {getProofTypeBadge(proof.proofType)}
                        <span className="text-sm text-rscm-dark-purple">
                          {proof.fileName || proof.url || "Document"}
                        </span>
                      </div>
                      {proof.url && (
                        <a
                          href={proof.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-rscm-violet hover:text-rscm-plum transition-colors"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejection Reason Input (shown when rejecting) */}
            {rejectionReasons[verification._id] !== undefined && (
              <div className="mb-4 pt-3 border-t border-gray-100">
                <label className="block text-xs text-gray-500 mb-1.5">
                  Reason for rejection*
                </label>
                <textarea
                  value={rejectionReasons[verification._id] || ""}
                  onChange={(e) =>
                    setRejectionReasons((prev) => ({
                      ...prev,
                      [verification._id]: e.target.value,
                    }))
                  }
                  placeholder="Please provide a reason..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:border-rscm-violet outline-none"
                  rows={2}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              {rejectionReasons[verification._id] === undefined ? (
                <>
                  <button
                    onClick={() =>
                      setRejectionReasons((prev) => ({
                        ...prev,
                        [verification._id]: "",
                      }))
                    }
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerify(verification._id, "approve")}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rscm-violet rounded-lg hover:bg-rscm-plum transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setRejectionReasons((prev) => {
                        const updated = { ...prev };
                        delete updated[verification._id];
                        return updated;
                      })
                    }
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleVerify(verification._id, "reject")}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Confirm Rejection
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

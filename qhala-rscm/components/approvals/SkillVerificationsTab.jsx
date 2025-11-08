"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  CheckCircle,
  XCircle,
  User,
  Award,
  FileText,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SkillVerificationsTab({ user }) {
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
      const reason = action === "reject"
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
      cv: { label: "CV", variant: "primary" },
      certification: { label: "Certificate", variant: "success" },
      badge: { label: "Badge", variant: "warning" },
      document: { label: "Document", variant: "default" },
      portfolio: { label: "Portfolio", variant: "primary" },
      link: { label: "Link", variant: "secondary" },
    };
    const { label, variant } = config[proofType] || { label: proofType, variant: "default" };
    return <Badge variant={variant} size="sm">{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
        <LoadingSpinner size={24} />
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          Loading skill verifications...
        </p>
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <Card className="bg-[rgb(var(--card))]">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-[rgb(var(--muted))]">
              <CheckCircle size={24} className="text-[rgb(var(--success))]" />
            </div>
            <div>
              <p className="font-medium text-[rgb(var(--foreground))]">
                All caught up!
              </p>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                No pending skill verifications to review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {verifications.map((verification) => {
        const isProcessing = processingSkillId === verification._id;
        const pendingProofs = verification.proofDocuments?.filter(
          (doc) => doc.verificationStatus === "pending"
        ) || [];

        return (
          <Card
            key={verification._id}
            className="overflow-hidden shadow-md bg-[rgb(var(--card))]"
          >
            <CardHeader
              className={cn(
                "p-4 border-b border-[rgb(var(--border))]",
                "bg-[rgb(var(--muted))]/50"
              )}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <CardTitle className="text-base sm:text-lg text-[rgb(var(--foreground))] flex items-center gap-2">
                  <User size={18} className="text-[rgb(var(--muted-foreground))]" />
                  <span className="font-semibold text-[rgb(var(--primary))]">
                    {verification.userName || "Unknown User"}
                  </span>
                  <span className="text-sm font-normal text-[rgb(var(--muted-foreground))]">
                    •
                  </span>
                  <Award size={16} className="text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm font-normal">
                    {verification.skillName || "Unknown Skill"}
                  </span>
                </CardTitle>
                {verification.skillCategory && (
                  <Badge variant="secondary" size="sm">
                    {verification.skillCategory}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                    Employee Email
                  </div>
                  <div className="text-[rgb(var(--foreground))]">
                    {verification.userEmail || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                    Proficiency Level
                  </div>
                  <div className="text-[rgb(var(--foreground))]">
                    {verification.proficiency ? `Level ${verification.proficiency}/5` : "Not specified"}
                  </div>
                </div>
              </div>

              {pendingProofs.length > 0 && (
                <div className="pt-3 mt-2 border-t border-[rgb(var(--border))]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText size={14} className="text-[rgb(var(--muted-foreground))]" />
                    <p className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                      Proof Documents ({pendingProofs.length}):
                    </p>
                  </div>
                  <div className="space-y-2">
                    {pendingProofs.map((proof, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-md",
                          "bg-[rgb(var(--muted))]/70 border border-[rgb(var(--border))]"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {getProofTypeBadge(proof.proofType)}
                          <span className="text-sm text-[rgb(var(--foreground))]">
                            {proof.fileName || proof.url || "Document"}
                          </span>
                          {proof.issuer && (
                            <span className="text-xs text-[rgb(var(--muted-foreground))]">
                              by {proof.issuer}
                            </span>
                          )}
                        </div>
                        {proof.url && (
                          <a
                            href={proof.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[rgb(var(--primary))] hover:underline"
                          >
                            View <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 mt-2 border-t border-[rgb(var(--border))]">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare size={14} className="text-[rgb(var(--muted-foreground))]" />
                  <p className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                    Rejection Reason (optional):
                  </p>
                </div>
                <textarea
                  value={rejectionReasons[verification._id] || ""}
                  onChange={(e) =>
                    setRejectionReasons((prev) => ({
                      ...prev,
                      [verification._id]: e.target.value,
                    }))
                  }
                  placeholder="Provide a reason if rejecting this verification..."
                  className={cn(
                    "w-full p-2.5 rounded-md text-sm",
                    "bg-[rgb(var(--background))] border border-[rgb(var(--border))]",
                    "text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]",
                    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]",
                    "resize-none"
                  )}
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 mt-2 border-t border-[rgb(var(--border))]">
                <Button
                  variant="destructive_outline"
                  size="sm"
                  onClick={() => handleVerify(verification._id, "reject")}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                >
                  <XCircle size={16} className="mr-1.5" /> Reject
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleVerify(verification._id, "approve")}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                >
                  <CheckCircle size={16} className="mr-1.5" /> Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

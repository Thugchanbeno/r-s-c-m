"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, Briefcase, Award } from "lucide-react";
import WorkRequestsTabNew from "@/components/approvals/WorkRequestsTabNew";
import ResourceRequestsTabNew from "@/components/approvals/ResourceRequestsTabNew";
import SkillVerificationsTabNew from "@/components/approvals/SkillVerificationsTabNew";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const ApprovalsViewNew = ({ user }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("work");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["work", "resources", "skills"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.push(`/approvals?tab=${tabId}`, { scroll: false });
  };

  const tabs = [
    {
      id: "work",
      label: "Work Requests",
      icon: ClipboardList,
      description: "Leave and overtime approvals",
      roles: ["line_manager", "admin", "hr", "pm"],
    },
    {
      id: "resources",
      label: "Resource Requests",
      icon: Briefcase,
      description: "Project allocation requests",
      roles: ["line_manager", "admin", "hr", "pm"],
    },
    {
      id: "skills",
      label: "Skill Verifications",
      icon: Award,
      description: "Employee skill validations",
      roles: ["line_manager", "admin", "hr"],
    },
  ];

  const visibleTabs = tabs.filter((tab) => tab.roles.includes(user?.role));

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-rscm-dark-purple">Loading approvals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-rscm-dark-purple">
              Approvals & Requests
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review and manage pending approvals from your team
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-rscm-violet text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "work" && <WorkRequestsTabNew user={user} />}
      {activeTab === "resources" && <ResourceRequestsTabNew user={user} />}
      {activeTab === "skills" && <SkillVerificationsTabNew user={user} />}
    </div>
  );
};

export default ApprovalsViewNew;

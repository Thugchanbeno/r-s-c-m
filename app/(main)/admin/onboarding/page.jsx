"use client";
import { useState } from "react";
import OnboardingForm from "@/components/admin/onboarding/OnboardingForm";
import TalentPool from "@/components/admin/onboarding/TalentPool";
import { Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserCreated = (newUser) => {
    setRefreshTrigger((prev) => prev + 1);
    setSelectedUser(newUser);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-2rem)] flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#251323] flex items-center gap-2">
            Onboarding
            <span className="px-2 py-0.5 rounded-full bg-[#4a2545]/5 text-[#4a2545] text-xs font-medium border border-[#4a2545]/10">
              Admin
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage new hires and search talent database
          </p>
        </div>
      </div>

      {/* Main Content - Floating Cards Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* LEFT: Talent Pool (List) - 4 Cols */}
        <div className="col-span-12 lg:col-span-4 h-full flex flex-col">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full overflow-hidden flex flex-col">
            <TalentPool
              selectedId={selectedUser?._id}
              onSelect={setSelectedUser}
              key={refreshTrigger}
              onAddNew={() => setSelectedUser(null)}
            />
          </div>
        </div>

        {/* RIGHT: Workspace (Form/View) - 8 Cols */}
        <div className="col-span-12 lg:col-span-8 h-full flex flex-col">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full overflow-hidden flex flex-col relative">
            <OnboardingForm
              selectedUser={selectedUser}
              onUserCreated={handleUserCreated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";

// Import resource components when ready
// import ResourcesListNew from "@/components/resources/ResourcesListNew";
// import ResourceAllocationFormNew from "@/components/resources/ResourceAllocationFormNew";

export default function TestLayoutPage() {
  const { user, isLoading } = useAuth();
  const [testView, setTestView] = useState("list"); // "list" or "form"

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <LoadingSpinner width={200} height={4} />
          <p className="text-sm text-rscm-dark-purple">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Test Banner */}
        <div className="bg-rscm-lilac/10 border border-rscm-lilac/30 rounded-lg px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-rscm-dark-purple mb-1 text-sm">
                🧪 Component Test Layout - Resources
              </h3>
              <p className="text-xs text-gray-600">
                Ready for resources component testing
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTestView("list")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  testView === "list"
                    ? "bg-rscm-violet text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Resources List
              </button>
              <button
                onClick={() => setTestView("form")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  testView === "form"
                    ? "bg-rscm-violet text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Allocate Resource
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder for resource components */}
        <div className="bg-white rounded-lg shadow-sm px-6 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-rscm-lilac/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rscm-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-rscm-dark-purple mb-2">
              Ready for Resources Redesign
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This test layout is prepared for testing new resource components.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Import resource components when ready</p>
              <p>• Test list and form views</p>
              <p>• Verify compact Intercom design patterns</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAllocations } from "@/lib/hooks/useAllocations";
import { toast } from "sonner";
import { Users, PieChart, Calendar } from "lucide-react";
import ResourcesListNew from "@/components/resources/ResourcesListNew";
import AllocationsViewNew from "@/components/resources/AllocationsViewNew";
import AllocationModal from "@/components/resources/AllocationModal";
import UserManagementModal from "@/components/resources/UserManagementModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const ResourcesViewNew = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { submitAllocation, isProcessingAction } = useAllocations();
  const [activeTab, setActiveTab] = useState("planning");
  const [searchTerm, setSearchTerm] = useState("");
  const [skillSearchTerm, setSkillSearchTerm] = useState("");

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["planning", "capacity", "allocations"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.push(`/resources?tab=${tabId}`, { scroll: false });
  };

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);

  const users = useQuery(
    api.users.getAll,
    user?.email ? { email: user.email, limit: 1000 } : "skip"
  );

  const projects = useQuery(
    api.projects.getAll,
    user?.email ? { email: user.email } : "skip"
  );

  const updateUser = useMutation(api.users.updateProfile);

  const handleUserUpdate = async (data) => {
    if (!user?.email || !selectedUser?._id) {
      toast.error("Missing user information");
      return;
    }

    try {
      await updateUser({
        email: user.email,
        id: selectedUser._id,
        name: data.name,
        role: data.role,
        department: data.department,
        availabilityStatus: data.availabilityStatus,
        weeklyHours: data.weeklyHours,
        lineManagerId: data.lineManagerId || undefined,
      });

      toast.success(`User ${data.name} updated successfully!`);
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const tabs = [
    {
      id: "planning",
      label: "Resource Planning",
      icon: Users,
      description: "Manage team members and their details",
    },
    {
      id: "capacity",
      label: "Capacity View",
      icon: PieChart,
      description: "View resource capacity and availability",
    },
    {
      id: "allocations",
      label: "Allocations",
      icon: Calendar,
      description: "Manage project allocations and assignments",
    },
  ];

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-rscm-dark-purple">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-rscm-dark-purple">Resources</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your team, capacity, and project allocations
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
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

      {/* Search Bars (for planning tab only) */}
      {activeTab === "planning" && (
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex gap-3">
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
          />
          <input
            type="text"
            placeholder="Search by skill..."
            value={skillSearchTerm}
            onChange={(e) => setSkillSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
          />
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "planning" && (
        <ResourcesListNew
          searchTerm={searchTerm}
          skillSearchTerm={skillSearchTerm}
          onManageUser={(usr) => {
            setSelectedUser(usr);
            setShowUserModal(true);
          }}
          onAllocateUser={(usr) => {
            setSelectedAllocation({
              userId: usr._id,
              projectId: "",
              allocationPercentage: "",
              role: "",
              startDate: null,
              endDate: null,
            });
            setShowAllocationModal(true);
          }}
        />
      )}

      {activeTab === "capacity" && (
        <div className="bg-white rounded-lg shadow-sm px-6 py-12 text-center">
          <PieChart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-semibold text-rscm-dark-purple mb-1">
            Capacity View
          </h3>
          <p className="text-xs text-gray-600">
            Coming soon - Visual capacity planning and analytics
          </p>
        </div>
      )}

      {activeTab === "allocations" && (
        <AllocationsViewNew
          onEditAllocation={(allocation) => {
            setSelectedAllocation(allocation);
            setShowAllocationModal(true);
          }}
          onCreateAllocation={() => {
            setSelectedAllocation(null);
            setSelectedUser(null);
            setShowAllocationModal(true);
          }}
        />
      )}

      {/* Modals */}
      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        users={users || []}
        onSubmit={handleUserUpdate}
        isSubmitting={false}
      />

      <AllocationModal
        isOpen={showAllocationModal}
        onClose={() => {
          setShowAllocationModal(false);
          setSelectedAllocation(null);
          setSelectedUser(null);
        }}
        allocation={selectedAllocation}
        users={users || []}
        projects={projects || []}
        onSubmit={async (data) => {
          const result = await submitAllocation(data);
          if (result.success) {
            setShowAllocationModal(false);
            setSelectedAllocation(null);
            setSelectedUser(null);
          }
        }}
        isSubmitting={isProcessingAction}
      />
    </div>
  );
};

export default ResourcesViewNew;

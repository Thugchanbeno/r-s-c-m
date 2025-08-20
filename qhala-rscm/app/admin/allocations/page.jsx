"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Badge from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import AllocationForm from "@/components/admin/AllocationForm";
import {
  ArrowLeft,
  UserCheck,
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  pageVariants,
  itemVariants,
  listContainerVariants,
} from "@/lib/animations";
import {
  getAllocationPercentageColor,
} from "@/components/common/CustomColors";
import { formatDate } from "@/lib/dateUtils";
import { useAllocations } from "@/lib/hooks/useAllocations";
import { cn } from "@/lib/utils";

const AllocationsListPage = () => {
  const { data: session, status: sessionStatus } = useSession({
    required: true,
  });

  const {
    allocations,
    loading,
    error,
    currentPage,
    totalPages,
    goToPage,
    setError,
    usersList,
    projectsList,
    loadingDropdowns,
    dropdownError,
    editingAllocation,
    isProcessingAction,
    selectAllocationForEdit,
    clearEditingAllocation,
    submitAllocation,
    confirmDeleteId,
    handleDeleteClick,
    cancelDeleteConfirmation,
  } = useAllocations();

  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      !["admin", "hr"].includes(session?.user?.role)
    ) {
      setError("Access Denied: Insufficient permissions.");
    }
  }, [sessionStatus, session, setError]);

  const openCreateAllocationModal = () => {
    clearEditingAllocation();
    setIsAllocationModalOpen(true);
  };

  const openEditAllocationModal = (allocation) => {
    selectAllocationForEdit(allocation);
    setIsAllocationModalOpen(true);
  };

  const closeAllocationModal = () => {
    setIsAllocationModalOpen(false);
  };

  const handleFormSubmit = async (formData) => {
    const result = await submitAllocation(formData);
    if (result && result.success) {
      closeAllocationModal();
    }
  };

  const handleDelete = async (allocationId) => {
    if (window.confirm("Are you sure you want to delete this allocation?")) {
      await removeAllocation(allocationId);
    }
  };

  const isInitialLoading =
    sessionStatus === "loading" ||
    (loading && allocations.length === 0 && !error);

  if (isInitialLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--background))] p-10 text-center rounded-lg">
        <LoadingSpinner size={30} />
        <p className="mt-3 text-[rgb(var(--muted-foreground))]">
          Loading allocations...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 md:p-6 bg-[rgb(var(--background))] min-h-screen rounded-lg"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[rgb(var(--border))]"
        >
          <div>
            <Link href="/admin" className="inline-block mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] -ml-2"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Admin Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]">
              Manage Allocations
            </h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              View, create, edit, and delete resource allocations.
            </p>
          </div>
          {(session?.user?.role === "admin" ||
            session?.user?.role === "hr") && (
            <Button
              variant="primary"
              onClick={openCreateAllocationModal}
              disabled={isProcessingAction || loadingDropdowns}
              isLoading={loadingDropdowns && !isAllocationModalOpen}
            >
              <PlusCircle size={18} className="mr-2" /> Create New Allocation
            </Button>
          )}
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className={cn(
              "flex items-center p-4 rounded-lg text-sm shadow-sm",
              "bg-[rgb(var(--destructive))]/15 text-[rgb(var(--destructive))] border border-[rgb(var(--destructive))]/40"
            )}
          >
            <AlertCircle size={20} className="mr-2 flex-shrink-0" /> {error}
          </motion.div>
        )}

        {loading && allocations.length > 0 && !isInitialLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size={24} />
          </div>
        )}

        {!loading && allocations.length === 0 && !error && (
          <motion.div
            variants={itemVariants}
            className="text-center text-[rgb(var(--muted-foreground))] py-10 bg-[rgb(var(--card))] rounded-[var(--radius)] shadow-sm border border-[rgb(var(--border))]"
          >
            <UserCheck
              size={40}
              className="mx-auto mb-3 text-[rgb(var(--muted-foreground))]"
              strokeWidth={1.5}
            />
            No allocations found.
          </motion.div>
        )}

        {allocations.length > 0 && !error && (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Desktop Table View */}
            <Card className="hidden lg:block shadow-md bg-[rgb(var(--card))] rounded-[var(--radius)] overflow-hidden">
              <CardContent className="p-0">
                <table className="w-full table-fixed divide-y divide-[rgb(var(--border))]">
                  <thead className="bg-[rgb(var(--muted))]">
                    <tr>
                      <th
                        scope="col"
                        className="w-[30%] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[rgb(var(--foreground))] sm:pl-6"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="w-[20%] px-3 py-3.5 text-left text-sm font-semibold text-[rgb(var(--foreground))]"
                      >
                        Project
                      </th>
                      <th
                        scope="col"
                        className="w-[15%] px-3 py-3.5 text-left text-sm font-semibold text-[rgb(var(--foreground))]"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="w-[10%] px-3 py-3.5 text-left text-sm font-semibold text-[rgb(var(--foreground))]"
                      >
                        Allocation
                      </th>
                      <th
                        scope="col"
                        className="w-[15%] px-3 py-3.5 text-left text-sm font-semibold text-[rgb(var(--foreground))]"
                      >
                        Dates
                      </th>
                      <th
                        scope="col"
                        className="w-[10%] py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-[rgb(var(--foreground))]"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--border))] bg-[rgb(var(--card))]">
                    {allocations.map((alloc) => (
                      <motion.tr
                        key={alloc._id}
                        variants={itemVariants}
                        className="hover:bg-[rgb(var(--muted))] transition-colors duration-150"
                      >
                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 relative mr-3">
                              {alloc.userId?.avatarUrl ? (
                                <Image
                                  className="h-8 w-8 rounded-full object-cover"
                                  src={alloc.userId.avatarUrl}
                                  alt={alloc.userId.name || "User avatar"}
                                  width={32}
                                  height={32}
                                  sizes="32px"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center text-[rgb(var(--muted-foreground))]">
                                  <UserCheck size={16} />
                                </div>
                              )}
                              <span
                                className={cn(
                                  "absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-[rgb(var(--card))]",
                                  alloc.userId?.availabilityStatus ===
                                    "available" && "bg-green-500",
                                  alloc.userId?.availabilityStatus ===
                                    "unavailable" && "bg-red-500",
                                  alloc.userId?.availabilityStatus ===
                                    "on_leave" && "bg-yellow-500",
                                  !alloc.userId?.availabilityStatus &&
                                    "bg-gray-300"
                                )}
                                title={`Availability: ${
                                  alloc.userId?.availabilityStatus?.replace(
                                    "_",
                                    " "
                                  ) || "unknown"
                                }`}
                              ></span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-[rgb(var(--foreground))] truncate">
                                {alloc.userId?.name || "N/A"}
                              </div>
                              <div className="text-[rgb(var(--muted-foreground))] text-xs mt-0.5 truncate">
                                {alloc.userId?.email || ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-[rgb(var(--foreground))]">
                          <div className="truncate" title={alloc.projectId?.name || "N/A"}>
                            {alloc.projectId?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-[rgb(var(--muted-foreground))]">
                          <div className="truncate" title={alloc.role}>
                            {alloc.role}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm">
                          <Badge
                            size="sm"
                            pill={true}
                            className={getAllocationPercentageColor(
                              alloc.allocationPercentage
                            )}
                          >
                            {alloc.allocationPercentage}%
                          </Badge>
                        </td>
                        <td className="px-3 py-4 text-sm text-[rgb(var(--muted-foreground))]">
                          <div className="text-xs">
                            <div className="truncate">
                              {formatDate(alloc.startDate)}
                            </div>
                            <div className="truncate text-[rgb(var(--muted-foreground))]/80">
                              {formatDate(alloc.endDate)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditAllocationModal(alloc)}
                              disabled={isProcessingAction}
                              className="text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-accent-background))]"
                              aria-label={`Edit allocation for ${alloc.userId?.name}`}
                            >
                              <Edit size={14} />
                            </Button>
                            {confirmDeleteId === alloc._id ? (
                              <Button
                                variant="destructive"
                                size="icon-sm"
                                onClick={() => handleDeleteClick(alloc._id)}
                                onMouseLeave={cancelDeleteConfirmation}
                                disabled={isProcessingAction}
                                aria-label={`Confirm delete allocation for ${alloc.userId?.name}`}
                              >
                                <CheckCircle size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDeleteClick(alloc._id)}
                                disabled={isProcessingAction}
                                className="text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/10"
                                aria-label={`Delete allocation for ${alloc.userId?.name}`}
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <div className="lg:hidden space-y-4">
              {allocations.map((alloc) => (
                <motion.div
                  key={alloc._id}
                  variants={itemVariants}
                >
                  <Card className="shadow-md bg-[rgb(var(--card))] rounded-[var(--radius)] hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        {/* User Info */}
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="h-12 w-12 flex-shrink-0 relative mr-3">
                            {alloc.userId?.avatarUrl ? (
                              <Image
                                className="h-12 w-12 rounded-full object-cover"
                                src={alloc.userId.avatarUrl}
                                alt={alloc.userId.name || "User avatar"}
                                width={48}
                                height={48}
                                sizes="48px"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center text-[rgb(var(--muted-foreground))]">
                                <UserCheck size={24} />
                              </div>
                            )}
                            <span
                              className={cn(
                                "absolute -bottom-0.5 -right-0.5 block h-4 w-4 rounded-full ring-2 ring-[rgb(var(--card))]",
                                alloc.userId?.availabilityStatus ===
                                  "available" && "bg-green-500",
                                alloc.userId?.availabilityStatus ===
                                  "unavailable" && "bg-red-500",
                                alloc.userId?.availabilityStatus ===
                                  "on_leave" && "bg-yellow-500",
                                !alloc.userId?.availabilityStatus &&
                                  "bg-gray-300"
                              )}
                              title={`Availability: ${
                                alloc.userId?.availabilityStatus?.replace(
                                  "_",
                                  " "
                                ) || "unknown"
                              }`}
                            ></span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-[rgb(var(--foreground))] truncate">
                              {alloc.userId?.name || "N/A"}
                            </h3>
                            <p className="text-sm text-[rgb(var(--muted-foreground))] truncate">
                              {alloc.userId?.email || ""}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEditAllocationModal(alloc)}
                            disabled={isProcessingAction}
                            className="text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-accent-background))]"
                            aria-label={`Edit allocation for ${alloc.userId?.name}`}
                          >
                            <Edit size={16} />
                          </Button>
                          {confirmDeleteId === alloc._id ? (
                            <Button
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => handleDeleteClick(alloc._id)}
                              onMouseLeave={cancelDeleteConfirmation}
                              disabled={isProcessingAction}
                              aria-label={`Confirm delete allocation for ${alloc.userId?.name}`}
                            >
                              <CheckCircle size={16} />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteClick(alloc._id)}
                              disabled={isProcessingAction}
                              className="text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))]/10"
                              aria-label={`Delete allocation for ${alloc.userId?.name}`}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center">
                          <Briefcase size={16} className="text-[rgb(var(--muted-foreground))] mr-2 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                              {alloc.projectId?.name || "N/A"}
                            </p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              Project
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <UserCheck size={16} className="text-[rgb(var(--muted-foreground))] mr-2 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                              {alloc.role}
                            </p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              Role
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar size={16} className="text-[rgb(var(--muted-foreground))] mr-2" />
                          <div>
                            <p className="text-sm text-[rgb(var(--muted-foreground))]">
                              {formatDate(alloc.startDate)} - {formatDate(alloc.endDate)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          size="sm"
                          pill={true}
                          className={getAllocationPercentageColor(
                            alloc.allocationPercentage
                          )}
                        >
                          {alloc.allocationPercentage}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {totalPages > 1 && !error && (
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t border-[rgb(var(--border))]"
          >
            <Button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loading || isProcessingAction}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm text-[rgb(var(--muted-foreground))]">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => goToPage(currentPage + 1)}
              disabled={
                currentPage === totalPages || loading || isProcessingAction
              }
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </motion.div>
        )}
      </div>

      {isAllocationModalOpen && (
        <Modal
          isOpen={isAllocationModalOpen}
          onClose={closeAllocationModal}
          title={
            editingAllocation ? "Edit Allocation" : "Create New Allocation"
          }
        >
          <AllocationForm
            onFormSubmit={handleFormSubmit}
            onCancel={closeAllocationModal}
            currentAllocation={editingAllocation}
            isProcessing={isProcessingAction}
            usersList={usersList}
            projectsList={projectsList}
            loadingDropdowns={loadingDropdowns}
            dropdownError={dropdownError}
          />
        </Modal>
      )}
    </motion.div>
  );
};

export default AllocationsListPage;
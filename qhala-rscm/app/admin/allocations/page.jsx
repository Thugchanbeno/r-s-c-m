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
  getAvailabilityStyles,
} from "@/components/common/skillcolors";
import { formatDate } from "@/lib/dateUtils";
import { useAllocations } from "@/lib/hooks/useAllocations";

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
    removeAllocation,
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
    if (result.success) {
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
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--background))] p-10 text-center">
        <LoadingSpinner size={30} />
        <p className="mt-3 text-[rgb(var(--muted-foreground))]">
          Loading allocations...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 md:p-6 bg-[rgb(var(--muted))] min-h-screen"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between sm:items-center gap-4"
        >
          <div>
            <Link href="/admin">
              <Button
                variant="ghost"
                className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] mb-2 sm:mb-0 -ml-2"
              >
                <ArrowLeft size={18} className="mr-2" /> Back to Admin Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]">
              {" "}
              Manage Allocations{" "}
            </h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              {" "}
              View, create, edit, and delete resource allocations.{" "}
            </p>
          </div>
          {(session?.user?.role === "admin" ||
            session?.user?.role === "hr") && (
            <Button
              variant="primary"
              onClick={openCreateAllocationModal}
              disabled={isProcessingAction}
            >
              <PlusCircle size={18} className="mr-2" /> Create New Allocation
            </Button>
          )}
        </motion.div>
        {error && (
          <motion.div
            variants={itemVariants}
            className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-[var(--radius)] flex items-center gap-2"
          >
            <AlertCircle size={20} /> {error}
          </motion.div>
        )}
        {loading && allocations.length > 0 && (
          <div className="flex justify-center py-4">
            {" "}
            <LoadingSpinner size={24} />{" "}
          </div>
        )}
        {!loading && allocations.length === 0 && !error && (
          <motion.p
            variants={itemVariants}
            className="text-center text-[rgb(var(--muted-foreground))] py-10"
          >
            No allocations found.
          </motion.p>
        )}
        {allocations.length > 0 && !error && (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[rgb(var(--border))]">
                    <thead className="bg-[rgb(var(--muted))]">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[rgb(var(--foreground))] sm:pl-6"
                        >
                          {" "}
                          User{" "}
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-[rgb(var(--foreground))]"
                        >
                          {" "}
                          Project{" "}
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-[rgb(var(--foreground))]"
                        >
                          {" "}
                          Role{" "}
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-[rgb(var(--foreground))]"
                        >
                          {" "}
                          Allocation{" "}
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-[rgb(var(--foreground))]"
                        >
                          {" "}
                          Dates{" "}
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          {" "}
                          <span className="sr-only">Actions</span>{" "}
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
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 relative mr-3">
                                {alloc.userId?.avatarUrl ? (
                                  <Image
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={alloc.userId.avatarUrl}
                                    alt=""
                                    width={40}
                                    height={40}
                                    sizes="40px"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center text-[rgb(var(--muted-foreground))]">
                                    <UserCheck size={20} />
                                  </div>
                                )}
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-[rgb(var(--card))] ${getAvailabilityStyles(
                                    alloc.userId?.availabilityStatus
                                  )
                                    .split(" ")[0]
                                    .replace("border-", "bg-")
                                    .replace("-400", "-500")}`}
                                  aria-label={`Availability: ${
                                    alloc.userId?.availabilityStatus ||
                                    "unknown"
                                  }`}
                                ></span>
                              </div>
                              <div>
                                <div className="font-medium text-[rgb(var(--foreground))]">
                                  {alloc.userId?.name || "N/A"}
                                </div>
                                <div className="text-[rgb(var(--muted-foreground))] text-xs mt-0.5">
                                  {alloc.userId?.email || ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-[rgb(var(--foreground))]">
                            {alloc.projectId?.name || "N/A"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-[rgb(var(--muted-foreground))]">
                            {alloc.role}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
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
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-[rgb(var(--muted-foreground))]">
                            {formatDate(alloc.startDate)} -{" "}
                            {formatDate(alloc.endDate)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEditAllocationModal(alloc)}
                                disabled={isProcessingAction}
                                className="text-[rgb(var(--primary))] hover:bg-[rgba(var(--primary),0.1)]"
                                aria-label={`Edit allocation for ${alloc.userId?.name}`}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(alloc._id)}
                                disabled={isProcessingAction}
                                className="text-red-600 hover:bg-red-50"
                                aria-label={`Delete allocation for ${alloc.userId?.name}`}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {totalPages > 1 && !error && (
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-center space-x-2 mt-6"
          >
            <Button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loading || isProcessingAction}
              variant="outline"
              size="sm"
            >
              {" "}
              Previous{" "}
            </Button>
            <span className="text-sm text-[rgb(var(--muted-foreground))]">
              {" "}
              Page {currentPage} of {totalPages}{" "}
            </span>
            <Button
              onClick={() => goToPage(currentPage + 1)}
              disabled={
                currentPage === totalPages || loading || isProcessingAction
              }
              variant="outline"
              size="sm"
            >
              {" "}
              Next{" "}
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

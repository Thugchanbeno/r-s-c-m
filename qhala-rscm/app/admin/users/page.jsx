"use client";
import { useState, useCallback } from "react";
import UserList from "@/components/admin/UserList";
import Modal from "@/components/common/Modal";
import EditUserForm from "@/components/admin/UserForm";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditClick = useCallback((userId) => {
    setEditingUserId(userId);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUserId(null);
  }, []);

  const handleUserUpdated = useCallback(() => {
    handleCloseModal();
    setRefreshKey((prevKey) => prevKey + 1);
  }, [handleCloseModal]);

  return (
    <div className="p-4 md:p-6 bg-[rgb(var(--background))] min-h-screen rounded-lg">
      <div className="mb-6 pb-4 border-b border-[rgb(var(--border))]">
        <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]">
          Manage Users
        </h1>
        <p className="mt-1 text-[rgb(var(--muted-foreground))]">
          View, search, and edit user profiles and roles.
        </p>
      </div>

      <UserList
        key={refreshKey}
        onEditUser={handleEditClick}
        // onDeleteUser={handleDeleteUser} // Implement when ready
      />

      {isModalOpen && editingUserId && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={`Edit User`} // Simplified title, more details can be in the form
        >
          <EditUserForm
            userId={editingUserId}
            onUserUpdated={handleUserUpdated}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}

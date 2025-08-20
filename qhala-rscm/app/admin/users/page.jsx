"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import UserList from "@/components/admin/UserList";
import Modal from "@/components/common/Modal";
import EditUserForm from "@/components/admin/UserForm";
import { Button } from "@/components/ui/button";
import { CreateUserFlow } from "@/components/admin/CreateUserFlow";

export default function AdminUsersPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const handleEditClick = useCallback((userId) => {
    setEditingUserId(userId);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingUserId(null);
  }, []);

  const handleUserUpdated = useCallback(() => {
    handleCloseEditModal();
    setRefreshKey((prevKey) => prevKey + 1);
  }, [handleCloseEditModal]);

  const handleUserCreated = useCallback(() => {
    setIsCreateModalOpen(false);
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  return (
    <div className="p-4 md:p-6 bg-[rgb(var(--background))] min-h-screen rounded-lg">
      <div className="mb-6 pb-4 border-b border-[rgb(var(--border))] flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]">
            Manage Users
          </h1>
          <p className="mt-1 text-[rgb(var(--muted-foreground))]">
            View, search, and edit user profiles and roles.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <UserList
        key={refreshKey}
        onEditUser={handleEditClick}
        // onDeleteUser={handleDeleteUser}
      />

      {/* Modal for Editing an Existing User */}
      {isEditModalOpen && editingUserId && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          title={`Edit User`}
        >
          <EditUserForm
            userId={editingUserId}
            onUserUpdated={handleUserUpdated}
            onCancel={handleCloseEditModal}
          />
        </Modal>
      )}

      {/* Modal for the New User Creation Flow */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
        size="xl" // Use the larger size for the form
      >
        <CreateUserFlow
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={handleUserCreated}
        />
      </Modal>
    </div>
  );
}

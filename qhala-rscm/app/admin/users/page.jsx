"use client";
import { useState, useCallback } from "react";
import UserList from "@/components/admin/UserList";
import Modal from "@/components/common/Modal";
import EditUserForm from "@/components/admin/UserForm";

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
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-900">
        Manage Users
      </h1>

      {/* UserList component fetches and displays users */}
      {/* Pass handleEditClick and a key for refreshing */}
      <UserList
        key={refreshKey}
        onEditUser={handleEditClick}
        // Pass onDeleteUser later when implementing delete
        // onDeleteUser={handleDeleteUser}
      />

      {/* Render Modal conditionally */}
      {isModalOpen && editingUserId && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={`Edit User (ID: ${editingUserId.substring(0, 8)}...)`} // Show partial ID in title might change later for clarity
        >
          {/* Render EditUserForm inside the modal */}
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

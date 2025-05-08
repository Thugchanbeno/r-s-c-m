"use client";
import { useState, useCallback } from "react";
import SkillTaxonomyList from "@/components/SkillTaxonomyList";
import SkillForm from "@/components/admin/SkillForm";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { PlusCircle } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSession } from "next-auth/react";

export default function AdminSkillsPage() {
  const { status } = useSession({ required: true });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSkillAdded = useCallback(() => {
    setIsModalOpen(false);
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[rgb(var(--background))]">
        <LoadingSpinner size={30} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
          Manage Skill Taxonomy
        </h1>
        <Button variant="primary" onClick={openModal}>
          <PlusCircle size={18} className="mr-2" /> Add New Skill
        </Button>
      </div>
      <SkillTaxonomyList key={refreshKey} />
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Add New Skill">
        <SkillForm onSkillAdded={handleSkillAdded} />
      </Modal>
    </div>
  );
}

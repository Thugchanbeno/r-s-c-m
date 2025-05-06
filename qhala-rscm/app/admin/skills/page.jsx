"use client";
import React, { useState, useCallback } from "react";
import SkillTaxonomyList from "@/components/SkillTaxonomyList";
import SkillForm from "@/components/admin/SkillForm";
import Button from "@/components/common/Button";
import { PlusCircle, X } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSession } from "next-auth/react";

// This page is protected by app/admin/layout.jsx
export default function AdminSkillsPage() {
  const { status } = useSession({ required: true });
  const [showAddForm, setShowAddForm] = useState(false);
  // State to trigger refresh of SkillsTaxonomyList after adding a skill
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSkillAdded = useCallback(() => {
    setShowAddForm(false); // Hide form on success
    setRefreshKey((prevKey) => prevKey + 1); // Increment key to refresh list
  }, []);

  const handleCancelAdd = useCallback(() => {
    setShowAddForm(false);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center pt-20">
        <LoadingSpinner size={30} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Manage Skill Taxonomy
        </h1>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <PlusCircle size={18} className="mr-2" /> Add New Skill
          </Button>
        )}
      </div>

      {/* Conditionally render the Add Skill Form */}
      {showAddForm && (
        <div className="mb-8 p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Skill</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancelAdd}
              className="p-1"
            >
              <X size={20} />
            </Button>
          </div>
          <SkillForm onSkillAdded={handleSkillAdded} />
        </div>
      )}
      {/* need to pass keys to get rid of the persistent each child needs a key prop */}
      {/* SkillsTaxonomyList fetches and displays the current taxonomy */}
      {/* Pass key to force re-render/re-fetch when a skill is added */}
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <SkillTaxonomyList key={refreshKey} />
      </div>
    </div>
  );
}

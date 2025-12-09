"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, BrainCircuit } from "lucide-react";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/user/ProfileComponents";
import { fadeIn, staggerChildren } from "@/lib/animations";
import { useDebounce } from "@/lib/hooks/useDebounce";

export const CachedCVs = ({ onSelectCv }) => {
  const [cvs, setCvs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchCvs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/cv-cache?skill=${debouncedSearchTerm}`
        );
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to fetch cached CVs.");
        }
        setCvs(result.data);
      } catch (err) {
        setError(err.message);
        setCvs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCvs();
  }, [debouncedSearchTerm]);

  const handleSelect = (cv) => {
    onSelectCv({ prepopulatedData: cv.prepopulatedData });
  };

  return (
    <motion.div variants={fadeIn}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Or Select a Processed CV
      </h3>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by skill (e.g., Python)..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="relative h-80 overflow-y-auto rounded-lg border bg-background p-2 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorMessage message={error} />
          </div>
        ) : cvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <FileText className="h-8 w-8 mb-2" />
            <p className="font-semibold">No CVs Found</p>
            <p className="text-sm">
              Try a different search or upload a new CV.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <motion.ul variants={staggerChildren}>
              {cvs.map((cv) => (
                <motion.li
                  key={cv._id}
                  variants={fadeIn}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => handleSelect(cv)}
                  className="flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors hover:bg-muted"
                >
                  <div className="flex items-center overflow-hidden">
                    <BrainCircuit className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-foreground truncate">
                        {cv.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cv.extractedSkills.length} skills identified
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {new Date(cv.createdAt).toLocaleDateString()}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

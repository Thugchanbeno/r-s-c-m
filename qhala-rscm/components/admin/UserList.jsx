"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Image from "next/image";
import Button from "@/components/common/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import {
  Edit,
  Trash2,
  Mail,
  Building,
  UserCheck,
  Search,
  UserPlus,
  AlertCircle,
  Users as UsersIcon,
} from "lucide-react";
import { getAvailabilityStyles } from "@/components/common/CustomColors";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const UserList = ({
  searchTerm = "",
  skillSearchTerm = "",
  onEditUser,
  onDeleteUser,
  onInitiateRequest,
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (textSearch, skillSearch) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (textSearch) {
        params.append("search", textSearch);
      }
      if (skillSearch) {
        params.append("skillName", skillSearch);
      }

      const apiUrl = `/api/users?${params.toString()}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Error: ${response.status} ${response.statusText}`
        );
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        throw new Error(
          result.error || "Invalid data format received from API."
        );
      }
    } catch (err) {
      console.error("UserList: Error fetching users:", err);
      setError(err.message || "An error occurred while fetching users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(searchTerm, skillSearchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, skillSearchTerm, fetchUsers]);

  const handleEditClick = (userId) => {
    if (onEditUser) onEditUser(userId);
  };

  const handleDeleteClick = (userId) => {
    if (onDeleteUser) onDeleteUser(userId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] bg-[rgb(var(--card))] rounded-[var(--radius)] shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size={24} />
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex items-center p-4 rounded-lg text-sm shadow-sm",
          "bg-[rgb(var(--destructive))]/15",
          "text-[rgb(var(--destructive))]",
          "border border-[rgb(var(--destructive))]/40"
        )}
      >
        <AlertCircle size={20} className="mr-3 flex-shrink-0" />
        <span className="font-medium">Error loading users: {error}</span>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 pt-0"
      >
        {users.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-12 px-6 bg-[rgb(var(--muted))] rounded-[var(--radius)] border-2 border-dashed border-[rgb(var(--border))]"
          >
            <Search
              className="w-12 h-12 text-[rgb(var(--muted-foreground))] mb-3"
              strokeWidth={1.5}
            />
            <p className="text-[rgb(var(--muted-foreground))] text-center">
              {searchTerm || skillSearchTerm
                ? `No users found matching your criteria.`
                : "No users found."}
            </p>
          </motion.div>
        ) : (
          users.map((user) => {
            const availabilityStyleClasses = getAvailabilityStyles(
              user.availabilityStatus
            );

            return (
              <motion.div key={user._id} variants={itemVariants}>
                <Card
                  className={cn(
                    "group overflow-hidden transition-all duration-300 border-2 hover:shadow-xl",
                    availabilityStyleClasses,
                    "bg-[rgb(var(--card))]"
                  )}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {user.avatarUrl ? (
                            <div className="relative h-16 w-16">
                              <Image
                                className="rounded-full object-cover border-4 border-[rgb(var(--background))]"
                                src={user.avatarUrl}
                                alt={`${user.name}'s avatar`}
                                fill
                                sizes="64px"
                              />
                            </div>
                          ) : (
                            <div className="relative h-16 w-16 bg-[rgb(var(--muted))] rounded-full flex items-center justify-center border-4 border-[rgb(var(--background))]">
                              <UserCheck
                                size={32}
                                className="text-[rgb(var(--muted-foreground))]"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-lg sm:text-xl font-semibold text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors duration-300">
                            {user.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] flex items-center mt-1">
                            <Mail
                              size={14}
                              className="mr-2 text-[rgb(var(--muted-foreground))] opacity-80"
                            />
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex flex-col sm:items-end sm:ml-auto mt-4 sm:mt-0 space-y-2">
                        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
                          <div className="flex items-center gap-2">
                            {/* Reverted Badge variants to original logic */}
                            <Badge
                              variant={
                                user.availabilityStatus === "available"
                                  ? "success"
                                  : user.availabilityStatus === "unavailable"
                                  ? "error"
                                  : "default"
                              }
                              className="capitalize px-2.5 py-1 text-[10px] sm:text-xs"
                              pill={true}
                            >
                              {user.availabilityStatus?.replace("_", " ") ||
                                "Unknown"}
                            </Badge>
                            <Badge
                              variant={
                                user.role === "admin" || user.role === "hr"
                                  ? "error" // These were your original variants
                                  : user.role === "pm"
                                  ? "warning"
                                  : "success"
                              }
                              className="capitalize px-2.5 py-1 text-[10px] sm:text-xs"
                              pill={true}
                            >
                              {user.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
                            <Building
                              size={14}
                              className="text-[rgb(var(--muted-foreground))]"
                            />
                            <span className="font-medium text-[rgb(var(--foreground))]">
                              {user.department || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-auto self-start sm:self-end pt-2">
                          {onInitiateRequest && (
                            <Button
                              variant="success" // Keep themed success variant
                              size="xs"
                              onClick={() => onInitiateRequest(user)}
                              aria-label={`Request ${user.name} for project`}
                            >
                              <UserPlus size={16} className="mr-1 sm:mr-1.5" />
                              <span className="hidden sm:inline">Request</span>
                            </Button>
                          )}
                          {onEditUser && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleEditClick(user._id)}
                              className="text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-accent-background))]"
                              aria-label="Edit user"
                            >
                              <Edit size={16} />
                            </Button>
                          )}
                          {onDeleteUser && (
                            <Button
                              variant="destructive_outline" // Keep themed destructive outline
                              size="xs"
                              onClick={() => handleDeleteClick(user._id)}
                              aria-label="Delete user"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </>
  );
};

export default UserList;

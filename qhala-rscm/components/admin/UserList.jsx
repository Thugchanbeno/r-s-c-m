// components/admin/UserList.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Image from "next/image";
import Button from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import { Edit, Trash2, Mail, Building, UserCheck, Search } from "lucide-react";
import { getAvailabilityStyles } from "@/components/common/skillcolors";

// Animation variants (unchanged)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const UserList = ({ searchTerm = "", onEditUser, onDeleteUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (search) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = search
        ? `/api/users?search=${encodeURIComponent(search)}`
        : "/api/users";
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
    fetchUsers(searchTerm);
  }, [searchTerm, fetchUsers]);

  const handleEditClick = (userId) => {
    if (onEditUser) onEditUser(userId);
    else console.warn("UserList: onEditUser prop not provided.");
  };

  const handleDeleteClick = (userId) => {
    if (onDeleteUser) onDeleteUser(userId);
    else console.warn("UserList: onDeleteUser prop not provided.");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] bg-[rgb(var(--muted))] rounded-[var(--radius)] shadow-sm">
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
        className="p-6 bg-red-50 border border-red-200 rounded-[var(--radius)] shadow-sm"
      >
        <div className="flex items-center gap-3 text-red-600">
          <span className="p-2 bg-red-100 rounded-lg">
            <Search className="w-5 h-5" /> {/* Or AlertCircle */}
          </span>
          <p className="font-medium">Error loading users: {error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {users.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-12 px-6 bg-[rgb(var(--muted))] rounded-[var(--radius)] border-2 border-dashed border-[rgb(var(--border))]"
        >
          <Search className="w-12 h-12 text-[rgb(var(--muted-foreground))] mb-3" />
          <p className="text-[rgb(var(--muted-foreground))] text-center">
            {searchTerm
              ? `No users found matching "${searchTerm}"`
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
                className={`group overflow-hidden transition-all duration-300 border-2 ${availabilityStyleClasses}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* User Avatar and Basic Info */}
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--primary))] to-purple-500 rounded-full opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                        {user.avatarUrl ? ( // Check if avatarUrl exists
                          <div className="relative h-16 w-16">
                            <Image
                              className="rounded-full object-cover border-4 border-[rgb(var(--card))]"
                              src={user.avatarUrl}
                              alt={`${user.name}'s avatar`}
                              fill
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          // Placeholder if no avatarUrl
                          <div className="relative h-16 w-16 bg-[rgb(var(--muted))] rounded-full flex items-center justify-center border-4 border-[rgb(var(--card))]">
                            <UserCheck
                              size={32}
                              className="text-[rgb(var(--muted-foreground))]"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[rgb(var(--card-foreground))] group-hover:text-[rgb(var(--primary))] transition-colors duration-300">
                          {user.name}
                        </h3>
                        <p className="text-sm text-[rgb(var(--muted-foreground))] flex items-center mt-1">
                          <Mail size={14} className="mr-2 opacity-70" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* User Details and Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 ml-auto">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <UserCheck
                            size={16}
                            className="text-[rgb(var(--muted-foreground))]"
                          />
                          <Badge
                            variant={
                              user.role === "admin" || user.role === "hr"
                                ? "error"
                                : user.role === "pm"
                                ? "warning"
                                : "success"
                            }
                            className="capitalize px-3 py-1"
                            pill={true}
                          >
                            {user.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building
                            size={16}
                            className="text-[rgb(var(--muted-foreground))]"
                          />
                          <span className="text-sm font-medium text-[rgb(var(--card-foreground))]">
                            {user.department || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:ml-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(user._id)}
                          className="text-[rgb(var(--primary))] hover:bg-[rgba(var(--primary),0.1)] p-2"
                          aria-label="Edit user"
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(user._id)}
                          className="text-red-600 hover:bg-red-50 p-2"
                          aria-label="Delete user"
                        >
                          <Trash2 size={18} />
                        </Button>
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
  );
};

export default UserList;

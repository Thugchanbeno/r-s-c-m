"use client";
import { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Image from "next/image";
import Button from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import { Edit, Trash2, Mail, Building, UserCheck } from "lucide-react";

// Accepts searchTerm for filtering, and callbacks for edit/delete actions
const UserList = ({ searchTerm = "", onEditUser, onDeleteUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized fetch function (remains the same)
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

  // Effect to fetch users (remains the same)
  useEffect(() => {
    fetchUsers(searchTerm);
  }, [searchTerm, fetchUsers]);

  // Action Handlers (remain the same)
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
      <div className="flex justify-center items-center p-6 min-h-[200px]">
        <LoadingSpinner size={20} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-600 p-4 border border-red-200 bg-red-50 rounded">
        Error loading users: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400 italic border border-dashed rounded-md">
          {searchTerm
            ? `No users found matching "${searchTerm}".`
            : "No users found."}
        </div>
      ) : (
        // Map users to Card components the ui for the cards might need extra work to spread out the info more evenly within the card
        users.map((user) => (
          <Card key={user._id} className="p-0 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center flex-shrink-0">
                  {user.avatarUrl && (
                    <div className="relative h-16 w-16 mr-4">
                      <Image
                        className="rounded-full object-cover"
                        src={user.avatarUrl}
                        alt={`${user.name}'s avatar`}
                        fill
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Mail size={14} className="mr-1.5 opacity-70" />{" "}
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex-grow hidden sm:block"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full sm:w-auto mt-3 sm:mt-0">
                  <div className="flex flex-col items-start sm:items-end text-sm w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <UserCheck
                        size={14}
                        className="mr-1.5 text-gray-500 dark:text-gray-400"
                      />
                      <span className="font-medium mr-2 text-gray-600 dark:text-gray-300">
                        Role:
                      </span>
                      <Badge
                        variant={
                          // Use Badge component for role
                          user.role === "admin" || user.role === "hr"
                            ? "destructive"
                            : user.role === "pm"
                            ? "warning"
                            : "success"
                        }
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <Building
                        size={14}
                        className="mr-1.5 text-gray-500 dark:text-gray-400"
                      />
                      <span className="font-medium mr-2 text-gray-600 dark:text-gray-300">
                        Dept:
                      </span>
                      <span className="text-gray-700 dark:text-gray-200">
                        {user.department || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0 self-start sm:self-center">
                    <Button
                      variant="ghost"
                      size="sm" // Use sm for potentially smaller buttons
                      onClick={() => handleEditClick(user._id)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                      aria-label={`Edit user ${user.name}`}
                    >
                      <Edit size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                      aria-label={`Delete user ${user.name}`}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default UserList;

"use client";
import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UserCreationForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee",
    department: "Engineering",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          newUserEmail: formData.email,
        }),
      });

      if (!response.ok) throw new Error("Failed to create user");

      toast.success("User created successfully");
      setFormData({
        name: "",
        email: "",
        role: "employee",
        department: "Engineering",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-[#3d2346] mb-4">
        Manual Onboarding
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#3d2346]/10 focus:border-[#3d2346] outline-none transition-all"
            placeholder="e.g. Jane Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#3d2346]/10 focus:border-[#3d2346] outline-none transition-all"
            placeholder="jane@company.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 outline-none"
            >
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 outline-none"
            >
              <option value="employee">Employee</option>
              <option value="line_manager">Line Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Create User
            </>
          )}
        </button>
      </form>
    </div>
  );
}

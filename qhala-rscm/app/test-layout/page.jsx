"use client";
import AppLayout from "@/components/layout/AppLayout";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function TestLayoutPage() {
  const mockUser = {
    id: "test-user",
    name: "Test Admin",
    email: "admin@rscm.com",
    role: "admin",
  };

  return (
    <AppLayout>
      <AdminDashboard user={mockUser} />
    </AppLayout>
  );
}

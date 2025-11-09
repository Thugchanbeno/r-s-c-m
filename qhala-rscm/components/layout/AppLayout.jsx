"use client";
import AppSidebar from "./AppSidebar";
import NotificationRotator from "./NotificationRotator";

const AppLayout = ({ children }) => {
  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-100"
      style={{
        backgroundImage: `radial-gradient(circle, rgb(var(--rscm-violet) / 0.08) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      <AppSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3">
          <NotificationRotator />
        </div>

        <main className="flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

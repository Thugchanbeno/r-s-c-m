"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Briefcase,
  Award,
  CheckSquare,
} from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";
import WorkRequestsTab from "@/components/approvals/WorkRequestsTab";
import SkillVerificationsTab from "@/components/approvals/SkillVerificationsTab";
import ResourceRequestsTab from "@/components/approvals/ResourceRequestsTab";

export default function LineManagerRequestsView({ user }) {
  const [activeTab, setActiveTab] = useState("work-requests");

  const tabs = [
    {
      value: "work-requests",
      label: "Leave & Overtime",
      icon: ClipboardList,
      description: "Approve leave and overtime requests from your team",
    },
    {
      value: "resource-requests",
      label: "Resource Allocation",
      icon: Briefcase,
      description: "Review resource allocation requests for projects",
    },
    {
      value: "skill-verifications",
      label: "Skill Verifications",
      icon: Award,
      description: "Verify skills submitted by your direct reports",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[rgb(var(--background))] p-4 sm:p-6 lg:p-8"
    >
      <header className="pb-6 mb-6 border-b border-[rgb(var(--border))]">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="flex items-start gap-4">
            <div
              className={cn(
                "p-3 rounded-lg",
                "bg-[rgb(var(--primary))]/10"
              )}
            >
              <CheckSquare
                size={28}
                className="text-[rgb(var(--primary))]"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
                Approvals & Requests
              </h1>
              <p className="mt-1 text-[rgb(var(--muted-foreground))]">
                Review and manage pending approvals from your team
              </p>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 gap-4 bg-transparent h-auto p-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "data-[state=active]:bg-[rgb(var(--card))]",
                      "data-[state=active]:border-[rgb(var(--primary))]",
                      "data-[state=active]:shadow-md",
                      "border-2 border-transparent",
                      "rounded-lg p-4 transition-all",
                      "hover:bg-[rgb(var(--muted))]/50"
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Icon
                        size={20}
                        className={cn(
                          activeTab === tab.value
                            ? "text-[rgb(var(--primary))]"
                            : "text-[rgb(var(--muted-foreground))]"
                        )}
                      />
                      <div className="text-left flex-grow">
                        <div className="font-semibold text-sm">
                          {tab.label}
                        </div>
                        <div className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5 hidden sm:block">
                          {tab.description}
                        </div>
                      </div>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="work-requests" className="space-y-4">
              <WorkRequestsTab user={user} />
            </TabsContent>

            <TabsContent value="resource-requests" className="space-y-4">
              <ResourceRequestsTab user={user} />
            </TabsContent>

            <TabsContent value="skill-verifications" className="space-y-4">
              <SkillVerificationsTab user={user} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
}

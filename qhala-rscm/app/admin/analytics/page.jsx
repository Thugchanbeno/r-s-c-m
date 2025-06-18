"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/common/Button";
import { ArrowLeft } from "lucide-react";
import SkillDistributionChart from "@/components/admin/SkillDistributionChart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card";
import { cn } from "@/lib/utils";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", delay: 0.2 },
  },
};

export default function AnalyticsPage() {
  return (
    <motion.div
      className="p-4 md:p-6 bg-[rgb(var(--background))] min-h-screen rounded-lg"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div variants={itemVariants} className="mb-6">
          <Link href="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mb-8 pb-4 border-b border-[rgb(var(--border))]"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]">
            System Analytics
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">
            Insights into skills distribution and system usage.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SkillDistributionChart />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-10">
          <Card className="shadow-md bg-[rgb(var(--card))] rounded-[var(--radius)]">
            <CardHeader className="border-b border-[rgb(var(--border))]">
              <CardTitle className="text-[rgb(var(--foreground))]">
                Website Traffic (Google Analytics)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-[rgb(var(--muted-foreground))] py-10">
                Google Analytics integration placeholder.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  User,
  Building2,
  Globe,
  Briefcase,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Award,
  Target,
  Calendar,
  FileText,
  Plus,
  Clock,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { cn } from "@/lib/utils";
import {
  getSkillLevelColor,
  getSkillLevelName,
  getAllocationPercentageColor,
  getAvailabilityStyles,
  getMatchScoreColorClasses,
  getScoreRatingText,
  getStatusBadgeVariant,
  getStatusColor,
  getCapacityColor,
  getRequestStatusColor,
} from "@/components/common/CustomColors";

export const ProfileHeader = ({ user, capacityData, leaveData }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 p-8"
  >
    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-primary/60" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white p-1">
            <div
              className={cn(
                "h-full w-full rounded-full",
                getAvailabilityStyles(user?.availabilityStatus)
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {user?.name || "Loading..."}
          </h1>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {user?.role || "Employee"}
            </Badge>
            {user?.department && (
              <Badge variant="secondary" className="capitalize">
                <Building2 className="h-3 w-3 mr-1" />
                {user.department}
              </Badge>
            )}
            {user?.function && (
              <Badge variant="outline" className="capitalize">
                <Globe className="h-3 w-3 mr-1" />
                {user.function}
              </Badge>
            )}
            <Badge
              className={getStatusColor(user?.availabilityStatus)}
              variant="outline"
            >
              {user?.availabilityStatus?.replace("_", " ") || "Available"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {capacityData?.percentage || 0}%
          </div>
          <div className="text-sm text-muted-foreground">Capacity</div>
          <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                getCapacityColor(capacityData?.percentage || 0)
              )}
              style={{
                width: `${Math.min(capacityData?.percentage || 0, 100)}%`,
              }}
            />
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {user?.weeklyHours || 40}h
          </div>
          <div className="text-sm text-muted-foreground">Weekly Hours</div>
          <div className="text-xs text-muted-foreground mt-1">
            {user?.employeeType || "Full-time"}
          </div>
        </div>
        <div className="text-center col-span-2 lg:col-span-1">
          <div className="text-2xl font-bold text-foreground">
            {leaveData?.remaining || 0}
          </div>
          <div className="text-sm text-muted-foreground">Leave Days</div>
          <div className="text-xs text-muted-foreground mt-1">
            {leaveData?.compDays || 0} comp days
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export const EmploymentDetailsCard = ({
  user,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Employment Details
        </CardTitle>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <LoadingSpinner size={16} className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        )}
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Employee Type
          </label>
          <div className="mt-1">
            {isEditing ? (
              <Select defaultValue={user?.employeeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="consultancy">Consultancy</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground capitalize">
                {user?.employeeType || "Not specified"}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Weekly Hours
          </label>
          <div className="mt-1">
            {isEditing ? (
              <Input
                type="number"
                defaultValue={user?.weeklyHours || 40}
                min="1"
                max="60"
              />
            ) : (
              <p className="text-foreground">{user?.weeklyHours || 40} hours</p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Contract Start
          </label>
          <div className="mt-1">
            {isEditing ? (
              <Input
                type="date"
                defaultValue={
                  user?.contractStartDate
                    ? new Date(user.contractStartDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
              />
            ) : (
              <p className="text-foreground">
                {user?.contractStartDate
                  ? new Date(user.contractStartDate).toLocaleDateString()
                  : "Not specified"}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Contract End
          </label>
          <div className="mt-1">
            {isEditing ? (
              <Input
                type="date"
                defaultValue={
                  user?.contractEndDate
                    ? new Date(user.contractEndDate).toISOString().split("T")[0]
                    : ""
                }
              />
            ) : (
              <p className="text-foreground">
                {user?.contractEndDate
                  ? new Date(user.contractEndDate).toLocaleDateString()
                  : "Ongoing"}
              </p>
            )}
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          Payment Terms
        </label>
        <div className="mt-1">
          {isEditing ? (
            <Textarea
              placeholder="Enter payment terms..."
              defaultValue={user?.paymentTerms || ""}
              rows={3}
            />
          ) : (
            <p className="text-foreground">
              {user?.paymentTerms || "Not specified"}
            </p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const LineManagerCard = ({ lineManager }) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Line Manager
      </CardTitle>
    </CardHeader>
    <CardContent>
      {lineManager ? (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            {lineManager.avatarUrl ? (
              <Image
                src={lineManager.avatarUrl}
                alt={lineManager.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-primary/60" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{lineManager.name}</p>
            <p className="text-sm text-muted-foreground">{lineManager.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" size="sm">
                {lineManager.department}
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            No line manager assigned
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

export const SkillsSection = ({
  currentSkills,
  desiredSkills,
  pendingVerifications,
  onEditCurrent,
  onEditDesired,
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-4 flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        Skills & Expertise
        {pendingVerifications?.length > 0 && (
          <Badge variant="outline" className="ml-2">
            {pendingVerifications.length} pending
          </Badge>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Current Skills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Current Skills ({currentSkills?.length || 0})
          </h4>
          <Button size="sm" variant="ghost" onClick={onEditCurrent}>
            Edit
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentSkills?.length > 0 ? (
            currentSkills.map((skill) => (
              <Badge
                key={skill._id}
                className="px-3 py-1.5 text-sm font-medium border"
              >
                {skill.skillId?.name}
                {skill.proficiency && (
                  <span className="ml-1 opacity-75">L{skill.proficiency}</span>
                )}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm italic">
              No current skills added yet
            </p>
          )}
        </div>
      </div>

      {/* Desired Skills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Desired Skills ({desiredSkills?.length || 0})
          </h4>
          <Button size="sm" variant="ghost" onClick={onEditDesired}>
            Edit
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {desiredSkills?.length > 0 ? (
            desiredSkills.map((skill) => (
              <Badge
                key={skill._id}
                variant="outline"
                className="px-3 py-1.5 text-sm font-medium border-dashed"
              >
                {skill.skillId?.name}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm italic">
              No desired skills set yet
            </p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ProjectsSection = ({ allocations, isLoading, error }) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        Current Projects
      </CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size={24} />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      ) : allocations?.allocations?.length > 0 ? (
        <div className="space-y-4">
          {allocations.allocations.map((allocation) => (
            <motion.div
              key={allocation._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <Link
                  href={`/projects/${allocation.projectId?._id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {allocation.projectId?.name || "Unknown Project"}
                </Link>
                <Badge
                  className={cn(
                    "text-xs",
                    getAllocationPercentageColor(
                      allocation.allocationPercentage
                    )
                  )}
                >
                  {allocation.allocationPercentage}%
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>Role: {allocation.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {allocation.startDate
                      ? new Date(allocation.startDate).toLocaleDateString()
                      : "Start date TBD"}
                    {allocation.endDate &&
                      ` - ${new Date(allocation.endDate).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No active projects</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export const WorkRequestsSection = ({ requests, isLoading }) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        Work Requests
      </CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size={24} />
        </div>
      ) : requests?.length > 0 ? (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request._id} className="p-3 rounded-lg border bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium capitalize">
                    {request.requestType.replace("_", " ")} Request
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  className={getRequestStatusColor(request.status)}
                  variant="outline"
                >
                  {request.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{request.reason}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No work requests yet</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export const LeaveBalanceCard = ({
  leaveData,
  onRequestLeave,
  requests = [],
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Leave Balance
      </CardTitle>
      <Button size="sm" onClick={onRequestLeave}>
        Request Leave
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Balance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            {leaveData?.remaining || 0}
          </div>
          <div className="text-sm text-green-600 dark:text-green-500">
            Annual Leave
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {leaveData?.compDays || 0}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-500">
            Comp Days
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h4 className="font-medium mb-2">Leave History</h4>
        {requests.filter((r) => r.requestType === "leave").length > 0 ? (
          <ul className="space-y-2">
            {requests
              .filter((r) => r.requestType === "leave")
              .map((req) => (
                <li key={req._id} className="p-2 border rounded-md text-sm">
                  <div className="flex justify-between">
                    <span className="capitalize">{req.leaveType} Leave</span>
                    <span className="text-xs">{req.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {req.startDate &&
                      new Date(req.startDate).toLocaleDateString()}{" "}
                    -{" "}
                    {req.endDate && new Date(req.endDate).toLocaleDateString()}
                  </p>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No leave requests yet.
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

export const OvertimeCard = ({ onRequestOvertime, requests = [] }) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Overtime
      </CardTitle>
      <Button size="sm" onClick={onRequestOvertime}>
        Request Overtime
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Approved overtime can be compensated as <b>time off</b> or{" "}
        <b>payment</b>.
      </p>

      {/* History */}
      <div>
        <h4 className="font-medium mb-2">Overtime History</h4>
        {requests.filter((r) => r.requestType === "overtime").length > 0 ? (
          <ul className="space-y-2">
            {requests
              .filter((r) => r.requestType === "overtime")
              .map((req) => (
                <li key={req._id} className="p-2 border rounded-md text-sm">
                  <div className="flex justify-between">
                    <span>
                      {req.overtimeHours}h ({req.compensationType})
                    </span>
                    <span className="text-xs">{req.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {req.overtimeDate &&
                      new Date(req.overtimeDate).toLocaleDateString()}
                  </p>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No overtime requests yet.
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default {
  ProfileHeader,
  EmploymentDetailsCard,
  LineManagerCard,
  OvertimeCard,
  LeaveBalanceCard,
  SkillsSection,
  ProjectsSection,
  WorkRequestsSection,
};

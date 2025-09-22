"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  User,
  FileText,
  Briefcase,
  Users,
  CheckCircle2,
  Settings,
  TrendingUp,
  Clock,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Filter options with icons and colors
const PRIORITY_OPTIONS = [
  { value: "critical", label: "Critical", icon: AlertCircle, color: "rgb(239 68 68)" },
  { value: "high", label: "High", icon: AlertTriangle, color: "rgb(245 158 11)" },
  { value: "medium", label: "Medium", icon: Info, color: "rgb(59 130 246)" },
  { value: "low", label: "Low", icon: Info, color: "rgb(107 114 128)" },
];

const CATEGORY_OPTIONS = [
  { value: "user_management", label: "User Management", icon: User, color: "rgb(168 85 247)" },
  { value: "skills_verification", label: "Skills & Verification", icon: FileText, color: "rgb(34 197 94)" },
  { value: "projects", label: "Projects", icon: Briefcase, color: "rgb(59 130 246)" },
  { value: "resources", label: "Resources", icon: Users, color: "rgb(245 158 11)" },
  { value: "approvals", label: "Approvals", icon: CheckCircle2, color: "rgb(239 68 68)" },
  { value: "tasks", label: "Tasks", icon: Calendar, color: "rgb(139 69 19)" },
  { value: "system", label: "System", icon: Settings, color: "rgb(107 114 128)" },
  { value: "analytics", label: "Analytics", icon: TrendingUp, color: "rgb(236 72 153)" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const NotificationFilters = ({
  searchTerm = "",
  onSearchChange,
  filters = {},
  onFilterChange,
  onClearFilters,
  className,
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value && value !== "all" && value !== ""
  ).length;

  const handleQuickFilter = (type, value) => {
    onFilterChange?.(type, value);
  };

  const isFilterActive = (type, value) => {
    if (Array.isArray(filters[type])) {
      return filters[type].includes(value);
    }
    return filters[type] === value;
  };

  const toggleMultiFilter = (type, value) => {
    const currentValues = filters[type] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange?.(type, newValues.length > 0 ? newValues : undefined);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
          <Input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Quick Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleQuickFilter("status", value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Quick Date Filter */}
        <Select
          value={filters.dateRange || "all"}
          onValueChange={(value) => handleQuickFilter("dateRange", value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Popover open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Advanced
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClearFilters?.();
                      setAdvancedOpen(false);
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <Separator />

              {/* Priority Filters */}
              <div>
                <label className="text-sm font-medium mb-3 block">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isActive = isFilterActive("priorities", option.value);
                    
                    return (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                          isActive 
                            ? "bg-[rgb(var(--primary-accent-background))] text-[rgb(var(--primary))]"
                            : "hover:bg-[rgb(var(--muted))]"
                        )}
                        onClick={() => toggleMultiFilter("priorities", option.value)}
                      >
                        <Checkbox 
                          checked={isActive}
                          onChange={() => {}} // Handled by div click
                        />
                        <Icon 
                          className="h-4 w-4" 
                          style={{ color: option.color }}
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Category Filters */}
              <div>
                <label className="text-sm font-medium mb-3 block">Categories</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {CATEGORY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isActive = isFilterActive("categories", option.value);
                    
                    return (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                          isActive 
                            ? "bg-[rgb(var(--primary-accent-background))] text-[rgb(var(--primary))]"
                            : "hover:bg-[rgb(var(--muted))]"
                        )}
                        onClick={() => toggleMultiFilter("categories", option.value)}
                      >
                        <Checkbox 
                          checked={isActive}
                          onChange={() => {}} // Handled by div click
                        />
                        <Icon 
                          className="h-4 w-4" 
                          style={{ color: option.color }}
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Special Filters */}
              <div>
                <label className="text-sm font-medium mb-3 block">Special Filters</label>
                <div className="space-y-2">
                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                      filters.requiresAction
                        ? "bg-[rgb(var(--primary-accent-background))] text-[rgb(var(--primary))]"
                        : "hover:bg-[rgb(var(--muted))]"
                    )}
                    onClick={() => onFilterChange?.("requiresAction", !filters.requiresAction)}
                  >
                    <Checkbox 
                      checked={filters.requiresAction || false}
                      onChange={() => {}} // Handled by div click
                    />
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Action Required</span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                      filters.hasExpiry
                        ? "bg-[rgb(var(--primary-accent-background))] text-[rgb(var(--primary))]"
                        : "hover:bg-[rgb(var(--muted))]"
                    )}
                    onClick={() => onFilterChange?.("hasExpiry", !filters.hasExpiry)}
                  >
                    <Checkbox 
                      checked={filters.hasExpiry || false}
                      onChange={() => {}} // Handled by div click
                    />
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Has Expiry</span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[rgb(var(--muted-foreground))]">Active filters:</span>
          
          {/* Status filter badge */}
          {filters.status && filters.status !== "all" && (
            <Badge 
              variant="secondary" 
              className="gap-1 cursor-pointer hover:bg-[rgb(var(--muted))]"
              onClick={() => handleQuickFilter("status", "all")}
            >
              Status: {filters.status}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {/* Date range filter badge */}
          {filters.dateRange && filters.dateRange !== "all" && (
            <Badge 
              variant="secondary" 
              className="gap-1 cursor-pointer hover:bg-[rgb(var(--muted))]"
              onClick={() => handleQuickFilter("dateRange", "all")}
            >
              {DATE_RANGE_OPTIONS.find(o => o.value === filters.dateRange)?.label}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {/* Priority filters badges */}
          {filters.priorities?.map((priority) => {
            const option = PRIORITY_OPTIONS.find(o => o.value === priority);
            const Icon = option?.icon || Info;
            return (
              <Badge 
                key={priority}
                variant="secondary" 
                className="gap-1 cursor-pointer hover:bg-[rgb(var(--muted))]"
                onClick={() => toggleMultiFilter("priorities", priority)}
              >
                <Icon className="h-3 w-3" style={{ color: option?.color }} />
                {option?.label}
                <X className="h-3 w-3" />
              </Badge>
            );
          })}

          {/* Category filters badges */}
          {filters.categories?.map((category) => {
            const option = CATEGORY_OPTIONS.find(o => o.value === category);
            const Icon = option?.icon || Info;
            return (
              <Badge 
                key={category}
                variant="secondary" 
                className="gap-1 cursor-pointer hover:bg-[rgb(var(--muted))]"
                onClick={() => toggleMultiFilter("categories", category)}
              >
                <Icon className="h-3 w-3" style={{ color: option?.color }} />
                {option?.label}
                <X className="h-3 w-3" />
              </Badge>
            );
          })}

          {/* Special filters badges */}
          {filters.requiresAction && (
            <Badge 
              variant="secondary" 
              className="gap-1 cursor-pointer hover:bg-[rgb(var(--muted))]"
              onClick={() => onFilterChange?.("requiresAction", false)}
            >
              <Clock className="h-3 w-3 text-amber-500" />
              Action Required
              <X className="h-3 w-3" />
            </Badge>
          )}

          {filters.hasExpiry && (
            <Badge 
              variant="secondary" 
              className="gap-1 cursor-pointer hover:bg-[rgb(var(--muted))]"
              onClick={() => onFilterChange?.("hasExpiry", false)}
            >
              <Calendar className="h-3 w-3 text-orange-500" />
              Has Expiry
              <X className="h-3 w-3" />
            </Badge>
          )}

          {/* Clear all button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;
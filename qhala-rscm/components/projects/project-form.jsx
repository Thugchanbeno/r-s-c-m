"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import QuickAsk from "@/components/projects/quick-ask";
import SkillSelector from "@/components/projects/skill-selector";
import TaskManager from "@/components/projects/task-manager";
import { departmentEnum, projectStatusEnum } from "@/lib/projectconstants";
import { CalendarDays, Briefcase, Building2 } from "lucide-react";

const ProjectForm = ({
  formData,
  onChange,
  onSubmit,
  onAnalyze,
  nlpSuggestedSkills,
  onQuickAskSelect,
  onSkillsChange,
  onTasksChange,
  loading,
}) => {
  return (
    <Card className="animate-fade-in overflow-hidden shadow-xl">
      <CardHeader className="bg-gradient-to-br from-primary/10 via-blue-50 to-purple-50 p-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-primary md:text-xl">
          <Briefcase size={20} />
          {formData._id ? "Edit Project" : "Create Project"}
        </CardTitle>
        <CardDescription>
          {formData._id
            ? "Update project details, required skills, and tasks."
            : "Define your project, required skills, and initial tasks."}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 md:p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Project Overview */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Project Name*</label>
              <Input
                name="name"
                value={formData.name}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <Building2 size={14} /> Department*
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={onChange}
                className="w-full rounded-md border p-2"
              >
                {departmentEnum.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={onChange}
                className="w-full rounded-md border p-2"
              >
                {projectStatusEnum.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <CalendarDays size={14} /> Start Date
              </label>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <CalendarDays size={14} /> End Date
              </label>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={onChange}
              />
            </div>
          </section>

          {/* Description + AI Analysis */}
          <section>
            <label className="text-sm font-medium">Description*</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              required
              rows={3}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onAnalyze}
              className="mt-2"
            >
              Analyze with AI
            </Button>
            {nlpSuggestedSkills?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {nlpSuggestedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs rounded bg-primary/10 text-primary"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Quick Ask */}
          <section>
            <h3 className="text-sm font-semibold mb-2">
              Quick Ask (AI Skill Suggestion)
            </h3>
            <QuickAsk onSkillSelected={onQuickAskSelect} />
          </section>

          {/* Required Skills */}
          <section>
            <h3 className="text-sm font-semibold mb-2">Required Skills*</h3>
            <SkillSelector
              initialSelectedSkills={formData.requiredSkills}
              nlpSuggestedSkills={nlpSuggestedSkills}
              onChange={onSkillsChange}
            />
          </section>

          {/* Initial Tasks */}
          <section>
            <h3 className="text-sm font-semibold mb-2">Initial Tasks</h3>
            <TaskManager
              tasks={formData.tasks}
              onTasksChange={onTasksChange}
              canEdit
            />
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading} isLoading={loading}>
              {formData._id ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;

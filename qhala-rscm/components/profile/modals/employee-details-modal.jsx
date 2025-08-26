"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function EmployeeDetailsModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  defaultValues,
}) {
  const [form, setForm] = useState(defaultValues || {});

  useEffect(() => {
    if (defaultValues) setForm(defaultValues);
  }, [defaultValues]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <DialogContent className="max-w-2xl w-full rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <DialogHeader>
          <DialogTitle>Edit Employment Details</DialogTitle>
          <DialogDescription>
            Update contract and employment information for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <label className="text-sm font-medium">Employee Type</label>
            <Select
              defaultValue={form.employeeType}
              onValueChange={(val) => handleChange("employeeType", val)}
            >
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
          </div>
          <div>
            <label className="text-sm font-medium">Weekly Hours</label>
            <Input
              type="number"
              value={form.weeklyHours || ""}
              onChange={(e) =>
                handleChange("weeklyHours", Number(e.target.value))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Contract Start</label>
            <Input
              type="date"
              value={
                form.contractStartDate
                  ? new Date(form.contractStartDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) =>
                handleChange(
                  "contractStartDate",
                  new Date(e.target.value).getTime()
                )
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Contract End</label>
            <Input
              type="date"
              value={
                form.contractEndDate
                  ? new Date(form.contractEndDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                handleChange(
                  "contractEndDate",
                  new Date(e.target.value).getTime()
                )
              }
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Payment Terms</label>
          <Textarea
            value={form.paymentTerms || ""}
            onChange={(e) => handleChange("paymentTerms", e.target.value)}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
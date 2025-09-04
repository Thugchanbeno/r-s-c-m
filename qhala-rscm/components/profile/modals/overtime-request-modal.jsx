"use client";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function OvertimeRequestModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}) {
  const [form, setForm] = useState({
    projectId: "",
    overtimeHours: "",
    overtimeDate: "",
    reason: "",
    compensationType: "time_off",
  });

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <DialogContent className="max-w-lg w-full rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <DialogHeader>
          <DialogTitle>Request Overtime</DialogTitle>
          <DialogDescription>
            Submit an overtime request for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            type="number"
            placeholder="Overtime Hours"
            value={form.overtimeHours}
            onChange={(e) => handleChange("overtimeHours", e.target.value)}
          />
          <Input
            type="date"
            value={form.overtimeDate}
            onChange={(e) => handleChange("overtimeDate", e.target.value)}
          />
          <Textarea
            placeholder="Reason"
            value={form.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
          />
          <Select
            defaultValue={form.compensationType}
            onValueChange={(val) => handleChange("compensationType", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time_off">Time Off</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)} disabled={isSaving}>
            {isSaving ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

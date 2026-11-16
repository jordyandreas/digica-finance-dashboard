"use client";

import { useState } from "react";
import { Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { UserLookupResult } from "@/app/api/admin/users/lookup/route";
import type { LmsCourse } from "@/services/courses.service";
import { getMutationErrorMessage } from "../../courses/_hooks/use-courses-actions";
import { useEntitlementMutations } from "../_hooks/use-entitlement-mutations";

const inputClassName =
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

interface GrantEntitlementFormProps {
  courses: Array<Pick<LmsCourse, "id" | "title" | "status">>;
}

/** Date input (YYYY-MM-DD) -> end-of-day local time as ISO string. */
function endOfDayIso(dateValue: string): string | null {
  if (!dateValue) {
    return null;
  }
  const date = new Date(`${dateValue}T23:59:59`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function GrantEntitlementForm({ courses }: GrantEntitlementFormProps) {
  const { grantMutation } = useEntitlementMutations();
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<UserLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [notes, setNotes] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const selectedCourse = courses.find((course) => course.id === courseId);

  const handleLookup = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setLookupError("Enter the learner's email");
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setUser(null);

    try {
      const response = await fetch(
        `/api/admin/users/lookup?email=${encodeURIComponent(trimmed)}`,
      );
      const payload = (await response.json().catch(() => null)) as {
        data?: UserLookupResult;
        error?: string;
      } | null;

      if (!response.ok || !payload?.data) {
        setLookupError(payload?.error ?? "User lookup failed");
        return;
      }

      setUser(payload.data);
    } catch (error) {
      console.error("User lookup failed:", error);
      setLookupError("User lookup failed. Please try again.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleGrant = async () => {
    if (!user || !courseId) {
      return;
    }

    try {
      await grantMutation.mutateAsync({
        user_id: user.id,
        course_id: courseId,
        notes,
        ends_at: endOfDayIso(endsAt),
      });
      toast.success(
        `Access to "${selectedCourse?.title ?? "course"}" granted to ${user.email}`,
      );
      setEmail("");
      setUser(null);
      setNotes("");
      setEndsAt("");
    } catch (error) {
      console.error("Error granting entitlement:", error);
      toast.error(
        getMutationErrorMessage(error, "Failed to grant access. Please try again."),
      );
    }
  };

  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold">Grant access</h2>
        <p className="text-sm text-muted-foreground">
          After a WhatsApp payment is confirmed, look up the learner by email
          and grant the course. Granting again re-activates an existing
          entitlement.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="grant-email">
            Learner email
          </label>
          <div className="flex gap-2">
            <input
              id="grant-email"
              type="email"
              className={inputClassName}
              value={email}
              placeholder="learner@example.com"
              onChange={(event) => {
                setEmail(event.target.value);
                setUser(null);
                setLookupError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleLookup();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isLookingUp}
              onClick={handleLookup}
            >
              <Search className="h-4 w-4" />
              {isLookingUp ? "Looking up..." : "Look up"}
            </Button>
          </div>
          {lookupError ? (
            <p className="text-xs text-destructive">{lookupError}</p>
          ) : user ? (
            <p className="flex items-center gap-1.5 text-xs text-emerald-700">
              <UserCheck className="h-3.5 w-3.5" />
              {user.full_name || "No name"} · {user.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Course</label>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger>
              {selectedCourse ? (
                <SelectValue>{selectedCourse.title}</SelectValue>
              ) : (
                <span className="text-muted-foreground">Select course</span>
              )}
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                  {course.status === "draft" ? " (draft)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="grant-ends-at">
            Ends at (optional)
          </label>
          <input
            id="grant-ends-at"
            type="date"
            className={inputClassName}
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for lifetime access.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="grant-notes">
            Notes
          </label>
          <Textarea
            id="grant-notes"
            rows={2}
            value={notes}
            placeholder="e.g. WhatsApp payment ref, transfer date"
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!user || !courseId || grantMutation.isPending}
          onClick={handleGrant}
        >
          {grantMutation.isPending ? "Granting..." : "Grant access"}
        </Button>
      </div>
    </Card>
  );
}

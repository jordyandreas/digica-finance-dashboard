"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { CalendarX, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { SelectController } from "@/components/controllers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/utils/date";
import {
  formatCheckInParticipantLabel,
  getDuplicateParticipantNames,
} from "@/utils/check-in-participants";

export interface CheckInParticipant {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface CheckInSession {
  id: string;
  session_number: number;
  session_date: string | null;
}

export interface CheckInData {
  program: {
    id: string;
    name: string;
  };
  participants: CheckInParticipant[];
  sessions: CheckInSession[];
}

type CheckInFormState = {
  participant_id: string;
  session_id: string;
};

interface CheckInFormProps {
  programId: string;
  data: CheckInData;
}

export function CheckInForm({ programId, data }: CheckInFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successSessionNumber, setSuccessSessionNumber] = React.useState<
    number | null
  >(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const form = useForm<CheckInFormState>({
    defaultValues: {
      participant_id: "",
      session_id: "",
    },
  });

  const selectedParticipantId = form.watch("participant_id");
  const selectedSessionId = form.watch("session_id");
  const isSessionSelectEnabled = Boolean(selectedParticipantId);

  React.useEffect(() => {
    if (!selectedParticipantId) {
      form.setValue("session_id", "");
      return;
    }

    if (data.sessions.length === 1) {
      form.setValue("session_id", data.sessions[0].id);
    }
  }, [data.sessions, form, selectedParticipantId]);

  const duplicateNames = React.useMemo(
    () => getDuplicateParticipantNames(data.participants),
    [data.participants],
  );

  const participantOptions = data.participants.map((participant) => ({
    label: formatCheckInParticipantLabel(participant, duplicateNames),
    value: participant.id,
  }));

  const sessionOptions = data.sessions.map((session) => ({
    label: session.session_date
      ? `Session ${session.session_number} — ${formatDate(session.session_date)}`
      : `Session ${session.session_number} — No date set`,
    value: session.id,
  }));

  const handleSuccessModalChange = (open: boolean) => {
    setIsSuccessModalOpen(open);
    if (!open) {
      setSuccessSessionNumber(null);
      form.reset({
        participant_id: "",
        session_id: "",
      });
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/check-in/${programId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participant_id: values.participant_id,
          session_id: values.session_id,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        session_number?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Failed to check in");
      }

      setSuccessSessionNumber(result.session_number ?? null);
      setIsSuccessModalOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to check in";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (data.participants.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand-royal">
          <Users className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          No participants registered yet.
        </p>
      </div>
    );
  }

  if (data.sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand-royal">
          <CalendarX className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          No class scheduled for check-in today. Contact your Administrator if you think
          this is a mistake.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <SelectController
          form={form}
          name="participant_id"
          label="Your name"
          placeholder="Select your name"
          searchable
          searchPlaceholder="Search name..."
          options={participantOptions}
          componentProps={{
            selectTrigger: { className: "mt-2", id: "participant_id" },
          }}
        />

        <SelectController
          form={form}
          name="session_id"
          label="Session"
          placeholder={
            isSessionSelectEnabled ? "Select session" : "Select your name first"
          }
          description={
            isSessionSelectEnabled
              ? undefined
              : "Choose your name before selecting a session."
          }
          options={sessionOptions}
          componentProps={{
            select: { disabled: !isSessionSelectEnabled },
            selectTrigger: {
              className: "mt-2",
              id: "session_id",
              disabled: !isSessionSelectEnabled,
            },
          }}
        />

        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={
            isSubmitting || !selectedParticipantId || !selectedSessionId
          }
        >
          {isSubmitting ? "Checking in..." : "Check in"}
        </Button>
      </form>

      <Dialog open={isSuccessModalOpen} onOpenChange={handleSuccessModalChange}>
        <DialogContent className="border-brand-periwinkle/70 sm:max-w-md">
          <DialogHeader className="items-center text-center sm:text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale text-brand-royal ring-4 ring-brand-pale/50">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <DialogTitle className="text-brand-deep">
              You&apos;re checked in
            </DialogTitle>
            <DialogDescription>
              {successSessionNumber != null
                ? `Attendance recorded for Session ${successSessionNumber}.`
                : "Your attendance has been recorded."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => handleSuccessModalChange(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

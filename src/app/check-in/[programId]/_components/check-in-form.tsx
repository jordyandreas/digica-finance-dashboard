"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { CalendarX, CheckCircle2, Copy, Users } from "lucide-react";
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
import {
  SECURE_SEAT_INTEREST_OPTIONS,
  type SecureSeatInterest,
} from "@/constants/secure-seat-interest";
import type { ProgramType } from "@/services/programs.service";
import { formatDate } from "@/utils/date";
import {
  formatCheckInParticipantLabel,
  getDuplicateParticipantNames,
} from "@/utils/check-in-participants";
import { resolveRegistrationLink } from "@/utils/program-public";
import { resolvePublicAppOrigin } from "@/utils/program-public-link";

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
    type: ProgramType;
    registration_link: string | null;
    public_code: string | null;
    public_slug: string | null;
  };
  participants: CheckInParticipant[];
  sessions: CheckInSession[];
}

type CheckInFormState = {
  participant_id: string;
  session_id: string;
  secure_seat_interest: SecureSeatInterest | "";
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
  const [successSecureSeatInterest, setSuccessSecureSeatInterest] =
    React.useState<SecureSeatInterest | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [isBannerPreviewOpen, setIsBannerPreviewOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [origin, setOrigin] = React.useState("");

  const isWorkshop = data.program.type === "workshop";
  const promoBannerSrc = "/banner/banner-fw-sql-3.png";
  const promoBannerAlt = "Promo secure seat Batch 3";

  const form = useForm<CheckInFormState>({
    defaultValues: {
      participant_id: "",
      session_id: "",
      secure_seat_interest: "",
    },
  });

  const selectedParticipantId = form.watch("participant_id");
  const selectedSessionId = form.watch("session_id");
  const selectedSecureSeatInterest = form.watch("secure_seat_interest");
  const isSessionSelectEnabled = Boolean(selectedParticipantId);

  React.useEffect(() => {
    setOrigin(resolvePublicAppOrigin(window.location.origin));
  }, []);

  React.useEffect(() => {
    if (!selectedParticipantId) {
      form.setValue("session_id", "");
      return;
    }

    if (data.sessions.length === 1) {
      form.setValue("session_id", data.sessions[0].id);
    }
  }, [data.sessions, form, selectedParticipantId]);

  const registrationUrl = resolveRegistrationLink(
    data.program.registration_link,
    origin,
    data.program.public_code
      ? {
          public_code: data.program.public_code,
          public_slug: data.program.public_slug,
        }
      : null,
  );

  const showSecureSeatCta =
    isWorkshop &&
    successSecureSeatInterest === "yes" &&
    Boolean(registrationUrl);

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

  const canSubmit =
    Boolean(selectedParticipantId) &&
    Boolean(selectedSessionId) &&
    (!isWorkshop || Boolean(selectedSecureSeatInterest));

  const handleSuccessModalChange = (open: boolean) => {
    setIsSuccessModalOpen(open);
    if (!open) {
      setSuccessSessionNumber(null);
      setSuccessSecureSeatInterest(null);
      form.reset({
        participant_id: "",
        session_id: "",
        secure_seat_interest: "",
      });
    }
  };

  const handleCopyRegistrationLink = async () => {
    if (!registrationUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(registrationUrl);
      toast.success("Link berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin link");
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
          ...(isWorkshop && values.secure_seat_interest
            ? { secure_seat_interest: values.secure_seat_interest }
            : {}),
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
      setSuccessSecureSeatInterest(
        values.secure_seat_interest
          ? (values.secure_seat_interest as SecureSeatInterest)
          : null,
      );
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
          No class scheduled for check-in today. Contact your Administrator if
          you think this is a mistake.
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

        {isWorkshop ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsBannerPreviewOpen(true)}
              className="block w-full overflow-hidden rounded-lg border border-brand-periwinkle/50 text-left transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-royal focus-visible:ring-offset-2"
              aria-label="Preview promo banner"
            >
              <Image
                src={promoBannerSrc}
                alt={promoBannerAlt}
                width={800}
                height={450}
                className="h-auto w-full object-cover"
              />
            </button>
            <SelectController
              form={form}
              name="secure_seat_interest"
              label="Banyak peserta workshop sudah mulai secure seat Batch 3. Jangan sampai ketinggalan!"
              placeholder="Pilih jawaban"
              options={SECURE_SEAT_INTEREST_OPTIONS}
              componentProps={{
                selectTrigger: {
                  className: "mt-2",
                  id: "secure_seat_interest",
                },
                labelTypography: {
                  variant: "label",
                  className: "text-left leading-snug",
                },
              }}
            />
          </div>
        ) : null}

        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? "Checking in..." : "Check in"}
        </Button>
      </form>

      <Dialog open={isBannerPreviewOpen} onOpenChange={setIsBannerPreviewOpen}>
        <DialogContent className="border-brand-periwinkle/70 p-2 sm:max-w-3xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{promoBannerAlt}</DialogTitle>
            <DialogDescription>Preview promo banner</DialogDescription>
          </DialogHeader>
          <Image
            src={promoBannerSrc}
            alt={promoBannerAlt}
            width={1200}
            height={675}
            className="h-auto w-full rounded-md object-contain"
            priority
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessModalOpen} onOpenChange={handleSuccessModalChange}>
        <DialogContent
          className={
            isWorkshop
              ? "border-brand-periwinkle/70 sm:max-w-lg"
              : "border-brand-periwinkle/70 sm:max-w-md"
          }
        >
          <DialogHeader className="items-center text-center sm:text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale text-brand-royal ring-4 ring-brand-pale/50">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            {isWorkshop ? (
              <>
                <DialogTitle className="text-brand-deep">
                  Terima kasih!
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-3 text-left text-sm leading-relaxed text-muted-foreground">
                    <p>
                      Terima kasih sudah mengikuti workshop dan mengisi form
                      ini! 🙌
                    </p>
                    <p>
                      Kami sangat menghargai waktumu dan antusiasme untuk
                      belajar{" "}
                      <strong className="font-semibold text-foreground">
                        {data.program.name}
                      </strong>{" "}
                      bersama Digica Academy.
                    </p>
                    {showSecureSeatCta ? (
                      <div className="space-y-2 rounded-lg border border-brand-periwinkle/50 bg-brand-pale/40 p-3">
                        <p>
                          <strong className="font-semibold text-foreground">
                            Slot terbatas!
                          </strong>{" "}
                          Karena kamu mau secure promo sekarang, amankan seat
                          Batch 3 lewat link di bawah (sama seperti di banner).
                        </p>
                        <div className="flex items-center gap-2">
                          <a
                            href={registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 flex-1 truncate font-medium text-brand-royal underline underline-offset-2"
                          >
                            {registrationUrl}
                          </a>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={handleCopyRegistrationLink}
                            aria-label="Salin link registrasi"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p>
                          Jangan sampai kehabisan — makin cepat daftar, makin
                          aman seat-nya.
                        </p>
                      </div>
                    ) : null}
                    <p>
                      ✅{" "}
                      <strong className="font-semibold text-foreground">
                        E-Sertifikat
                      </strong>{" "}
                      akan dikirim melalui{" "}
                      <strong className="font-semibold text-foreground">
                        Grup WA
                      </strong>
                      , silahkan tunggu dalam{" "}
                      <strong className="font-semibold text-foreground">
                        waktu 5-7 hari kerja
                      </strong>
                      .
                    </p>
                    <div className="space-y-1">
                      <p>
                        📱 Tetap terhubung dan dapatkan insight menarik seputar
                        Data &amp; Tech:
                      </p>
                      <p>
                        🔹 Follow kami di Instagram, TikTok dan Threads:
                        <br />
                        👉 @digica.academy
                      </p>
                    </div>
                    <p>
                      🎓 Siap belajar lebih dalam? Nantikan info tentang
                      bootcamp dan kelas lainnya!
                      <br />
                      Sampai jumpa di program Digica Academy berikutnya 🚀
                    </p>
                    <p className="font-medium text-foreground">#MakeITHappen</p>
                  </div>
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle className="text-brand-deep">
                  You&apos;re checked in
                </DialogTitle>
                <DialogDescription>
                  {successSessionNumber != null
                    ? `Attendance recorded for Session ${successSessionNumber}.`
                    : "Your attendance has been recorded."}
                </DialogDescription>
              </>
            )}
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

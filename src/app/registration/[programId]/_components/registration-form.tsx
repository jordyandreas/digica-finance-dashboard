"use client";

import * as React from "react";
import { Copy, Info, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import {
  SelectController,
  TextInputController,
} from "@/components/controllers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  participantRegistrationSchema,
  type ParticipantRegistrationInput,
  registrationOccupationOptions,
} from "@/schemas/participant-registration-schema";
import { cn } from "@/lib/utils";
import { resolveRegistrationLink } from "@/utils/program-public";
import { resolvePublicAppOrigin } from "@/utils/program-public-link";

export interface RegistrationPageData {
  program: {
    id: string;
    name: string;
    summary_html: string | null;
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    registration_link: string | null;
    wa_group_link: string | null;
    public_code: string;
    public_slug: string | null;
  };
}

type RegistrationFormState = {
  name: string;
  email: string;
  phone: string;
  occupation: string;
  organization: string;
};

interface RegistrationFormProps {
  programId: string;
  registrationLink?: string | null;
  waGroupLink?: string | null;
  publicCode?: string;
  publicSlug?: string | null;
}

const defaultOrganizationCopy = {
  placeholder: "Enter your company, school, university, or organization name",
  helper: "Ex: Google, Universitas Indonesia, SMAK 1 Penabur",
} as const;

const organizationCopyByOccupation: Record<
  string,
  { placeholder: string; helper: string }
> = {
  mahasiswa: {
    placeholder: "Enter your school or university name",
    helper: "Ex: Universitas Indonesia, Universitas Bina Nusantara",
  },
  fresh_graduate: {
    placeholder: "Enter your last school or university",
    helper: "Ex: Universitas Indonesia, Universitas Bina Nusantara",
  },
  karyawan: {
    placeholder: "Enter your company name",
    helper: "Ex: Google, Tokopedia, PT Telkom Indonesia",
  },
  freelance: {
    placeholder: "Enter your business agency, or personal brand (optional)",
    helper: "Ex: Jasa Desain, Self-Employed, John Creative",
  },
  job_seeker: {
    placeholder: "Enter your last company or school (optional)",
    helper: "Ex: PT ABC, Universitas Gadjah Mada",
  },
  other: {
    placeholder: "Enter your profession or organization name",
    helper: "Ex: Ibu Rumah Tangga, Online Shop, Komunitas Belajar",
  },
};

const defaultValues: RegistrationFormState = {
  name: "",
  email: "",
  phone: "",
  occupation: "",
  organization: "",
};

function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+\s-]/g, "");
}

interface SuccessStepCardProps {
  title: string;
  description: string;
  badge: "Required" | "Optional";
  emphasized?: boolean;
  children: React.ReactNode;
}

function SuccessStepCard({
  title,
  description,
  badge,
  emphasized = false,
  children,
}: SuccessStepCardProps) {
  const isRequired = badge === "Required";

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        emphasized
          ? "border-brand-royal/60 bg-brand-pale/30 ring-1 ring-brand-royal/20"
          : "border-brand-periwinkle/50 bg-brand-pale/15",
      )}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-brand-deep">{title}</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            isRequired
              ? "bg-brand-royal/15 text-brand-royal"
              : "bg-muted text-muted-foreground",
          )}
        >
          {badge}
        </span>
      </div>
      <p
        className={cn(
          "mb-4 text-xs leading-relaxed",
          emphasized ? "text-brand-deep/80" : "text-muted-foreground",
        )}
      >
        {description}
      </p>
      {children}
    </div>
  );
}

export function RegistrationForm({
  programId,
  registrationLink,
  waGroupLink,
  publicCode,
  publicSlug,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [origin, setOrigin] = React.useState("");
  const form = useForm<RegistrationFormState>({ defaultValues });

  const name = form.watch("name");
  const email = form.watch("email");
  const phone = form.watch("phone");
  const occupation = form.watch("occupation");
  const organization = form.watch("organization");
  const organizationCopy =
    organizationCopyByOccupation[occupation] ?? defaultOrganizationCopy;

  React.useEffect(() => {
    setOrigin(resolvePublicAppOrigin(window.location.origin));
  }, []);

  const registrationUrl = resolveRegistrationLink(
    registrationLink,
    origin,
    publicCode
      ? {
          public_code: publicCode,
          public_slug: publicSlug,
        }
      : null,
  );
  const waGroupUrl = waGroupLink?.trim() ?? "";
  const hasWaGroupLink = Boolean(waGroupUrl);

  const handleSuccessModalChange = (open: boolean) => {
    setIsSuccessModalOpen(open);
    if (!open) {
      form.reset(defaultValues);
      setErrorMessage(null);
    }
  };

  const handleCopyRegistrationLink = async () => {
    if (!registrationUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(registrationUrl);
      toast.success("Invitation link copied!");
    } catch {
      toast.error("Failed to copy registration link");
    }
  };

  const handleCopyWaGroupLink = async () => {
    if (!waGroupUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(waGroupUrl);
      toast.success("WhatsApp link copied!");
    } catch {
      toast.error("Failed to copy WhatsApp group link");
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    form.clearErrors();

    const validation = participantRegistrationSchema.safeParse(values);

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof RegistrationFormState | undefined;
        if (field && !form.formState.errors[field]) {
          form.setError(field, { type: "manual", message: issue.message });
        }
      }
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/registration/${programId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data as ParticipantRegistrationInput),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit registration");
      }

      form.reset(defaultValues);
      form.clearErrors();
      setErrorMessage(null);
      setIsSuccessModalOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit registration";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border bg-background/80 p-5"
      >
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-brand-deep">
            Participant Information
          </h2>
          <p className="text-sm text-muted-foreground">
            Fields marked with{" "}
            <span className="font-semibold text-destructive">*</span> are
            required.
          </p>
        </div>

        <div className="space-y-4">
          <TextInputController
            form={form}
            name="name"
            label="Full Name"
            required
            placeholder="Enter your full name"
            componentProps={{
              input: {
                required: true,
              },
            }}
          />

          <TextInputController
            form={form}
            name="email"
            label="Email"
            required
            placeholder="name@example.com"
            componentProps={{
              input: {
                type: "email",
                required: true,
              },
            }}
          />

          <TextInputController
            form={form}
            name="phone"
            label="Phone Number"
            required
            placeholder="+62 812 000 0000"
            description="Use your active WhatsApp number."
            componentProps={{
              input: {
                type: "tel",
                inputMode: "tel",
                required: true,
                onChange: (event) => {
                  const sanitized = sanitizePhoneInput(event.target.value);
                  if (sanitized !== event.target.value) {
                    form.setValue("phone", sanitized, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                },
              },
            }}
          />
        </div>

        <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-deep">
              Background Information
            </p>
            <p className="text-xs text-muted-foreground">
              These optional details help us understand your current background
              better.
            </p>
          </div>

          <SelectController
            form={form}
            name="occupation"
            label={
              <span>
                Occupation <span className="ml-1 text-destructive">*</span>
              </span>
            }
            placeholder="Select occupation"
            options={[...registrationOccupationOptions]}
            componentProps={{
              selectTrigger: { className: "mt-2", id: "occupation" },
            }}
          />

          <TextInputController
            form={form}
            name="organization"
            label="Organization"
            required
            placeholder={organizationCopy.placeholder}
            description={organizationCopy.helper}
          />
        </div>

        {errorMessage ? (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl border bg-brand-pale/20 px-4 py-3 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-royal" />
            <p>
              After you submit, your registration will be saved directly to this
              program.
            </p>
          </div>

          <Button
            type="submit"
            className={cn("w-full", isSubmitting && "cursor-wait")}
            disabled={
              isSubmitting ||
              !name.trim() ||
              !email.trim() ||
              !phone.trim() ||
              !occupation.trim() ||
              !organization.trim()
            }
          >
            {isSubmitting
              ? "Submitting registration..."
              : "Complete Registration"}
          </Button>
        </div>
      </form>

      <Dialog open={isSuccessModalOpen} onOpenChange={handleSuccessModalChange}>
        <DialogContent className="flex max-h-[90dvh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-2xl border-brand-periwinkle/70 p-0 sm:w-[70%] sm:max-w-md">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-6">
            <DialogHeader className="items-center space-y-3 text-center sm:text-center">
              <DialogTitle className="text-xl text-brand-deep">
                You&apos;re registered 🎉
              </DialogTitle>
              <DialogDescription className="text-center text-sm leading-relaxed">
                {hasWaGroupLink
                  ? "Your seat is confirmed. Join our WhatsApp group to receive your e-certificate, schedules, and materials."
                  : "Your seat is confirmed. Share the invitation link with friends, and we'll invite you to the WhatsApp group 3 days before the program starts."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              {hasWaGroupLink ? (
                <SuccessStepCard
                  title="Join WhatsApp Group"
                  description="Your e-certificate will be shared in this group after the program. Join now to receive it, along with class schedules and materials."
                  badge="Required"
                  emphasized
                >
                  <div className="space-y-3">
                    <Button asChild className="h-11 w-full">
                      <a
                        href={waGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join WhatsApp Group
                      </a>
                    </Button>

                    <div className="flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-border/80" />
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Having trouble?
                      </span>
                      <div className="h-px flex-1 bg-border/80" />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full gap-2"
                      onClick={handleCopyWaGroupLink}
                    >
                      <Copy className="h-4 w-4" />
                      Copy WhatsApp Link
                    </Button>
                  </div>
                </SuccessStepCard>
              ) : null}

              <SuccessStepCard
                title="Invite your friends"
                description="Learning is better together."
                badge="Optional"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full gap-2"
                  onClick={handleCopyRegistrationLink}
                  disabled={!registrationUrl}
                >
                  <Copy className="h-4 w-4" />
                  Copy Invitation Link
                </Button>
              </SuccessStepCard>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-center">
            <Button
              type="button"
              className="h-11 w-full"
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

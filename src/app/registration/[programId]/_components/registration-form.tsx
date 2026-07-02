"use client";

import * as React from "react";
import { CheckCircle2, Copy, Info, ShieldCheck, Users } from "lucide-react";
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

export function RegistrationForm({
  programId,
  registrationLink,
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
    setOrigin(window.location.origin);
  }, []);

  const registrationUrl = resolveRegistrationLink(
    programId,
    registrationLink,
    origin,
  );

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
      toast.success("Link registration copied!");
    } catch {
      toast.error("Failed to copy registration link");
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
                required: true,
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
        <DialogContent className="border-brand-periwinkle/70 sm:max-w-md">
          <DialogHeader className="items-center text-center sm:text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale text-brand-royal ring-4 ring-brand-pale/50">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <DialogTitle className="text-brand-deep">
              Registration completed!
            </DialogTitle>
            <DialogDescription>
              You have successfully registered for the Digica program. Please
              wait for our team to invite you to the WhatsApp group 3 days
              before the program starts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border bg-brand-pale/20 px-4 py-3 text-sm text-muted-foreground">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand-royal" />
              <p>
                Want to join with your friends too? Share this registration link
                so they can register right away.
              </p>
            </div>

            <div className="flex items-start justify-between gap-3 rounded-xl border bg-muted/30 px-4 py-3 text-left">
              <p className="min-w-0 flex-1 break-all text-xs text-brand-deep">
                {registrationUrl || `/registration/${programId}`}
              </p>
              <button
                type="button"
                onClick={handleCopyRegistrationLink}
                disabled={!registrationUrl}
                aria-label="Copy registration link"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-brand-deep transition-colors hover:bg-background/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-center">
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

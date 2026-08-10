"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Info, MessageCircle, ShieldCheck } from "lucide-react";
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
  emptyProgramOfferPrices,
  getOffersForSource,
  resolveRegistrationSource,
  type ProgramOfferPrices,
  type RegistrationPackage,
  type RegistrationSource,
} from "@/constants/registration-offers";
import {
  paidParticipantRegistrationSchema,
  participantRegistrationSchema,
  registrationOccupationOptions,
} from "@/schemas/participant-registration-schema";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { buildPaymentWhatsAppUrl } from "@/utils/admin-whatsapp";
import { resolveRegistrationLink } from "@/utils/program-public";
import { resolvePublicAppOrigin } from "@/utils/program-public-link";
import { appendRegistrationSource } from "@/utils/registration-source-url";
import {
  getPromoInitialSlots,
  getPromoMinSlots,
  getPromoSlotNumberClass,
  PROMO_SLOT_TICK_MS,
  type PromoSlotProgramType,
} from "@/utils/promo-slot-countdown";
import type { ProgramStatus, ProgramType } from "@/services/programs.service";

export interface RegistrationPageData {
  program: {
    id: string;
    name: string;
    type: ProgramType;
    status: ProgramStatus;
    summary_html: string | null;
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    registration_link: string | null;
    wa_group_link: string | null;
    public_code: string;
    public_slug: string | null;
    registration_banner_url?: string | null;
    price?: number | null;
    promo_individual_price?: number | null;
    promo_bareng_teman_price?: number | null;
  };
}

type RegistrationFormState = {
  name: string;
  email: string;
  phone: string;
  occupation: string;
  organization: string;
  selected_package: string;
  friend_name: string;
  friend_phone: string;
};

interface RegistrationFormProps {
  programId: string;
  programName?: string;
  programType?: ProgramType | null;
  registrationLink?: string | null;
  waGroupLink?: string | null;
  publicCode?: string;
  publicSlug?: string | null;
  offerPrices?: ProgramOfferPrices;
}

const defaultOrganizationCopy = {
  placeholder: "Masukkan nama perusahaan, sekolah, atau organisasi",
  helper: "Contoh: Google, Universitas Indonesia, SMAK 1 Penabur",
} as const;

const organizationCopyByOccupation: Record<
  string,
  { placeholder: string; helper: string }
> = {
  mahasiswa: {
    placeholder: "Masukkan nama sekolah atau universitas",
    helper: "Contoh: Universitas Indonesia, Universitas Bina Nusantara",
  },
  fresh_graduate: {
    placeholder: "Masukkan sekolah atau universitas terakhir",
    helper: "Contoh: Universitas Indonesia, Universitas Bina Nusantara",
  },
  karyawan: {
    placeholder: "Masukkan nama perusahaan",
    helper: "Contoh: Google, Tokopedia, PT Telkom Indonesia",
  },
  freelance: {
    placeholder: "Masukkan nama bisnis, agensi, atau personal brand",
    helper: "Contoh: Jasa Desain, Self-Employed, John Creative",
  },
  job_seeker: {
    placeholder: "Masukkan perusahaan atau sekolah terakhir",
    helper: "Contoh: PT ABC, Universitas Gadjah Mada",
  },
  other: {
    placeholder: "Masukkan nama pekerjaan atau organisasi",
    helper: "Contoh: Ibu Rumah Tangga, Online Shop, Komunitas Belajar",
  },
};

const defaultValues: RegistrationFormState = {
  name: "",
  email: "",
  phone: "",
  occupation: "",
  organization: "",
  selected_package: "",
  friend_name: "",
  friend_phone: "",
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
  programName = "program Digica",
  programType,
  registrationLink,
  waGroupLink,
  publicCode,
  publicSlug,
  offerPrices = emptyProgramOfferPrices(),
}: RegistrationFormProps) {
  const searchParams = useSearchParams();
  const registrationSource = resolveRegistrationSource(
    searchParams.get("source"),
  );
  const isBootcampProgram =
    programType === "bootcamp" || programType === "mini_bootcamp";
  const isWorkshopPromo =
    isBootcampProgram && registrationSource === "workshop_promo";
  const offers = React.useMemo(
    () =>
      isBootcampProgram
        ? getOffersForSource(registrationSource, offerPrices)
        : [],
    [isBootcampProgram, offerPrices, registrationSource],
  );

  const promoSlotTargetType: PromoSlotProgramType | null =
    programType === "bootcamp" || programType === "mini_bootcamp"
      ? programType
      : null;
  const initialSlots = getPromoInitialSlots(promoSlotTargetType);
  const minSlots = getPromoMinSlots(initialSlots);
  const [remainingSlots, setRemainingSlots] = React.useState(initialSlots);
  const [slotTickPulse, setSlotTickPulse] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [origin, setOrigin] = React.useState("");
  const [paymentWhatsAppUrl, setPaymentWhatsAppUrl] = React.useState<
    string | null
  >(null);
  const form = useForm<RegistrationFormState>({ defaultValues });

  React.useEffect(() => {
    setRemainingSlots(initialSlots);
  }, [initialSlots]);

  React.useEffect(() => {
    if (!isWorkshopPromo) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSlots((current) => {
        if (current <= minSlots) {
          window.clearInterval(intervalId);
          return current;
        }
        return current - 1;
      });
    }, PROMO_SLOT_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [isWorkshopPromo, minSlots]);

  React.useEffect(() => {
    if (!isWorkshopPromo || remainingSlots >= initialSlots) {
      return;
    }

    setSlotTickPulse(true);
    const timeoutId = window.setTimeout(() => {
      setSlotTickPulse(false);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [initialSlots, isWorkshopPromo, remainingSlots]);

  const name = form.watch("name");
  const email = form.watch("email");
  const phone = form.watch("phone");
  const occupation = form.watch("occupation");
  const organization = form.watch("organization");
  const selectedPackage = form.watch("selected_package");
  const friendName = form.watch("friend_name");
  const friendPhone = form.watch("friend_phone");
  const organizationCopy =
    organizationCopyByOccupation[occupation] ?? defaultOrganizationCopy;

  React.useEffect(() => {
    setOrigin(resolvePublicAppOrigin(window.location.origin));
  }, []);

  React.useEffect(() => {
    if (!isBootcampProgram) {
      form.setValue("selected_package", "");
      return;
    }

    if (offers.length === 1) {
      form.setValue("selected_package", offers[0].package);
      return;
    }

    const stillValid = offers.some(
      (offer) => offer.package === form.getValues("selected_package"),
    );
    if (!stillValid) {
      form.setValue("selected_package", "");
    }
  }, [form, isBootcampProgram, offers]);

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
  const invitationUrl = React.useMemo(() => {
    if (!registrationUrl) {
      return "";
    }
    if (!isBootcampProgram) {
      return registrationUrl;
    }
    return appendRegistrationSource(registrationUrl, registrationSource);
  }, [isBootcampProgram, registrationSource, registrationUrl]);
  const waGroupUrl = waGroupLink?.trim() ?? "";
  const hasWaGroupLink = Boolean(waGroupUrl);
  const isBarengTeman = selectedPackage === "bareng_teman";

  const successDescription = isBootcampProgram ? (
    <>
      Registrasi kamu sudah masuk. Chat admin sekarang untuk minta{" "}
      <strong className="font-semibold text-foreground">detail pembayaran</strong>{" "}
      dan amankan seat-mu. Admin siap bantu kalau masih ada pertanyaan soal
      programnya.
    </>
  ) : hasWaGroupLink ? (
    "Your seat is confirmed. Join our WhatsApp group to receive your e-certificate, schedules, and materials."
  ) : (
    "Your seat is confirmed. Share the invitation link with friends, and we'll invite you to the WhatsApp group 3 days before the program starts."
  );

  const handleSuccessModalChange = (open: boolean) => {
    setIsSuccessModalOpen(open);
    if (!open) {
      form.reset(defaultValues);
      setErrorMessage(null);
      setPaymentWhatsAppUrl(null);
    }
  };

  const handleCopyRegistrationLink = async () => {
    if (!invitationUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationUrl);
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

    const payload = isBootcampProgram
      ? {
          ...values,
          registration_source: registrationSource,
          friend_name: values.friend_name,
          friend_phone: values.friend_phone,
        }
      : {
          name: values.name,
          email: values.email,
          phone: values.phone,
          occupation: values.occupation,
          organization: values.organization,
        };

    const validation = isBootcampProgram
      ? paidParticipantRegistrationSchema.safeParse(payload)
      : participantRegistrationSchema.safeParse(payload);

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
        body: JSON.stringify(validation.data),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        package_price?: number;
        selected_package?: RegistrationPackage;
        registration_source?: RegistrationSource;
      };

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit registration");
      }

      if (
        isBootcampProgram &&
        result.selected_package &&
        result.package_price != null &&
        result.registration_source
      ) {
        setPaymentWhatsAppUrl(
          buildPaymentWhatsAppUrl({
            programName,
            participantName: values.name.trim(),
            phone: values.phone.trim(),
            selectedPackage: result.selected_package,
            packagePrice: result.package_price,
            source: result.registration_source,
            friendName: values.friend_name,
            friendPhone: values.friend_phone,
          }),
        );
      } else {
        setPaymentWhatsAppUrl(null);
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

  const packageReady =
    !isBootcampProgram ||
    (Boolean(selectedPackage) &&
      (!isBarengTeman ||
        (Boolean(friendName.trim()) && Boolean(friendPhone.trim()))));

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border bg-background/80 p-5"
      >
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-brand-deep">
            Data Peserta
          </h2>
          <p className="text-sm text-muted-foreground">
            Kolom bertanda{" "}
            <span className="font-semibold text-destructive">*</span> wajib
            diisi.
          </p>
        </div>

        <div className="space-y-4">
          <TextInputController
            form={form}
            name="name"
            label="Nama Lengkap"
            required
            placeholder="Masukkan nama lengkapmu"
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
            placeholder="nama@email.com"
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
            label="Nomor WhatsApp"
            required
            placeholder="+62 812 000 0000"
            description="Pakai nomor WhatsApp yang aktif."
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
              Informasi Latar Belakang
            </p>
            <p className="text-xs text-muted-foreground">
              Detail ini membantu kami mengenal background-mu lebih baik.
            </p>
          </div>

          <SelectController
            form={form}
            name="occupation"
            label={
              <span>
                Pekerjaan / Status{" "}
                <span className="ml-1 text-destructive">*</span>
              </span>
            }
            placeholder="Pilih status"
            options={[...registrationOccupationOptions]}
            componentProps={{
              selectTrigger: { className: "mt-2", id: "occupation" },
            }}
          />

          <TextInputController
            form={form}
            name="organization"
            label="Institusi / Organisasi"
            required
            placeholder={organizationCopy.placeholder}
            description={organizationCopy.helper}
          />
        </div>

        {isBootcampProgram ? (
          <div className="space-y-3">
            {isWorkshopPromo ? (
              <div className="rounded-xl border border-brand-periwinkle/60 bg-brand-pale/30 px-4 py-3 text-sm text-brand-deep">
                <p className="font-medium leading-snug">
                  Kamu datang dari absensi workshop — pilih paket di bawah untuk
                  kunci harga spesial.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-brand-deep">
                Pilih paket <span className="text-destructive">*</span>
              </h2>
              {isWorkshopPromo ? (
                <p className="text-sm text-muted-foreground">
                  Harga spesial untuk peserta workshop.
                </p>
              ) : null}
            </div>

            <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
              {offers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Paket untuk sumber ini belum tersedia. Hubungi admin Digica.
                </p>
              ) : (
                offers.map((offer) => {
                  const selected = selectedPackage === offer.package;
                  return (
                    <button
                      key={offer.package}
                      type="button"
                      onClick={() =>
                        form.setValue("selected_package", offer.package, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-left transition",
                        selected
                          ? "border-brand-royal/60 bg-brand-pale text-brand-deep shadow-sm ring-1 ring-brand-royal/20"
                          : "border-border bg-background hover:border-brand-periwinkle",
                      )}
                    >
                      <p className="text-sm font-semibold text-brand-deep">
                        {offer.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {offer.description}
                      </p>
                      <p className="mt-1 text-sm font-medium text-brand-royal">
                        {formatCurrency(offer.price)}
                      </p>
                    </button>
                  );
                })
              )}

              {isWorkshopPromo ? (
                <p className="pt-1 text-sm font-medium text-muted-foreground">
                  tersisa{" "}
                  <span
                    className={cn(
                      "inline-block font-bold transition-all duration-300",
                      getPromoSlotNumberClass(remainingSlots, initialSlots),
                      slotTickPulse && "scale-110",
                    )}
                  >
                    {remainingSlots}
                  </span>{" "}
                  slot
                </p>
              ) : null}

              {isBarengTeman ? (
                <div className="space-y-3 pt-2">
                  <TextInputController
                    form={form}
                    name="friend_name"
                    label="Nama Teman"
                    required
                    placeholder="Nama teman yang join bersama"
                  />
                  <TextInputController
                    form={form}
                    name="friend_phone"
                    label="WhatsApp Teman"
                    required
                    placeholder="+62 812 000 0000"
                    componentProps={{
                      input: {
                        type: "tel",
                        inputMode: "tel",
                        onChange: (event) => {
                          const sanitized = sanitizePhoneInput(
                            event.target.value,
                          );
                          if (sanitized !== event.target.value) {
                            form.setValue("friend_phone", sanitized, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }
                        },
                      },
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        ) : null}

        <div className="space-y-3">
          {isBootcampProgram ? (
            <div className="rounded-xl border border-brand-royal/25 bg-brand-pale/60 px-4 py-3 text-sm leading-snug text-brand-deep">
              <p className="font-semibold">
                Daftar dulu, abis itu chat admin WhatsApp buat minta detail
                bayarnya ya 💬
              </p>
              <p className="mt-1 text-brand-royal">
                {isWorkshopPromo
                  ? "Slotnya terbatas lho — jangan sampai kehabisan!"
                  : "Slot early bird-nya terbatas lho — jangan sampai kehabisan!"}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border bg-brand-pale/20 px-4 py-3 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-royal" />
              <p>Setelah kirim, datamu langsung tersimpan di program ini.</p>
            </div>
          )}

          <Button
            type="submit"
            className={cn("w-full", isSubmitting && "cursor-wait")}
            disabled={
              isSubmitting ||
              !name.trim() ||
              !email.trim() ||
              !phone.trim() ||
              !occupation.trim() ||
              !organization.trim() ||
              !packageReady
            }
          >
            {isSubmitting ? "Mengirim pendaftaran..." : "Daftar Sekarang"}
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
                {successDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              {isBootcampProgram ? (
                <SuccessStepCard
                  title="Chat admin untuk pembayaran"
                  description="Kirim pesan untuk minta detail transfer. Kamu juga bisa tanya dulu kalau masih mempertimbangkan."
                  badge="Required"
                  emphasized
                >
                  {paymentWhatsAppUrl ? (
                    <Button asChild className="h-11 w-full gap-2">
                      <a
                        href={paymentWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat Admin WhatsApp
                      </a>
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Hubungi admin Digica lewat WhatsApp untuk detail
                      pembayaran.
                    </p>
                  )}
                </SuccessStepCard>
              ) : null}

              {hasWaGroupLink ? (
                <SuccessStepCard
                  title="Join WhatsApp Group"
                  description="Your e-certificate will be shared in this group after the program. Join now to receive it, along with class schedules and materials."
                  badge="Required"
                  emphasized={!isBootcampProgram}
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
                description={
                  isBootcampProgram
                    ? registrationSource === "workshop_promo"
                      ? "Bagikan link ini ke teman. Mereka juga dapat harga spesial workshop."
                      : "Bagikan link ini ke teman. Mereka daftar dengan harga yang sama."
                    : "Learning is better together."
                }
                badge="Optional"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full gap-2"
                  onClick={handleCopyRegistrationLink}
                  disabled={!invitationUrl}
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

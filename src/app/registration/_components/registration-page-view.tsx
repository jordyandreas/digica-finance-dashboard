"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import {
  RegistrationForm,
  type RegistrationPageData,
} from "@/app/registration/[programId]/_components/registration-form";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegistrationWhatsAppFab } from "@/app/registration/_components/registration-whatsapp-fab";
import { resolveRegistrationSource } from "@/constants/registration-offers";
import {
  buildInquiryWhatsAppUrl,
  buildOtherProgramsWhatsAppUrl,
} from "@/utils/admin-whatsapp";
import {
  formatProgramDateRange,
  formatProgramTimeRange,
  isRegistrationClosed,
} from "@/utils/program-public";
import { cn } from "@/lib/utils";

function WorkshopPromoHeadline() {
  const searchParams = useSearchParams();
  const registrationSource = resolveRegistrationSource(
    searchParams.get("source"),
  );

  if (registrationSource !== "workshop_promo") {
    return null;
  }

  return (
    <div className="rounded-xl border border-brand-periwinkle/60 bg-brand-pale/40 px-4 py-3 text-center">
      <p className="text-sm font-semibold leading-snug text-brand-deep">
        Tinggal selangkah lagi buat dapat harga spesial workshop!
      </p>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">
        Isi data di bawah, pilih paket, lalu lanjut chat admin untuk pembayaran.
      </p>
    </div>
  );
}

function RegistrationPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-gradient-premium px-4 py-10",
        className,
      )}
    >
      <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-brand-periwinkle/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-1">
            <Image
              src="/logo/logo-digica.webp"
              alt="Digica Academy"
              width={160}
              height={40}
              className="h-9 w-auto"
              priority
            />
            <p className="text-[11px] text-muted-foreground">Est. 2020</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

interface RegistrationPageViewProps {
  identifier: string;
}

export function RegistrationPageView({ identifier }: RegistrationPageViewProps) {
  const [data, setData] = React.useState<RegistrationPageData | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sanitizedSummaryHtml, setSanitizedSummaryHtml] = React.useState("");
  const [isBannerPreviewOpen, setIsBannerPreviewOpen] = React.useState(false);

  React.useEffect(() => {
    const summaryHtml = data?.program.summary_html;

    if (!summaryHtml) {
      setSanitizedSummaryHtml("");
      return;
    }

    let cancelled = false;

    void import("isomorphic-dompurify")
      .then(({ default: DOMPurify }) => {
        if (cancelled) {
          return;
        }

        setSanitizedSummaryHtml(DOMPurify.sanitize(summaryHtml));
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setSanitizedSummaryHtml("");
      });

    return () => {
      cancelled = true;
    };
  }, [data?.program.summary_html, identifier]);

  React.useEffect(() => {
    if (!identifier) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/registration/${identifier}`);
        const result = (await response.json()) as RegistrationPageData & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error || "Failed to load registration page");
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load registration page";
          setErrorMessage(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [identifier]);

  const registrationBannerUrl = data?.program.registration_banner_url?.trim() || null;
  const registrationBannerAlt = data
    ? `${data.program.name} banner`
    : "Registration banner";
  const isClosed = data
    ? isRegistrationClosed({
        status: data.program.status,
        start_date: data.program.start_date,
        end_date: data.program.end_date,
      })
    : false;
  const otherProgramsWhatsAppUrl = data
    ? buildOtherProgramsWhatsAppUrl({ programName: data.program.name })
    : null;
  const isInquiryProgramType =
    data?.program.type === "bootcamp" ||
    data?.program.type === "mini_bootcamp" ||
    data?.program.type === "workshop";
  const showInquiryFab =
    Boolean(data) && !isLoading && !errorMessage && !isClosed && isInquiryProgramType;
  const inquiryWhatsAppUrl =
    showInquiryFab && data
      ? buildInquiryWhatsAppUrl({ programName: data.program.name })
      : null;

  return (
    <>
      <RegistrationPageShell className={inquiryWhatsAppUrl ? "pb-24" : undefined}>
        {isLoading ? (
        <div className="space-y-5">
          <div className="space-y-3 rounded-2xl border border-brand-periwinkle/50 bg-muted/20 p-5">
            <div className="mx-auto h-6 w-24 animate-pulse rounded-full bg-brand-pale/60" />
            <div className="mx-auto h-8 w-3/4 animate-pulse rounded bg-brand-pale/60" />
            <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-16 animate-pulse rounded-xl bg-muted" />
              <div className="h-16 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border bg-background/70 p-5">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-brand-pale/60" />
          </div>
        </div>
      ) : errorMessage ? (
        <div className="space-y-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-brand-deep">
            Registration unavailable
          </h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this registration page right now.
          </p>
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      ) : data && isClosed ? (
        <div className="space-y-4 rounded-2xl border border-brand-periwinkle/60 bg-brand-pale/20 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand-deep">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-brand-deep">
              Program completed
            </h1>
            <p className="text-sm font-medium text-brand-deep">
              {data.program.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Pendaftaran untuk program ini sudah ditutup karena tanggalnya
              sudah lewat. Tertarik ikut program Digica yang sedang aktif?
              Chat admin kami lewat WhatsApp.
            </p>
          </div>
          {otherProgramsWhatsAppUrl ? (
            <Button asChild className="h-11 w-full gap-2">
              <a
                href={otherProgramsWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Tanya Program Aktif
              </a>
            </Button>
          ) : null}
        </div>
      ) : data ? (
        <div className="flex flex-col gap-5">
          <React.Suspense fallback={null}>
            <WorkshopPromoHeadline />
          </React.Suspense>

          {registrationBannerUrl ? (
            <button
              type="button"
              onClick={() => setIsBannerPreviewOpen(true)}
              className="block w-full overflow-hidden rounded-2xl border border-brand-periwinkle/50 text-left transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-royal focus-visible:ring-offset-2"
              aria-label="Preview registration banner"
            >
              {registrationBannerUrl.startsWith("http") ? (
                <Image
                  src={registrationBannerUrl}
                  alt={registrationBannerAlt}
                  width={1200}
                  height={630}
                  className="h-auto w-full object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <Image
                  src={registrationBannerUrl}
                  alt={registrationBannerAlt}
                  width={1200}
                  height={630}
                  className="h-auto w-full object-cover"
                  priority
                />
              )}
            </button>
          ) : (
            <div className="space-y-4 rounded-2xl border border-brand-periwinkle/60 bg-brand-pale/20 p-5 text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-periwinkle/50 bg-background/80 px-3 py-1 text-xs font-medium text-brand-deep">
                <Sparkles className="h-3.5 w-3.5" />
                Digica Program Registration
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-brand-deep">
                  {data.program.name}
                </h1>
              </div>

              <div className="flex items-start gap-3 rounded-xl border bg-background/80 px-4 py-3 text-left">
                <div className="min-w-0 flex-1">
                  <p className="flex items-start gap-2 text-xs font-medium text-brand-deep sm:text-sm">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      {formatProgramDateRange(
                        data.program.start_date,
                        data.program.end_date,
                      )}
                    </span>
                  </p>
                </div>
                <div className="w-px self-stretch bg-border" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-start gap-2 text-xs font-medium text-brand-deep sm:text-sm">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      {formatProgramTimeRange(
                        data.program.start_time,
                        data.program.end_time,
                      )}
                    </span>
                  </p>
                </div>
              </div>

              {sanitizedSummaryHtml ? (
                <div
                  className="rounded-xl border bg-background/80 px-4 py-4 text-left text-sm text-foreground [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-2 [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: sanitizedSummaryHtml }}
                />
              ) : null}
            </div>
          )}

          <React.Suspense
            fallback={
              <div className="h-40 animate-pulse rounded-2xl border bg-muted/30" />
            }
          >
            <RegistrationForm
              programId={identifier}
              programName={data.program.name}
              programType={data.program.type}
              registrationLink={data.program.registration_link}
              waGroupLink={data.program.wa_group_link}
              publicCode={data.program.public_code}
              publicSlug={data.program.public_slug}
              offerPrices={{
                promo_individual_price:
                  data.program.promo_individual_price ?? null,
                promo_bareng_teman_price:
                  data.program.promo_bareng_teman_price ?? null,
                price: data.program.price ?? null,
              }}
            />
          </React.Suspense>

          {registrationBannerUrl ? (
            <Dialog
              open={isBannerPreviewOpen}
              onOpenChange={setIsBannerPreviewOpen}
            >
              <DialogContent className="w-[calc(100%-1.5rem)] border-brand-periwinkle/70 p-3 sm:max-w-md">
                <DialogHeader className="sr-only">
                  <DialogTitle>{registrationBannerAlt}</DialogTitle>
                  <DialogDescription>
                    Preview registration banner
                  </DialogDescription>
                </DialogHeader>
                {registrationBannerUrl.startsWith("http") ? (
                  <Image
                    src={registrationBannerUrl}
                    alt={registrationBannerAlt}
                    width={1200}
                    height={630}
                    className="mx-auto h-auto max-h-[60dvh] w-full rounded-md object-contain"
                    unoptimized
                    priority
                  />
                ) : (
                  <Image
                    src={registrationBannerUrl}
                    alt={registrationBannerAlt}
                    width={1200}
                    height={630}
                    className="mx-auto h-auto max-h-[60dvh] w-full rounded-md object-contain"
                    priority
                  />
                )}
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      ) : null}
      </RegistrationPageShell>
      {showInquiryFab ? (
        <RegistrationWhatsAppFab href={inquiryWhatsAppUrl} />
      ) : null}
    </>
  );
}

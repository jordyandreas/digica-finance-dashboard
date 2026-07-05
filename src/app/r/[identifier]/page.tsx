import type { Metadata } from "next";
import { RegistrationPageView } from "@/app/registration/_components/registration-page-view";
import { getProgramRegistrationShareMetadata } from "@/services/program-share-metadata.service";

const REGISTRATION_OG_IMAGE = {
  url: "/logo/logo-digica.webp",
  width: 640,
  height: 160,
  alt: "Digica Academy",
  type: "image/webp",
} as const;

interface PageProps {
  params: Promise<{ identifier: string }>;
}

function buildShareMetadata(share: {
  title: string;
  description: string;
  canonicalUrl: string;
}): Metadata {
  return {
    title: `${share.title} | Digica Academy`,
    description: share.description,
    openGraph: {
      title: share.title,
      description: share.description,
      url: share.canonicalUrl,
      siteName: "Digica Academy",
      locale: "id_ID",
      type: "website",
      images: [REGISTRATION_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: share.title,
      description: share.description,
      images: [REGISTRATION_OG_IMAGE.url],
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { identifier } = await params;

  // #region agent log
  fetch("http://127.0.0.1:7435/ingest/5fd01bb4-894f-413f-b437-bb736c271def", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "7b4354",
    },
    body: JSON.stringify({
      sessionId: "7b4354",
      runId: "pre-fix",
      hypothesisId: "H5",
      location: "r/[identifier]/page.tsx:generateMetadata:entry",
      message: "generateMetadata started",
      data: { identifier },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  try {
    const share = await getProgramRegistrationShareMetadata(identifier);

    // #region agent log
    fetch("http://127.0.0.1:7435/ingest/5fd01bb4-894f-413f-b437-bb736c271def", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "7b4354",
      },
      body: JSON.stringify({
        sessionId: "7b4354",
        runId: "pre-fix",
        hypothesisId: "H5",
        location: "r/[identifier]/page.tsx:generateMetadata:success",
        message: "generateMetadata resolved share data",
        data: {
          identifier,
          hasShare: Boolean(share),
          title: share?.title ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!share) {
      return buildShareMetadata({
        title: "Registrasi Program",
        description: "Halaman registrasi program Digica Academy.",
        canonicalUrl: `/r/${identifier.trim()}`,
      });
    }

    return buildShareMetadata(share);
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7435/ingest/5fd01bb4-894f-413f-b437-bb736c271def", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "7b4354",
      },
      body: JSON.stringify({
        sessionId: "7b4354",
        runId: "pre-fix",
        hypothesisId: "H5",
        location: "r/[identifier]/page.tsx:generateMetadata:error",
        message: "generateMetadata threw",
        data: {
          identifier,
          errorMessage:
            error instanceof Error ? error.message : "unknown metadata error",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw error;
  }
}

export default async function ShortRegistrationPage({ params }: PageProps) {
  const { identifier } = await params;

  return <RegistrationPageView identifier={identifier} />;
}

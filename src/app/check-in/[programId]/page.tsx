import type { Metadata } from "next";
import { CheckInPageView } from "../_components/check-in-page-view";
import {
  getProgramCheckInShareMetadata,
  type ProgramShareMetadata,
} from "@/services/program-share-metadata.service";
import {
  buildShareOgImage,
  buildShareOgLogoUrl,
} from "@/utils/program-share-assets";
import { resolvePublicAppOrigin } from "@/utils/program-public-link";

interface PageProps {
  params: Promise<{ programId: string }>;
}

function buildShareMetadata(share: ProgramShareMetadata): Metadata {
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
      images: [share.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: share.title,
      description: share.description,
      images: [share.ogImage.url],
    },
    other: {
      "og:logo": share.ogLogoUrl,
    },
  };
}

function buildFallbackShareMetadata(
  identifier: string,
  title: string,
  description: string,
): Metadata {
  const origin = resolvePublicAppOrigin();

  return buildShareMetadata({
    title,
    description,
    canonicalUrl: `${origin}/c/${identifier.trim()}`,
    dateRange: "",
    timeRange: "",
    programName: title,
    ogImage: buildShareOgImage(origin, title, null),
    ogLogoUrl: buildShareOgLogoUrl(origin),
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { programId } = await params;
  const share = await getProgramCheckInShareMetadata(programId);

  if (!share) {
    return buildFallbackShareMetadata(
      programId,
      "Absensi Program",
      "Halaman absensi program Digica Academy.",
    );
  }

  return buildShareMetadata(share);
}

export default async function CheckInPage({ params }: PageProps) {
  const { programId } = await params;

  return <CheckInPageView identifier={programId} />;
}

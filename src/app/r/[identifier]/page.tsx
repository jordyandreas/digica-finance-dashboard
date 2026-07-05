import type { Metadata } from "next";
import { RegistrationPageView } from "@/app/registration/_components/registration-page-view";
import {
  getProgramRegistrationShareMetadata,
  type ProgramShareMetadata,
} from "@/services/program-share-metadata.service";
import {
  buildShareOgImage,
  buildShareOgLogoUrl,
} from "@/utils/program-share-assets";
import { resolvePublicAppOrigin } from "@/utils/program-public-link";

interface PageProps {
  params: Promise<{ identifier: string }>;
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
    canonicalUrl: `${origin}/r/${identifier.trim()}`,
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
  const { identifier } = await params;
  const share = await getProgramRegistrationShareMetadata(identifier);

  if (!share) {
    return buildFallbackShareMetadata(
      identifier,
      "Registrasi Program",
      "Halaman registrasi program Digica Academy.",
    );
  }

  return buildShareMetadata(share);
}

export default async function ShortRegistrationPage({ params }: PageProps) {
  const { identifier } = await params;

  return <RegistrationPageView identifier={identifier} />;
}

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
  const share = await getProgramRegistrationShareMetadata(identifier);

  if (!share) {
    return buildShareMetadata({
      title: "Registrasi Program",
      description: "Halaman registrasi program Digica Academy.",
      canonicalUrl: `/r/${identifier.trim()}`,
    });
  }

  return buildShareMetadata(share);
}

export default async function ShortRegistrationPage({ params }: PageProps) {
  const { identifier } = await params;

  return <RegistrationPageView identifier={identifier} />;
}

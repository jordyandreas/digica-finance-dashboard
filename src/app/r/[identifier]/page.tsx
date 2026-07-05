import type { Metadata } from "next";
import { RegistrationPageView } from "@/app/registration/_components/registration-page-view";
import { getProgramRegistrationShareMetadata } from "@/services/program-share-metadata.service";

interface PageProps {
  params: Promise<{ identifier: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { identifier } = await params;
  const share = await getProgramRegistrationShareMetadata(identifier);

  if (!share) {
    return {
      title: "Registrasi Program | Digica Academy",
      description: "Halaman registrasi program Digica Academy.",
    };
  }

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
    },
    twitter: {
      card: "summary_large_image",
      title: share.title,
      description: share.description,
    },
  };
}

export default async function ShortRegistrationPage({ params }: PageProps) {
  const { identifier } = await params;

  return <RegistrationPageView identifier={identifier} />;
}

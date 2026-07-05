"use client";

import { useParams } from "next/navigation";
import { RegistrationPageView } from "@/app/registration/_components/registration-page-view";

export default function ShortRegistrationPage() {
  const { identifier } = useParams<{ identifier: string }>();

  return <RegistrationPageView identifier={identifier} />;
}

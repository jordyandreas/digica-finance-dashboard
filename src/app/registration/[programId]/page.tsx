"use client";

import { useParams } from "next/navigation";
import { RegistrationPageView } from "../_components/registration-page-view";

export default function RegistrationPage() {
  const { programId } = useParams<{ programId: string }>();

  return <RegistrationPageView identifier={programId} />;
}

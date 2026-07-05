"use client";

import { useParams } from "next/navigation";
import { CheckInPageView } from "../_components/check-in-page-view";

export default function CheckInPage() {
  const { programId } = useParams<{ programId: string }>();

  return <CheckInPageView identifier={programId} />;
}

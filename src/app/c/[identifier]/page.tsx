"use client";

import { useParams } from "next/navigation";
import { CheckInPageView } from "@/app/check-in/_components/check-in-page-view";

export default function ShortCheckInPage() {
  const { identifier } = useParams<{ identifier: string }>();

  return <CheckInPageView identifier={identifier} />;
}

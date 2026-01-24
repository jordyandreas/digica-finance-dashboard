"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProgramRedirect() {
  const router = useRouter();
  const { id } = useParams<{ id?: string }>();
  const programId = Array.isArray(id) ? id[0] : id ?? "";

  useEffect(() => {
    if (programId) {
      router.replace(`/programs/${programId}/overview`);
    }
  }, [programId, router]);

  return null;
}

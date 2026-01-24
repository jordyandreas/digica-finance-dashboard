"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { supabase } from "@/lib/supabase";

export default function LogoutPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogout = useCallback(async () => {
    setErrorMessage(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    void handleLogout();
  }, [handleLogout]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Signing out</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {errorMessage
            ? "We couldn't sign you out. Please try again."
            : "Please wait while we sign you out."}
        </p>

        {errorMessage && (
          <Button onClick={handleLogout} className="mt-4 w-full">
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}

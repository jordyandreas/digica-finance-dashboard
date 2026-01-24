"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { TextInputController } from "@/components/controllers";
import { supabase } from "@/lib/supabase";

type LoginFormState = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const form = useForm<LoginFormState>({
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    const redirectedFrom = searchParams.get("redirectedFrom");
    return redirectedFrom && redirectedFrom.startsWith("/")
      ? redirectedFrom
      : "/dashboard";
  }, [searchParams]);

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.username,
      password: values.password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectPath);
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use your username and password to continue.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <TextInputController
            form={form}
            name="username"
            label="Username"
            placeholder="Enter username"
            required
            componentProps={{
              input: {
                type: "text",
                autoComplete: "username",
                required: true,
              },
            }}
          />

          <TextInputController
            form={form}
            name="password"
            label="Password"
            placeholder="Enter password"
            required
            componentProps={{
              input: {
                type: "password",
                autoComplete: "current-password",
                required: true,
              },
            }}
          />

          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

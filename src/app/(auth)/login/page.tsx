"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/atoms/button";
import { TextInputController } from "@/components/controllers";
import {
  ADMIN_UNAUTHORIZED_MESSAGE,
  getProfileRole,
} from "@/lib/profile-role";
import { supabase } from "@/lib/supabase";

type LoginFormState = {
  username: string;
  password: string;
};

function LoginForm() {
  const form = useForm<LoginFormState>({
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    searchParams.get("error") === "unauthorized"
      ? ADMIN_UNAUTHORIZED_MESSAGE
      : null,
  );
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const role = user ? await getProfileRole(supabase, user.id) : null;

    if (role !== "admin") {
      await supabase.auth.signOut();
      setErrorMessage(ADMIN_UNAUTHORIZED_MESSAGE);
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectPath);
  });

  return (
    <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-brand-periwinkle/70 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          src="/logo/logo-digica.webp"
          alt="Digica Academy"
          width={160}
          height={40}
          className="h-9 w-auto"
          priority
        />
        <div className="space-y-1">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-pale text-brand-royal ring-4 ring-brand-pale/50">
            <LockKeyhole className="h-4 w-4" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold text-brand-deep">
            Admin sign in
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the Digica dashboard.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {errorMessage}
          </div>
        )}

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-brand-periwinkle/70 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-40 animate-pulse rounded bg-brand-pale/60" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-brand-pale/60" />
        <div className="h-7 w-36 animate-pulse rounded bg-brand-pale/60" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-4">
        <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-premium px-4 py-10">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

"use client";

import { AlertTriangle, Check, Info, X } from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function SuccessIcon() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
      <Check className="size-3 text-white" strokeWidth={3} />
    </span>
  );
}

function InfoIcon() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
      <Info className="size-3 text-white" strokeWidth={2.5} />
    </span>
  );
}

function ErrorIcon() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500">
      <X className="size-3 text-white" strokeWidth={3} />
    </span>
  );
}

function WarningIcon() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500">
      <AlertTriangle className="size-3 text-white" strokeWidth={2.5} />
    </span>
  );
}

function CloseIcon() {
  return <X className="size-3.5" strokeWidth={2} />;
}

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      duration={3000}
      closeButton
      gap={12}
      style={
        {
          "--toast-close-button-start": "unset",
          "--toast-close-button-end": "12px",
          "--toast-close-button-transform": "none",
          "--toast-button-margin-start": "0",
          "--toast-button-margin-end": "auto",
        } as React.CSSProperties
      }
      icons={{
        success: <SuccessIcon />,
        info: <InfoIcon />,
        error: <ErrorIcon />,
        warning: <WarningIcon />,
        close: <CloseIcon />,
      }}
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "group toast group-[.toaster]:pointer-events-auto group-[.toaster]:w-[min(100%,24rem)] group-[.toaster]:items-start group-[.toaster]:gap-3 group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-zinc-200/80 group-[.toaster]:bg-white group-[.toaster]:p-4 group-[.toaster]:pr-10 group-[.toaster]:shadow-[0_8px_30px_rgb(0,0,0,0.06)] group-[.toaster]:text-zinc-900",
          title:
            "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:leading-5 group-[.toast]:text-zinc-900",
          description:
            "group-[.toast]:mt-0.5 group-[.toast]:text-sm group-[.toast]:leading-5 group-[.toast]:text-zinc-500",
          icon: "group-[.toast]:mt-0.5",
          closeButton:
            "toast-close-button group-[.toast]:!top-3.5 group-[.toast]:!size-5 group-[.toast]:!rounded-md group-[.toast]:!border-0 group-[.toast]:!bg-transparent group-[.toast]:!text-zinc-400 group-[.toast]:!shadow-none group-[.toast]:hover:!bg-zinc-100/80 group-[.toast]:hover:!text-zinc-600",
          actionButton:
            "!h-auto !rounded-none !bg-transparent !px-0 !py-0 !text-sm !font-medium !text-blue-600 !shadow-none hover:!bg-transparent hover:!text-blue-700",
          cancelButton:
            "!ml-3 !h-auto !rounded-none !bg-transparent !px-0 !py-0 !text-sm !font-medium !text-zinc-500 !shadow-none hover:!bg-transparent hover:!text-zinc-700",
          success:
            "!border-emerald-100/90 !bg-[linear-gradient(105deg,rgba(16,185,129,0.14)_0%,rgba(255,255,255,1)_38%)]",
          info: "!border-blue-100/90 !bg-[linear-gradient(105deg,rgba(59,130,246,0.12)_0%,rgba(255,255,255,1)_38%)]",
          error:
            "!border-rose-100/90 !bg-[linear-gradient(105deg,rgba(244,63,94,0.12)_0%,rgba(255,255,255,1)_38%)]",
          warning:
            "!border-amber-100/90 !bg-[linear-gradient(105deg,rgba(245,158,11,0.12)_0%,rgba(255,255,255,1)_38%)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

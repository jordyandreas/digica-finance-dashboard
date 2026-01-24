import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

const typographyVariants = cva(
  "has-[svg,img]:flex has-[svg,img]:items-center has-[svg,img]:gap-1 capitalize",
  {
    variants: {
      variant: {
        h1: "text-ds-size-48 leading-ds-heading-100p font-semibold",
        h2: "text-ds-size-32 leading-ds-heading-112p font-bold",
        h3: "text-ds-size-28 leading-ds-heading-120p font-bold",
        h4: "text-ds-size-24 leading-ds-heading-116p font-semibold",
        title: "text-ds-size-18 leading-ds-title-144p font-semibold",
        body1: "text-ds-size-14 leading-ds-body-128p font-semibold",
        body2: "text-ds-size-14 leading-ds-body-128p font-medium",
        body3: "text-ds-size-14 leading-ds-body-144p",
        body4: "text-ds-size-12 leading-ds-body-132p font-semibold",
        button: "text-ds-size-16 leading-ds-button-100p font-bold",
        caption: "text-ds-size-14 leading-ds-caption-116p",
        label: "text-ds-size-12 leading-ds-label-116p",
      },
    },
    defaultVariants: {
      variant: "body3",
    },
  },
);

type VariantUnion = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>;

interface TypographyProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  variant: VariantUnion;
  asChild?: boolean;
  tagName?: string;
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "body3", asChild = false, tagName, ...props }, ref) => {
    const Tag: Record<VariantUnion, string> = {
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      body1: "p",
      body2: "div",
      body3: "div",
      body4: "div",
      title: "div",
      button: "span",
      caption: "span",
      label: "label",
    };

    const Comp = asChild ? Slot : tagName ?? Tag?.[variant] ?? "div";

    return (
      <Comp
        ref={ref}
        data-slot="typography"
        className={cn(typographyVariants({ variant, className }))}
        {...props}
      />
    );
  },
);

Typography.displayName = "Typography";

export { Typography, typographyVariants };

import type { ComponentPropsWithoutRef } from "react";
import { useReveal } from "./useReveal";

const REVEAL_STAGGER_MS = 60;

export function Container({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={["showcase-container", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

interface SectionProps
  extends Omit<ComponentPropsWithoutRef<"section">, "aria-labelledby" | "id"> {
  id: string;
  labelledBy?: string;
  reveal?: boolean;
  revealIndex?: number;
}

export function Section({
  id,
  labelledBy = `${id}-title`,
  reveal = true,
  revealIndex = 0,
  className,
  style,
  ...props
}: SectionProps) {
  const revealRef = useReveal<HTMLElement>(reveal);

  return (
    <section
      ref={revealRef}
      id={id}
      aria-labelledby={labelledBy}
      className={["showcase-section", reveal ? "reveal" : "", className].filter(Boolean).join(" ")}
      style={{ ...style, transitionDelay: reveal ? `${revealIndex * REVEAL_STAGGER_MS}ms` : undefined }}
      {...props}
    />
  );
}

interface SectionTitleProps extends ComponentPropsWithoutRef<"h2"> {
  as?: "h1" | "h2";
}

export function SectionTitle({ as: Heading = "h2", className, ...props }: SectionTitleProps) {
  return (
    <Heading
      className={["section-title", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

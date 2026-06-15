import { type ReactNode } from "react";
import { TKHeader, useNav } from "tg-mini-app-uikit";
import { useMockHandle } from "../telegram/mock-context";

export function useMockBackHeader(title?: ReactNode): ReactNode | undefined {
  const mock = useMockHandle();
  const nav = useNav();
  if (!mock || nav.depth <= 1) return undefined;
  return <TKHeader title={title} onBack={nav.pop} testId="mock-back" />;
}

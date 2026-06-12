import type { ComponentType } from "react";

/**
 * True for anything renderable as a component: plain functions and
 * `forwardRef`/`memo` exotic components (which are objects, not functions).
 */
export function isComponent(value: unknown): boolean {
  if (typeof value === "function") return true;
  return typeof value === "object" && value !== null && "$$typeof" in (value as object);
}

/** All `TK*` component exports of the kit, by name. */
export function discoverComponents(
  kit: Record<string, unknown>,
): Array<[string, ComponentType<Record<string, unknown>>]> {
  return Object.entries(kit)
    .filter(([name, value]) => /^TK[A-Z]/.test(name) && isComponent(value))
    .map(([name, value]) => [name, value as ComponentType<Record<string, unknown>>]);
}

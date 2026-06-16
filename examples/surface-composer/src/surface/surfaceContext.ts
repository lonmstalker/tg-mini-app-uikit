/*
 * Lets motion hooks reach the surface root <main> so they can write the
 * contact/origin CSS vars where the DOM contract says they live (dom-contract
 * §1). The app provides the element; hooks read it from context.
 */
import { createContext, use } from "react";

export const SurfaceElementContext = createContext<HTMLElement | null>(null);

export function useSurfaceElement(): HTMLElement | null {
  return use(SurfaceElementContext);
}

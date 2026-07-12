import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ElementType } from "react";

/**
 * Props of a polymorphic component: its own props plus `as` and the native
 * attributes of the rendered element (`href` only typechecks with `as="a"`).
 */
export type TKPolymorphicProps<T extends ElementType, OwnProps> = OwnProps & { as?: T } & Omit<
    ComponentPropsWithoutRef<T>,
    keyof OwnProps | "as"
  >;

/**
 * The correct `ref` type for the rendered element of a polymorphic component, so
 * `<TKTappable as="a" ref={…} />` yields an `HTMLAnchorElement` ref (CC-12).
 */
export type TKPolymorphicRef<T extends ElementType> = ComponentPropsWithRef<T>["ref"];

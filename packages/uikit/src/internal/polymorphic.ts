import type { ComponentPropsWithoutRef, ElementType } from "react";

/**
 * Props of a polymorphic component: its own props plus `as` and the native
 * attributes of the rendered element (`href` only typechecks with `as="a"`).
 */
export type TKPolymorphicProps<T extends ElementType, OwnProps> = OwnProps & { as?: T } & Omit<
    ComponentPropsWithoutRef<T>,
    keyof OwnProps | "as"
  >;

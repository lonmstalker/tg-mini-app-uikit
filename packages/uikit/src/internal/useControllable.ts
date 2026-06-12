import { useCallback, useRef, useState } from "react";

/**
 * Controlled/uncontrolled state helper. When `controlled` is defined the
 * component mirrors it and only reports changes through `onChange`.
 */
export function useControllable<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const set = useCallback((next: T) => {
    if (!isControlledRef.current) setInternal(next);
    onChangeRef.current?.(next);
  }, []);

  return [isControlled ? controlled : internal, set];
}

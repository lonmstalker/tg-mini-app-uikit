import { tkFormat, useTKLocale } from "../../foundation/i18n";
import { useControllable } from "../../internal/useControllable";

export interface TKPageDotsProps {
  count: number;
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  testId?: string;
}

export function TKPageDots({ count, page, defaultPage = 0, onChange, testId }: TKPageDotsProps) {
  const locale = useTKLocale();
  const [cur, setCur] = useControllable(page, defaultPage, onChange);

  return (
    <div data-testid={testId} style={{ display: "flex", gap: 7 }}>
      {Array.from({ length: count }).map((_, index) => (
        <button
          type="button"
          key={index}
          onClick={() => setCur(index)}
          aria-label={tkFormat(locale.page, { page: index + 1 })}
          style={{
            width: index === cur ? 24 : 8,
            height: 8,
            borderRadius: 4,
            border: "none",
            padding: 0,
            cursor: "pointer",
            background: index === cur ? "var(--tk-accent)" : "var(--tk-text-3)",
            transition: "width var(--tk-t2) var(--tk-spring), background var(--tk-t2) var(--tk-ease)",
          }}
        />
      ))}
    </div>
  );
}

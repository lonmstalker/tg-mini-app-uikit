import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { TKIcon } from "../icons";
import { mergeRefs } from "../../internal/dom";
import { useTKLocale } from "../../foundation/i18n";
import { TKFormField } from "./form-field";

export interface TKFileInputProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  buttonLabel?: ReactNode;
  emptyLabel?: ReactNode;
  onFilesChange?: (files: File[]) => void;
  /** Accept files dropped onto the row (drag-n-drop zone). */
  dropZone?: boolean;
  /** Upload progress 0-100; renders a progress bar under the row. */
  progress?: number;
  /** Image preview of the first selected image file (default true). */
  preview?: boolean;
  testId?: string;
}

export const TKFileInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKFileInputProps>(function TKFileInput(
  {
    label,
    hint,
    error,
    disabled,
    accept,
    multiple,
    buttonLabel,
    emptyLabel,
    onFilesChange,
    dropZone,
    progress,
    preview = true,
    testId,
  },
  forwardedRef,
) {
  const locale = useTKLocale();
  const ref = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const revokePreviewUrl = () => {
    if (previewUrlRef.current && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  };
  useEffect(() => revokePreviewUrl, []);
  const commit = (next: File[]) => {
    setFiles(next);
    onFilesChange?.(next);
    revokePreviewUrl();
    const img = preview ? next.find((f) => f.type.startsWith("image/")) : undefined;
    const nextPreviewUrl = img && typeof URL.createObjectURL === "function" ? URL.createObjectURL(img) : null;
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
  };
  return (
    <TKFormField label={label} hint={hint} error={error} disabled={disabled} testId={testId}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className="tk-press tk-press-soft"
        onClick={() => !disabled && ref.current?.click()}
        onDragOver={
          dropZone
            ? (event) => {
                event.preventDefault();
                setDragOver(true);
              }
            : undefined
        }
        onDragLeave={dropZone ? () => setDragOver(false) : undefined}
        onDrop={
          dropZone
            ? (event) => {
                event.preventDefault();
                setDragOver(false);
                if (disabled) return;
                const dropped = Array.from(event.dataTransfer?.files ?? []);
                if (dropped.length) commit(multiple ? dropped : dropped.slice(0, 1));
              }
            : undefined
        }
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            ref.current?.click();
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minHeight: 58,
          padding: "10px 14px",
          borderRadius: "var(--tk-r-md)",
          background: dragOver ? "var(--tk-accent-06)" : "var(--tk-surface)",
          boxShadow: error
            ? "inset 0 0 0 1.5px var(--tk-red)"
            : dragOver
              ? "inset 0 0 0 1.5px var(--tk-accent), var(--tk-ring)"
              : dropZone
                ? "inset 0 0 0 1.5px var(--tk-accent-20)"
                : "var(--tk-shadow-sm)",
          transition: "background var(--tk-t1) var(--tk-ease), box-shadow var(--tk-t1) var(--tk-ease)",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <input
          ref={mergeRefs(ref, forwardedRef)}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            commit(Array.from(e.target.files ?? []));
            // Clear the value so re-picking the SAME file fires `change` again
            // (the browser suppresses it when the selection is unchanged).
            e.target.value = "";
          }}
          // display:none keeps it clickable programmatically while staying out
          // of the focus order and accessibility tree (the row is the control)
          style={{ display: "none" }}
        />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "var(--tk-r-sm)",
            background: "var(--tk-accent-12)",
            color: "var(--tk-accent)",
            flexShrink: 0,
          }}
        >
          <TKIcon name="share" size={18} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: "var(--tk-fz-body)", fontWeight: 600, color: "var(--tk-text)" }}>
            {buttonLabel ?? locale.chooseFile}
          </span>
          <span
            style={{
              display: "block",
              fontSize: "var(--tk-fz-caption)",
              color: files.length ? "var(--tk-text-2)" : "var(--tk-text-3)",
              marginTop: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {files.length ? files.map((file) => file.name).join(", ") : (emptyLabel ?? locale.noFileSelected)}
          </span>
        </span>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            style={{ width: 42, height: 42, objectFit: "cover", borderRadius: "var(--tk-r-sm)", flexShrink: 0 }}
          />
        ) : null}
      </div>
      {progress != null ? (
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={locale.progress}
          style={{ height: 5, borderRadius: 3, background: "var(--tk-surface-3)", overflow: "hidden", margin: "0 2px" }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, progress))}%`,
              borderRadius: 3,
              background: "var(--tk-accent-grad)",
              transition: "width var(--tk-t2) var(--tk-ease)",
            }}
          />
        </div>
      ) : null}
    </TKFormField>
  );
});

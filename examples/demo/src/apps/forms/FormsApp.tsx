import { useRef, useState } from "react";
import {
  TKButton,
  TKCell,
  TKCheckbox,
  TKChipsInput,
  TKDateInput,
  TKFileInput,
  TKInput,
  TKListGroup,
  TKMainButton,
  TKMultiselect,
  TKPage,
  TKPhoneInput,
  TKPopper,
  TKProvider,
  TKSheet,
  TKSlider,
  TKTelegramProvider,
  TKTimeInput,
  TKToastProvider,
  useTelegramTheme,
  useTKToast,
} from "tg-mini-app-uikit";
import { createMockTelegram } from "../../telegram/mock";
import { bootToday } from "../../shell/boot";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface FormState {
  name: string;
  phone: string;
  date: Date | null;
  time: string | null;
  interests: string[];
  channels: string[];
  budget: [number, number];
  licenseAccepted: boolean;
  photoProgress: number | undefined;
}

interface FormErrors {
  name?: string;
  phone?: string;
  date?: string;
  license?: string;
}

const INITIAL: FormState = {
  name: "",
  phone: "",
  date: null,
  time: null,
  interests: [],
  channels: [],
  budget: [500, 2000],
  licenseAccepted: false,
  photoProgress: undefined,
};

/* Budget marks for the slider */
const BUDGET_MARKS = [0, 500, 1000, 1500, 2000, 3000];
const ENABLE_EXACT_BUDGET_EDITOR = true;

/* ------------------------------------------------------------------ */
/* Inner form component (needs toast context)                           */
/* ------------------------------------------------------------------ */

function FormsInner() {
  const theme = useTelegramTheme();
  const toast = useTKToast();
  const today = bootToday();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState<[string, string]>(["500", "2000"]);
  const [helpOpen, setHelpOpen] = useState(false);

  // Refs for scroll-into-view on first invalid field
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const licenseAreaRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLButtonElement>(null);

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    // Phone is "complete" when it has 10+ digits
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) errs.phone = "Enter a valid phone number";
    if (!form.date) errs.date = "Date is required";
    if (!form.licenseAccepted) errs.license = "You must accept the license";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll first invalid field into view
      if (errs.name) nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (errs.phone) phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (errs.date) dateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (errs.license) licenseAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSummaryOpen(true);
  };

  const handleConfirm = () => {
    setSummaryOpen(false);
    toast.success("Registration complete! Welcome aboard.");
    setForm(INITIAL);
    setErrors({});
  };

  const fmtDate = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(d)
      : "—";

  const openBudgetEditor = () => {
    setBudgetDraft([String(form.budget[0]), String(form.budget[1])]);
    setBudgetOpen(true);
  };

  const applyBudgetDraft = () => {
    const parsedMin = Number.parseInt(budgetDraft[0], 10);
    const parsedMax = Number.parseInt(budgetDraft[1], 10);
    const nextMin = Number.isFinite(parsedMin) ? Math.max(0, Math.min(3000, parsedMin)) : form.budget[0];
    const nextMax = Number.isFinite(parsedMax) ? Math.max(0, Math.min(3000, parsedMax)) : form.budget[1];
    patch("budget", nextMin <= nextMax ? [nextMin, nextMax] : [nextMax, nextMin]);
    setBudgetOpen(false);
  };

  return (
    <TKProvider theme={theme} style={{ height: "100%" }}>
      <div data-demo-app="forms" style={{ height: "100%" }}>
        <TKPage>
          <div style={{ fontSize: "var(--tk-fz-headline)", fontWeight: 700, color: "var(--tk-text)" }}>
            Sign Up
          </div>
          <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>
            Tell us about yourself to get started.
          </div>

          {/* Name */}
          <TKInput
            ref={nameRef}
            label="Full name"
            placeholder="Anna Karlova"
            value={form.name}
            onChange={(v) => patch("name", v)}
            error={errors.name}
            testId="forms-name"
          />

          {/* Phone */}
          <TKPhoneInput
            ref={phoneRef}
            label="Phone number"
            value={form.phone}
            onChange={(v) => patch("phone", v)}
            error={errors.phone}
            testId="forms-phone"
          />

          {/* Date */}
          <div ref={dateRef}>
            <TKDateInput
              label="Birth date"
              placeholder="DD / MM / YYYY"
              value={form.date}
              onChange={(d) => patch("date", d)}
              min={new Date(1900, 0, 1)}
              max={today}
              error={errors.date}
              testId="forms-date"
            />
          </div>

          {/* Time */}
          <TKTimeInput
            label="Preferred contact time"
            placeholder="HH:MM"
            value={form.time ?? ""}
            onChange={(t) => patch("time", t)}
            testId="forms-time"
          />

          {/* Interests (chips) */}
          <TKChipsInput
            label="Interests"
            placeholder="Type and press Enter…"
            value={form.interests}
            onChange={(tags) => patch("interests", tags)}
            testId="forms-tags"
          />

          <TKMultiselect
            label="Contact channels"
            placeholder="Choose one or more"
            selectAll
            options={["Telegram", "Email", "Phone"]}
            value={form.channels}
            onChange={(channels) => patch("channels", channels)}
            testId="forms-channels"
          />

          {/* Budget range slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "0 14px" }}>
              <span
                data-testid="forms-budget-label"
                style={{
                  fontSize: "var(--tk-fz-caption)",
                  fontWeight: 600,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: "var(--tk-text-2)",
                }}
              >
                Budget range (USD)
              </span>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <TKButton
                  ref={helpRef}
                  type="button"
                  aria-label="Budget help"
                  size="sm"
                  variant="surface"
                  pill
                  onClick={() => setHelpOpen((open) => !open)}
                  testId="forms-help"
                  style={{ width: 30, height: 28, padding: 0, flex: "0 0 30px" }}
                >
                  ?
                </TKButton>
                {ENABLE_EXACT_BUDGET_EDITOR ? (
                  <TKButton
                    type="button"
                    aria-label="Exact budget values"
                    size="sm"
                    variant="surface"
                    pill
                    icon="edit"
                    onClick={openBudgetEditor}
                    testId="forms-budget-exact"
                    style={{ width: 30, height: 28, padding: 0, flex: "0 0 30px" }}
                  />
                ) : null}
              </div>
              <TKPopper open={helpOpen} anchorRef={helpRef} placement="left" arrow onClose={() => setHelpOpen(false)} testId="forms-help-popover">
                <div style={{ width: 210, fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)", lineHeight: 1.35 }}>
                  Use the slider for quick ranges. Open exact values for uncommon amounts.
                </div>
              </TKPopper>
            </div>
            <TKSlider
              range
              min={0}
              max={3000}
              step={50}
              rangeValue={form.budget}
              onRangeChange={(r) => patch("budget", r)}
              marks={BUDGET_MARKS}
              suffix=" $"
              label="Budget range"
            />
            <span
              data-testid="forms-budget-value"
              style={{
                fontSize: "var(--tk-fz-caption)",
                color: "var(--tk-text-3)",
                textAlign: "center",
              }}
            >
              ${form.budget[0].toLocaleString()} – ${form.budget[1].toLocaleString()}
            </span>
          </div>

          {/* License checkbox */}
          <div ref={licenseAreaRef} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <TKCheckbox
              label="I accept the license agreement and Terms of Service"
              checked={form.licenseAccepted}
              onChange={(v) => patch("licenseAccepted", v)}
              testId="forms-license"
            />
            {errors.license ? (
              <span style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-red)", marginLeft: 34 }}>
                {errors.license}
              </span>
            ) : null}
          </div>

          {/* Photo upload (optional) */}
          <TKFileInput
            label="Profile photo (optional)"
            accept="image/*"
            dropZone
            preview
            progress={form.photoProgress}
            onFilesChange={(files) => {
              // Immediately simulate 100% progress (deterministic, no network)
              patch("photoProgress", files.length > 0 ? 100 : undefined);
            }}
          />

          {/* Submit button */}
          <TKMainButton label="Submit" onClick={handleSubmit} testId="forms-submit" />

          {/* Bottom spacer */}
          <div style={{ height: 8 }} />
        </TKPage>

        {/* Summary sheet */}
        <TKSheet
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          title="Review your answers"
          testId="forms-summary"
        >
          <TKListGroup title="Your information" inset>
            <TKCell title="Name" value={form.name || "—"} />
            <TKCell title="Phone" value={form.phone || "—"} />
            <TKCell title="Birth date" value={fmtDate(form.date)} />
            <TKCell title="Contact time" value={form.time ?? "—"} />
            <TKCell
              title="Interests"
              value={form.interests.length > 0 ? form.interests.join(", ") : "—"}
            />
            <TKCell
              title="Channels"
              value={form.channels.length > 0 ? form.channels.join(", ") : "—"}
            />
            <TKCell
              title="Budget"
              value={`$${form.budget[0].toLocaleString()} – $${form.budget[1].toLocaleString()}`}
            />
            <TKCell title="License" value={form.licenseAccepted ? "Accepted" : "Not accepted"} />
          </TKListGroup>
          <div style={{ padding: "12px 16px 0" }}>
            <TKButton variant="filled" onClick={handleConfirm} testId="forms-confirm" style={{ width: "100%" }}>
              Confirm
            </TKButton>
          </div>
        </TKSheet>

        {ENABLE_EXACT_BUDGET_EDITOR ? (
          <TKSheet
            open={budgetOpen}
            onClose={() => setBudgetOpen(false)}
            title="Exact budget"
            testId="forms-budget-sheet"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TKInput
                label="Minimum"
                type="number"
                inputMode="numeric"
                value={budgetDraft[0]}
                onChange={(value) => setBudgetDraft((prev) => [value, prev[1]])}
                testId="forms-budget-min"
              />
              <TKInput
                label="Maximum"
                type="number"
                inputMode="numeric"
                value={budgetDraft[1]}
                onChange={(value) => setBudgetDraft((prev) => [prev[0], value])}
                testId="forms-budget-max"
              />
              <TKButton full onClick={applyBudgetDraft} testId="forms-budget-apply">
                Apply
              </TKButton>
            </div>
          </TKSheet>
        ) : null}
      </div>
    </TKProvider>
  );
}

export function FormsApp() {
  const mock = useRef(createMockTelegram());
  return (
    <TKTelegramProvider webApp={mock.current.webApp}>
      <TKToastProvider>
        <FormsInner />
      </TKToastProvider>
    </TKTelegramProvider>
  );
}

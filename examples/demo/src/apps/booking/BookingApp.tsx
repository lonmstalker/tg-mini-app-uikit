import { useState } from "react";
import {
  TKBadge,
  TKBookingCard,
  TKButton,
  TKCell,
  TKHeader,
  TKIcon,
  TKListGroup,
  TKMainButton,
  TKPaymentSummary,
  TKSlotPicker,
  TKSteps,
  TKSwitch,
  TKTimeline,
  TKToastProvider,
  useTKToast,
  type TKIconName,
} from "tg-mini-app-uikit";

/* Booking — appointment flow example: service → time → confirm → status. */

interface Service {
  id: string;
  icon: TKIconName;
  iconBg: string;
  title: string;
  subtitle: string;
  price: number;
  duration: string;
}

const SERVICES: Service[] = [
  { id: "consult", icon: "user", iconBg: "var(--tk-accent)", title: "Consultation", subtitle: "Skin check & treatment plan", price: 60, duration: "45 min" },
  { id: "derma", icon: "sun", iconBg: "var(--tk-orange)", title: "Dermatoscopy", subtitle: "Full-body mole mapping", price: 95, duration: "60 min" },
  { id: "peel", icon: "bolt", iconBg: "#5856d6", title: "Chemical peel", subtitle: "Light glycolic acid peel", price: 120, duration: "30 min" },
  { id: "follow", icon: "calendar", iconBg: "var(--tk-green)", title: "Follow-up visit", subtitle: "For returning patients", price: 40, duration: "20 min" },
];

const DAYS = [
  { label: "Mon", date: 15 },
  { label: "Tue", date: 16 },
  { label: "Wed", date: 17 },
  { label: "Thu", date: 18 },
  { label: "Fri", date: 19 },
  { label: "Sat", date: 20 },
];
const SLOTS = ["10:00", "10:45", "11:30", "12:15", "14:30", "15:15", "16:00", "17:30", "18:15"];
const BUSY = ["10:45", "14:30", "17:30"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function BookingApp() {
  return (
    <TKToastProvider offset={20}>
      <div data-demo-app="booking" style={{ height: "100%" }}>
        <BookingInner />
      </div>
    </TKToastProvider>
  );
}

function BookingInner() {
  const toast = useTKToast();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("consult");
  const [day, setDay] = useState(4);
  const [slot, setSlot] = useState("15:15");
  const [remind, setRemind] = useState(true);
  const [booked, setBooked] = useState(false);

  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0];
  const dateLabel = `${DAYS[day].label}, Jun ${DAYS[day].date}`;

  const confirm = async () => {
    await sleep(1400);
    setBooked(true);
    toast.success(remind ? "Booked — we'll remind you 2h before" : "Booked!");
  };

  const reset = () => {
    setBooked(false);
    setStep(0);
  };

  if (booked) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "64px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: "-.02em" }}>You're booked</span>
            <TKBadge tone="green" soft>Confirmed</TKBadge>
          </div>
          <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>Clinic on Pine St · Dermatology</div>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <div style={{ padding: "4px 16px 12px", display: "flex", flexDirection: "column", gap: 16 }}>
          <TKBookingCard
            initials="RV"
            name="Dr. Renata Voss"
            subtitle={`${service.title} · Clinic on Pine St`}
            status={<TKBadge tone="green" soft>Confirmed</TKBadge>}
            date={dateLabel}
            time={slot}
            actionLabel="Reschedule"
            onAction={reset}
          />
          <div>
            <div
              style={{
                fontSize: "var(--tk-fz-caption)",
                fontWeight: 600,
                letterSpacing: ".05em",
                textTransform: "uppercase",
                color: "var(--tk-text-2)",
                margin: "0 2px 8px",
              }}
            >
              What happens next
            </div>
            <div style={{ background: "var(--tk-surface)", borderRadius: "var(--tk-r-lg)", boxShadow: "var(--tk-shadow-sm)", padding: 16 }}>
              <TKTimeline
                steps={[
                  { label: "Booking confirmed", time: "just now", status: "done" },
                  { label: "Reminder", time: remind ? "2 hours before the visit" : "disabled", status: remind ? "active" : "pending" },
                  { label: `Visit · ${service.title}`, time: `${dateLabel} · ${slot}`, status: "pending" },
                ]}
              />
            </div>
          </div>
          </div>
        </div>
        <div style={{ padding: "8px 16px 30px" }}>
          <TKButton full variant="tonal" onClick={reset}>
            Book another visit
          </TKButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ paddingTop: 54 }}>
        <TKHeader
          large
          back={step > 0}
          onBack={() => setStep(Math.max(0, step - 1))}
          title="Book a visit"
          subtitle="Clinic on Pine St · Dermatology"
        />
      </div>
      <div style={{ padding: "14px 16px" }}>
        <TKSteps
          steps={["Service", "Time", "Confirm"]}
          current={step}
          onStepClick={(i) => i < step && setStep(i)}
        />
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "2px 16px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
        {step === 0 ? (
          <TKListGroup title="Choose a service" footer="Prices include all materials.">
            {SERVICES.map((s) => (
              <TKCell
                key={s.id}
                icon={s.icon}
                iconBg={s.iconBg}
                title={s.title}
                subtitle={s.subtitle}
                value={`$${s.price}`}
                onClick={() => setServiceId(s.id)}
                after={
                  s.id === serviceId ? (
                    <span className="tk-pop" style={{ display: "inline-flex", color: "var(--tk-accent)" }}>
                      <TKIcon name="check" size={18} strokeWidth={2.6} />
                    </span>
                  ) : null
                }
              />
            ))}
          </TKListGroup>
        ) : null}

        {step === 1 ? (
          <>
            <TKSlotPicker
              days={DAYS}
              slots={SLOTS}
              busy={BUSY}
              day={day}
              onDayChange={setDay}
              slot={slot}
              onSlotChange={setSlot}
            />
            <TKListGroup>
              <TKCell icon="user" title="Dr. Renata Voss" subtitle="4.9 · 280 visits" chevron onClick={() => {}} />
            </TKListGroup>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <TKListGroup title="Visit details">
              <TKCell icon="calendar" iconBg="var(--tk-green)" title={dateLabel} value={slot} />
              <TKCell icon="clock" iconBg="var(--tk-orange)" title="Duration" value={service.duration} />
              <TKCell icon="wallet" iconBg="#5856d6" title={service.title} value={`$${service.price}`} />
            </TKListGroup>
            <TKPaymentSummary
              rows={[
                { label: service.title, value: `$${service.price}.00` },
                { label: "Booking fee", value: "$0.00" },
                { label: "Total", value: `$${service.price}.00`, total: true },
              ]}
            />
            <div style={{ background: "var(--tk-surface)", borderRadius: "var(--tk-r-md)", boxShadow: "var(--tk-shadow-sm)", padding: "12px 14px" }}>
              <TKSwitch label="Remind me 2 hours before" checked={remind} onChange={setRemind} />
            </div>
          </>
        ) : null}
        </div>
      </div>

      <div style={{ padding: "8px 16px 30px" }}>
        {step < 2 ? (
          <TKButton full size="lg" onClick={() => setStep(step + 1)}>
            Continue
          </TKButton>
        ) : (
          <TKMainButton label={`Confirm · ${DAYS[day].label} ${slot}`} successLabel="Booked" onClick={confirm} />
        )}
      </div>
    </div>
  );
}

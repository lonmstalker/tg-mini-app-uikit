import { useRef, useState } from "react";
import {
  TKBadge,
  TKButton,
  TKCell,
  TKInput,
  TKListGroup,
  TKPage,
  TKSelect,
  TKSwitch,
  TKTelegramProvider,
  useCloudStorage,
  useDeviceStorage,
  useSecureStorage,
} from "tg-mini-app-uikit";
import { createMockTelegram } from "../../telegram/mock";

/* ------------------------------------------------------------------ */
/*  Form data shape                                                     */
/* ------------------------------------------------------------------ */
interface ProfileForm {
  name: string;
  theme: string;
  notifications: boolean;
  analytics: boolean;
}

const DEFAULT_FORM: ProfileForm = {
  name: "",
  theme: "system",
  notifications: true,
  analytics: false,
};

/* ------------------------------------------------------------------ */
/*  Storage key                                                         */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = "settings-snapshot";

/* ------------------------------------------------------------------ */
/*  Inner app — must be inside TKTelegramProvider                      */
/* ------------------------------------------------------------------ */
function SettingsInner() {
  const cloud = useCloudStorage();
  const device = useDeviceStorage();
  const secure = useSecureStorage();

  // In-memory form state (a "restart" resets to DEFAULT_FORM)
  const [form, setForm] = useState<ProfileForm>(DEFAULT_FORM);

  // Which storages currently hold a snapshot
  const [cloudHas, setCloudHas] = useState(false);
  const [deviceHas, setDeviceHas] = useState(false);
  const [secureHas, setSecureHas] = useState(false);

  // Last-loaded summary
  const [loadSummary, setLoadSummary] = useState<string | null>(null);

  const merge = (patch: Partial<ProfileForm>) =>
    setForm((f) => ({ ...f, ...patch }));

  /* ---- helpers ---- */
  const serialize = () => JSON.stringify(form);
  const deserialize = (raw: string | null): ProfileForm | null => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ProfileForm;
    } catch {
      return null;
    }
  };
  const applyLoaded = (data: ProfileForm | null, source: string) => {
    if (!data) {
      setLoadSummary(`${source}: nothing stored`);
      return;
    }
    setForm(data);
    setLoadSummary(
      `Loaded from ${source}: name="${data.name}", theme=${data.theme}`,
    );
  };

  /* ---- Cloud ---- */
  const saveCloud = async () => {
    await cloud.set(STORAGE_KEY, serialize());
    setCloudHas(true);
  };
  const loadCloud = async () => {
    const raw = await cloud.get(STORAGE_KEY);
    applyLoaded(deserialize(raw), "Cloud");
  };

  /* ---- Device ---- */
  const saveDevice = async () => {
    await device.set(STORAGE_KEY, serialize());
    setDeviceHas(true);
  };
  const loadDevice = async () => {
    const raw = await device.get(STORAGE_KEY);
    applyLoaded(deserialize(raw), "Device");
  };

  /* ---- Secure ---- */
  const saveSecure = async () => {
    await secure.set(STORAGE_KEY, serialize());
    setSecureHas(true);
  };
  const loadSecure = async () => {
    const raw = await secure.get(STORAGE_KEY);
    applyLoaded(deserialize(raw), "Secure");
  };

  /* ---- Simulate restart ---- */
  const simulateRestart = () => {
    setForm(DEFAULT_FORM);
    setLoadSummary(null);
  };

  const storageRow = (
    label: string,
    has: boolean,
    onSave: () => void,
    onLoad: () => void,
    saveTestId: string,
    loadTestId: string,
  ) => (
    <TKListGroup title={label}>
      <TKCell
        icon={has ? "check" : "archive"}
        iconBg={has ? "var(--tk-green)" : "var(--tk-accent)"}
        title={has ? "Snapshot stored" : "No snapshot"}
        subtitle={`Tap Save to persist current form to ${label}`}
        value={has ? <TKBadge tone="green" soft>saved</TKBadge> : undefined}
      />
      <div style={{ display: "flex", gap: 10, padding: "10px 14px" }}>
        <TKButton testId={saveTestId} full size="sm" onClick={onSave}>
          Save
        </TKButton>
        <TKButton testId={loadTestId} full size="sm" variant="tonal" onClick={onLoad}>
          Load
        </TKButton>
      </div>
    </TKListGroup>
  );

  return (
    <TKPage padding={16} gap={16}>
      {/* ---- Profile form ---- */}
      <TKListGroup title="Profile">
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          <TKInput
            testId="settings-name"
            label="Display name"
            placeholder="Your name"
            value={form.name}
            onChange={(v) => merge({ name: v })}
          />
          <TKSelect
            label="Theme"
            options={[
              { value: "system", label: "System default" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            value={form.theme}
            onChange={(v) => merge({ theme: v })}
          />
        </div>
        <TKCell
          icon="bell"
          title="Notifications"
          after={
            <TKSwitch
              checked={form.notifications}
              onChange={(v) => merge({ notifications: v })}
            />
          }
        />
        <TKCell
          icon="tune"
          title="Analytics"
          after={
            <TKSwitch
              checked={form.analytics}
              onChange={(v) => merge({ analytics: v })}
            />
          }
        />
      </TKListGroup>

      {/* ---- Storage comparison ---- */}
      {storageRow(
        "Cloud storage",
        cloudHas,
        saveCloud,
        loadCloud,
        "settings-save-cloud",
        "settings-load-cloud",
      )}
      {storageRow(
        "Device storage",
        deviceHas,
        saveDevice,
        loadDevice,
        "settings-save-device",
        "settings-load-device",
      )}
      {storageRow(
        "Secure storage",
        secureHas,
        saveSecure,
        loadSecure,
        "settings-save-secure",
        "settings-load-secure",
      )}

      {/* ---- Status ---- */}
      {loadSummary ? (
        <TKListGroup>
          <TKCell
            testId="settings-snapshot"
            icon="check"
            iconBg="var(--tk-green)"
            title="Last operation"
            subtitle={loadSummary}
          />
        </TKListGroup>
      ) : null}

      {/* ---- Simulate restart ---- */}
      <TKListGroup footer="Clears the in-memory form to defaults without touching any storage. Then restore from one of the backends above.">
        <TKCell
          icon="refresh"
          iconBg="var(--tk-orange)"
          title="Simulate restart"
          subtitle="Resets fields to defaults (storages untouched)"
          chevron
          testId="settings-restart"
          onClick={simulateRestart}
        />
      </TKListGroup>
    </TKPage>
  );
}

/* ------------------------------------------------------------------ */
/*  Root export                                                         */
/* ------------------------------------------------------------------ */
export function SettingsApp() {
  const mockRef = useRef(createMockTelegram());
  const mock = mockRef.current;

  return (
    <TKTelegramProvider webApp={mock.webApp}>
      <div
        data-demo-app="settings"
        style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <SettingsInner />
      </div>
    </TKTelegramProvider>
  );
}

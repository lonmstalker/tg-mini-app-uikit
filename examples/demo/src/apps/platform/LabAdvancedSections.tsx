import type { Dispatch, SetStateAction } from "react";
import { TKButton, TKInput, TKListGroup, TKSwitch } from "tg-mini-app-uikit";
import type {
  useBiometrics,
  useChatRequest,
  useClipboard,
  useCloudStorage,
  useContactRequest,
  useDeviceStorage,
  useDownloadFile,
  useEmojiStatus,
  useHomeScreen,
  useLocation,
  useMotionSensors,
  useQrScanner,
  useSecureStorage,
  useShare,
  useTKToast,
  useWebApp,
  useWriteAccess,
} from "tg-mini-app-uikit";
import type { MockTelegramState } from "../../telegram/mock";
import { Card, HookStatus, KV, Section, SensorRow, fmtReading } from "./shared";

interface LabAdvancedSectionsProps {
  state: MockTelegramState;
  toast: ReturnType<typeof useTKToast>;
  webApp: ReturnType<typeof useWebApp>;
  cloud: ReturnType<typeof useCloudStorage>;
  deviceStorage: ReturnType<typeof useDeviceStorage>;
  secureStorage: ReturnType<typeof useSecureStorage>;
  share: ReturnType<typeof useShare>;
  contact: ReturnType<typeof useContactRequest>;
  writeAccess: ReturnType<typeof useWriteAccess>;
  clipboard: ReturnType<typeof useClipboard>;
  qr: ReturnType<typeof useQrScanner>;
  homeScreen: ReturnType<typeof useHomeScreen>;
  emojiStatus: ReturnType<typeof useEmojiStatus>;
  downloadFile: ReturnType<typeof useDownloadFile>;
  chatRequest: ReturnType<typeof useChatRequest>;
  biometrics: ReturnType<typeof useBiometrics>;
  location: ReturnType<typeof useLocation>;
  sensors: ReturnType<typeof useMotionSensors>;
  needAbsolute: boolean;
  setNeedAbsolute: Dispatch<SetStateAction<boolean>>;
  note: string;
  setNote: Dispatch<SetStateAction<string>>;
  storedNote: string | null;
  setStoredNote: Dispatch<SetStateAction<string | null>>;
  deviceValue: string | null;
  setDeviceValue: Dispatch<SetStateAction<string | null>>;
  secureValue: string | null;
  setSecureValue: Dispatch<SetStateAction<string | null>>;
  confirmClose: boolean;
  setConfirmClose: Dispatch<SetStateAction<boolean>>;
}

export function LabAdvancedSections({
  state,
  toast,
  webApp,
  cloud,
  deviceStorage,
  secureStorage,
  share,
  contact,
  writeAccess,
  clipboard,
  qr,
  homeScreen,
  emojiStatus,
  downloadFile,
  chatRequest,
  biometrics,
  location,
  sensors,
  needAbsolute,
  setNeedAbsolute,
  note,
  setNote,
  storedNote,
  setStoredNote,
  deviceValue,
  setDeviceValue,
  secureValue,
  setSecureValue,
  confirmClose,
  setConfirmClose,
}: LabAdvancedSectionsProps) {
  return (
    <>
      <Section title="Permissions · QR, clipboard, access">
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!contact.isSupported}
              onClick={async () => toast.show({ icon: "user", text: `contact → ${await contact.request()}` })}
            >
              Contact
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!writeAccess.isSupported}
              onClick={async () => toast.show({ icon: "chat", text: `write → ${await writeAccess.request()}` })}
            >
              Write access
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!qr.isSupported}
              onClick={async () => toast.show({ icon: "grid", text: (await qr.open({ text: "Scan demo QR" })) ?? "no QR" })}
            >
              QR scan
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!clipboard.isSupported}
              onClick={async () => toast.show({ icon: "check", text: (await clipboard.readText()) ?? "empty clipboard" })}
            >
              Clipboard
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              onClick={async () => toast.show({ icon: "home", text: `home → ${await homeScreen.check()}` })}
            >
              Home status
            </TKButton>
            <TKButton size="sm" variant="surface" onClick={() => homeScreen.add()}>
              Add home
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!emojiStatus.isSupported}
              onClick={async () => toast.show({ icon: "star", text: `emoji → ${await emojiStatus.set("5368324170671202286")}` })}
            >
              Emoji status
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!downloadFile.isSupported}
              onClick={async () => toast.show({ icon: "share", text: `download → ${await downloadFile.download({ url: "/demo.txt", fileName: "demo.txt" })}` })}
            >
              Download
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!chatRequest.isSupported}
              onClick={async () => toast.show({ icon: "chat", text: `chat → ${await chatRequest.request("prepared-demo-chat")}` })}
            >
              Request chat
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!location.isSupported}
              onClick={async () => toast.show({ icon: "location", text: (await location.getLocation()) ? "location ok" : "no location" })}
            >
              Location
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!biometrics.isSupported}
              onClick={async () => toast.show({ icon: "bolt", text: `biometric → ${(await biometrics.authenticate("Demo auth")).ok}` })}
            >
              Biometrics
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!sensors.accelerometer.isSupported}
              onClick={async () => toast.show({ icon: "tune", text: `sensor → ${await sensors.accelerometer.start(30)}` })}
            >
              Sensor
            </TKButton>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <HookStatus label="share" hook={share} />
            <HookStatus label="contact" hook={contact} />
            <HookStatus label="write access" hook={writeAccess} />
            <HookStatus label="qr" hook={qr} />
            <HookStatus label="clipboard" hook={clipboard} />
            <HookStatus label="emoji" hook={emojiStatus} />
            <HookStatus label="download" hook={downloadFile} />
            <HookStatus label="chat" hook={chatRequest} />
            <HookStatus label="location" hook={location} />
            <HookStatus label="biometrics" hook={biometrics} />
            <HookStatus label="accelerometer" hook={sensors.accelerometer} />
          </div>
        </Card>
      </Section>

      <Section title="Sensors · useMotionSensors">
        <Card>
          <SensorRow
            label="Accelerometer"
            sensor={state.sensors.accelerometer}
            format={(v) => `x ${fmtReading(v.x)} · y ${fmtReading(v.y)} · z ${fmtReading(v.z)} m/s²`}
            onStart={() => sensors.accelerometer.start(30)}
            onStop={() => sensors.accelerometer.stop()}
            testId="accelerometer"
          />
          <SensorRow
            label="Device orientation"
            sensor={state.sensors.deviceOrientation}
            format={(v) =>
              `α ${fmtReading(v.alpha)} · β ${fmtReading(v.beta)} · γ ${fmtReading(v.gamma)}${
                state.sensors.deviceOrientation.absolute ? " · absolute" : ""
              }`
            }
            onStart={() => sensors.deviceOrientation.start(60, { needAbsolute })}
            onStop={() => sensors.deviceOrientation.stop()}
            testId="orientation"
          />
          <SensorRow
            label="Gyroscope"
            sensor={state.sensors.gyroscope}
            format={(v) => `x ${fmtReading(v.x)} · y ${fmtReading(v.y)} · z ${fmtReading(v.z)} rad/s`}
            onStart={() => sensors.gyroscope.start(60)}
            onStop={() => sensors.gyroscope.stop()}
            testId="gyroscope"
          />
          <TKSwitch label="Absolute orientation (need_absolute)" checked={needAbsolute} onChange={setNeedAbsolute} />
        </Card>
      </Section>

      <Section title="Cloud storage · restore on launch">
        <Card>
          <TKInput label="Note" placeholder="Anything to remember" value={note} onChange={setNote} />
          <div style={{ display: "flex", gap: 8 }}>
            <TKButton
              size="sm"
              full
              onClick={async () => {
                await cloud.set("note", note);
                setStoredNote(note);
                toast.success("Saved to CloudStorage");
              }}
            >
              Save
            </TKButton>
            <TKButton
              size="sm"
              full
              variant="tonal"
              onClick={async () => {
                const v = await cloud.get("note");
                setStoredNote(v);
                setNote(v ?? "");
                toast.show({ text: v != null ? "Restored" : "Nothing stored yet" });
              }}
            >
              Load
            </TKButton>
            <TKButton
              size="sm"
              full
              variant="destructive"
              onClick={async () => {
                await cloud.remove("note");
                setStoredNote(null);
                toast.show({ icon: "trash", text: "Removed" });
              }}
            >
              Clear
            </TKButton>
          </div>
          <KV label="stored value" value={storedNote ?? "—"} />
          <KV label="backend" value={cloud.isSupported ? "Telegram CloudStorage" : "localStorage fallback"} />
        </Card>
      </Section>

      <Section title="Device & secure storage">
        <Card>
          <div style={{ display: "flex", gap: 8 }}>
            <TKButton
              size="sm"
              full
              variant="surface"
              onClick={async () => {
                await deviceStorage.set("draft", "local device draft");
                setDeviceValue(await deviceStorage.get("draft"));
                toast.success("DeviceStorage saved");
              }}
            >
              Device set
            </TKButton>
            <TKButton
              size="sm"
              full
              variant="surface"
              onClick={async () => {
                await secureStorage.set("token", "secure-demo-token");
                setSecureValue(await secureStorage.get("token"));
                toast.success("SecureStorage saved");
              }}
            >
              Secure set
            </TKButton>
          </div>
          <KV label="device value" value={deviceValue ?? "—"} />
          <KV label="secure value" value={secureValue ? "••••••••" : "—"} />
        </Card>
      </Section>

      <Section title="Closing · confirmation">
        <Card>
          <TKSwitch label="Ask before closing" checked={confirmClose} onChange={setConfirmClose} />
          <KV label="isClosingConfirmationEnabled" value={String(webApp?.isClosingConfirmationEnabled ?? false)} />
          <TKButton variant="destructive" full onClick={() => webApp?.close?.()}>
            Close mini app
          </TKButton>
        </Card>
      </Section>

      <Section title="Event log">
        <TKListGroup footer="Every WebApp call and event the mock receives, newest first.">
          <div
            role="log"
            aria-label="Event log"
            tabIndex={0}
            style={{ padding: "10px 14px", maxHeight: 180, overflowY: "auto" }}
          >
            {state.log.length === 0 ? (
              <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>quiet so far…</div>
            ) : (
              state.log.map((line) => (
                <div
                  key={line.id}
                  style={{
                    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                    fontSize: "var(--tk-fz-caption)",
                    color: "var(--tk-text-2)",
                    padding: "2px 0",
                  }}
                >
                  {line.text}
                </div>
              ))
            )}
          </div>
        </TKListGroup>
      </Section>

    </>
  );
}

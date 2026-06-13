import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { TKTelegramProvider } from "tg-mini-app-uikit";
import { createMockTelegram, type MockTelegram } from "../../telegram/mock";
import type { ShellApi } from "../../shell/types";
import { Chrome } from "./Chrome";

/*
 * Platform Lab — the kit's Telegram layer running against a mock
 * `window.Telegram.WebApp`. The surrounding "client" (header, chat,
 * bottom buttons, popups) is rendered by the demo from the mock state,
 * so every hook behaves exactly as it would inside Telegram.
 */

export function PlatformApp({ shell }: { shell: ShellApi }) {
  const mockRef = useRef<MockTelegram | null>(null);
  // Launch with the page theme, like the real client: a light mock under a
  // dark shell would make the mount-time sync effects fight forever.
  if (!mockRef.current) mockRef.current = createMockTelegram({ colorScheme: shell.dark ? "dark" : "light" });
  const mock = mockRef.current;
  const state = useSyncExternalStore(mock.subscribe, mock.getState);
  const [highlight, setHighlight] = useState(false);

  // Two-way theme sync: the mock plays the Telegram client, the shell owns the page theme.
  useEffect(() => {
    const dark = state.colorScheme === "dark";
    if (shell.dark !== dark) shell.setDark(dark);
  }, [state.colorScheme]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    mock.setColorScheme(shell.dark ? "dark" : "light");
  }, [shell.dark]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TKTelegramProvider webApp={mock.webApp} haptics>
      <Chrome mock={mock} state={state} highlight={highlight} setHighlight={setHighlight} />
    </TKTelegramProvider>
  );
}

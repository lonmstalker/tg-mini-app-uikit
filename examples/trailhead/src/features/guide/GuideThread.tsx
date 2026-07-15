import { useEffect, useRef, useState } from "react";
import { AsyncBoundary, TKMessages, TKPage, TKWriteBar, useNav } from "tg-mini-app-uikit";
import { useOptionalHaptics } from "@tg-mini-app/telegram";
import { listMessages, sendMessage, type Message, type MessageStatus } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useMockBackHeader } from "../../components/MockBackHeader";
import { useAsync } from "@tg-mini-app/async";

/** "08:04" derived from the message's minute offset (deterministic, no clock). */
const clockOf = (offset: number) => {
  const total = 8 * 60 + offset;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export function GuideThread() {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const id = (nav.params as { id?: string } | undefined)?.id ?? "";
  const loaded = useAsync(() => listMessages(lang, id), [lang, id]);
  const [sent, setSent] = useState<Message[]>([]);
  const haptics = useOptionalHaptics();
  const header = useMockBackHeader(t("guide.action.message"));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const bump = (msgId: string, status: MessageStatus) =>
    setSent((prev) => prev.map((m) => (m.id === msgId ? { ...m, status } : m)));

  const send = async (text: string) => {
    const msg = await sendMessage(id, text);
    setSent((prev) => [...prev, msg]);
    haptics.selection();
    // progress the status ticks: sent → delivered → read
    timers.current.push(setTimeout(() => bump(msg.id, "delivered"), 450));
    timers.current.push(setTimeout(() => bump(msg.id, "read"), 1000));
  };

  const messages = [...(loaded.data ?? []), ...sent].map((m) => ({
    id: m.id,
    text: m.text,
    out: m.authorId === "me",
    time: m.offset >= 900 ? t("chat.now") : clockOf(m.offset),
    status: m.status,
  }));

  return (
    <TKPage
      testId="panel-guide-thread"
      header={header}
      footer={<TKWriteBar testId="guide-write" onSend={(text) => void send(text)} placeholder={t("guide.writePlaceholder")} />}
    >
      <AsyncBoundary
        loading={loaded.loading}
        error={loaded.error}
        empty={!loaded.loading && !loaded.error && messages.length === 0}
        onRetry={loaded.reload}
        errorTitle={t("discover.error.title")}
        errorText={t("discover.error.text")}
        retryLabel={t("discover.error.retry")}
        emptyIcon="chat"
        emptyTitle={t("guide.empty.title")}
        emptyText={t("guide.empty.text")}
        testId="guide-thread-empty"
      >
        <TKMessages testId="guide-messages" messages={messages} />
      </AsyncBoundary>
    </TKPage>
  );
}

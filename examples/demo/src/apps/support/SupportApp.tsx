import { useRef, useState } from "react";
import {
  TKButton,
  TKChip,
  TKListGroup,
  TKMessages,
  TKPage,
  TKRating,
  TKTelegramProvider,
  TKText,
  TKWriteBar,
  useTelegramLinks,
  type TKMessage,
} from "tg-mini-app-uikit";
import { createMockTelegram } from "../../telegram/mock";

const START_MESSAGES: TKMessage[] = [
  { id: "m1", text: "Hi. I am the demo support bot.", time: "09:41" },
  { id: "m2", out: true, text: "I need help with an order.", time: "09:42", status: "read" },
];

function SupportInner() {
  const links = useTelegramLinks();
  const [messages, setMessages] = useState<TKMessage[]>(START_MESSAGES);
  const [rating, setRating] = useState(0);
  const [lastEvent, setLastEvent] = useState("idle");

  const send = (text: string) =>
    setMessages((prev) => [
      ...prev,
      { id: `u${prev.length}`, out: true, text, time: "now", status: "delivered" },
      { id: `b${prev.length}`, text: `Support received: ${text}`, time: "now" },
    ]);

  const handoff = () => {
    links.openTelegramLink("https://t.me/tgMiniAppUIKitSupport");
    setLastEvent('openTelegramLink("https://t.me/tgMiniAppUIKitSupport")');
    setMessages((prev) => [...prev, { id: "handoff", text: "Operator handoff requested.", time: "now" }]);
  };

  return (
    <div data-demo-app="support" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TKPage padding={16} gap={14} style={{ flex: 1 }}>
        <TKListGroup title="Quick replies">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 14px" }}>
            {["Refund", "Delivery", "Subscription"].map((item) => (
              <TKChip key={item} onClick={() => send(item)}>
                {item}
              </TKChip>
            ))}
          </div>
        </TKListGroup>

        <TKMessages messages={messages} testId="support-messages" />

        <TKButton testId="support-handoff" variant="tonal" icon="chat" onClick={handoff}>
          Hand off to operator
        </TKButton>

        <TKListGroup title="Rate the dialog">
          <div
            data-testid="support-rating"
            style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}
          >
            <TKRating value={rating} onChange={setRating} />
            <TKText>{rating ? `${rating}/5` : "Not rated"}</TKText>
          </div>
        </TKListGroup>

        <div style={{ color: "var(--tk-text-3)", fontSize: "var(--tk-fz-caption)" }}>{lastEvent}</div>
      </TKPage>

      <TKWriteBar onSend={send} placeholder="Message support" />
    </div>
  );
}

export function SupportApp() {
  const mock = useRef(createMockTelegram());
  return (
    <TKTelegramProvider webApp={mock.current.webApp}>
      <SupportInner />
    </TKTelegramProvider>
  );
}

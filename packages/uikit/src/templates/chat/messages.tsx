import type { CSSProperties } from "react";
import { TKMessageBubble, type TKMessage } from "./message-bubble";

export interface TKMessagesProps {
  messages: TKMessage[];
  testId?: string;
  style?: CSSProperties;
}

/** Chat feed: groups consecutive same-side messages, tail on the last one. */
export function TKMessages({ messages, testId, style }: TKMessagesProps) {
  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 3, ...style }}>
      {messages.map((message, index) => {
        const next = messages[index + 1];
        const tail = !next || !!next.out !== !!message.out;
        const prev = messages[index - 1];
        const groupStart = !prev || !!prev.out !== !!message.out;
        return (
          <div key={message.id} style={{ marginTop: groupStart && index > 0 ? 8 : 0 }}>
            <TKMessageBubble {...message} tail={tail} />
          </div>
        );
      })}
    </div>
  );
}

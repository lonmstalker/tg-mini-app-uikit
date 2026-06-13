import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src";
import { TKMessageBubble, TKMessages, TKWriteBar } from "../src/composites/chat";
import { TKMessageBubble as ModuleTKMessageBubble } from "../src/composites/chat/message-bubble";
import { TKMessages as ModuleTKMessages } from "../src/composites/chat/messages";
import { TKWriteBar as ModuleTKWriteBar } from "../src/composites/chat/write-bar";

describe("chat module reorganization", () => {
  it("publishes chat composites from the composite category and root package", () => {
    expect(TKMessageBubble).toBe(kit.TKMessageBubble);
    expect(TKMessages).toBe(kit.TKMessages);
    expect(TKWriteBar).toBe(kit.TKWriteBar);
  });

  it("keeps chat implementation modules under the composite category", () => {
    expect(ModuleTKMessageBubble).toBe(TKMessageBubble);
    expect(ModuleTKMessages).toBe(TKMessages);
    expect(ModuleTKWriteBar).toBe(TKWriteBar);
  });

  it("renders and sends from the new chat category", () => {
    const onSend = vi.fn();
    render(
      <div>
        <TKMessages
          messages={[
            { id: "1", text: "Hello", time: "10:00" },
            { id: "2", text: "Delivered", out: true, status: "read", time: "10:01" },
          ]}
          testId="messages"
        />
        <TKWriteBar onSend={onSend} placeholder="Message" />
      </div>,
    );

    expect(screen.getByTestId("messages").querySelectorAll("[data-tk-bubble]")).toHaveLength(2);
    expect(document.querySelector("[data-tk-ticks]")).not.toBeNull();

    fireEvent.change(screen.getByPlaceholderText("Message"), { target: { value: "Thanks" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith("Thanks");
    expect(screen.getByPlaceholderText("Message")).toHaveValue("");
  });
});

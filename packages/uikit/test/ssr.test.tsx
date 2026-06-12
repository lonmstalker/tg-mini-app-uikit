// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";
import { MINIMAL_PROPS } from "./helpers/minimal-props";
import { discoverComponents } from "./helpers/components";

const components = discoverComponents(kit);

describe("SSR smoke", () => {
  it("discovers the component exports", () => {
    expect(components.length).toBeGreaterThan(50);
  });

  it.each(components.map(([name]) => name))("renderToString(<%s />) works without window", (name) => {
    expect(typeof window).toBe("undefined");
    const Component = components.find(([n]) => n === name)![1];
    const props = MINIMAL_PROPS[name] ?? {};
    expect(() => renderToString(<Component {...props} />)).not.toThrow();
  });

  it("renders a themed page composition to markup", () => {
    const { TKProvider, TKTelegramProvider, TKToastProvider, TKButton } = kit;
    const html = renderToString(
      <TKTelegramProvider signalReady={false}>
        <TKProvider theme="dark" accent="#ff7755">
          <TKToastProvider>
            <TKButton>Go</TKButton>
          </TKToastProvider>
        </TKProvider>
      </TKTelegramProvider>,
    );
    expect(html).toContain("Go");
    expect(html).toContain('data-theme="dark"');
  });
});

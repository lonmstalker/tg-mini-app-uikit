import type { Meta } from "@storybook/react-vite";
import {
  TKBottomBar,
  TKButton,
  TKCard,
  TKFrame,
  TKHeader,
  TKIconButton,
  TKNavPanel,
  TKNavStack,
  TKPage,
  TKSafeArea,
  TKTabbar,
  TKText,
  useNav,
} from "tg-mini-app-uikit";
import { FrameStory } from "../story-helpers";

const meta = {
  title: "Templates/Page Shell",
  parameters: {
    docs: {
      description: {
        component: "Page-level templates that compose navigation, safe-area layout, headers, footers, tabbars, and stack navigation.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

function HomePanel({ onContinue }: { onContinue?: () => void }) {
  return (
    <TKPage
      header={<TKHeader title="Orders" back={false} actions={<TKIconButton icon="settings" label="Settings" />} />}
      footer={
        <TKBottomBar>
          <TKButton full onClick={onContinue}>
            Continue
          </TKButton>
        </TKBottomBar>
      }
    >
      <TKSafeArea edges={["top"]}>
        <TKCard>Scrollable page content</TKCard>
      </TKSafeArea>
      <TKCard>Second content block</TKCard>
    </TKPage>
  );
}

function StackHomePanel() {
  const nav = useNav();
  return <HomePanel onContinue={() => nav.push("details")} />;
}

function DetailsPanel() {
  const nav = useNav();
  return (
    <TKPage
      header={<TKHeader title="Details" onBack={() => nav.pop()} />}
      footer={
        <TKTabbar
          safeArea
          tabs={[
            { icon: "home", label: "Home" },
            { icon: "cart", label: "Cart", count: 3 },
            { icon: "user", label: "Profile" },
          ]}
        />
      }
    >
      <TKCard>
        <TKText>Details panel inside the same page shell.</TKText>
      </TKCard>
    </TKPage>
  );
}

export const PageShell = {
  render: () => (
    <FrameStory>
      <TKFrame height={620}>
        <HomePanel />
      </TKFrame>
    </FrameStory>
  ),
} satisfies Story;

export const NavigationStack = {
  render: () => (
    <FrameStory>
      <TKFrame height={620}>
        <TKNavStack initial="home">
          <TKNavPanel id="home">
            <StackHomePanel />
          </TKNavPanel>
          <TKNavPanel id="details">
            <DetailsPanel />
          </TKNavPanel>
        </TKNavStack>
      </TKFrame>
    </FrameStory>
  ),
} satisfies Story;

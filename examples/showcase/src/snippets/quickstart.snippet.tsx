import "tg-mini-app-uikit/style.css";
import { createRoot } from "react-dom/client";
import {
  TKButton,
  TKCard,
  TKCardCell,
  TKPage,
  TKProvider,
  TKTelegramProvider,
} from "tg-mini-app-uikit";

function WalletScreen() {
  return (
    <TKTelegramProvider haptics>
      <TKProvider telegram>
        <TKPage>
          <TKCard inset={false} padding={0}>
            <TKCardCell
              title="TON Wallet"
              subtitle="Ready in Telegram"
              after={<strong>24.8 TON</strong>}
            />
          </TKCard>
          <TKButton full>Send payment</TKButton>
        </TKPage>
      </TKProvider>
    </TKTelegramProvider>
  );
}

createRoot(document.getElementById("root")!).render(<WalletScreen />);

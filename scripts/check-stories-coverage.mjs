import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const configPath = ts.findConfigFile(path.join(root, "packages/uikit"), ts.sys.fileExists, "tsconfig.json");

if (!configPath) {
  throw new Error("Cannot find packages/uikit/tsconfig.json");
}

const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const indexPath = path.join(root, "packages/uikit/src/index.ts");
const index = program.getSourceFile(indexPath);

if (!index) {
  throw new Error("Cannot load packages/uikit/src/index.ts");
}

const moduleSymbol = checker.getSymbolAtLocation(index);

if (!moduleSymbol) {
  throw new Error("Cannot read uikit exports");
}

const exportedRuntimeNames = checker
  .getExportsOfModule(moduleSymbol)
  .filter((symbol) => {
    const aliased = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    return Boolean(aliased.valueDeclaration);
  })
  .map((symbol) => symbol.getName())
  .sort((a, b) => a.localeCompare(b));

const sourceDirs = [
  path.join(root, "packages/uikit/storybook/atoms"),
  path.join(root, "packages/uikit/storybook/foundation"),
  path.join(root, "packages/uikit/storybook/tokens"),
  path.join(root, "packages/uikit/storybook/composites"),
  path.join(root, "packages/uikit/storybook/templates"),
  path.join(root, "packages/uikit/storybook/.storybook"),
];
const previewPath = path.join(root, "packages/uikit/storybook/.storybook/preview.tsx");
const storybookMainPath = path.join(root, "packages/uikit/storybook/.storybook/main.ts");
const packagePath = path.join(root, "packages/uikit/package.json");

function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full);
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [full] : [];
  });
}

const haystack = sourceDirs
  .flatMap(files)
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

const currentAtomExports = [
  "TKButton",
  "TKAvatar",
  "TKAvatarStack",
  "TKBadge",
  "TKBlockquote",
  "TKCheckbox",
  "TKChip",
  "TKChipGroup",
  "TKCounter",
  "TKDot",
  "TKFileInput",
  "TKFormField",
  "TKFormInput",
  "TKIcon",
  "TKIconButton",
  "TKInlineButtons",
  "TKInput",
  "TKMainButton",
  "TKMultiselect",
  "TKOTP",
  "TKImage",
  "TKImg",
  "TKRadioGroup",
  "TKRating",
  "TKSearch",
  "TKSelect",
  "TKSelectable",
  "TKSlider",
  "TKSpinner",
  "TKStepper",
  "TKSwitch",
  "TKTextarea",
  "TKSpoiler",
  "TKTappable",
  "TKVisuallyHidden",
].filter((name) => exportedRuntimeNames.includes(name));

const currentFoundationExports = [
  "TKLocaleProvider",
  "TKProvider",
  "TKTelegramProvider",
  "tkFlattenOptions",
  "tkOptionItem",
  "tkThemeVars",
  "useMainButton",
  "useSafeArea",
  "useTelegramTheme",
  "useWebApp",
].filter((name) => exportedRuntimeNames.includes(name));

const currentTokenExports = [
  "TKCaption",
  "TKText",
  "TKTitle",
].filter((name) => exportedRuntimeNames.includes(name));

const currentCompositeExports = [
  "TKActionSheet",
  "TKAccordion",
  "TKBannerCard",
  "TKBookingCard",
  "TKBottomBar",
  "TKCalendar",
  "TKCard",
  "TKCardCell",
  "TKCardChip",
  "TKCategoryTabs",
  "TKCell",
  "TKChipsInput",
  "TKBars",
  "TKDateInput",
  "TKDialog",
  "TKEmptyState",
  "TKFrame",
  "TKGallery",
  "TKHeader",
  "TKInfiniteList",
  "TKListGroup",
  "TKMaskedInput",
  "TKMessageBubble",
  "TKMessages",
  "TKNavPanel",
  "TKNavStack",
  "TKPage",
  "TKPageDots",
  "TKPhoneInput",
  "TKPinInput",
  "TKPopper",
  "TKProgress",
  "TKProductCardA",
  "TKProductCardB",
  "TKPullToRefresh",
  "TKRing",
  "TKSafeArea",
  "TKSegmented",
  "TKSheet",
  "TKStatTile",
  "TKSteps",
  "TKTabbar",
  "TKSkeleton",
  "TKSkeletonCard",
  "TKSkeletonList",
  "TKSkeletonTable",
  "TKSkeletonText",
  "TKTimeInput",
  "TKTimeline",
  "TKToastProvider",
  "TKTooltip",
  "TKSwipeCell",
  "TKVirtualList",
  "TKWriteBar",
  "useTKToast",
  "useLongPress",
  "useNav",
].filter((name) => exportedRuntimeNames.includes(name));

const currentTemplateExports = [
  "TKConfetti",
  "TKLeaderboard",
  "TKOnboardingTooltip",
  "TKPaymentSummary",
  "TKSlotPicker",
  "TKWalletConnectButton",
  "TKWalletStatusCell",
  "TKXPHeader",
].filter((name) => exportedRuntimeNames.includes(name));

const coveredExports = [
  ...currentAtomExports,
  ...currentFoundationExports,
  ...currentTokenExports,
  ...currentCompositeExports,
  ...currentTemplateExports,
];
const missing = coveredExports.filter((name) => !new RegExp(`\\b${name}\\b`).test(haystack));

if (missing.length) {
  console.error(`Missing current story coverage (${missing.length}/${coveredExports.length}):`);
  for (const name of missing) console.error(`- ${name}`);
  process.exit(1);
}

const previewSource = fs.existsSync(previewPath) ? fs.readFileSync(previewPath, "utf8") : "";
const hasProjectAutodocs = /\btags\s*:\s*\[[^\]]*["']autodocs["'][^\]]*\]/s.test(previewSource);

if (!hasProjectAutodocs) {
  console.error("Storybook autodocs are disabled: add tags: ['autodocs'] to packages/uikit/storybook/.storybook/preview.tsx.");
  process.exit(1);
}

const storybookMainSource = fs.existsSync(storybookMainPath) ? fs.readFileSync(storybookMainPath, "utf8") : "";
for (const category of ["foundation", "tokens", "composites", "templates"]) {
  if (!storybookMainSource.includes(category)) {
    console.error(`Storybook main config must include packages/uikit/storybook/${category} stories.`);
    process.exit(1);
  }
}

if (!storybookMainSource.includes("atoms")) {
  console.error("Storybook main config must include packages/uikit/storybook/atoms stories.");
  process.exit(1);
}

if (!storybookMainSource.includes("storybook-static")) {
  console.error("Storybook dev watcher must ignore storybook-static so static builds do not trigger preview HMR reloads.");
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const storiesScript = packageJson.scripts?.stories ?? "";
for (const flag of ["--host 127.0.0.1", "--exact-port"]) {
  if (!storiesScript.includes(flag)) {
    console.error(`Storybook dev script is not deterministic: packages/uikit/package.json scripts.stories must include "${flag}".`);
    process.exit(1);
  }
}

console.log(
  `Story coverage OK: ${coveredExports.length}/${coveredExports.length} current atom/foundation/token/composite/template exports are represented.`,
);

import { useEffect, useRef, useState } from "react";
import { TKCell, TKIconButton, TKListGroup, TKSearch, TKSheet, TKToastProvider, useTKToast, type TKMessage } from "tg-mini-app-uikit";
import { bootSection } from "../../shell/boot";
import { GalleryAdvanced } from "./GalleryAdvanced";
import { GalleryBasics } from "./GalleryBasics";
import { GalleryOverlays } from "./GalleryOverlays";

/* Components — a live gallery of everything the kit exports. */

export function GalleryApp() {
  return (
    <TKToastProvider offset={20}>
      <GalleryInner />
    </TKToastProvider>
  );
}

function GalleryInner() {
  const toast = useTKToast();
  const [seg, setSeg] = useState("Delivery");
  const [steps, setSteps] = useState(1);
  const [page, setPage] = useState(0);
  const [progress, setProgress] = useState(64);
  const [ring, setRing] = useState(0.72);
  const [counter, setCounter] = useState(3);
  const [inline, setInline] = useState("pickup");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [popperOpen, setPopperOpen] = useState(false);
  const popperAnchor = useRef<HTMLSpanElement>(null);
  const [snapSheetOpen, setSnapSheetOpen] = useState(false);
  const [ptrCount, setPtrCount] = useState(0);
  const [rows, setRows] = useState(["Flat white", "Cinnamon bun", "Filter brew"]);
  const [iconQuery, setIconQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<TKMessage[]>([
    { id: "1", text: "Привет! Чем можем помочь?", time: "12:01" },
    { id: "2", text: "Заказ #1042 ещё в пути?", out: true, time: "12:02", status: "read" },
    { id: "3", text: "Да, курьер будет через ~20 минут 🚴", time: "12:03" },
  ]);
  const [confetti, setConfetti] = useState(false);
  const [tourRun, setTourRun] = useState(0);
  const tourTarget1 = useRef<HTMLButtonElement>(null);
  const tourTarget2 = useRef<HTMLButtonElement>(null);
  const [pinStatus, setPinStatus] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 70]);

  const [tocOpen, setTocOpen] = useState(false);
  const [tocQuery, setTocQuery] = useState("");
  const scrollToSection = (slug: string) => {
    // lazily painted sections need a paint pass before the offset is right
    const el = document.querySelector(`[data-demo-section="${slug}"]`);
    el?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    requestAnimationFrame(() => el?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior }));
  };
  const tocSections = () =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-demo-section]")).map((el) => ({
      slug: el.dataset.demoSection!,
      title: el.querySelector("span")?.textContent ?? el.dataset.demoSection!,
    }));

  // deep-link: ?app=gallery&section=inputs (M8.2)
  useEffect(() => {
    const slug = bootSection();
    if (slug) setTimeout(() => scrollToSection(slug), 60);
  }, []);

  return (
    <div data-demo-app="gallery" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "64px 16px 8px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: "-.02em" }}>Components</div>
          <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>
            Every kit component, fully interactive
          </div>
        </div>
        <TKIconButton icon="filter" label="Sections" testId="demo-toc-open" onClick={() => setTocOpen(true)} />
      </div>
      <TKSheet open={tocOpen} onClose={() => setTocOpen(false)} title="Sections" snapPoints={[0.85]} testId="demo-toc">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
          <TKSearch placeholder="Filter sections…" value={tocQuery} onChange={setTocQuery} testId="demo-toc-search" />
          <TKListGroup>
            {tocSections()
              .filter(({ title }) => title.toLowerCase().includes(tocQuery.toLowerCase()))
              .map(({ slug, title }) => (
                <TKCell
                  key={slug}
                  title={title.toLowerCase()}
                  chevron
                  testId={`toc-${slug}`}
                  onClick={() => {
                    setTocOpen(false);
                    setTimeout(() => scrollToSection(slug), 60);
                  }}
                />
              ))}
          </TKListGroup>
        </div>
      </TKSheet>

      <div data-demo-gallery-scroll style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "8px 16px 32px", display: "flex", flexDirection: "column", gap: 22 }}>
        <GalleryBasics
          toast={toast}
          seg={seg}
          setSeg={setSeg}
          steps={steps}
          setSteps={setSteps}
          page={page}
          setPage={setPage}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          pinStatus={pinStatus}
          setPinStatus={setPinStatus}
          inline={inline}
          setInline={setInline}
          counter={counter}
          setCounter={setCounter}
          setDialogOpen={setDialogOpen}
        />
        <GalleryAdvanced
          toast={toast}
          iconQuery={iconQuery}
          setIconQuery={setIconQuery}
          progress={progress}
          setProgress={setProgress}
          ring={ring}
          setRing={setRing}
          setSheetOpen={setSheetOpen}
          setDialogOpen={setDialogOpen}
          setActionsOpen={setActionsOpen}
          ptrCount={ptrCount}
          setPtrCount={setPtrCount}
          rows={rows}
          setRows={setRows}
          setSnapSheetOpen={setSnapSheetOpen}
          popperOpen={popperOpen}
          setPopperOpen={setPopperOpen}
          popperAnchor={popperAnchor}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          tourTarget1={tourTarget1}
          tourTarget2={tourTarget2}
          tourRun={tourRun}
          setTourRun={setTourRun}
          confetti={confetti}
          setConfetti={setConfetti}
        />
        </div>
      </div>


      <GalleryOverlays
        toast={toast}
        snapSheetOpen={snapSheetOpen}
        setSnapSheetOpen={setSnapSheetOpen}
        sheetOpen={sheetOpen}
        setSheetOpen={setSheetOpen}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        actionsOpen={actionsOpen}
        setActionsOpen={setActionsOpen}
      />
    </div>
  );
}

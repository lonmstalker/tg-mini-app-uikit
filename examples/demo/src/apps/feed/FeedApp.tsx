import { useEffect, useRef, useState, type RefObject } from "react";
import {
  TKBadge,
  TKBlockquote,
  TKButton,
  TKCard,
  TKChip,
  TKCounter,
  TKPage,
  TKSpoiler,
  TKTelegramProvider,
  TKText,
  useShare,
  type TelegramWebApp,
} from "tg-mini-app-uikit";
import { createMockTelegram } from "../../telegram/mock";

interface Post {
  id: string;
  title: string;
  body: string;
  spoiler?: string;
  quote?: string;
  likes: number;
}

const POSTS: Post[] = [
  {
    id: "p1",
    title: "Channel update",
    body: "The next release candidate is ready for review.",
    spoiler: "launch window opens on Friday",
    quote: "Telegram mini apps should feel native before they feel branded.",
    likes: 12,
  },
  {
    id: "p2",
    title: "Design note",
    body: "Use counters, reactions and read tracking without custom plumbing.",
    likes: 7,
  },
];

function useReadMarker(ref: RefObject<HTMLElement | null>) {
  const [read, setRead] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setRead(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setRead(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return read;
}

function FeedInner() {
  const share = useShare();
  const firstRef = useRef<HTMLDivElement>(null);
  const read = useReadMarker(firstRef);
  const [likes, setLikes] = useState(() => Object.fromEntries(POSTS.map((p) => [p.id, p.likes])));
  const [lastEvent, setLastEvent] = useState("idle");

  const handleShare = async (id: string) => {
    await share.shareMessage(id);
    setLastEvent(`shareMessage("${id}")`);
  };

  return (
    <div data-demo-app="feed" style={{ height: "100%", overflow: "hidden" }}>
      <TKPage padding={16} gap={14}>
        <div style={{ paddingTop: 44 }}>
          <TKText weight={700} style={{ fontSize: "var(--tk-fz-title2)" }}>
            Channel feed
          </TKText>
        </div>

        {POSTS.map((post, index) => (
          <TKCard
            key={post.id}
            ref={index === 0 ? firstRef : undefined}
            padding={16}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <TKText weight={700}>{post.title}</TKText>
              {index === 0 ? (
                <TKBadge testId="feed-read" tone={read ? "green" : "gray"} soft>
                  {read ? "read" : "unread"}
                </TKBadge>
              ) : null}
            </div>
            <TKText>{post.body}</TKText>
            {post.spoiler ? (
              <TKText>
                Spoiler: <TKSpoiler>{post.spoiler}</TKSpoiler>
              </TKText>
            ) : null}
            {post.quote ? <TKBlockquote author="UIKit team">{post.quote}</TKBlockquote> : null}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <TKChip icon="thumbsUp" onClick={() => setLikes((prev) => ({ ...prev, [post.id]: prev[post.id] + 1 }))}>
                Like
              </TKChip>
              <TKCounter value={likes[post.id]} max={99} testId="feed-like-count" />
              <TKButton testId="feed-share" size="sm" variant="tonal" icon="forward" onClick={() => handleShare(post.id)}>
                Repost
              </TKButton>
            </div>
          </TKCard>
        ))}

        <div style={{ color: "var(--tk-text-3)", fontSize: "var(--tk-fz-caption)" }}>{lastEvent}</div>
      </TKPage>
    </div>
  );
}

export function FeedApp() {
  const mock = useRef(createMockTelegram());
  return (
    <TKTelegramProvider webApp={mock.current.webApp as TelegramWebApp}>
      <FeedInner />
    </TKTelegramProvider>
  );
}

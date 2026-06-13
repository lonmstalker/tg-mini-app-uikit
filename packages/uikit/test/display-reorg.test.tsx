import { describe, expect, it } from "vitest";
import {
  TKAvatar as AtomTKAvatar,
  TKAvatarStack as AtomTKAvatarStack,
  TKBadge as AtomTKBadge,
  TKBlockquote as AtomTKBlockquote,
  TKCounter as AtomTKCounter,
  TKDot as AtomTKDot,
  TKImage as AtomTKImage,
  TKImg as AtomTKImg,
  TKSpoiler as AtomTKSpoiler,
} from "../src/atoms/display";
import {
  TKBadge as AtomFileTKBadge,
  TKCounter as AtomFileTKCounter,
  TKDot as AtomFileTKDot,
} from "../src/atoms/display/badges";
import {
  TKAvatar as AtomFileTKAvatar,
  TKAvatarStack as AtomFileTKAvatarStack,
} from "../src/atoms/display/avatar";
import {
  TKImage as AtomFileTKImage,
  TKImg as AtomFileTKImg,
} from "../src/atoms/display/image";
import { TKSpoiler as AtomFileTKSpoiler } from "../src/atoms/display/spoiler";
import { TKBlockquote as AtomFileTKBlockquote } from "../src/atoms/display/blockquote";
import {
  TKAvatar as RootTKAvatar,
  TKAvatarStack as RootTKAvatarStack,
  TKBadge as RootTKBadge,
  TKBlockquote as RootTKBlockquote,
  TKCounter as RootTKCounter,
  TKDot as RootTKDot,
  TKImage as RootTKImage,
  TKImg as RootTKImg,
  TKSpoiler as RootTKSpoiler,
} from "../src";

describe("display atom reorganization", () => {
  it("exports display atoms from the atom category and root package", () => {
    expect(AtomTKBadge).toBeDefined();
    expect(AtomTKDot).toBeDefined();
    expect(AtomTKCounter).toBeDefined();
    expect(AtomTKAvatar).toBeDefined();
    expect(AtomTKAvatarStack).toBeDefined();
    expect(AtomTKImg).toBeDefined();
    expect(AtomTKImage).toBeDefined();
    expect(AtomTKSpoiler).toBeDefined();
    expect(AtomTKBlockquote).toBeDefined();

    expect(RootTKBadge).toBe(AtomTKBadge);
    expect(RootTKDot).toBe(AtomTKDot);
    expect(RootTKCounter).toBe(AtomTKCounter);
    expect(RootTKAvatar).toBe(AtomTKAvatar);
    expect(RootTKAvatarStack).toBe(AtomTKAvatarStack);
    expect(RootTKImg).toBe(AtomTKImg);
    expect(RootTKImage).toBe(AtomTKImage);
    expect(RootTKSpoiler).toBe(AtomTKSpoiler);
    expect(RootTKBlockquote).toBe(AtomTKBlockquote);
  });

  it("splits display atoms into focused modules", () => {
    expect(AtomFileTKBadge).toBe(AtomTKBadge);
    expect(AtomFileTKDot).toBe(AtomTKDot);
    expect(AtomFileTKCounter).toBe(AtomTKCounter);
    expect(AtomFileTKAvatar).toBe(AtomTKAvatar);
    expect(AtomFileTKAvatarStack).toBe(AtomTKAvatarStack);
    expect(AtomFileTKImg).toBe(AtomTKImg);
    expect(AtomFileTKImage).toBe(AtomTKImage);
    expect(AtomFileTKSpoiler).toBe(AtomTKSpoiler);
    expect(AtomFileTKBlockquote).toBe(AtomTKBlockquote);
  });
});

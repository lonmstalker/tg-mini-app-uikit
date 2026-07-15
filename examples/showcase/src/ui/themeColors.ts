function colorChannels(color: string): [number, number, number] | null {
  const channels = color.match(/[+-]?(?:\d+\.?\d*|\.\d+)/g)?.map(Number);
  if (!channels || channels.length < 3) return null;

  if (color.startsWith("color(srgb")) {
    return [channels[0] * 255, channels[1] * 255, channels[2] * 255];
  }

  if (color.startsWith("rgb")) {
    return [channels[0], channels[1], channels[2]];
  }

  return null;
}

function channelsToHex(channels: [number, number, number]): string {
  return `#${channels
    .map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function resolveTokenColor(host: HTMLElement, token: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  host.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

export function resolveTokenHex(host: HTMLElement, token: string): string | null {
  if (!getComputedStyle(host).getPropertyValue(token).trim()) return null;
  const channels = colorChannels(resolveTokenColor(host, token));
  return channels ? channelsToHex(channels) : null;
}

export function mixHexColors(first: string, second: string): string | null {
  const parse = (color: string): [number, number, number] | null => {
    const value = color.startsWith("#") ? color.slice(1) : color;
    if (!/^[\da-f]{6}$/i.test(value)) return null;
    return [
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
    ];
  };

  const firstChannels = parse(first);
  const secondChannels = parse(second);
  if (!firstChannels || !secondChannels) return null;

  return channelsToHex([
    (firstChannels[0] + secondChannels[0]) / 2,
    (firstChannels[1] + secondChannels[1]) / 2,
    (firstChannels[2] + secondChannels[2]) / 2,
  ]);
}

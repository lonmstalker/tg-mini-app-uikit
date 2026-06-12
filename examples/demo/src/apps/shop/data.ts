export interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  img: string;
  photo: string;
  category: string;
}

/* Self-contained "product photo": a gradient SVG still life rendered to a
   data URI — looks like real media, works offline, exercises TKImage. */
export function productPhoto(emoji: string, from: string, to: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
    `<rect width="320" height="320" fill="url(#g)"/>` +
    `<circle cx="252" cy="64" r="92" fill="rgba(255,255,255,.16)"/>` +
    `<circle cx="56" cy="276" r="72" fill="rgba(255,255,255,.10)"/>` +
    `<ellipse cx="160" cy="248" rx="86" ry="18" fill="rgba(0,0,0,.14)"/>` +
    `<text x="160" y="172" font-size="128" text-anchor="middle" dominant-baseline="middle">${emoji}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const CATEGORIES = ["For you", "Mugs", "Bags", "Candles", "Paper"];

export const PRODUCTS: Product[] = [
  { id: "mug", title: "Ceramic mug", price: 18, oldPrice: 24, rating: 4.8, reviews: 212, img: "mug photo", photo: productPhoto("☕", "#f6d365", "#fda085"), category: "Mugs" },
  { id: "tote", title: "Linen tote", price: 32, rating: 4.6, reviews: 96, img: "tote photo", photo: productPhoto("👜", "#a8edea", "#5ee7df"), category: "Bags" },
  { id: "candle", title: "Soy candle", price: 24, rating: 4.9, reviews: 154, img: "candle photo", photo: productPhoto("🕯️", "#fbc2eb", "#a18cd1"), category: "Candles" },
  { id: "notebook", title: "Notebook", price: 12, rating: 4.5, reviews: 67, img: "notebook photo", photo: productPhoto("📓", "#84fab0", "#8fd3f4"), category: "Paper" },
  { id: "pot", title: "Stone teapot", price: 42, oldPrice: 55, rating: 4.7, reviews: 88, img: "teapot photo", photo: productPhoto("🫖", "#e0c3fc", "#8ec5fc"), category: "Mugs" },
  { id: "planner", title: "Weekly planner", price: 16, rating: 4.4, reviews: 41, img: "planner photo", photo: productPhoto("🗓️", "#fddb92", "#d1fdff"), category: "Paper" },
];

export const fmt = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;

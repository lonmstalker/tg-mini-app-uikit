/*
 * Phone country data for TKPhoneInput's country picker. Kept internal (not
 * re-exported from the package root) so it stays tree-shakeable: only consumers
 * that render `TKPhoneInput countrySelect` pull the table into their bundle.
 *
 * Country names are resolved at runtime via Intl.DisplayNames, so the picker is
 * localized for free (no bundled name strings). Pass a custom `countries` list
 * to override.
 */

export interface TKPhoneCountry {
  /** ISO 3166-1 alpha-2 code, e.g. `"RU"`. */
  iso: string;
  /** Display name (localized via Intl.DisplayNames, falls back to the ISO code). */
  name: string;
  /** Dial code digits without the leading `+`, e.g. `"7"`. */
  dial: string;
  /** National-number mask (`#` is a digit) applied after the dial code. */
  mask: string;
}

/** Flag emoji from an ISO alpha-2 code via Unicode regional indicators. */
export function tkCountryFlag(iso: string): string {
  const cc = iso.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "🌐";
  return String.fromCodePoint(0x1f1e6 + cc.charCodeAt(0) - 65, 0x1f1e6 + cc.charCodeAt(1) - 65);
}

const GENERIC_MASK = "### ### ## ## ##";

// ISO 3166-1 alpha-2 -> E.164 calling code (digits only). Verified against
// Wikipedia "List of country calling codes" + Google libphonenumber metadata (2026-06).
const TK_DIAL_BY_ISO: Record<string, string> = {
  AD: "376", AE: "971", AF: "93", AG: "1", AI: "1", AL: "355", AM: "374", AO: "244", AQ: "672", AR: "54",
  AS: "1", AT: "43", AU: "61", AW: "297", AX: "358", AZ: "994", BA: "387", BB: "1", BD: "880", BE: "32",
  BF: "226", BG: "359", BH: "973", BI: "257", BJ: "229", BL: "590", BM: "1", BN: "673", BO: "591", BQ: "599",
  BR: "55", BS: "1", BT: "975", BW: "267", BY: "375", BZ: "501", CA: "1", CC: "61", CD: "243", CF: "236",
  CG: "242", CH: "41", CI: "225", CK: "682", CL: "56", CM: "237", CN: "86", CO: "57", CR: "506", CU: "53",
  CV: "238", CW: "599", CX: "61", CY: "357", CZ: "420", DE: "49", DJ: "253", DK: "45", DM: "1", DO: "1",
  DZ: "213", EC: "593", EE: "372", EG: "20", EH: "212", ER: "291", ES: "34", ET: "251", FI: "358", FJ: "679",
  FK: "500", FM: "691", FO: "298", FR: "33", GA: "241", GB: "44", GD: "1", GE: "995", GF: "594", GG: "44",
  GH: "233", GI: "350", GL: "299", GM: "220", GN: "224", GP: "590", GQ: "240", GR: "30", GT: "502", GU: "1",
  GW: "245", GY: "592", HK: "852", HN: "504", HR: "385", HT: "509", HU: "36", ID: "62", IE: "353", IL: "972",
  IM: "44", IN: "91", IO: "246", IQ: "964", IR: "98", IS: "354", IT: "39", JE: "44", JM: "1", JO: "962",
  JP: "81", KE: "254", KG: "996", KH: "855", KI: "686", KM: "269", KN: "1", KP: "850", KR: "82", KW: "965",
  KY: "1", KZ: "7", LA: "856", LB: "961", LC: "1", LI: "423", LK: "94", LR: "231", LS: "266", LT: "370",
  LU: "352", LV: "371", LY: "218", MA: "212", MC: "377", MD: "373", ME: "382", MF: "590", MG: "261", MH: "692",
  MK: "389", ML: "223", MM: "95", MN: "976", MO: "853", MP: "1", MQ: "596", MR: "222", MS: "1", MT: "356",
  MU: "230", MV: "960", MW: "265", MX: "52", MY: "60", MZ: "258", NA: "264", NC: "687", NE: "227", NF: "672",
  NG: "234", NI: "505", NL: "31", NO: "47", NP: "977", NR: "674", NU: "683", NZ: "64", OM: "968", PA: "507",
  PE: "51", PF: "689", PG: "675", PH: "63", PK: "92", PL: "48", PM: "508", PR: "1", PS: "970", PT: "351",
  PW: "680", PY: "595", QA: "974", RE: "262", RO: "40", RS: "381", RU: "7", RW: "250", SA: "966", SB: "677",
  SC: "248", SD: "249", SE: "46", SG: "65", SH: "290", SI: "386", SJ: "47", SK: "421", SL: "232", SM: "378",
  SN: "221", SO: "252", SR: "597", SS: "211", ST: "239", SV: "503", SX: "1", SY: "963", SZ: "268", TC: "1",
  TD: "235", TF: "262", TG: "228", TH: "66", TJ: "992", TK: "690", TL: "670", TM: "993", TN: "216", TO: "676",
  TR: "90", TT: "1", TV: "688", TW: "886", TZ: "255", UA: "380", UG: "256", US: "1", UY: "598", UZ: "998",
  VA: "39", VC: "1", VE: "58", VG: "1", VI: "1", VN: "84", VU: "678", WF: "681", WS: "685", YE: "967",
  YT: "262", ZA: "27", ZM: "260", ZW: "263",
};

// National-number grouping masks for high-traffic countries; the rest use GENERIC_MASK.
const TK_MASK_BY_ISO: Record<string, string> = {
  US: "(###) ###-####", CA: "(###) ###-####", GB: "#### ######", RU: "(###) ###-##-##", KZ: "(###) ###-##-##",
  UA: "## ### ## ##", BY: "## ###-##-##", DE: "### #######", FR: "# ## ## ## ##", ES: "### ### ###",
  IT: "### ######", BR: "(##) #####-####", IN: "##### #####", CN: "### #### ####", JP: "## #### ####",
  TR: "### ### ## ##", AE: "## ### ####", PL: "### ### ###", NL: "# ########", AU: "### ### ###",
};

function regionDisplay(lang: string): Intl.DisplayNames | undefined {
  try {
    return new Intl.DisplayNames([lang || "en"], { type: "region" });
  } catch {
    return undefined;
  }
}

function safeName(dn: Intl.DisplayNames | undefined, iso: string): string {
  try {
    return dn?.of(iso) ?? iso;
  } catch {
    return iso;
  }
}

// Built lists are cached per language so the ~240-row table + Intl lookups run once.
// Lazily initialized (no module-level side effect) so the table tree-shakes out
// of bundles that don't render the country picker.
let cache: Map<string, readonly TKPhoneCountry[]> | undefined;

/** Full country list with names localized to `lang`, sorted by localized name. */
export function tkBuildCountries(lang = "en"): readonly TKPhoneCountry[] {
  cache ??= new Map();
  const cached = cache.get(lang);
  if (cached) return cached;
  const dn = regionDisplay(lang);
  const list = Object.keys(TK_DIAL_BY_ISO)
    .map((iso) => ({ iso, dial: TK_DIAL_BY_ISO[iso], mask: TK_MASK_BY_ISO[iso] ?? GENERIC_MASK, name: safeName(dn, iso) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang || "en"));
  cache.set(lang, list);
  return list;
}

/**
 * Resolve `defaultCountry` (an ISO code like `"RU"` or a dial code like `"+7"`)
 * to a country in the list. Dial codes prefer the longest match.
 */
export function tkResolveCountry(input: string | undefined, list: readonly TKPhoneCountry[]): TKPhoneCountry {
  const fallback =
    list.find((c) => c.iso === "US") ?? list[0] ?? { iso: "US", name: "United States", dial: "1", mask: GENERIC_MASK };
  if (!input) return fallback;
  const iso = input.toUpperCase();
  const byIso = list.find((c) => c.iso === iso);
  if (byIso) return byIso;
  const digits = input.replace(/\D/g, "");
  if (!digits) return fallback;
  const byDial = list.filter((c) => c.dial === digits).sort((a, b) => b.dial.length - a.dial.length)[0];
  if (byDial) return byDial;
  // Unknown dial code: synthesize an entry so callers still get the generic mask.
  return { iso: "", name: `+${digits}`, dial: digits, mask: GENERIC_MASK };
}

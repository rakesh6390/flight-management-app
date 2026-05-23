/**
 * Internal flight dates use YYYY-MM-DD (ISO date keys).
 * Use formatDepartureDateForDisplay() only for UI — never for filtering or URLs.
 */

export const ISO_DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DD_MM_YYYY_DASH = /^(\d{2})-(\d{2})-(\d{4})$/;
const DD_MM_YYYY_SLASH = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE_SLASH = /^(\d{4})\/(\d{2})\/(\d{2})$/;

export function toIsoDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isValidIsoDateKey(value: string): boolean {
  if (!ISO_DATE_KEY_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));

  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

/**
 * Coerce any supported user/input string to YYYY-MM-DD.
 * Supports: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, YYYY/MM/DD, and ISO datetimes.
 */
export function normalizeDepartureDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (ISO_DATE_KEY_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const ddDash = trimmed.match(DD_MM_YYYY_DASH);
  if (ddDash) {
    const [, day, month, year] = ddDash;
    return toIsoDateKey(Number(year), Number(month), Number(day));
  }

  const ddSlash = trimmed.match(DD_MM_YYYY_SLASH);
  if (ddSlash) {
    const [, day, month, year] = ddSlash;
    return toIsoDateKey(Number(year), Number(month), Number(day));
  }

  const isoSlash = trimmed.match(ISO_DATE_SLASH);
  if (isoSlash) {
    const [, year, month, day] = isoSlash;
    return toIsoDateKey(Number(year), Number(month), Number(day));
  }

  if (trimmed.length >= 10 && ISO_DATE_KEY_PATTERN.test(trimmed.slice(0, 10))) {
    return trimmed.slice(0, 10);
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    return toIsoDateKey(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate()
    );
  }

  return trimmed.slice(0, 10);
}

/** User-facing label: DD-MM-YYYY */
export function formatDepartureDateForDisplay(isoDateKey: string): string {
  const normalized = normalizeDepartureDate(isoDateKey);
  if (!ISO_DATE_KEY_PATTERN.test(normalized)) {
    return isoDateKey;
  }

  const [year, month, day] = normalized.split("-");
  return `${day}-${month}-${year}`;
}

/**
 * Calendar date from departs_at for filtering (UTC date parts; ignores time).
 */
export function getDepartureDateKeyFromTimestamp(departsAt: string): string {
  const trimmed = departsAt.trim();
  if (!trimmed) {
    return "";
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    if (trimmed.length >= 10 && ISO_DATE_KEY_PATTERN.test(trimmed.slice(0, 10))) {
      return trimmed.slice(0, 10);
    }
    return "";
  }

  const d = new Date(parsed);
  return toIsoDateKey(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate()
  );
}

export function matchesDepartureDate(
  departsAt: string,
  departureDate: string
): boolean {
  const searchDate = normalizeDepartureDate(departureDate);
  const flightDate = getDepartureDateKeyFromTimestamp(departsAt);

  if (!isValidIsoDateKey(searchDate) || !isValidIsoDateKey(flightDate)) {
    return false;
  }

  return flightDate === searchDate;
}

export function isDepartureDateInPast(isoDateKey: string): boolean {
  const normalized = normalizeDepartureDate(isoDateKey);
  if (!isValidIsoDateKey(normalized)) {
    return true;
  }

  const now = new Date();
  const todayKey = toIsoDateKey(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );

  return normalized < todayKey;
}

export function normalizeIataCode(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeFlightSearchFilters(filters: {
  origin: string;
  destination: string;
  departureDate: string;
}) {
  return {
    origin: normalizeIataCode(filters.origin),
    destination: normalizeIataCode(filters.destination),
    departureDate: normalizeDepartureDate(filters.departureDate),
  };
}

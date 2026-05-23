/**
 * Flight search normalization and date-only matching (ignores time & timezone).
 */

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeIataCode(value: string): string {
  return value.trim().toUpperCase();
}

/** Normalizes HTML date input / URL param to YYYY-MM-DD */
export function normalizeDepartureDate(value: string): string {
  const trimmed = value.trim();
  if (DATE_KEY_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return trimmed.slice(0, 10);
  }

  const d = new Date(parsed);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Calendar date from departs_at (uses the date portion of the ISO string when present).
 * Avoids shifting the day via local/UTC conversion for standard timestamptz strings.
 */
export function getDepartureDateKey(departsAt: string): string {
  const trimmed = departsAt.trim();

  if (trimmed.length >= 10 && DATE_KEY_PATTERN.test(trimmed.slice(0, 10))) {
    return trimmed.slice(0, 10);
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return "";
  }

  const d = new Date(parsed);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function matchesDepartureDate(
  departsAt: string,
  departureDate: string
): boolean {
  const searchDate = normalizeDepartureDate(departureDate);
  const flightDate = getDepartureDateKey(departsAt);

  if (!DATE_KEY_PATTERN.test(searchDate) || !DATE_KEY_PATTERN.test(flightDate)) {
    return false;
  }

  return flightDate === searchDate;
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

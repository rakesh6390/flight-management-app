import type { CabinClass, Tables } from "@/types/database";

export type SeatRow = Tables<"seats">;

export type SeatState = "available" | "occupied" | "selected" | "booked";

export interface SeatViewModel extends SeatRow {
  rowNumber: number;
  column: string;
  state: SeatState;
}

export interface SeatMapRow {
  rowNumber: number;
  seatsByColumn: Map<string, SeatViewModel>;
}

export interface CabinSection {
  class: CabinClass;
  columns: string[];
  aisleAfterColumns: string[];
  rows: SeatMapRow[];
  seatCount: number;
}

const CABIN_ORDER: CabinClass[] = ["first", "business", "economy"];
const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  business: "Business",
  first: "First",
};

const COLUMN_ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function parseSeatNumber(seatNumber: string): {
  rowNumber: number;
  column: string;
} {
  const match = seatNumber.trim().toUpperCase().match(/^(\d+)([A-Z]+)$/);

  if (!match) {
    return {
      rowNumber: Number.MAX_SAFE_INTEGER,
      column: seatNumber.trim().toUpperCase(),
    };
  }

  return {
    rowNumber: Number(match[1]),
    column: match[2],
  };
}

function sortColumns(columns: string[]): string[] {
  return [...columns].sort((a, b) => {
    const aIndex = COLUMN_ORDER.indexOf(a);
    const bIndex = COLUMN_ORDER.indexOf(b);

    if (aIndex === -1 || bIndex === -1) {
      return a.localeCompare(b);
    }

    return aIndex - bIndex;
  });
}

function inferAisles(columns: string[]): string[] {
  const key = columns.join("");

  const knownLayouts: Record<string, string[]> = {
    AK: ["A"],
    ACDF: ["C"],
    ABCDEF: ["C"],
    ADGK: ["A", "G"],
    ABCDEFGHK: ["C", "G"],
  };

  if (knownLayouts[key]) {
    return knownLayouts[key];
  }

  if (columns.length <= 2) {
    return columns.length === 2 ? [columns[0]] : [];
  }

  return [columns[Math.floor(columns.length / 2) - 1]];
}

export function getCabinLabel(cabin: CabinClass): string {
  return CABIN_LABELS[cabin];
}

export function createSeatViewModels(
  seats: SeatRow[],
  selectedSeatId?: string | null,
  bookedSeatIds: string[] = []
): SeatViewModel[] {
  const booked = new Set(bookedSeatIds);

  return seats.map((seat) => {
    const parsed = parseSeatNumber(seat.seat_number);
    const state: SeatState = booked.has(seat.id)
      ? "booked"
      : selectedSeatId === seat.id
        ? "selected"
        : seat.is_available
          ? "available"
          : "occupied";

    return {
      ...seat,
      rowNumber: parsed.rowNumber,
      column: parsed.column,
      state,
    };
  });
}

export function groupSeatsByRow(seats: SeatViewModel[]): SeatMapRow[] {
  const rows = new Map<number, Map<string, SeatViewModel>>();

  for (const seat of seats) {
    const row = rows.get(seat.rowNumber) ?? new Map<string, SeatViewModel>();
    row.set(seat.column, seat);
    rows.set(seat.rowNumber, row);
  }

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rowNumber, seatsByColumn]) => ({
      rowNumber,
      seatsByColumn,
    }));
}

export function generateCabinSections(seats: SeatViewModel[]): CabinSection[] {
  return CABIN_ORDER.map((cabinClass) => {
    const cabinSeats = seats.filter((seat) => seat.class === cabinClass);

    if (cabinSeats.length === 0) {
      return null;
    }

    const columns = sortColumns([
      ...new Set(cabinSeats.map((seat) => seat.column)),
    ]);

    return {
      class: cabinClass,
      columns,
      aisleAfterColumns: inferAisles(columns),
      rows: groupSeatsByRow(cabinSeats),
      seatCount: cabinSeats.length,
    };
  }).filter((section): section is CabinSection => section !== null);
}

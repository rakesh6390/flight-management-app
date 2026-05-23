export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type FlightStatus =
  | "scheduled"
  | "boarding"
  | "departed"
  | "arrived"
  | "cancelled"
  | "delayed";

export type CabinClass = "economy" | "business" | "first";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Database {
  public: {
    Tables: {
      flights: {
        Row: {
          id: string;
          flight_no: string;
          origin: string;
          destination: string;
          departs_at: string;
          arrives_at: string;
          aircraft_type: string | null;
          status: FlightStatus;
          base_price: number;
        };
        Insert: {
          id?: string;
          flight_no: string;
          origin: string;
          destination: string;
          departs_at: string;
          arrives_at: string;
          aircraft_type?: string | null;
          status?: FlightStatus;
          base_price: number;
        };
        Update: {
          id?: string;
          flight_no?: string;
          origin?: string;
          destination?: string;
          departs_at?: string;
          arrives_at?: string;
          aircraft_type?: string | null;
          status?: FlightStatus;
          base_price?: number;
        };
        Relationships: [];
      };
      seats: {
        Row: {
          id: string;
          flight_id: string;
          seat_number: string;
          class: CabinClass;
          is_available: boolean;
          extra_fee: number;
        };
        Insert: {
          id?: string;
          flight_id: string;
          seat_number: string;
          class: CabinClass;
          is_available?: boolean;
          extra_fee?: number;
        };
        Update: {
          id?: string;
          flight_id?: string;
          seat_number?: string;
          class?: CabinClass;
          is_available?: boolean;
          extra_fee?: number;
        };
        Relationships: [
          {
            foreignKeyName: "seats_flight_id_fkey";
            columns: ["flight_id"];
            isOneToOne: false;
            referencedRelation: "flights";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          flight_id: string;
          seat_id: string;
          status: BookingStatus;
          booked_at: string;
          total_price: number;
          pnr_code: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flight_id: string;
          seat_id: string;
          status?: BookingStatus;
          booked_at?: string;
          total_price: number;
          pnr_code: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flight_id?: string;
          seat_id?: string;
          status?: BookingStatus;
          booked_at?: string;
          total_price?: number;
          pnr_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_flight_id_fkey";
            columns: ["flight_id"];
            isOneToOne: false;
            referencedRelation: "flights";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_seat_id_fkey";
            columns: ["seat_id"];
            isOneToOne: false;
            referencedRelation: "seats";
            referencedColumns: ["id"];
          },
        ];
      };
      passengers: {
        Row: {
          id: string;
          booking_id: string;
          full_name: string;
          passport_no: string;
          nationality: string;
          dob: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          full_name: string;
          passport_no: string;
          nationality: string;
          dob: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          full_name?: string;
          passport_no?: string;
          nationality?: string;
          dob?: string;
        };
        Relationships: [
          {
            foreignKeyName: "passengers_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      reschedules: {
        Row: {
          id: string;
          booking_id: string;
          old_flight_id: string;
          new_flight_id: string;
          requested_at: string;
          fee_charged: number;
        };
        Insert: {
          id?: string;
          booking_id: string;
          old_flight_id: string;
          new_flight_id: string;
          requested_at?: string;
          fee_charged?: number;
        };
        Update: {
          id?: string;
          booking_id?: string;
          old_flight_id?: string;
          new_flight_id?: string;
          requested_at?: string;
          fee_charged?: number;
        };
        Relationships: [
          {
            foreignKeyName: "reschedules_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      reserve_seat: {
        Args: {
          p_flight_id: string;
          p_seat_id: string;
        };
        Returns: Json;
      };
      reschedule_booking: {
        Args: {
          p_booking_id: string;
          p_new_flight_id: string;
          p_new_seat_id: string;
        };
        Returns: Json;
      };
      cancel_booking: {
        Args: {
          p_booking_id: string;
        };
        Returns: Json;
      };
      is_own_booking: {
        Args: {
          booking_uuid: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type ReserveSeatResult = {
  booking: Tables<"bookings">;
  seat: Pick<Tables<"seats">, "id" | "seat_number" | "class" | "is_available">;
  flight: Pick<Tables<"flights">, "id" | "flight_no" | "departs_at">;
};

-- Flight Management System (Supabase / PostgreSQL)

-- ---------------------------------------------------------------------------
-- flights
-- ---------------------------------------------------------------------------

CREATE TABLE flights (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_no     varchar(10) NOT NULL,
  origin        varchar(3) NOT NULL,
  destination   varchar(3) NOT NULL,
  departs_at    timestamptz NOT NULL,
  arrives_at    timestamptz NOT NULL,
  aircraft_type varchar(50),
  status        varchar(20) NOT NULL DEFAULT 'scheduled',
  base_price    numeric(10, 2) NOT NULL,

  CONSTRAINT flights_origin_not_empty
    CHECK (length(trim(origin)) > 0),
  CONSTRAINT flights_destination_not_empty
    CHECK (length(trim(destination)) > 0),
  CONSTRAINT flights_different_route
    CHECK (origin <> destination),
  CONSTRAINT flights_arrives_after_departs
    CHECK (arrives_at > departs_at),
  CONSTRAINT flights_base_price_non_negative
    CHECK (base_price >= 0),
  CONSTRAINT flights_status_valid
    CHECK (status IN (
      'scheduled',
      'boarding',
      'departed',
      'arrived',
      'cancelled',
      'delayed'
    ))
);

CREATE UNIQUE INDEX flights_flight_no_departs_at_unique
  ON flights (flight_no, departs_at);

CREATE INDEX flights_route_departs_idx
  ON flights (origin, destination, departs_at);

CREATE INDEX flights_status_idx
  ON flights (status);

-- ---------------------------------------------------------------------------
-- seats
-- ---------------------------------------------------------------------------

CREATE TABLE seats (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id    uuid NOT NULL REFERENCES flights (id) ON DELETE CASCADE,
  seat_number  varchar(5) NOT NULL,
  class        varchar(20) NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  extra_fee    numeric(10, 2) NOT NULL DEFAULT 0,

  CONSTRAINT seats_class_valid
    CHECK (class IN ('economy', 'business', 'first')),
  CONSTRAINT seats_extra_fee_non_negative
    CHECK (extra_fee >= 0),
  CONSTRAINT seats_seat_number_not_empty
    CHECK (length(trim(seat_number)) > 0),
  CONSTRAINT seats_unique_per_flight
    UNIQUE (flight_id, seat_number)
);

CREATE INDEX seats_flight_id_idx ON seats (flight_id);
CREATE INDEX seats_flight_available_idx ON seats (flight_id, is_available);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------

CREATE TABLE bookings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  flight_id   uuid NOT NULL REFERENCES flights (id) ON DELETE RESTRICT,
  seat_id     uuid NOT NULL REFERENCES seats (id) ON DELETE RESTRICT,
  status      varchar(20) NOT NULL DEFAULT 'pending',
  booked_at   timestamptz NOT NULL DEFAULT now(),
  total_price numeric(10, 2) NOT NULL,
  pnr_code    varchar(8) NOT NULL,

  CONSTRAINT bookings_total_price_non_negative
    CHECK (total_price >= 0),
  CONSTRAINT bookings_status_valid
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  CONSTRAINT bookings_pnr_code_format
    CHECK (pnr_code ~ '^[A-Z0-9]{6,8}$')
);

CREATE UNIQUE INDEX bookings_pnr_code_unique ON bookings (pnr_code);

CREATE UNIQUE INDEX bookings_seat_active_unique
  ON bookings (seat_id)
  WHERE status IN ('pending', 'confirmed');

CREATE INDEX bookings_user_id_idx ON bookings (user_id);
CREATE INDEX bookings_flight_id_idx ON bookings (flight_id);
CREATE INDEX bookings_status_idx ON bookings (status);

-- ---------------------------------------------------------------------------
-- passengers
-- ---------------------------------------------------------------------------

CREATE TABLE passengers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   uuid NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  full_name    varchar(200) NOT NULL,
  passport_no  varchar(20) NOT NULL,
  nationality  varchar(3) NOT NULL,
  dob          date NOT NULL,

  CONSTRAINT passengers_full_name_not_empty
    CHECK (length(trim(full_name)) > 0),
  CONSTRAINT passengers_passport_not_empty
    CHECK (length(trim(passport_no)) > 0),
  CONSTRAINT passengers_nationality_format
    CHECK (nationality ~ '^[A-Z]{3}$'),
  CONSTRAINT passengers_dob_in_past
    CHECK (dob < current_date),
  CONSTRAINT passengers_unique_passport_per_booking
    UNIQUE (booking_id, passport_no)
);

CREATE INDEX passengers_booking_id_idx ON passengers (booking_id);

-- ---------------------------------------------------------------------------
-- reschedules
-- ---------------------------------------------------------------------------

CREATE TABLE reschedules (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     uuid NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  old_flight_id  uuid NOT NULL REFERENCES flights (id) ON DELETE RESTRICT,
  new_flight_id  uuid NOT NULL REFERENCES flights (id) ON DELETE RESTRICT,
  requested_at   timestamptz NOT NULL DEFAULT now(),
  fee_charged    numeric(10, 2) NOT NULL DEFAULT 0,

  CONSTRAINT reschedules_different_flights
    CHECK (old_flight_id <> new_flight_id),
  CONSTRAINT reschedules_fee_non_negative
    CHECK (fee_charged >= 0)
);

CREATE INDEX reschedules_booking_id_idx ON reschedules (booking_id);
CREATE INDEX reschedules_requested_at_idx ON reschedules (requested_at);

-- ---------------------------------------------------------------------------
-- Integrity triggers
-- ---------------------------------------------------------------------------

-- Seat must belong to the booked flight and be available (unless booking is cancelled)
CREATE OR REPLACE FUNCTION check_booking_seat()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  seat_flight    uuid;
  seat_available boolean;
BEGIN
  SELECT flight_id, is_available
  INTO seat_flight, seat_available
  FROM seats
  WHERE id = NEW.seat_id;

  IF seat_flight IS DISTINCT FROM NEW.flight_id THEN
    RAISE EXCEPTION 'seat_id must belong to flight_id';
  END IF;

  IF TG_OP = 'INSERT' AND NOT seat_available THEN
    RAISE EXCEPTION 'seat is not available';
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.seat_id IS DISTINCT FROM OLD.seat_id AND NOT seat_available THEN
    RAISE EXCEPTION 'seat is not available';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_seat_check
  BEFORE INSERT OR UPDATE OF flight_id, seat_id, status ON bookings
  FOR EACH ROW
  WHEN (NEW.status IN ('pending', 'confirmed'))
  EXECUTE FUNCTION check_booking_seat();

-- Mark seat unavailable when booking is confirmed; release when cancelled
CREATE OR REPLACE FUNCTION sync_seat_availability()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE seats SET is_available = false WHERE id = NEW.seat_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status <> 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE seats SET is_available = false WHERE id = NEW.seat_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
      UPDATE seats SET is_available = true WHERE id = OLD.seat_id;
    END IF;

    IF NEW.seat_id IS DISTINCT FROM OLD.seat_id AND NEW.status = 'confirmed' THEN
      UPDATE seats SET is_available = true WHERE id = OLD.seat_id;
      UPDATE seats SET is_available = false WHERE id = NEW.seat_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE seats SET is_available = true WHERE id = OLD.seat_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER bookings_sync_seat_availability
  AFTER INSERT OR UPDATE OF status, seat_id OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_seat_availability();

-- Reschedule old_flight_id must match the booking's current flight
CREATE OR REPLACE FUNCTION check_reschedule_flights()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  booking_flight uuid;
BEGIN
  SELECT flight_id INTO booking_flight
  FROM bookings
  WHERE id = NEW.booking_id;

  IF booking_flight IS DISTINCT FROM NEW.old_flight_id THEN
    RAISE EXCEPTION 'old_flight_id must match the booking current flight';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER reschedules_flights_check
  BEFORE INSERT OR UPDATE OF booking_id, old_flight_id ON reschedules
  FOR EACH ROW
  EXECUTE FUNCTION check_reschedule_flights();

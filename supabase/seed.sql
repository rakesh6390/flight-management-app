-- Seed: 8 flights with realistic seat maps
-- Run via: npx supabase db reset  (local) or execute in SQL Editor after migrations

TRUNCATE TABLE
  public.reschedules,
  public.passengers,
  public.bookings,
  public.seats,
  public.flights
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- Helpers (dropped at end of this file)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public._seed_narrow_body_seats(
  p_flight_id uuid,
  p_business_rows int DEFAULT 4,
  p_economy_start int DEFAULT 5,
  p_economy_end int DEFAULT 31
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.seats (flight_id, seat_number, class, extra_fee)
  SELECT
    p_flight_id,
    r::text || l,
    'business',
    95.00
  FROM generate_series(1, p_business_rows) AS r
  CROSS JOIN unnest(ARRAY['A', 'C', 'D', 'F']) AS l;

  INSERT INTO public.seats (flight_id, seat_number, class, extra_fee)
  SELECT
    p_flight_id,
    r::text || l,
    'economy',
    CASE
      WHEN r IN (p_economy_start + 10, p_economy_start + 11) THEN 45.00
      WHEN l IN ('A', 'F') THEN 18.00
      ELSE 0.00
    END
  FROM generate_series(p_economy_start, p_economy_end) AS r
  CROSS JOIN unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) AS l
  WHERE r <> 13;
END;
$$;

CREATE OR REPLACE FUNCTION public._seed_wide_body_seats(p_flight_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.seats (flight_id, seat_number, class, extra_fee)
  SELECT p_flight_id, r::text || l, 'first', 250.00
  FROM generate_series(1, 2) AS r
  CROSS JOIN unnest(ARRAY['A', 'K']) AS l;

  INSERT INTO public.seats (flight_id, seat_number, class, extra_fee)
  SELECT p_flight_id, r::text || l, 'business', 140.00
  FROM generate_series(5, 12) AS r
  CROSS JOIN unnest(ARRAY['A', 'D', 'G', 'K']) AS l;

  INSERT INTO public.seats (flight_id, seat_number, class, extra_fee)
  SELECT
    p_flight_id,
    r::text || l,
    'economy',
    CASE
      WHEN r IN (40, 41) THEN 55.00
      WHEN l IN ('A', 'K') THEN 22.00
      ELSE 0.00
    END
  FROM generate_series(20, 52) AS r
  CROSS JOIN unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K']) AS l
  WHERE r <> 13;
END;
$$;

CREATE OR REPLACE FUNCTION public._seed_regional_jet_seats(p_flight_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.seats (flight_id, seat_number, class, extra_fee)
  SELECT p_flight_id, r::text || l, 'business', 75.00
  FROM generate_series(1, 2) AS r
  CROSS JOIN unnest(ARRAY['A', 'C', 'D', 'F']) AS l;

  INSERT INTO public.seats (flight_id, seat_number, class, extra_fee)
  SELECT
    p_flight_id,
    r::text || l,
    'economy',
    CASE WHEN l IN ('A', 'F') THEN 12.00 ELSE 0.00 END
  FROM generate_series(3, 18) AS r
  CROSS JOIN unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) AS l;
END;
$$;

-- ---------------------------------------------------------------------------
-- Flights (fixed UUIDs for stable references in dev)
-- ---------------------------------------------------------------------------

INSERT INTO public.flights (
  id, flight_no, origin, destination, departs_at, arrives_at,
  aircraft_type, status, base_price
) VALUES
  (
    'f1000001-0000-4000-8000-000000000001',
    'UA428', 'JFK', 'LAX',
    timestamptz '2026-06-01 08:00:00-04',
    timestamptz '2026-06-01 11:15:00-07',
    'Boeing 737-800', 'scheduled', 289.00
  ),
  (
    'f1000001-0000-4000-8000-000000000002',
    'BA304', 'LHR', 'CDG',
    timestamptz '2026-06-02 10:30:00+01',
    timestamptz '2026-06-02 12:45:00+02',
    'Airbus A320neo', 'scheduled', 159.00
  ),
  (
    'f1000001-0000-4000-8000-000000000003',
    'EK203', 'DXB', 'SIN',
    timestamptz '2026-06-03 02:15:00+04',
    timestamptz '2026-06-03 13:40:00+08',
    'Boeing 777-300ER', 'scheduled', 649.00
  ),
  (
    'f1000001-0000-4000-8000-000000000004',
    'AS512', 'SFO', 'SEA',
    timestamptz '2026-06-04 07:00:00-07',
    timestamptz '2026-06-04 09:05:00-07',
    'Boeing 737-900ER', 'scheduled', 129.00
  ),
  (
    'f1000001-0000-4000-8000-000000000005',
    'DL1189', 'ATL', 'MIA',
    timestamptz '2026-06-05 14:20:00-04',
    timestamptz '2026-06-05 16:10:00-04',
    'Airbus A321', 'scheduled', 199.00
  ),
  (
    'f1000001-0000-4000-8000-000000000006',
    'AI860', 'DEL', 'BOM',
    timestamptz '2026-06-06 06:45:00+05:30',
    timestamptz '2026-06-06 08:55:00+05:30',
    'Boeing 787-9', 'scheduled', 119.00
  ),
  (
    'f1000001-0000-4000-8000-000000000007',
    'JL105', 'NRT', 'HND',
    timestamptz '2026-06-07 17:30:00+09',
    timestamptz '2026-06-07 18:35:00+09',
    'Airbus A350-900', 'delayed', 89.00
  ),
  (
    'f1000001-0000-4000-8000-000000000008',
    'QF409', 'SYD', 'MEL',
    timestamptz '2026-06-08 09:15:00+10',
    timestamptz '2026-06-08 10:50:00+10',
    'Boeing 737-800', 'scheduled', 109.00
  );

-- ---------------------------------------------------------------------------
-- Seat maps
-- ---------------------------------------------------------------------------

-- UA428 / QF409: narrow-body 2-2 business + 3-3 economy (~160 seats each)
SELECT public._seed_narrow_body_seats('f1000001-0000-4000-8000-000000000001');
SELECT public._seed_narrow_body_seats('f1000001-0000-4000-8000-000000000008');

-- BA304: shorter narrow-body
SELECT public._seed_narrow_body_seats(
  'f1000001-0000-4000-8000-000000000002',
  p_business_rows => 3,
  p_economy_start => 4,
  p_economy_end => 28
);

-- EK203: wide-body first + business + 3-4-3 economy (~350 seats)
SELECT public._seed_wide_body_seats('f1000001-0000-4000-8000-000000000003');

-- AS512: narrow-body, smaller economy cabin
SELECT public._seed_narrow_body_seats(
  'f1000001-0000-4000-8000-000000000004',
  p_business_rows => 3,
  p_economy_start => 4,
  p_economy_end => 28
);

-- DL1189: Airbus A321 — extra economy rows
SELECT public._seed_narrow_body_seats(
  'f1000001-0000-4000-8000-000000000005',
  p_business_rows => 4,
  p_economy_start => 5,
  p_economy_end => 36
);

-- AI860: Dreamliner wide-body (slightly smaller business cabin)
CREATE OR REPLACE FUNCTION public._seed_dreamliner_seats(p_flight_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.seats (flight_id, seat_number, class, extra_fee)
  SELECT p_flight_id, r::text || l, 'business', 120.00
  FROM generate_series(1, 8) AS r
  CROSS JOIN unnest(ARRAY['A', 'D', 'G', 'K']) AS l;

  INSERT INTO public.seats (flight_id, seat_number, class, extra_fee)
  SELECT
    p_flight_id,
    r::text || l,
    'economy',
    CASE
      WHEN r IN (22, 23) THEN 40.00
      WHEN l IN ('A', 'K') THEN 20.00
      ELSE 0.00
    END
  FROM generate_series(15, 42) AS r
  CROSS JOIN unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K']) AS l
  WHERE r <> 13;
END;
$$;

SELECT public._seed_dreamliner_seats('f1000001-0000-4000-8000-000000000006');

-- JL105: short domestic — regional layout (~96 seats)
SELECT public._seed_regional_jet_seats('f1000001-0000-4000-8000-000000000007');

-- Mark a few seats unavailable on select flights (simulates existing holds)
UPDATE public.seats
SET is_available = false
WHERE (flight_id, seat_number) IN (
  ('f1000001-0000-4000-8000-000000000001', '12A'),
  ('f1000001-0000-4000-8000-000000000001', '12B'),
  ('f1000001-0000-4000-8000-000000000003', '8D'),
  ('f1000001-0000-4000-8000-000000000003', '1A'),
  ('f1000001-0000-4000-8000-000000000005', '20C'),
  ('f1000001-0000-4000-8000-000000000008', '5A')
);

-- ---------------------------------------------------------------------------
-- Cleanup helper functions
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public._seed_narrow_body_seats(uuid, int, int, int);
DROP FUNCTION IF EXISTS public._seed_wide_body_seats(uuid);
DROP FUNCTION IF EXISTS public._seed_regional_jet_seats(uuid);
DROP FUNCTION IF EXISTS public._seed_dreamliner_seats(uuid);

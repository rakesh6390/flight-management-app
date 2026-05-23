-- Transaction-safe seat reservation RPC (row-level locking)

-- ---------------------------------------------------------------------------
-- PNR generator (unique, format-compliant)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.generate_pnr_code()
RETURNS varchar(8)
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  v_code varchar(8);
BEGIN
  LOOP
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    EXIT WHEN v_code ~ '^[A-Z0-9]{6,8}$'
      AND NOT EXISTS (SELECT 1 FROM public.bookings WHERE pnr_code = v_code);
  END LOOP;

  RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_pnr_code() FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- reserve_seat: lock seat row, block double booking, create pending booking
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reserve_seat(
  p_flight_id uuid,
  p_seat_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id      uuid;
  v_seat         public.seats%ROWTYPE;
  v_flight       public.flights%ROWTYPE;
  v_total_price  numeric(10, 2);
  v_pnr          varchar(8);
  v_booking      public.bookings%ROWTYPE;
  v_active_count int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated'
      USING ERRCODE = '42501';
  END IF;

  -- Lock flight metadata first (consistent lock order: flight -> seat -> bookings)
  SELECT *
  INTO v_flight
  FROM public.flights
  WHERE id = p_flight_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'flight_not_found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_flight.status NOT IN ('scheduled', 'delayed') THEN
    RAISE EXCEPTION 'flight_not_bookable'
      USING ERRCODE = 'P0001',
        HINT = format('flight status is %s', v_flight.status);
  END IF;

  -- Exclusive lock on the seat row for the duration of this transaction
  SELECT *
  INTO v_seat
  FROM public.seats
  WHERE id = p_seat_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'seat_not_found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_seat.flight_id IS DISTINCT FROM p_flight_id THEN
    RAISE EXCEPTION 'seat_flight_mismatch'
      USING ERRCODE = 'P0001';
  END IF;

  IF NOT v_seat.is_available THEN
    RAISE EXCEPTION 'seat_not_available'
      USING ERRCODE = 'P0001';
  END IF;

  -- Lock any existing active booking on this seat (blocks concurrent reservers)
  SELECT count(*)::int
  INTO v_active_count
  FROM public.bookings
  WHERE seat_id = p_seat_id
    AND status IN ('pending', 'confirmed')
  FOR UPDATE;

  IF v_active_count > 0 THEN
    RAISE EXCEPTION 'seat_already_reserved'
      USING ERRCODE = 'P0001';
  END IF;

  v_total_price := v_flight.base_price + v_seat.extra_fee;
  v_pnr := public.generate_pnr_code();

  INSERT INTO public.bookings (
    user_id,
    flight_id,
    seat_id,
    status,
    total_price,
    pnr_code
  )
  VALUES (
    v_user_id,
    p_flight_id,
    p_seat_id,
    'pending',
    v_total_price,
    v_pnr
  )
  RETURNING * INTO v_booking;

  -- Hold inventory immediately (pending counts as reserved)
  UPDATE public.seats
  SET is_available = false
  WHERE id = p_seat_id;

  RETURN jsonb_build_object(
    'booking', to_jsonb(v_booking),
    'seat', jsonb_build_object(
      'id', v_seat.id,
      'seat_number', v_seat.seat_number,
      'class', v_seat.class,
      'is_available', false
    ),
    'flight', jsonb_build_object(
      'id', v_flight.id,
      'flight_no', v_flight.flight_no,
      'departs_at', v_flight.departs_at
    )
  );
EXCEPTION
  WHEN unique_violation THEN
    -- bookings_seat_active_unique backstop if two txs race past checks
    RAISE EXCEPTION 'seat_already_reserved'
      USING ERRCODE = 'P0001';
END;
$$;

COMMENT ON FUNCTION public.reserve_seat(uuid, uuid) IS
  'Atomically reserves a seat with FOR UPDATE row locks. Creates a pending booking for auth.uid().';

REVOKE ALL ON FUNCTION public.reserve_seat(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_seat(uuid, uuid) TO authenticated;

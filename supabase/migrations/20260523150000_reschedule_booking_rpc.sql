-- Transaction-safe booking reschedule (same route, new flight + seat)

CREATE OR REPLACE FUNCTION public.reschedule_booking(
  p_booking_id uuid,
  p_new_flight_id uuid,
  p_new_seat_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id       uuid;
  v_booking       public.bookings%ROWTYPE;
  v_old_flight    public.flights%ROWTYPE;
  v_new_flight    public.flights%ROWTYPE;
  v_new_seat      public.seats%ROWTYPE;
  v_fee           numeric(10, 2) := 75;
  v_total_price   numeric(10, 2);
  v_reschedule    public.reschedules%ROWTYPE;
  v_active_count  int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated'
      USING ERRCODE = '42501';
  END IF;

  SELECT *
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
    AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'booking_not_found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_booking.status <> 'confirmed' THEN
    RAISE EXCEPTION 'booking_not_reschedulable'
      USING ERRCODE = 'P0001',
        HINT = format('booking status is %s', v_booking.status);
  END IF;

  SELECT *
  INTO v_old_flight
  FROM public.flights
  WHERE id = v_booking.flight_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'flight_not_found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_old_flight.departs_at <= now() + interval '2 hours' THEN
    RAISE EXCEPTION 'reschedule_not_allowed_within_2_hours_of_departure'
      USING ERRCODE = 'P0001';
  END IF;

  IF p_new_flight_id = v_booking.flight_id THEN
    RAISE EXCEPTION 'reschedule_requires_different_flight'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO v_new_flight
  FROM public.flights
  WHERE id = p_new_flight_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'new_flight_not_found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_new_flight.status NOT IN ('scheduled', 'delayed') THEN
    RAISE EXCEPTION 'new_flight_not_bookable'
      USING ERRCODE = 'P0001';
  END IF;

  IF v_new_flight.origin <> v_old_flight.origin
     OR v_new_flight.destination <> v_old_flight.destination THEN
    RAISE EXCEPTION 'reschedule_route_mismatch'
      USING ERRCODE = 'P0001';
  END IF;

  IF v_new_flight.departs_at <= now() THEN
    RAISE EXCEPTION 'new_flight_departed'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO v_new_seat
  FROM public.seats
  WHERE id = p_new_seat_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'new_seat_not_found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_new_seat.flight_id IS DISTINCT FROM p_new_flight_id THEN
    RAISE EXCEPTION 'new_seat_flight_mismatch'
      USING ERRCODE = 'P0001';
  END IF;

  IF NOT v_new_seat.is_available THEN
    RAISE EXCEPTION 'new_seat_not_available'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*)::int
  INTO v_active_count
  FROM public.bookings
  WHERE seat_id = p_new_seat_id
    AND status IN ('pending', 'confirmed')
    AND id <> p_booking_id
  FOR UPDATE;

  IF v_active_count > 0 THEN
    RAISE EXCEPTION 'new_seat_already_reserved'
      USING ERRCODE = 'P0001';
  END IF;

  v_total_price := v_new_flight.base_price + v_new_seat.extra_fee + v_fee;

  INSERT INTO public.reschedules (
    booking_id,
    old_flight_id,
    new_flight_id,
    fee_charged
  )
  VALUES (
    p_booking_id,
    v_booking.flight_id,
    p_new_flight_id,
    v_fee
  )
  RETURNING * INTO v_reschedule;

  UPDATE public.bookings
  SET
    flight_id = p_new_flight_id,
    seat_id = p_new_seat_id,
    total_price = v_total_price
  WHERE id = p_booking_id
  RETURNING * INTO v_booking;

  RETURN jsonb_build_object(
    'booking', to_jsonb(v_booking),
    'reschedule', to_jsonb(v_reschedule),
    'flight', to_jsonb(v_new_flight),
    'seat', jsonb_build_object(
      'id', v_new_seat.id,
      'seat_number', v_new_seat.seat_number,
      'class', v_new_seat.class,
      'extra_fee', v_new_seat.extra_fee
    )
  );
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'new_seat_already_reserved'
      USING ERRCODE = 'P0001';
END;
$$;

COMMENT ON FUNCTION public.reschedule_booking(uuid, uuid, uuid) IS
  'Moves a confirmed booking to another flight on the same route with row-level locking.';

REVOKE ALL ON FUNCTION public.reschedule_booking(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reschedule_booking(uuid, uuid, uuid) TO authenticated;

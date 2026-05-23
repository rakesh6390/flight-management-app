-- Atomic booking cancellation with seat release

CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  uuid;
  v_booking  public.bookings%ROWTYPE;
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

  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'booking_already_cancelled'
      USING ERRCODE = 'P0001';
  END IF;

  IF v_booking.status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'booking_not_cancellable'
      USING ERRCODE = 'P0001',
        HINT = format('booking status is %s', v_booking.status);
  END IF;

  -- Triggers enforce 2-hour rule and release confirmed seats; pending needs explicit release
  UPDATE public.bookings
  SET status = 'cancelled'
  WHERE id = p_booking_id
  RETURNING * INTO v_booking;

  IF v_booking.status = 'cancelled' THEN
    UPDATE public.seats
    SET is_available = true
    WHERE id = v_booking.seat_id
      AND NOT EXISTS (
        SELECT 1
        FROM public.bookings b
        WHERE b.seat_id = v_booking.seat_id
          AND b.id <> v_booking.id
          AND b.status IN ('pending', 'confirmed')
      );
  END IF;

  RETURN jsonb_build_object('booking', to_jsonb(v_booking));
EXCEPTION
  WHEN SQLSTATE 'P0001' THEN
    RAISE;
END;
$$;

COMMENT ON FUNCTION public.cancel_booking(uuid) IS
  'Atomically cancels an owned booking and frees the seat when safe.';

REVOKE ALL ON FUNCTION public.cancel_booking(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO authenticated;

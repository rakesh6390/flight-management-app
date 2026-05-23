-- Block booking cancellation within 2 hours of scheduled departure

CREATE OR REPLACE FUNCTION public.prevent_late_cancellation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_departs_at timestamptz;
BEGIN
  IF OLD.status = 'cancelled' OR NEW.status <> 'cancelled' THEN
    RETURN NEW;
  END IF;

  SELECT departs_at
  INTO v_departs_at
  FROM public.flights
  WHERE id = NEW.flight_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'flight_not_found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_departs_at <= now() + interval '2 hours' THEN
    RAISE EXCEPTION 'cancellation_not_allowed_within_2_hours_of_departure'
      USING ERRCODE = 'P0001',
        HINT = format(
          'departure is at %s; cancellations must be made more than 2 hours before departure',
          v_departs_at
        );
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_late_cancellation() IS
  'Rejects booking updates to cancelled when departure is within the next 2 hours.';

CREATE TRIGGER bookings_prevent_late_cancellation
  BEFORE UPDATE OF status ON public.bookings
  FOR EACH ROW
  WHEN (
    OLD.status IS DISTINCT FROM 'cancelled'
    AND NEW.status = 'cancelled'
  )
  EXECUTE FUNCTION public.prevent_late_cancellation();

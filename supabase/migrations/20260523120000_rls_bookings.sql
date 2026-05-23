-- Row Level Security: users may only access their own bookings (and related rows)

-- ---------------------------------------------------------------------------
-- Helper: true when the booking belongs to the current user
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_own_booking(booking_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE id = booking_uuid
      AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_own_booking(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_own_booking(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings FORCE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_own"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "bookings_insert_own"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookings_update_own"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookings_delete_own"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- passengers (scoped via booking ownership)
-- ---------------------------------------------------------------------------

ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers FORCE ROW LEVEL SECURITY;

CREATE POLICY "passengers_select_own_booking"
  ON public.passengers
  FOR SELECT
  TO authenticated
  USING (public.is_own_booking(booking_id));

CREATE POLICY "passengers_insert_own_booking"
  ON public.passengers
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_own_booking(booking_id));

CREATE POLICY "passengers_update_own_booking"
  ON public.passengers
  FOR UPDATE
  TO authenticated
  USING (public.is_own_booking(booking_id))
  WITH CHECK (public.is_own_booking(booking_id));

CREATE POLICY "passengers_delete_own_booking"
  ON public.passengers
  FOR DELETE
  TO authenticated
  USING (public.is_own_booking(booking_id));

-- ---------------------------------------------------------------------------
-- reschedules (scoped via booking ownership)
-- ---------------------------------------------------------------------------

ALTER TABLE public.reschedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedules FORCE ROW LEVEL SECURITY;

CREATE POLICY "reschedules_select_own_booking"
  ON public.reschedules
  FOR SELECT
  TO authenticated
  USING (public.is_own_booking(booking_id));

CREATE POLICY "reschedules_insert_own_booking"
  ON public.reschedules
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_own_booking(booking_id));

CREATE POLICY "reschedules_update_own_booking"
  ON public.reschedules
  FOR UPDATE
  TO authenticated
  USING (public.is_own_booking(booking_id))
  WITH CHECK (public.is_own_booking(booking_id));

CREATE POLICY "reschedules_delete_own_booking"
  ON public.reschedules
  FOR DELETE
  TO authenticated
  USING (public.is_own_booking(booking_id));

-- ---------------------------------------------------------------------------
-- Grants (authenticated clients use the anon key + JWT)
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.passengers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reschedules TO authenticated;

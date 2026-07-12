CREATE OR REPLACE FUNCTION public.delete_owned_event_with_photos(
  p_event_id uuid,
  p_user_id uuid
)
RETURNS TABLE(file_path text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    WITH target_event AS (
      SELECT id
      FROM public.events
      WHERE id = p_event_id
        AND user_id = p_user_id
      FOR UPDATE
    ),
    deleted_photos AS (
      DELETE FROM public.event_photos AS ep
      USING target_event AS te
      WHERE ep.event_id = te.id
        AND ep.user_id = p_user_id
      RETURNING ep.file_path
    ),
    deleted_event AS (
      DELETE FROM public.events AS e
      USING target_event AS te
      WHERE e.id = te.id
        AND e.user_id = p_user_id
      RETURNING e.id
    )
    SELECT dp.file_path
    FROM deleted_photos AS dp
    CROSS JOIN deleted_event AS de
    WHERE dp.file_path IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_owned_event_with_photos(
  p_event_id uuid,
  p_user_id uuid
)
RETURNS TABLE(file_path text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  target_event_id uuid;
  deleted_event_count integer;
  photo_paths text[] := ARRAY[]::text[];
BEGIN
  SELECT e.id
  INTO target_event_id
  FROM public.events AS e
  WHERE e.id = p_event_id
    AND e.user_id = p_user_id
  FOR UPDATE;

  IF target_event_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(array_agg(ep.file_path::text) FILTER (WHERE ep.file_path IS NOT NULL), ARRAY[]::text[])
  INTO photo_paths
  FROM public.event_photos AS ep
  WHERE ep.event_id = target_event_id
    AND ep.user_id = p_user_id;

  DELETE FROM public.event_photos AS ep
  WHERE ep.event_id = target_event_id
    AND ep.user_id = p_user_id;

  DELETE FROM public.events AS e
  WHERE e.id = target_event_id
    AND e.user_id = p_user_id;

  GET DIAGNOSTICS deleted_event_count = ROW_COUNT;

  IF deleted_event_count <> 1 THEN
    RAISE EXCEPTION 'Failed to delete owned event %', p_event_id;
  END IF;

  RETURN QUERY
  SELECT unnest(photo_paths);
END;
$$;

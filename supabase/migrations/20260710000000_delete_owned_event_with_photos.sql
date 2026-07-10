CREATE OR REPLACE FUNCTION public.delete_owned_event_with_photos(p_event_id uuid)
RETURNS TABLE(file_path text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_file_paths text[] := ARRAY[]::text[];
BEGIN
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(
    array_agg(ep.file_path::text) FILTER (WHERE ep.file_path IS NOT NULL),
    ARRAY[]::text[]
  )
  INTO v_file_paths
  FROM public.event_photos ep
  INNER JOIN public.events e ON e.id = ep.event_id
  WHERE e.id = p_event_id
    AND e.user_id = v_user_id
    AND ep.user_id = v_user_id;

  DELETE FROM public.event_photos ep
  USING public.events e
  WHERE ep.event_id = e.id
    AND e.id = p_event_id
    AND e.user_id = v_user_id
    AND ep.user_id = v_user_id;

  DELETE FROM public.events e
  WHERE e.id = p_event_id
    AND e.user_id = v_user_id;

  RETURN QUERY
  SELECT unnest(v_file_paths);
END;
$$;

REVOKE ALL ON FUNCTION public.delete_owned_event_with_photos(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_owned_event_with_photos(uuid) TO authenticated;

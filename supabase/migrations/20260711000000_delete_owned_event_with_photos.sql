CREATE OR REPLACE FUNCTION public.delete_owned_event_with_photos(target_event_id uuid)
RETURNS TABLE(file_path text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  owned_photo_paths text[];
BEGIN
  SELECT COALESCE(array_agg(ep.file_path::text) FILTER (WHERE ep.file_path IS NOT NULL), ARRAY[]::text[])
  INTO owned_photo_paths
  FROM public.event_photos ep
  INNER JOIN public.events e ON e.id = ep.event_id
  WHERE e.id = target_event_id
    AND e.user_id = auth.uid()
    AND ep.user_id = auth.uid();

  DELETE FROM public.event_photos ep
  USING public.events e
  WHERE ep.event_id = e.id
    AND e.id = target_event_id
    AND e.user_id = auth.uid()
    AND ep.user_id = auth.uid();

  DELETE FROM public.events e
  WHERE e.id = target_event_id
    AND e.user_id = auth.uid();

  RETURN QUERY
  SELECT unnest(owned_photo_paths);
END;
$$;

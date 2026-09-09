/**
 * Birth events anchor the timeline. Shared detection used by API guards and UI.
 */
export function isBirthEventRecord(event: {
  type?: string | null;
  event_types?: { name?: string | null } | Array<{ name?: string | null }> | null;
} | null | undefined): boolean {
  if (!event) return false;
  const eventType = Array.isArray(event.event_types) ? event.event_types[0] : event.event_types;
  return event.type === 'birth' || eventType?.name === 'birth';
}

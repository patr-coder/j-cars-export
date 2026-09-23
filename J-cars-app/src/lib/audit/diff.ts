export type FieldChange = { field: string; before: unknown; after: unknown };

type Row = Record<string, unknown> | null;

export function changedFields(before: Row, after: Row): FieldChange[] {
  const fields = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  fields.delete("updated_at");

  const changes: FieldChange[] = [];
  for (const field of fields) {
    const b = before?.[field];
    const a = after?.[field];
    if (JSON.stringify(b) !== JSON.stringify(a)) changes.push({ field, before: b, after: a });
  }
  return changes;
}

/**
 * Vehicle detail URLs are a single slug segment (`/cars/[slug]`, Phase 0's
 * existing route — see DECISIONS.md for why this isn't nested per-make/model
 * folders): `{makeSlug}-{modelSlug}-{refNo}`. `ref_no` is always exactly two
 * hyphen-joined tokens (e.g. `JC-0001`), so the *last two* tokens of the
 * slug are the ref, regardless of how many hyphens the make/model slugs
 * themselves contain (e.g. "cr-v", "land-cruiser").
 */
export function buildVehicleSlug(params: {
  makeSlug: string;
  modelSlug: string;
  refNo: string;
}): string {
  return `${params.makeSlug}-${params.modelSlug}-${params.refNo.toLowerCase()}`;
}

export function parseRefFromSlug(slug: string): string {
  return slug.split("-").slice(-2).join("-").toUpperCase();
}

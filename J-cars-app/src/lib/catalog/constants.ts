// Pure constants, safe to import from Client Components — kept separate
// from queries.ts, which pulls in the server-only Supabase client.
export const BODY_TYPES = [
  "suv",
  "sedan",
  "van",
  "truck",
  "bus",
  "hatchback",
  "coupe",
  "wagon",
  "pickup",
  "machinery",
] as const;

export const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric", "lpg"] as const;
export const TRANSMISSIONS = ["manual", "automatic", "cvt"] as const;
export const DRIVE_TYPES = ["fwd", "rwd", "awd", "4wd"] as const;
export const STEERING_SIDES = ["left", "right"] as const;
export const VEHICLE_STATUSES = ["available", "reserved", "sold", "in_transit"] as const;

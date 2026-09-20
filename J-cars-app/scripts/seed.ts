/**
 * Phase 0 dev seed data (spec §21). Run via `npm run seed` (or
 * `npm run db:reset` to reset + reseed in one step). Idempotent: safe to
 * re-run against a database that already has this seed data.
 *
 * Uses the service-role client because seeded staff/client accounts need
 * real auth.users rows created through auth.admin.createUser() — the
 * supported, version-stable way to create a user with a password. A raw
 * INSERT into auth.users would work today but is an internal-schema hack
 * that can break across GoTrue/CLI upgrades. See DECISIONS.md.
 */
import { createAdminSupabaseClient } from "../src/lib/supabase/admin-client";
import type { Database } from "../src/types/database";

type Tables = Database["public"]["Tables"];

const DEV_PASSWORD = "DevPassword123!";
// Set SEED_AUTH_USERS=false to seed catalog/reference data only — e.g.
// against a hosted project you don't want a shared dev password on.
const SEED_AUTH_USERS = process.env.SEED_AUTH_USERS !== "false";

const supabase = createAdminSupabaseClient();

// Supabase's query builder needs the table name as a literal to resolve
// the right row type — routing it through a generic `upsert<T>(table: T, ...)`
// collapses that to a union Postgrest can't type-check. So each call site
// keeps its own literal `.from("table")` call; this just centralizes the
// repeated "throw on error, otherwise unwrap data" part.
function orThrow<T>(
  label: string,
  result: { data: T | null; error: { message: string } | null },
): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data as T;
}

async function getOrCreateAuthUser(
  email: string,
  fullName: string,
): Promise<string> {
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password: DEV_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
  if (!createError) return created.user.id;

  // Already seeded on a previous run (no `supabase db reset` in between).
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const existing = data.users.find((u) => u.email === email);
    if (existing) return existing.id;
    if (data.users.length === 0) break;
    page += 1;
  }
  throw new Error(`Could not create or find auth user ${email}`);
}

async function main() {
  // 1. countries -> ports ---------------------------------------------
  const countries = orThrow(
    "countries",
    await supabase
      .from("countries")
      .upsert(
        [
          { name: "United States", iso_code: "US", currency: "USD" },
          { name: "Kenya", iso_code: "KE", currency: "KES" },
          { name: "Tanzania", iso_code: "TZ", currency: "TZS" },
          { name: "United Arab Emirates", iso_code: "AE", currency: "AED" },
          { name: "Jamaica", iso_code: "JM", currency: "JMD" },
        ],
        { onConflict: "iso_code" },
      )
      .select(),
  );
  const countryId = (iso: string) =>
    countries.find((c) => c.iso_code === iso)!.id;

  const ports = orThrow(
    "ports",
    await supabase
      .from("ports")
      .upsert(
        [
          { country_id: countryId("US"), name: "Baltimore", code: "USBAL", active: true },
          { country_id: countryId("US"), name: "Los Angeles", code: "USLAX", active: true },
          { country_id: countryId("KE"), name: "Mombasa", code: "KEMBA", active: true },
          { country_id: countryId("KE"), name: "Lamu", code: "KELAM", active: true },
          { country_id: countryId("TZ"), name: "Dar es Salaam", code: "TZDAR", active: true },
          { country_id: countryId("TZ"), name: "Zanzibar", code: "TZZNZ", active: true },
          { country_id: countryId("AE"), name: "Jebel Ali", code: "AEJEA", active: true },
          { country_id: countryId("AE"), name: "Sharjah", code: "AESHJ", active: true },
          { country_id: countryId("JM"), name: "Kingston", code: "JMKIN", active: true },
          { country_id: countryId("JM"), name: "Montego Bay", code: "JMMBJ", active: true },
        ],
        { onConflict: "code" },
      )
      .select(),
  );
  const portId = (code: string) => ports.find((p) => p.code === code)!.id;

  // 2. locations (export yards) ----------------------------------------
  // No natural unique key in the spec's schema, so these upsert on
  // (country, city, yard_name) via a manual existence check instead.
  const locationSeeds = [
    { country: "Japan", city: "Yokohama", yard_name: "Yokohama Yard A" },
    { country: "Japan", city: "Nagoya", yard_name: "Nagoya Yard B" },
    { country: "Japan", city: "Osaka", yard_name: "Osaka Yard C" },
  ];
  const locations: { id: string; yard_name: string }[] = [];
  for (const seed of locationSeeds) {
    const { data: existing } = await supabase
      .from("locations")
      .select("id, yard_name")
      .eq("yard_name", seed.yard_name)
      .maybeSingle();
    if (existing) {
      locations.push(existing);
      continue;
    }
    const { data: inserted, error } = await supabase
      .from("locations")
      .insert(seed)
      .select("id, yard_name")
      .single();
    if (error) throw new Error(`locations: ${error.message}`);
    locations.push(inserted);
  }
  const locationId = (yard: string) =>
    locations.find((l) => l.yard_name === yard)!.id;

  // 3. makes -> models ---------------------------------------------------
  const makes = orThrow(
    "makes",
    await supabase
      .from("makes")
      .upsert(
        [
          { name: "Toyota", slug: "toyota" },
          { name: "Nissan", slug: "nissan" },
          { name: "Honda", slug: "honda" },
          { name: "Mazda", slug: "mazda" },
          { name: "Suzuki", slug: "suzuki" },
          { name: "Mitsubishi", slug: "mitsubishi" },
          { name: "Subaru", slug: "subaru" },
          { name: "Isuzu", slug: "isuzu" },
        ],
        { onConflict: "slug" },
      )
      .select(),
  );
  const makeId = (slug: string) => makes.find((m) => m.slug === slug)!.id;

  const modelSeeds: { make: string; name: string; slug: string }[] = [
    { make: "toyota", name: "Corolla", slug: "corolla" },
    { make: "toyota", name: "Land Cruiser", slug: "land-cruiser" },
    { make: "toyota", name: "Hiace", slug: "hiace" },
    { make: "toyota", name: "Vitz", slug: "vitz" },
    { make: "nissan", name: "X-Trail", slug: "x-trail" },
    { make: "nissan", name: "Note", slug: "note" },
    { make: "nissan", name: "Serena", slug: "serena" },
    { make: "honda", name: "Fit", slug: "fit" },
    { make: "honda", name: "CR-V", slug: "cr-v" },
    { make: "honda", name: "Vezel", slug: "vezel" },
    { make: "mazda", name: "Demio", slug: "demio" },
    { make: "mazda", name: "CX-5", slug: "cx-5" },
    { make: "suzuki", name: "Swift", slug: "swift" },
    { make: "suzuki", name: "Escudo", slug: "escudo" },
    { make: "mitsubishi", name: "Pajero", slug: "pajero" },
    { make: "mitsubishi", name: "Outlander", slug: "outlander" },
    { make: "subaru", name: "Forester", slug: "forester" },
    { make: "subaru", name: "Impreza", slug: "impreza" },
    { make: "isuzu", name: "D-Max", slug: "d-max" },
    { make: "isuzu", name: "MU-X", slug: "mu-x" },
  ];
  const models = orThrow(
    "models",
    await supabase
      .from("models")
      .upsert(
        modelSeeds.map((m) => ({
          make_id: makeId(m.make),
          name: m.name,
          slug: m.slug,
        })),
        { onConflict: "make_id,slug" },
      )
      .select(),
  );

  // 4. shipping_rates ----------------------------------------------------
  const roroPorts = ["USBAL", "KEMBA", "TZDAR", "AEJEA", "JMKIN"];
  const containerPorts = ["USLAX", "KELAM", "TZZNZ", "AESHJ", "JMMBJ"];
  const shippingRateRows: Tables["shipping_rates"]["Insert"][] = [
    ...roroPorts.map((code, i) => ({
      origin_location_id: locationId("Yokohama Yard A"),
      destination_port_id: portId(code),
      method: "roro" as const,
      base_cost_usd: 900 + i * 50,
      insurance_rate: 0.02,
      active: true,
    })),
    ...containerPorts.map((code, i) => ({
      origin_location_id: locationId("Nagoya Yard B"),
      destination_port_id: portId(code),
      method: "container" as const,
      base_cost_usd: 1500 + i * 75,
      m3_rate: 45,
      insurance_rate: 0.02,
      active: true,
    })),
  ];
  // No natural unique key on shipping_rates either; scope idempotency to
  // (destination_port_id, method) for this seed's purposes.
  for (const row of shippingRateRows) {
    const { data: existing } = await supabase
      .from("shipping_rates")
      .select("id")
      .eq("destination_port_id", row.destination_port_id)
      .eq("method", row.method)
      .maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from("shipping_rates").insert(row);
    if (error) throw new Error(`shipping_rates: ${error.message}`);
  }

  // 5. auth users + profile roles ----------------------------------------
  if (SEED_AUTH_USERS) {
    const adminId = await getOrCreateAuthUser("admin@jcars.dev", "Admin User");
    const salesId = await getOrCreateAuthUser("sales@jcars.dev", "Sales Rep");
    const inventoryId = await getOrCreateAuthUser(
      "inventory@jcars.dev",
      "Inventory Manager",
    );
    await getOrCreateAuthUser("client1@jcars.dev", "Client One");
    await getOrCreateAuthUser("client2@jcars.dev", "Client Two");

    for (const [id, role] of [
      [adminId, "admin"],
      [salesId, "sales"],
      [inventoryId, "inventory_manager"],
    ] as const) {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id);
      if (error) throw new Error(`profiles role update: ${error.message}`);
    }
  }

  // 6. vehicles ------------------------------------------------------------
  const fuelTypes = ["petrol", "diesel", "hybrid"] as const;
  const transmissions = ["manual", "automatic", "cvt"] as const;
  const driveTypes = ["fwd", "rwd", "awd", "4wd"] as const;
  const bodyTypes = [
    "suv", "sedan", "van", "hatchback", "wagon", "pickup",
  ] as const;
  const colors = ["White", "Black", "Silver", "Blue", "Red", "Grey"];
  const yardNames = locations.map((l) => l.yard_name);

  const vehicleRows = Array.from({ length: 30 }, (_, i) => {
    const model = modelSeeds[i % modelSeeds.length];
    const modelRow = models.find(
      (m) => m.slug === model.slug && m.make_id === makeId(model.make),
    )!;
    return {
      ref_no: `JC-${String(i + 1).padStart(4, "0")}`,
      make_id: makeId(model.make),
      model_id: modelRow.id,
      year: 2015 + (i % 10),
      price_usd: 6000 + i * 350,
      mileage_km: 30000 + i * 4000,
      fuel_type: fuelTypes[i % fuelTypes.length],
      transmission: transmissions[i % transmissions.length],
      drive_type: driveTypes[i % driveTypes.length],
      steering_side: "right" as const,
      body_type: bodyTypes[i % bodyTypes.length],
      color: colors[i % colors.length],
      seats: 5,
      doors: 4,
      location_id: locationId(yardNames[i % yardNames.length]),
      status: "available" as const,
      published: true,
      featured: i % 7 === 0,
    };
  });
  orThrow(
    "vehicles",
    await supabase
      .from("vehicles")
      .upsert(vehicleRows, { onConflict: "ref_no" })
      .select(),
  );

  console.log("Seed complete:", {
    countries: countries.length,
    ports: ports.length,
    locations: locations.length,
    makes: makes.length,
    models: models.length,
    shipping_rates: shippingRateRows.length,
    vehicles: vehicleRows.length,
    authUsersSeeded: SEED_AUTH_USERS,
    devPassword: SEED_AUTH_USERS ? DEV_PASSWORD : undefined,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { createLocation, createMake, createModel, deleteLocation, deleteMake, deleteModel } from "@/actions/catalog";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLocations, getMakes, getModels } from "@/lib/catalog/queries";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [makes, models, locations] = await Promise.all([getMakes(), getModels(), getLocations()]);
  const makeName = new Map(makes.map((m) => [m.id, m.name]));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Catalog</h1>
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Makes</h2>
        <ul className="flex flex-col divide-y rounded-xl border">
          {makes.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>
                {m.name} <span className="text-muted-foreground">({m.slug})</span>
              </span>
              <form action={deleteMake.bind(null, m.id)}>
                <ConfirmSubmitButton
                  type="submit"
                  size="xs"
                  variant="destructive"
                  confirmMessage={`Delete make "${m.name}"?`}
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
        <form action={createMake} className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="make-name">New make</Label>
            <Input id="make-name" name="name" placeholder="Toyota" required />
          </div>
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Models</h2>
        <ul className="flex flex-col divide-y rounded-xl border">
          {models.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>
                {makeName.get(m.makeId) ?? "—"} {m.name}{" "}
                <span className="text-muted-foreground">({m.slug})</span>
              </span>
              <form action={deleteModel.bind(null, m.id)}>
                <ConfirmSubmitButton
                  type="submit"
                  size="xs"
                  variant="destructive"
                  confirmMessage={`Delete model "${m.name}"?`}
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
        <form action={createModel} className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="model-make">Make</Label>
            <select id="model-make" name="makeId" required className={selectClassName}>
              <option value="" disabled>
                Select make
              </option>
              {makes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="model-name">New model</Label>
            <Input id="model-name" name="name" placeholder="Corolla" required />
          </div>
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Locations</h2>
        <ul className="flex flex-col divide-y rounded-xl border">
          {locations.map((l) => (
            <li key={l.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>
                {l.city}, {l.country}
              </span>
              <form action={deleteLocation.bind(null, l.id)}>
                <ConfirmSubmitButton
                  type="submit"
                  size="xs"
                  variant="destructive"
                  confirmMessage={`Delete location "${l.city}, ${l.country}"?`}
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
        <form action={createLocation} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="location-country">Country</Label>
            <Input id="location-country" name="country" placeholder="Japan" required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="location-city">City</Label>
            <Input id="location-city" name="city" placeholder="Yokohama" required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="location-yard">Yard name</Label>
            <Input id="location-yard" name="yardName" placeholder="Yokohama Yard" required />
          </div>
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      </section>
    </div>
  );
}

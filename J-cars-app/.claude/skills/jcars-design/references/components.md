# J-cars interface patterns

## Public website

- Header: full logo on a white surface, concise navigation, language/currency controls when needed, and one primary CTA.
- Hero: value proposition, a vehicle-search action, and one strong automotive image. Keep headline width readable.
- Trust layer: inspection, secure payment, shipping support, and international reach supported by specific evidence.
- Footer: company, inventory, buying guide, shipping, support, policies, and verified contact details.

## Vehicle catalogue

- Put search, make/model, price, year, mileage, fuel, transmission, steering, and availability filters within easy reach.
- Preserve active filters visibly and support a clear-all action.
- Vehicle cards must prioritize image, make/model, year, price, mileage, transmission, location, and availability.
- Keep card actions predictable: view details as primary; compare, favorite, and share as secondary.
- On mobile, use a compact filter summary and an accessible filter drawer.

## Vehicle detail

- Use a responsive gallery with thumbnails and image count.
- Keep price, stock number, status, core specifications, inquiry, and purchase/export actions prominent.
- Group detailed specifications into logical sections rather than one unstructured list.
- Provide shipping estimate context, inspection information, document status, and transparent next steps where data exists.
- Use a sticky inquiry/purchase action on mobile only when it does not hide content or keyboard controls.

## Forms and checkout/inquiry flows

- Use persistent labels; never rely on placeholder-only inputs.
- Group fields into short stages and show progress for multi-step flows.
- Validate near the field, preserve entered data, and explain how to recover from errors.
- Clearly distinguish required and optional fields.
- Show confirmation, reference number, and expected next action after submission.

## Customer portal

- Lead with active orders, payment/document status, shipment progress, messages, and next required action.
- Represent multi-stage progress with text labels and dates, not color alone.
- Make document upload requirements, file constraints, and verification status explicit.

## Admin dashboard

- Use a compact left navigation on desktop and a drawer on mobile.
- Summary cards must answer operational questions, not merely decorate the page.
- Tables need a clear title, search, relevant filters, sortable columns, pagination, row actions, loading state, empty state, and error state.
- Freeze headers or key columns only where it materially improves large datasets.
- Confirm destructive actions and communicate whether they are reversible.
- Charts must have a decision-making purpose, accessible labels, and a table or textual fallback when necessary.

## Core component states

Every interactive component must define default, hover, focus-visible, active, disabled, loading, success, and error states as applicable. Focus rings use a visible brand-blue outline with sufficient offset. Do not remove native focus without an equivalent replacement.
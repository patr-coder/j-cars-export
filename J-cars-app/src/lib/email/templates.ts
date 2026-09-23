import { formatCurrency } from "@/lib/currency/format";

// `name` comes straight from an anonymous, unauthenticated form
// (submitInquiry) — escape it before interpolating into HTML we send to a
// third party. Everything else interpolated below (vehicleLabel, amounts,
// dates) is server-derived, not user input.
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Plain HTML strings, not react-email — each template is a few lines of
// markup, not enough to justify a templating dependency.
const WRAP = (title: string, body: string) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
    <h1 style="font-size: 18px;">${title}</h1>
    ${body}
    <p style="margin-top: 24px; color: #666; font-size: 13px;">J-cars Exports</p>
  </div>
`;

export function welcomeEmail(params: { name: string }) {
  const subject = "Welcome to J-cars Exports";
  const html = WRAP(
    "Welcome aboard",
    `
      <p>Hi ${escapeHtml(params.name)},</p>
      <p>
        Your account is ready. Browse our stock, save favorites, and request a quote whenever
        you're ready — we're here to help with the whole export process.
      </p>
    `,
  );
  return { subject, html };
}

export function reservationConfirmedEmail(params: {
  name: string;
  vehicleLabel: string;
  orderNo: string;
  totalUsd: number;
  reservedUntil: string | null;
}) {
  const subject = `Reservation confirmed — ${params.vehicleLabel}`;
  const html = WRAP(
    "Reservation confirmed",
    `
      <p>Hi ${escapeHtml(params.name)},</p>
      <p>
        We've reserved the ${params.vehicleLabel} for you (order ${params.orderNo}), total
        ${formatCurrency(params.totalUsd)}.
      </p>
      ${
        params.reservedUntil
          ? `<p style="color: #666; font-size: 13px;">This hold is valid until ${new Date(params.reservedUntil).toLocaleString()} — our team will follow up before then.</p>`
          : ""
      }
    `,
  );
  return { subject, html };
}

export function inquiryReceivedEmail(params: { name: string; vehicleLabel: string | null }) {
  const subject = "We've received your request — J-cars Exports";
  const html = WRAP(
    "Thanks for reaching out",
    `
      <p>Hi ${escapeHtml(params.name)},</p>
      <p>
        We've received your request${params.vehicleLabel ? ` about the ${params.vehicleLabel}` : ""}.
        A member of our team will get back to you shortly.
      </p>
    `,
  );
  return { subject, html };
}

export function quoteReadyEmail(params: {
  name: string;
  vehicleLabel: string;
  vehiclePrice: number;
  freight: number;
  insurance: number;
  inspection: number;
  certificate: number;
  otherFees: number;
  discount: number;
  totalUsd: number;
  expiresAt: string | null;
}) {
  const rows: { label: string; amount: number }[] = [
    { label: "Vehicle price", amount: params.vehiclePrice },
    { label: "Freight", amount: params.freight },
    { label: "Insurance", amount: params.insurance },
    { label: "Inspection", amount: params.inspection },
    { label: "Certificate", amount: params.certificate },
    { label: "Other fees (incl. local / export)", amount: params.otherFees },
    { label: "Discount", amount: -params.discount },
  ].filter((row) => row.amount !== 0);

  const subject = `Your quote for the ${params.vehicleLabel} is ready`;
  const html = WRAP(
    "Your quote is ready",
    `
      <p>Hi ${escapeHtml(params.name)},</p>
      <p>Here is your quote for the ${params.vehicleLabel}:</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${rows
          .map(
            ({ label, amount }) => `
              <tr>
                <td style="padding: 4px 0; color: #555;">${label}</td>
                <td style="padding: 4px 0; text-align: right;">${formatCurrency(amount)}</td>
              </tr>
            `,
          )
          .join("")}
        <tr style="border-top: 1px solid #ddd; font-weight: 600;">
          <td style="padding: 8px 0;">Total</td>
          <td style="padding: 8px 0; text-align: right;">${formatCurrency(params.totalUsd)}</td>
        </tr>
      </table>
      ${
        params.expiresAt
          ? `<p style="color: #666; font-size: 13px;">This quote is valid until ${new Date(params.expiresAt).toLocaleDateString()}.</p>`
          : ""
      }
    `,
  );
  return { subject, html };
}

export function paymentReceivedEmail(params: { name: string; orderNo: string; amount: number }) {
  const subject = `Payment proof received — order ${params.orderNo}`;
  const html = WRAP(
    "We've received your payment proof",
    `
      <p>Hi ${escapeHtml(params.name)},</p>
      <p>
        Thanks — we've received your proof of payment of ${formatCurrency(params.amount)} for order
        ${params.orderNo}. Our team will confirm it once the transfer reaches our account.
      </p>
    `,
  );
  return { subject, html };
}

export function paymentVerifiedEmail(params: {
  name: string;
  orderNo: string;
  amount: number;
  remainingUsd: number;
}) {
  const subject = `Payment confirmed — order ${params.orderNo}`;
  const html = WRAP(
    "Payment confirmed",
    `
      <p>Hi ${escapeHtml(params.name)},</p>
      <p>We've confirmed your payment of ${formatCurrency(params.amount)} for order ${params.orderNo}.</p>
      <p>
        ${
          params.remainingUsd > 0
            ? `Remaining balance: ${formatCurrency(params.remainingUsd)}.`
            : "Your order is now fully paid — we'll start preparing your vehicle for export."
        }
      </p>
    `,
  );
  return { subject, html };
}

// `reason` is typed by staff — escaped like any other free text.
export function paymentRejectedEmail(params: {
  name: string;
  orderNo: string;
  amount: number;
  reason: string;
}) {
  const subject = `Payment proof needs attention — order ${params.orderNo}`;
  const html = WRAP(
    "We couldn't confirm your payment",
    `
      <p>Hi ${escapeHtml(params.name)},</p>
      <p>
        We couldn't confirm the payment of ${formatCurrency(params.amount)} you submitted for order
        ${params.orderNo}.
      </p>
      <p><strong>Reason:</strong> ${escapeHtml(params.reason)}</p>
      <p>You can upload a new proof from your account.</p>
    `,
  );
  return { subject, html };
}

export function vehicleShippedEmail(params: {
  name: string;
  orderNo: string;
  vehicleLabel: string;
  vesselName: string | null;
  eta: string | null;
}) {
  const subject = `Your ${params.vehicleLabel} has shipped`;
  const html = WRAP(
    "Your vehicle is on its way",
    `
      <p>Hi ${escapeHtml(params.name)},</p>
      <p>
        The ${params.vehicleLabel} (order ${params.orderNo}) has shipped${
          params.vesselName ? ` aboard the ${escapeHtml(params.vesselName)}` : ""
        }.
      </p>
      ${params.eta ? `<p>Estimated arrival: ${new Date(params.eta).toLocaleDateString()}.</p>` : ""}
      <p>Track its progress and download your shipping documents from your account.</p>
    `,
  );
  return { subject, html };
}

export function etaUpdatedEmail(params: { name: string; orderNo: string; eta: string }) {
  const subject = `Updated arrival date — order ${params.orderNo}`;
  const html = WRAP(
    "Estimated arrival updated",
    `
      <p>Hi ${escapeHtml(params.name)},</p>
      <p>
        The estimated arrival date for order ${params.orderNo} is now
        ${new Date(params.eta).toLocaleDateString()}.
      </p>
    `,
  );
  return { subject, html };
}

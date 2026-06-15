import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Generic types ───────────────────────────────────────

type OrderItem = {
	name: string;
	price: string;
	quantity: number;
	image: string;
};

type StoreConfig = {
	name: string;
	from: string;
	ordersUrl: string;
	colors?: {
		primary?: string;
		background?: string;
		text?: string;
		muted?: string;
		border?: string;
	};
};

type OrderEmailData = {
	to: string;
	customerName: string;
	orderId: string;
	total: string;
	items: OrderItem[];
};

// ─── Email builder ───────────────────────────────────────

export async function sendOrderConfirmationEmail(store: StoreConfig, order: OrderEmailData) {
	const c = {
		primary: store.colors?.primary ?? "#0f172a",
		background: store.colors?.background ?? "#f8fafc",
		text: store.colors?.text ?? "#0f172a",
		muted: store.colors?.muted ?? "#64748b",
		border: store.colors?.border ?? "#e2e8f0"
	};

	const itemRows = order.items
		.map(
			item =>
				`<tr>
          <td style="padding:12px 8px;border-bottom:1px solid ${c.border};">
            <img src="${item.image}" alt="${item.name}" width="48" height="48" style="border-radius:8px;object-fit:cover;" />
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid ${c.border};font-size:14px;color:${c.text};">
            ${item.name}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid ${c.border};font-size:14px;text-align:center;color:${c.text};">
            ${item.quantity}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid ${c.border};font-size:14px;text-align:right;color:${c.text};">
            $${(Number(item.price) * item.quantity).toFixed(2)}
          </td>
        </tr>`
		)
		.join("");

	const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="text-align:center;padding:24px 0;border-bottom:2px solid ${c.border};">
        <h1 style="margin:0;font-size:24px;color:${c.text};">Order Confirmed! ✓</h1>
        <p style="margin:8px 0 0;font-size:13px;color:${c.muted};">${store.name}</p>
      </div>

      <div style="padding:24px 0;">
        <p style="font-size:16px;color:${c.text};">Hi ${order.customerName},</p>
        <p style="font-size:14px;color:${c.muted};">
          Thank you for your purchase. Here's a summary of your order.
        </p>
      </div>

      <div style="background:${c.background};border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;color:${c.muted};text-transform:uppercase;letter-spacing:0.05em;">Order ID</p>
        <p style="margin:0;font-size:14px;color:${c.text};font-family:monospace;">${order.orderId}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid ${c.border};">
            <th style="padding:8px;text-align:left;font-size:12px;color:${c.muted};text-transform:uppercase;"></th>
            <th style="padding:8px;text-align:left;font-size:12px;color:${c.muted};text-transform:uppercase;">Product</th>
            <th style="padding:8px;text-align:center;font-size:12px;color:${c.muted};text-transform:uppercase;">Qty</th>
            <th style="padding:8px;text-align:right;font-size:12px;color:${c.muted};text-transform:uppercase;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div style="text-align:right;padding:16px 8px;border-top:2px solid ${c.text};margin-top:8px;">
        <span style="font-size:16px;font-weight:700;color:${c.text};">Total: $${Number(order.total).toFixed(2)}</span>
      </div>

      <div style="text-align:center;padding:32px 0 16px;">
        <a href="${store.ordersUrl}" style="display:inline-block;background:${c.primary};color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
          View My Orders
        </a>
      </div>

      <div style="text-align:center;padding:16px 0;border-top:1px solid ${c.border};">
        <p style="font-size:12px;color:${c.muted};margin:0;">
          This email was sent by ${store.name}.
        </p>
      </div>
    </div>
  `;

	const { error } = await resend.emails.send({
		from: store.from,
		to: order.to,
		subject: `Order Confirmed — ${order.orderId.slice(0, 8)}`,
		html
	});

	if (error) {
		console.error(`[${store.name}] Failed to send confirmation email:`, error);
	}
}

import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ordPath = () => path.join(process.cwd(), "data", "orders.json");

function readOrders() {
  try {
    const p = ordPath();
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return [];
  }
}

function writeOrders(data) {
  try {
    fs.writeFileSync(ordPath(), JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    // Read-only filesystem in Vercel serverless environment
  }
}

const getBackendUrl = () => {
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
  return url.replace(/\/+$/, "");
};

export async function GET() {
  const backend = getBackendUrl();
  if (backend) {
    try {
      const res = await fetch(`${backend}/api/orders`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        return Response.json(data, { headers: { "cache-control": "no-store" } });
      }
    } catch (e) {
      console.error("Backend fetch error on GET /api/orders:", e.message);
    }
  }

  const items = readOrders();
  return Response.json(items, { headers: { "cache-control": "no-store" } });
}

export async function POST(req) {
  try {
    const b = await req.json();
    if (!b.customerName || !b.phone || !b.address) {
      return new Response("Customer name, phone and address are required", { status: 400 });
    }
    if (!Array.isArray(b.items) || b.items.length === 0) {
      return new Response("No items in order", { status: 400 });
    }

    const backend = getBackendUrl();
    if (backend) {
      try {
        const res = await fetch(`${backend}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(b)
        });
        if (res.ok) {
          const data = await res.json();
          return Response.json(data, { status: 201 });
        }
      } catch (e) {
        console.error("Backend POST error on /api/orders:", e.message);
      }
    }

    const orders = readOrders();
    const newOrd = {
      id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      customerName: String(b.customerName).trim(),
      phone: String(b.phone).trim(),
      address: String(b.address).trim(),
      notes: b.notes ? String(b.notes).trim() : "",
      items: b.items,
      total: Number(b.total) || 0,
      status: "Received",
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrd);
    writeOrders(orders);
    return Response.json({ ok: true, order: newOrd });
  } catch (err) {
    return new Response("Invalid request", { status: 400 });
  }
}

export async function PATCH(req) {
  try {
    const b = await req.json();
    const backend = getBackendUrl();
    if (backend) {
      try {
        const res = await fetch(`${backend}/api/orders`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(b)
        });
        if (res.ok) {
          const data = await res.json();
          return Response.json(data);
        }
      } catch (e) {
        console.error("Backend PATCH error on /api/orders:", e.message);
      }
    }

    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === b.id);
    if (idx === -1) return new Response("Not found", { status: 404 });
    if (b.status) orders[idx].status = b.status;
    writeOrders(orders);
    return Response.json({ ok: true, order: orders[idx] });
  } catch (err) {
    return new Response("Invalid request", { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response("Missing id", { status: 400 });

    const backend = getBackendUrl();
    if (backend) {
      try {
        const res = await fetch(`${backend}/api/orders?id=${encodeURIComponent(id)}`, {
          method: "DELETE"
        });
        if (res.ok) {
          const data = await res.json();
          return Response.json(data);
        }
      } catch (e) {
        console.error("Backend DELETE error on /api/orders:", e.message);
      }
    }

    const orders = readOrders();
    const filtered = orders.filter((o) => o.id !== id);
    writeOrders(filtered);
    return Response.json({ ok: true });
  } catch (err) {
    return new Response("Invalid request", { status: 400 });
  }
}

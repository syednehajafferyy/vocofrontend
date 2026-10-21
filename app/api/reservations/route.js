import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const resPath = () => path.join(process.cwd(), "data", "reservations.json");

function readReservations() {
  try {
    const p = resPath();
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return [];
  }
}

function writeReservations(data) {
  try {
    fs.writeFileSync(resPath(), JSON.stringify(data, null, 2), "utf8");
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
      const res = await fetch(`${backend}/api/reservations`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        return Response.json(data, { headers: { "cache-control": "no-store" } });
      }
    } catch (e) {
      console.error("Backend fetch error on GET /api/reservations:", e.message);
    }
  }

  const items = readReservations();
  return Response.json(items, { headers: { "cache-control": "no-store" } });
}

export async function POST(req) {
  try {
    const b = await req.json();
    if (!b.name || !b.phone) {
      return new Response("Name and phone are required", { status: 400 });
    }

    const backend = getBackendUrl();
    if (backend) {
      try {
        const res = await fetch(`${backend}/api/reservations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(b)
        });
        if (res.ok) {
          const data = await res.json();
          return Response.json(data, { status: 201 });
        }
      } catch (e) {
        console.error("Backend POST error on /api/reservations:", e.message);
      }
    }

    const items = readReservations();
    const newRes = {
      id: "res_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name: String(b.name).trim(),
      phone: String(b.phone).trim(),
      date: b.date || "",
      time: b.time || "",
      seating: b.seating || "Skyline Edge",
      guests: Number(b.guests) || 2,
      preorder: b.preorder ? String(b.preorder).trim() : "",
      notes: b.notes ? String(b.notes).trim() : "",
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    items.unshift(newRes);
    writeReservations(items);
    return Response.json({ ok: true, reservation: newRes });
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
        const res = await fetch(`${backend}/api/reservations`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(b)
        });
        if (res.ok) {
          const data = await res.json();
          return Response.json(data);
        }
      } catch (e) {
        console.error("Backend PATCH error on /api/reservations:", e.message);
      }
    }

    const items = readReservations();
    const idx = items.findIndex((r) => r.id === b.id);
    if (idx === -1) return new Response("Not found", { status: 404 });
    if (b.status) items[idx].status = b.status;
    writeReservations(items);
    return Response.json({ ok: true, reservation: items[idx] });
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
        const res = await fetch(`${backend}/api/reservations?id=${encodeURIComponent(id)}`, {
          method: "DELETE"
        });
        if (res.ok) {
          const data = await res.json();
          return Response.json(data);
        }
      } catch (e) {
        console.error("Backend DELETE error on /api/reservations:", e.message);
      }
    }

    const items = readReservations();
    const filtered = items.filter((r) => r.id !== id);
    writeReservations(filtered);
    return Response.json({ ok: true });
  } catch (err) {
    return new Response("Invalid request", { status: 400 });
  }
}

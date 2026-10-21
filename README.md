# VOCO Rooftop Restaurant — Frontend Web Application ✨🍸

The official frontend web application for **VOCO Rooftop Restaurant**, built with **Next.js 14 (App Router)** and **Tailwind CSS**.

---

## 🌟 Highlights & Features

- **Luxury Aesthetics & Brand Identity**: Curated dark palette (`#0A120E`, `#224338`, `#C1A278`, `#9EB0AA`) with typography using *Plus Jakarta Sans*, *Syne*, and *Playfair Display*.
- **Interactive Booking Dock**: Table reservation system allowing guests to select seating zone (Skyline Edge, Canopy Booth, Hearth Corner), guest count, date, time, and **pre-order meals** directly via an interactive menu dialog.
- **Dedicated Online Delivery Menu (`/menu`)**:
  - Live food ordering with instant category filtering (Steaks & Robata, Starters & Small Plates, Artisan Flatbreads, Decadent Desserts, Signature Mocktails).
  - Search filter bar with instant query matching.
  - Interactive ordering cart with item count, quantity increment/decrement, and live PKR pricing total.
  - Express Delivery checkout modal capturing customer name, phone number, delivery address, and delivery notes.
- **Admin Dashboard (`/admin`)**:
  - **Table Requests Tab**: Displays all reservation requests with guest counts, seating areas, requested date/time, and pre-ordered meals, with quick status controls (Confirm / Seat / Cancel) and delete actions.
  - **Delivery Orders Tab**: Tracks incoming home delivery orders, delivery addresses, order timestamps, full itemized breakdown, and live fulfillment statuses (Received, Preparing, Out for Delivery, Delivered).
  - **Menu & Zone Content Editor**: Real-time content management for seating zones and featured dishes.
- **Interactive Rooftop Night Canvas**: Floating ember and starlight animation reflecting the rooftop ambiance.
- **Custom Gold Cursor**: Custom luxury cursor with center dot and smooth outer ring physics that dynamically expands on interactive element hover with tactile click responses.
- **Crisp Hover Typography**: Refined transition shifting headings cleanly to signature gold (`#C1A278`) on hover.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) v3 + Vanilla CSS Micro-interactions
- **Typography**: Google Fonts (*Plus Jakarta Sans*, *Syne*, *Playfair Display*, *Jost*)
- **Icons & Graphics**: Embedded SVG vectors & HTML5 Canvas

---

## 📁 Repository Structure

```
vocofrontend/
├── app/
│   ├── route.js              # Homepage route (SSR injected VOCO landing page)
│   ├── menu/route.js         # Dedicated /menu delivery ordering page
│   ├── admin/route.js        # Admin dashboard (protected by cookie auth)
│   ├── admin-login/route.js  # Luxury admin sign-in page
│   └── api/                  # Next.js App Router API proxy handlers
│       ├── content/route.js
│       ├── login/route.js
│       ├── logout/route.js
│       ├── orders/route.js
│       └── reservations/route.js
├── data/
│   ├── content.json          # SSR content, zones, and dishes
│   ├── orders.json           # Delivery orders storage
│   └── reservations.json     # Table reservations storage
├── lib/
│   ├── admin.html            # Admin dashboard UI template
│   ├── auth.js               # Admin session & cookie validation
│   ├── login.html            # Admin login UI template
│   ├── menu.html             # Delivery menu UI template
│   ├── render.js             # SSR page rendering engine
│   └── template.html         # Main landing page UI template
├── .env.example
├── .gitignore
├── next.config.mjs           # Next.js configuration
├── package.json              # Project dependencies and npm scripts
├── postcss.config.mjs        # PostCSS configuration
├── README.md                 # Frontend documentation
└── tailwind.config.mjs       # Tailwind CSS theme extension
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### 2. Installation
```bash
git clone https://github.com/syednehajafferyy/vocofrontend.git
cd vocofrontend
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your admin credentials:
```env
ADMIN_EMAIL=admin@vocorooftop.com
ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Running the Development Server
```bash
npm run dev
```

Open your browser at:
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Delivery Menu**: [http://localhost:3000/menu](http://localhost:3000/menu)
- **Admin Login**: [http://localhost:3000/admin-login](http://localhost:3000/admin-login)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔗 Connecting to the Backend Service

This frontend web app is fully decoupled and can communicate directly with the dedicated **VOCO Backend REST API**:
- **Backend Repo**: [https://github.com/syednehajafferyy/vocobackend](https://github.com/syednehajafferyy/vocobackend)

Set `NEXT_PUBLIC_API_URL=http://localhost:5000` in `.env.local` to direct requests to your deployed backend instance.

---

## 📜 License
ISC License © 2026 VOCO Rooftop Restaurant.
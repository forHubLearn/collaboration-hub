
## Building Materials Store Management System

A frontend-only demo (local storage/mock data) with clean & minimal design, real camera QR scanning, and dashboard notifications.

### Pages & Navigation
- **Sidebar layout** with navigation: Dashboard, POS, Inventory, Taxes, Analytics, Settings
- Role switcher (Admin/Sales toggle) to demo role-based access

### 1. Dashboard
- Summary cards: total products, low stock alerts, today's sales, revenue
- Low stock notification panel showing items below alert threshold
- Quick links to POS and Inventory

### 2. Inventory Management
- Table of all materials: name, unit price, quantity, alert threshold, assigned taxes, QR code
- Add/Edit material form with multi-tax assignment
- Stock quantity update (restock)
- Low stock badge indicators
- Search and filter

### 3. Tax Management
- CRUD for tax types (name, percentage)
- Set default tax
- View which products use each tax

### 4. POS System
- **Two input methods:**
  - Real camera QR scanner (using `html5-qrcode` library) — scans QR → finds product → adds to cart
  - Search bar with auto-suggest dropdown
- **Cart** with editable quantities (+/- buttons), per-item tax breakdown, remove button
- **Checkout summary**: subtotal, total tax, final total
- Complete sale → saves transaction to local storage → clears cart

### 5. Sales & Analytics (Admin only)
- Filter by: weekly, monthly, quarterly, yearly
- Charts (using Recharts): revenue over time, top-selling products
- Summary: total revenue, transaction count
- Export as PDF and XLSX download

### 6. Data & State
- All data stored in localStorage (products, taxes, transactions)
- Seed with sample building materials (cement, steel bars, sand, bricks, etc.)
- Real-time cart updates

### Tech Additions
- `html5-qrcode` for camera-based QR scanning
- `recharts` for analytics charts
- `jspdf` + `jspdf-autotable` for PDF export
- `xlsx` for Excel export

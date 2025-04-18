// resources/js/app.js

// Laravel’s default bootstrap (axios, Echo, etc.)
import "bootstrap";

// ── Third‑party libraries ─────────────────────────────────────────────────────
// Bootstrap JS + Popper
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// Leaflet
// import "leaflet/dist/leaflet.js";
// DataTables
import "datatables.net";
// Chart.js
import Chart from "chart.js/auto";

// ── Your custom dashboard code ─────────────────────────────────────────────────
import './query.js';
import './dashboard.js';
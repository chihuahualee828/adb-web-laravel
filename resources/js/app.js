// resources/js/app.js

// Optional: Chart.js
import Chart from 'chart.js/auto';
window.Chart = Chart;

// // Any custom imports or helpers
// import './drawPieChart.js';
// import './tableManager.js'; // if you're manually building dynamic tables

// ── Bootstrap & dependencies ─────────────────────────────
import 'bootstrap';

// // ── Chart.js ─────────────────────────────────────────────
// import Chart from 'chart.js/auto';
// window.Chart = Chart;

// ── DataTables (Bootstrap 5) ─────────────────────────────
import DataTable from 'datatables.net-bs5';

window.DataTable = DataTable;

// import './drawPieChart.js'; etc.

// // Leaflet
// // import "leaflet/dist/leaflet.js";
// // DataTables
// import "datatables.net";
// // Chart.js
// import Chart from "chart.js/auto";

// ── Your custom dashboard code ─────────────────────────────────────────────────
// import './query.js';
import './dashboard.js';
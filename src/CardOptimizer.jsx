import { useState, useMemo, useEffect } from "react";
// 1. IMPORTAMOS EL HOOK Y EL BANNER DESDE TU ARCHIVO
// Por esto:
import { useSheetData, SyncBanner } from "./useSheetData.jsx";

// ─── PALETA & FUENTES ────────────────────────────────────────────────
const FONT_LINK = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
`;

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --green:   #00C853;
    --green2:  #00A846;
    --blue:    #1976D2;
    --blue2:   #1251A3;
    --navy:    #0D1B3E;
    --bg:      #F4F7FC;
    --card:    #FFFFFF;
    --border:  #E3EAF4;
    --muted:   #7A8BA6;
    --text:    #0D1B3E;
    --radius:  18px;
    --shadow:  0 4px 24px rgba(13,27,62,.09);
    --shadow2: 0 8px 40px rgba(13,27,62,.14);
  }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); }
  h1,h2,h3 { font-family: 'Syne', sans-serif; }
  input { font-family: 'Plus Jakarta Sans', sans-serif; }
  button { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* ── Animaciones ── */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(1.04); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .fade-up { animation: fadeUp .38s ease both; }
  .fade-up-1 { animation: fadeUp .38s ease .07s both; }
  .fade-up-2 { animation: fadeUp .38s ease .14s both; }
  .fade-up-3 { animation: fadeUp .38s ease .21s both; }

  /* ── Top-bar de la app ── */
  .topbar {
    position: sticky; top:0; z-index:40;
    background: var(--card);
    border-bottom: 1px solid var(--border);
    padding: 16px 20px 12px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .topbar-title { font-size: 20px; font-weight: 800; letter-spacing: -.4px; }
  .topbar-avatar {
    width:36px; height:36px; border-radius:50%;
    background: linear-gradient(135deg,var(--green),var(--blue));
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-size:13px; font-weight:700;
  }

  /* ── Bottom Nav ── */
  .bottom-nav {
    position: fixed; bottom:0; left:50%; transform:translateX(-50%);
    width:100%; max-width:430px;
    background: var(--card);
    border-top: 1px solid var(--border);
    display: flex; z-index: 50;
    padding-bottom: env(safe-area-inset-bottom, 0);
    box-shadow: 0 -4px 20px rgba(13,27,62,.07);
  }
  .nav-btn {
    flex:1; display:flex; flex-direction:column; align-items:center;
    padding: 10px 0 12px; gap:4px; background:none; border:none;
    color: var(--muted); font-size:11px; font-weight:600;
    transition: color .2s;
  }
  .nav-btn.active { color: var(--green2); }
  .nav-btn svg { width:22px; height:22px; }
  .nav-btn.active svg { stroke: var(--green2); }
  .nav-indicator {
    width:6px; height:6px; border-radius:50%;
    background: var(--green); margin-top:2px;
  }

  /* ── Scroll page ── */
  .page {
    max-width: 430px; margin: 0 auto;
    padding: 0 0 90px;
    min-height: 100dvh;
  }

  /* ── Cards de plástico ── */
  .credit-card {
    border-radius: 20px;
    padding: 22px 24px;
    position: relative; overflow: hidden;
    color: #fff; min-height: 130px;
    display: flex; flex-direction: column; justify-content: space-between;
    box-shadow: 0 8px 32px rgba(0,0,0,.18);
    transition: transform .2s, box-shadow .2s;
  }
  .credit-card:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(0,0,0,.22); }
  .credit-card::before {
    content:''; position:absolute; top:-30px; right:-30px;
    width:140px; height:140px; border-radius:50%;
    background: rgba(255,255,255,.1);
  }
  .credit-card::after {
    content:''; position:absolute; bottom:-40px; left:-10px;
    width:120px; height:120px; border-radius:50%;
    background: rgba(255,255,255,.07);
  }
  .card-bank { font-size:12px; font-weight:600; opacity:.8; text-transform:uppercase; letter-spacing:.8px; }
  .card-name { font-family:'Syne',sans-serif; font-size:17px; font-weight:800; margin-top:4px; }
  .card-nick { font-size:12px; opacity:.7; margin-top:2px; }
  .card-chip {
    width:32px; height:24px; border-radius:5px;
    background: linear-gradient(135deg,#FFD700,#FFA000);
    position:relative; z-index:1;
  }

  /* ── List item de billetera ── */
  .wallet-item {
    background: var(--card); border-radius: var(--radius);
    padding: 16px; margin: 0 16px 12px;
    display:flex; align-items:center; gap:14px;
    box-shadow: var(--shadow); cursor:pointer;
    transition: box-shadow .2s, transform .2s;
  }
  .wallet-item:hover { box-shadow: var(--shadow2); transform:translateY(-2px); }
  .wallet-dot {
    width:44px; height:44px; border-radius:14px;
    display:flex; align-items:center; justify-content:center;
    font-size:20px; flex-shrink:0;
  }
  .wallet-info { flex:1; }
  .wallet-name { font-weight:700; font-size:15px; }
  .wallet-bank { font-size:12px; color:var(--muted); margin-top:2px; }
  .wallet-badge {
    font-size:11px; font-weight:700; padding:3px 9px;
    border-radius:20px; background:#E8F5E9; color:var(--green2);
  }

  /* ── Hero billetera ── */
  .wallet-hero {
    margin: 16px; padding: 20px;
    background: linear-gradient(135deg,var(--navy),var(--blue2));
    border-radius: 24px; color:#fff;
    box-shadow: 0 10px 40px rgba(21,101,192,.25);
  }
  .wallet-hero-label { font-size:12px; opacity:.7; text-transform:uppercase; letter-spacing:.8px; }
  .wallet-hero-count { font-family:'Syne',sans-serif; font-size:40px; font-weight:800; line-height:1; margin:6px 0 2px; }
  .wallet-hero-sub { font-size:13px; opacity:.75; }
  .wallet-hero-icon {
    position:absolute; right:20px; top:50%; transform:translateY(-50%);
    font-size:48px; opacity:.15;
  }

  /* ── Empty state ── */
  .empty-state {
    display:flex; flex-direction:column; align-items:center;
    padding: 48px 32px; text-align:center; gap:14px;
  }
  .empty-icon { font-size:56px; }
  .empty-title { font-size:19px; font-weight:700; }
  .empty-sub { font-size:14px; color:var(--muted); line-height:1.6; }

  /* ── Botones ── */
  .btn-primary {
    background: linear-gradient(135deg,var(--green),var(--green2));
    color:#fff; border:none; border-radius:14px;
    padding:14px 28px; font-size:15px; font-weight:700;
    box-shadow: 0 4px 18px rgba(0,168,70,.3);
    transition: transform .15s, box-shadow .15s;
    display:inline-flex; align-items:center; gap:8px;
  }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,168,70,.4); }
  .btn-primary:active { transform:translateY(0); }
  .btn-ghost {
    background: var(--bg); border:1.5px solid var(--border);
    color:var(--text); border-radius:14px;
    padding:12px 22px; font-size:14px; font-weight:600;
    transition: background .15s;
  }
  .btn-ghost:hover { background:var(--border); }
  .btn-icon {
    width:40px; height:40px; border-radius:12px;
    background:var(--bg); border:1.5px solid var(--border);
    display:flex; align-items:center; justify-content:center;
    font-size:18px; transition:background .15s;
  }
  .btn-icon:hover { background:var(--border); }
  .btn-add {
    background: linear-gradient(135deg,var(--green),var(--blue));
    color:#fff; border:none; border-radius:14px;
    padding: 10px 18px; font-size:13px; font-weight:700;
    transition: opacity .2s, transform .2s;
    display:flex; align-items:center; gap:6px;
    white-space:nowrap;
  }
  .btn-add:hover { opacity:.88; transform:scale(.97); }
  .btn-add.added {
    background: var(--bg); color: var(--green2);
    border: 1.5px solid var(--green);
  }

  /* ── Buscador ── */
  .search-wrapper {
    position:relative; margin: 16px;
  }
  .search-icon {
    position:absolute; left:16px; top:50%; transform:translateY(-50%);
    color:var(--muted);
  }
  .search-input {
    width:100%; padding:16px 16px 16px 48px;
    font-size:16px; border-radius:16px;
    border: 2px solid var(--border);
    background: var(--card); color:var(--text); outline:none;
    box-shadow: var(--shadow);
    transition: border-color .2s, box-shadow .2s;
    font-weight:500;
  }
  .search-input:focus {
    border-color: var(--green);
    box-shadow: 0 0 0 4px rgba(0,200,83,.12), var(--shadow);
  }
  .search-input::placeholder { color:var(--muted); }

  /* ── Category chips ── */
  .chips-row {
    display:flex; gap:10px; overflow-x:auto;
    padding: 4px 16px 8px; scrollbar-width:none;
  }
  .chips-row::-webkit-scrollbar { display:none; }
  .chip {
    display:flex; align-items:center; gap:7px;
    padding: 10px 16px; border-radius:40px;
    background: var(--card); border: 1.5px solid var(--border);
    font-size:13px; font-weight:600; white-space:nowrap;
    cursor:pointer; transition: all .18s;
    flex-shrink:0;
  }
  .chip:hover, .chip.active {
    background: var(--navy); color:#fff; border-color:var(--navy);
    box-shadow: 0 4px 14px rgba(13,27,62,.18);
  }
  .chip-icon { font-size:18px; }

  /* ── Resultado optimizador ── */
  .result-winner {
    margin: 8px 16px 6px;
    background: linear-gradient(135deg,#00C853,#00897B);
    border-radius: 20px; padding: 20px;
    color:#fff; box-shadow: 0 8px 32px rgba(0,137,123,.28);
    position:relative; overflow:hidden;
  }
  .result-winner::before {
    content:'⭐'; position:absolute; right:16px; top:12px;
    font-size:28px; opacity:.3;
  }
  .result-tag {
    font-size:10px; font-weight:800; text-transform:uppercase;
    letter-spacing:1.2px; opacity:.8; margin-bottom:8px;
  }
  .result-headline { font-family:'Syne',sans-serif; font-size:19px; font-weight:800; line-height:1.25; }
  .result-sub { font-size:13px; opacity:.8; margin-top:6px; line-height:1.5; }
  .result-cashback {
    margin-top:12px; background:rgba(255,255,255,.2);
    border-radius:10px; padding:8px 14px;
    display:inline-block; font-size:22px; font-weight:800;
    font-family:'Syne',sans-serif;
  }

  .result-card {
    margin: 8px 16px;
    background: var(--card); border-radius: var(--radius);
    padding: 16px; box-shadow: var(--shadow);
    display:flex; align-items:center; gap:14px;
    transition: box-shadow .2s;
  }
  .result-card:hover { box-shadow: var(--shadow2); }
  .result-rank {
    width:32px; height:32px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:800; flex-shrink:0;
  }
  .rank-1 { background:#FFF8E1; color:#F9A825; }
  .rank-2 { background:#F3F4F6; color:#6B7280; }
  .rank-3 { background:#FEF2F0; color:#CD7F32; }
  .result-value {
    font-family:'Syne',sans-serif;
    font-size:16px; font-weight:800; color:var(--green2);
    white-space:nowrap;
  }
  .no-cashback { color:var(--muted); font-size:13px; }

  /* ── Section headers ── */
  .section-header {
    padding: 20px 16px 10px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .section-title { font-size:16px; font-weight:800; }
  .section-link { font-size:13px; color:var(--green2); font-weight:600; cursor:pointer; }

  /* ── Catálogo cards ── */
  .catalog-card {
    background: var(--card); border-radius: var(--radius);
    margin: 0 16px 12px; padding: 16px;
    box-shadow: var(--shadow); display:flex; gap:14px; align-items:flex-start;
  }
  .catalog-logo {
    width:52px; height:52px; border-radius:14px;
    display:flex; align-items:center; justify-content:center;
    font-size:26px; flex-shrink:0;
  }
  .catalog-name { font-size:15px; font-weight:700; }
  .catalog-bank { font-size:12px; color:var(--muted); margin-top:2px; }
  .catalog-anual { font-size:12px; color:var(--blue); font-weight:600; margin-top:6px; }
  .catalog-benefit {
    font-size:12px; color:var(--muted); margin-top:4px; line-height:1.5;
  }
  .benefits-tag {
    display:inline-block; background:#EEF7FF; color:var(--blue);
    font-size:11px; font-weight:700; padding:3px 9px; border-radius:20px;
    margin: 4px 4px 0 0;
  }

  /* ── Modal ── */
  .modal-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.5);
    z-index:100; display:flex; align-items:flex-end;
    animation: fadeUp .2s ease;
  }
  .modal-sheet {
    background: var(--card); border-radius:28px 28px 0 0;
    width:100%; max-width:430px; margin:0 auto;
    padding:24px 20px 40px; max-height:80dvh; overflow-y:auto;
    animation: fadeUp .28s ease;
  }
  .modal-handle {
    width:40px; height:4px; border-radius:2px;
    background:var(--border); margin:0 auto 20px;
  }

  /* ── Toast ── */
  .toast {
    position:fixed; bottom:90px; left:50%; transform:translateX(-50%);
    background:var(--navy); color:#fff; border-radius:14px;
    padding:12px 20px; font-size:13px; font-weight:600;
    z-index:200; white-space:nowrap;
    animation: fadeUp .25s ease, fadeUp .25s ease 2.2s reverse both;
    box-shadow: 0 8px 32px rgba(0,0,0,.25);
    display:flex; align-items:center; gap:8px;
  }

  /* ── Pill section ── */
  .pill-header {
    display:flex; gap:8px; padding:6px 16px 2px;
    overflow-x:auto; scrollbar-width:none;
  }
  .pill-header::-webkit-scrollbar { display:none; }
  .pill-tab {
    padding:8px 18px; border-radius:30px; font-size:13px; font-weight:700;
    cursor:pointer; flex-shrink:0; border:none;
    background:var(--bg); color:var(--muted);
    transition: all .18s;
  }
  .pill-tab.active { background:var(--navy); color:#fff; }

  /* ── Dashboard Total Adeudos ── */
  .dashboard-card {
    margin: 16px; padding: 28px 24px;
    background: linear-gradient(135deg, #0D1B3E 0%, #1A3A6B 50%, #00C853 150%);
    border-radius: 24px; color: #fff;
    box-shadow: 0 12px 48px rgba(13,27,62,.35);
    position: relative; overflow: hidden;
  }
  .dashboard-card::before {
    content:''; position:absolute; top:-60px; right:-40px;
    width:200px; height:200px; border-radius:50%;
    background: rgba(0,200,83,.12);
  }
  .dashboard-card::after {
    content:''; position:absolute; bottom:-50px; left:-20px;
    width:160px; height:160px; border-radius:50%;
    background: rgba(255,255,255,.04);
  }
  .dashboard-label { font-size:12px; opacity:.7; text-transform:uppercase; letter-spacing:1.2px; font-weight:600; }
  .dashboard-amount {
    font-family:'Syne',sans-serif; font-size:38px; font-weight:800;
    line-height:1.1; margin:10px 0 4px; letter-spacing:-1px;
    text-shadow: 0 2px 12px rgba(0,0,0,.2);
  }
  .dashboard-sub { font-size:13px; opacity:.6; }
  .dashboard-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(0,200,83,.2); border-radius:20px;
    padding:5px 12px; font-size:11px; font-weight:700;
    margin-top:10px; color:#69F0AE;
  }

  /* ── Visual Wallet Card ── */
  .vcard {
    border-radius: 20px; padding: 20px;
    position: relative; overflow: hidden;
    color: #fff; min-height: 200px;
    display: flex; flex-direction: column;
    box-shadow: 0 10px 40px rgba(0,0,0,.22);
    margin: 0 16px 16px;
    transition: transform .2s, box-shadow .2s;
  }
  .vcard:hover { transform: translateY(-2px); box-shadow: 0 14px 48px rgba(0,0,0,.28); }
  .vcard::before {
    content:''; position:absolute; top:-40px; right:-40px;
    width:160px; height:160px; border-radius:50%;
    background: rgba(255,255,255,.1);
  }
  .vcard::after {
    content:''; position:absolute; bottom:-50px; left:-20px;
    width:130px; height:130px; border-radius:50%;
    background: rgba(255,255,255,.06);
  }
  .vcard-top { display:flex; justify-content:space-between; align-items:flex-start; position:relative; z-index:1; }
  .vcard-bank { font-size:11px; font-weight:600; opacity:.75; text-transform:uppercase; letter-spacing:1px; }
  .vcard-name { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; margin-top:2px; }
  .vcard-delete {
    width:32px; height:32px; border-radius:10px;
    background:rgba(255,255,255,.15); backdrop-filter:blur(4px);
    border:none; display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:background .2s;
    color:#FF5252;
  }
  .vcard-delete:hover { background:rgba(255,82,82,.3); }
  .vcard-delete svg { width:16px; height:16px; }
  .vcard-mid {
    display:flex; align-items:center; gap:10px;
    margin-top:14px; position:relative; z-index:1;
  }
  .vcard-chip {
    width:36px; height:28px; border-radius:6px;
    background: linear-gradient(135deg,#FFD700,#FFA000);
  }
  .vcard-emoji { font-size:28px; opacity:.8; }
  .vcard-details {
    display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;
    margin-top:auto; padding-top:16px; position:relative; z-index:1;
  }
  .vcard-field { display:flex; flex-direction:column; }
  .vcard-field-label { font-size:9px; opacity:.55; text-transform:uppercase; letter-spacing:.5px; font-weight:600; }
  .vcard-field-value { font-size:13px; font-weight:700; margin-top:2px; }
  .vcard-adeudo {
    display:flex; align-items:center; gap:6px; cursor:pointer;
    transition: opacity .2s;
  }
  .vcard-adeudo:hover { opacity:.8; }
  .vcard-edit-icon {
    width:16px; height:16px; background:rgba(255,255,255,.2);
    border-radius:4px; display:flex; align-items:center; justify-content:center;
  }
  .vcard-edit-icon svg { width:10px; height:10px; }

  /* ── Edit Adeudo Modal ── */
  .edit-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.55);
    z-index:120; display:flex; align-items:center; justify-content:center;
    animation: fadeUp .18s ease;
  }
  .edit-modal {
    background: var(--card); border-radius:24px;
    width:calc(100% - 40px); max-width:360px;
    padding:28px 24px; animation: fadeUp .25s ease;
    box-shadow: 0 20px 60px rgba(0,0,0,.3);
  }
  .edit-modal h3 { font-size:18px; margin-bottom:4px; }
  .edit-modal .edit-sub { font-size:13px; color:var(--muted); margin-bottom:20px; }
  .edit-modal label { font-size:12px; font-weight:700; color:var(--muted); display:block; margin-bottom:6px; text-transform:uppercase; letter-spacing:.5px; }
  .edit-modal input {
    width:100%; padding:14px 16px; font-size:16px; border-radius:14px;
    border:2px solid var(--border); background:var(--bg); color:var(--text);
    outline:none; transition:border-color .2s; font-weight:600;
  }
  .edit-modal input:focus { border-color:var(--green); }
  .edit-modal .edit-row { display:flex; gap:10px; margin-bottom:14px; }
  .edit-modal .edit-row > div { flex:1; }
  .edit-actions { display:flex; gap:10px; margin-top:20px; }
  .edit-actions button { flex:1; padding:14px; border-radius:14px; font-size:14px; font-weight:700; border:none; }
  .edit-cancel { background:var(--bg); color:var(--text); }
  .edit-save { background:linear-gradient(135deg,var(--green),var(--green2)); color:#fff; box-shadow:0 4px 16px rgba(0,168,70,.3); }
`;

// 2. ELIMINAMOS CONST CATALOG Y CASHBACK_RULES DUMMY

// Mapa de búsqueda semántica
const SEARCH_MAP = {
  supermercado: ["walmart", "soriana", "chedraui", "aurrera", "bodega", "costco", "superama", "heb", "super", "mercado", "grocery", "alimentos", "compras", "viveres", "tienda", "sams", "sam", "kroger", "la comer", "city market", "superstore"],
  gasolina: ["gasolina", "gas", "gasolinera", "pemex", "bp", "shell", "combustible", "bencina", "nafta", "petroleo", "diesel", "litros"],
  restaurantes: ["restaurante", "restaurant", "comida", "pizza", "tacos", "burger", "sushi", "cafe", "coffee", "starbucks", "dominos", "mcdonalds", "bk", "burger king", "kfc", "pollo", "cenar", "comer fuera", "antojitos", "mariscos", "bar"],
  farmacias: ["farmacia", "medicamento", "medicina", "pastilla", "doctor", "salud", "benavides", "ahorro", "guadalajara", "similares", "generico", "remedio"],
  delivery: ["rappi", "uber eats", "didi food", "mercado libre", "delivery", "domicilio", "pedido", "rapido", "pedir"],
  viajes: ["viaje", "vuelo", "aerolinea", "hotel", "hospedaje", "renta", "airbnb", "boleto", "avion", "aeromexico", "volaris", "vivaerobus", "aeropuerto", "viajar", "vacaciones", "turismo"],
  ecommerce: ["amazon", "liverpool", "mercado libre", "palacio", "tienda online", "online", "internet", "compra en linea", "web", "digital"],
  moda: ["ropa", "liverpool", "suburbia", "palacio de hierro", "fashion", "moda", "zapatos", "camisa", "pantalon", "vestido", "zapateria"],
  general: ["todo", "cualquier", "todo lo demas", "resto", "demas", "otros", "miscelanea", "varios"],
};

// Categorías populares con info
const QUICK_CATS = [
  { key: "supermercado", label: "Súper", icon: "🛒" },
  { key: "gasolina", label: "Gasolina", icon: "⛽" },
  { key: "restaurantes", label: "Comer", icon: "🍽️" },
  { key: "farmacias", label: "Farmacia", icon: "💊" },
  { key: "delivery", label: "Delivery", icon: "📦" },
  { key: "viajes", label: "Viajes", icon: "✈️" },
  { key: "ecommerce", label: "Online", icon: "🛍️" },
];

// ─── ICONS ────────────────────────────────────────────────────────────
const IconWallet = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20" /></svg>;
const IconSearch = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
const IconGrid = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
const IconPlus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IconTrash = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const IconPencil = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>;

// ─── HELPERS: Moneda MXN y Fechas ─────────────────────────────────────
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function formatMXN(amount) {
  if (!amount && amount !== 0) return "$0 MXN";
  return "$" + Number(amount).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " MXN";
}

function formatFecha(day) {
  if (!day) return "--";
  const now = new Date();
  let month = now.getMonth();
  // Si el día ya pasó este mes, mostrar el del próximo mes
  if (Number(day) < now.getDate()) month = (month + 1) % 12;
  return `${String(day).padStart(2,"0")} / ${MESES[month]}`;
}

function formatFechaLimite(corte, limite) {
  if (!limite) return "--";
  const now = new Date();
  let month = now.getMonth();
  if (Number(corte) < now.getDate()) month = (month + 1) % 12;
  if (Number(limite) <= Number(corte)) month = (month + 1) % 12;
  return `${String(limite).padStart(2,"0")} / ${MESES[month]}`;
}

// ─── HELPER: detectar categoría ──────────────────────────────────────
function detectCategory(text) {
  if (!text) return null;
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [cat, keywords] of Object.entries(SEARCH_MAP)) {
    if (keywords.some(k => t.includes(k))) return cat;
  }
  return null;
}

// ─── HELPER: colores del banco ────────────────────────────────────────
function getBgColor(id) {
  const map = { nu1: "#F3E5FF", bbva1: "#E3F0FF", bbva2: "#E3F0FF", banamex1: "#FFF8E1", santander1: "#FFEBEE", hsbc1: "#E8F5E9", amex1: "#FFF8E1", rappi1: "#FFF3E0", liverpool1: "#F3E5F5", hey1: "#FFF3E0", stori1: "#ECEFF1", invex1: "#FFF8E0" };
  return map[id] || "#F4F7FC";
}

// ─── APP COMPONENT ───────────────────────────────────────────────────
export default function CardOptimizer() {
  // 3. INYECTAMOS EL HOOK AQUÍ (Renombramos las variables exportadas a CATALOG y CASHBACK_RULES para que funcionen con tu código actual)
  const { catalog: CATALOG, rules: CASHBACK_RULES, loading, error, source, lastSync, refetch } = useSheetData();

  const [tab, setTab] = useState("wallet");
  // wallet es ahora un array de objetos: { id, fecha_corte, fecha_limite_pago, adeudo_actual }
  const [wallet, setWallet] = useState(() => {
    try {
      const saved = localStorage.getItem("cardopt_wallet_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrar de formato viejo (array de strings) a nuevo (array de objetos)
        if (parsed.length > 0 && typeof parsed[0] === "string") {
          return parsed.map(id => ({ id, fecha_corte: 15, fecha_limite_pago: 5, adeudo_actual: 0 }));
        }
        return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState(null);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // card id
  const [catFilter, setCatFilter] = useState("all");
  const [editCard, setEditCard] = useState(null); // id de la tarjeta a editar adeudo

  // Calcular total de adeudos en tiempo real
  const totalAdeudo = useMemo(() => {
    return wallet.reduce((sum, w) => sum + (Number(w.adeudo_actual) || 0), 0);
  }, [wallet]);

  // Inyectar CSS y fuente
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = FONT_LINK + CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Persistir billetera en localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cardopt_wallet_v2", JSON.stringify(wallet));
    } catch (_) {}
  }, [wallet]);

  function showToast(msg, icon = "✅") {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 2500);
  }

  // Helpers para el wallet basado en objetos
  const walletIds = useMemo(() => wallet.map(w => w.id), [wallet]);
  function isInWallet(id) { return walletIds.includes(id); }

  function toggleWallet(id) {
    if (isInWallet(id)) {
      setWallet(w => w.filter(x => x.id !== id));
      showToast("Tarjeta removida de tu billetera", "🗑️");
    } else {
      setWallet(w => [...w, { id, fecha_corte: 15, fecha_limite_pago: 5, adeudo_actual: 0 }]);
      showToast("¡Tarjeta agregada a tu billetera!", "💳");
    }
  }

  function updateWalletCard(id, fields) {
    setWallet(w => w.map(item => item.id === id ? { ...item, ...fields } : item));
  }

  // Lógica del optimizador (Agregamos CATALOG y CASHBACK_RULES a las dependencias)
  const optimizerResults = useMemo(() => {
    const cat = activeChip || detectCategory(query);
    if (!cat && !query) return [];
    if (!cat) return [];

    const walletCards = CATALOG.filter(c => isInWallet(c.id));
    const results = walletCards.map(card => {
      const rule = CASHBACK_RULES.find(r => r.cardId === card.id && r.cat === cat)
        || CASHBACK_RULES.find(r => r.cardId === card.id && r.cat === "general");
      return {
        card,
        value: rule ? rule.value : 0,
        type: rule ? rule.type : "",
        nota: rule ? rule.nota : "Sin beneficio especial",
      };
    });
    return results.sort((a, b) => b.value - a.value);
  }, [query, activeChip, walletIds, CATALOG, CASHBACK_RULES]);

  const detectedCat = activeChip || detectCategory(query);

  // Filtrar catálogo (Agregamos CATALOG y CASHBACK_RULES a las dependencias)
  const filteredCatalog = useMemo(() => {
    if (catFilter === "all") return CATALOG;
    return CATALOG.filter(c => {
      const rules = CASHBACK_RULES.filter(r => r.cardId === c.id);
      return rules.some(r => r.cat === catFilter);
    });
  }, [catFilter, CATALOG, CASHBACK_RULES]);

  const walletCards = CATALOG.filter(c => isInWallet(c.id));
  const selectedModal = modal ? CATALOG.find(c => c.id === modal) : null;
  const modalRules = modal ? CASHBACK_RULES.filter(r => r.cardId === modal) : [];

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: "var(--bg)", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative" }}>

      {/* 4. AGREGAMOS EL BANNER DE SINCRONIZACIÓN EN LA PARTE SUPERIOR */}
      <div style={{ paddingBottom: '4px' }}>
        <SyncBanner loading={loading} error={error} source={source} lastSync={lastSync} onRefetch={refetch} />
      </div>

      {/* ── TABS ── */}
      {tab === "wallet" && <WalletPage walletCards={walletCards} onAddCard={() => setTab("catalog")} onRemove={toggleWallet} setModal={setModal} CASHBACK_RULES={CASHBACK_RULES} totalAdeudo={totalAdeudo} walletData={wallet} updateWalletCard={updateWalletCard} editCard={editCard} setEditCard={setEditCard} />}
      {tab === "optimizer" && <OptimizerPage query={query} setQuery={setQuery} activeChip={activeChip} setActiveChip={setActiveChip} results={optimizerResults} detectedCat={detectedCat} hasWallet={wallet.length > 0} goWallet={() => setTab("catalog")} />}
      {tab === "catalog" && <CatalogPage catalog={filteredCatalog} wallet={wallet} onToggle={toggleWallet} setModal={setModal} catFilter={catFilter} setCatFilter={setCatFilter} CASHBACK_RULES={CASHBACK_RULES} />}

      {/* ── BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className={`nav-btn ${tab === "wallet" ? "active" : ""}`} onClick={() => setTab("wallet")}>
          <IconWallet /> Billetera
          {tab === "wallet" && <span className="nav-indicator" />}
        </button>
        <button className={`nav-btn ${tab === "optimizer" ? "active" : ""}`} onClick={() => setTab("optimizer")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M3 12h2M19 12h2M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41" /></svg>
          Optimizador
          {tab === "optimizer" && <span className="nav-indicator" />}
        </button>
        <button className={`nav-btn ${tab === "catalog" ? "active" : ""}`} onClick={() => setTab("catalog")}>
          <IconGrid /> Catálogo
          {tab === "catalog" && <span className="nav-indicator" />}
        </button>
      </nav>

      {/* ── MODAL DETALLE TARJETA ── */}
      {modal && selectedModal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            {/* Mini card */}
            <div className="credit-card" style={{ background: selectedModal.gradient, marginBottom: 20 }}>
              <div>
                <div className="card-bank">{selectedModal.bank}</div>
                <div className="card-name">{selectedModal.name}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div className="card-chip" />
                <div style={{ fontSize: 28, opacity: .7 }}>{selectedModal.emoji}</div>
              </div>
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{selectedModal.bank} {selectedModal.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{selectedModal.beneficios}</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>💳 Anualidad</div>
            <div style={{ background: "var(--bg)", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 14, fontWeight: 600, color: "var(--blue)" }}>{selectedModal.anualidad}</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🎯 Beneficios por categoría</div>
            {modalRules.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, textTransform: "capitalize" }}>{r.cat === "general" ? "🌟 Todas las compras" : `${["supermercado", "gasolina", "restaurantes", "farmacias", "delivery", "viajes", "ecommerce", "moda"].includes(r.cat) ? ["🛒", "⛽", "🍽️", "💊", "📦", "✈️", "🛍️", "👗"][["supermercado", "gasolina", "restaurantes", "farmacias", "delivery", "viajes", "ecommerce", "moda"].indexOf(r.cat)] : "📌"} ${r.cat.charAt(0).toUpperCase() + r.cat.slice(1)}`}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{r.nota}</div>
                </div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: r.value >= 3 ? "var(--green2)" : "var(--blue)" }}>{r.value}% <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>{r.type}</span></div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className={`btn-add ${wallet.includes(selectedModal.id) ? "added" : ""}`} style={{ flex: 1, justifyContent: "center", padding: "14px" }} onClick={() => { toggleWallet(selectedModal.id); setModal(null); }}>
                {wallet.includes(selectedModal.id) ? <><span style={{ fontSize: 14 }}><IconCheck /></span> En tu billetera</> : <><span style={{ fontSize: 14 }}><IconPlus /></span> Agregar a billetera</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="toast">
          <span>{toast.icon}</span> {toast.msg}
        </div>
      )}
    </div>
  );
}


// ─── PAGE: BILLETERA ─────────────────────────────────────────────────
function WalletPage({ walletCards, onAddCard, onRemove, setModal, CASHBACK_RULES, totalAdeudo, walletData, updateWalletCard, editCard, setEditCard }) {
  const [editValue, setEditValue] = useState("");

  function openEdit(id, currentAdeudo) {
    setEditValue(currentAdeudo || "0");
    setEditCard(id);
  }

  function handleSaveAdeudo() {
    if (!editCard) return;
    const numValue = parseFloat(String(editValue).replace(/[^0-9.-]+/g, "")) || 0;
    updateWalletCard(editCard, { adeudo_actual: numValue });
    setEditCard(null);
  }

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Buenos días 👋</div>
          <div className="topbar-title" style={{ fontFamily: "'Syne',sans-serif" }}>Mi Billetera</div>
        </div>
        <div className="topbar-avatar">MX</div>
      </div>

      {/* Dashboard Total Adeudos */}
      <div className="dashboard-card fade-up">
        <div className="dashboard-label">Total Adeudos</div>
        <div className="dashboard-amount">{formatMXN(totalAdeudo)}</div>
        <div className="dashboard-sub">
          {walletCards.length === 0 ? "Sin plásticos registrados" : `En ${walletCards.length} tarjeta${walletCards.length !== 1 ? 's' : ''}`}
        </div>
        {walletCards.length > 0 && totalAdeudo === 0 && (
          <div className="dashboard-badge">✨ ¡Excelente! Todo al corriente</div>
        )}
      </div>

      {/* Tarjetas Visuales Detalladas */}
      <div className="section-header fade-up-1">
        <div className="section-title">Tus tarjetas</div>
        <button className="btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={onAddCard}>+ Agregar</button>
      </div>

      {walletCards.length === 0 ? (
        <div className="empty-state fade-up-1">
          <div className="empty-icon">💳</div>
          <div className="empty-title">Tu billetera está vacía</div>
          <div className="empty-sub">Agrega tus tarjetas para organizar tus fechas y ver beneficios.</div>
          <button className="btn-primary" onClick={onAddCard}>
            <span style={{ fontSize: 18 }}><IconPlus /></span>
            Agregar mi primera tarjeta
          </button>
        </div>
      ) : (
        walletCards.map((c, i) => {
          const wd = walletData.find(w => w.id === c.id) || {};
          return (
            <div key={c.id} className={`vcard fade-up-${Math.min(i + 1, 3)}`} style={{ background: c.gradient, animationDelay: `${i * 0.08}s` }}>
              
              <div className="vcard-top">
                <div onClick={() => setModal(c.id)} style={{ cursor: "pointer", flex: 1 }}>
                  <div className="vcard-bank">{c.bank}</div>
                  <div className="vcard-name">{c.name}</div>
                </div>
                <button className="vcard-delete" onClick={() => onRemove(c.id)}>
                  <IconTrash />
                </button>
              </div>

              <div className="vcard-mid" onClick={() => setModal(c.id)} style={{ cursor: "pointer" }}>
                <div className="vcard-chip" />
                <div className="vcard-emoji">{c.emoji}</div>
              </div>

              <div className="vcard-details">
                <div className="vcard-field">
                  <span className="vcard-field-label">Fecha de corte</span>
                  <span className="vcard-field-value">{formatFecha(wd.fecha_corte)}</span>
                </div>
                <div className="vcard-field">
                  <span className="vcard-field-label">Límite de pago</span>
                  <span className="vcard-field-value">{formatFechaLimite(wd.fecha_corte, wd.fecha_limite_pago)}</span>
                </div>
                <div className="vcard-field">
                  <span className="vcard-field-label">Adeudo</span>
                  <div className="vcard-adeudo" onClick={() => openEdit(c.id, wd.adeudo_actual)}>
                    <span className="vcard-field-value">{formatMXN(wd.adeudo_actual)}</span>
                    <div className="vcard-edit-icon"><IconPencil /></div>
                  </div>
                </div>
              </div>

            </div>
          );
        })
      )}

      {/* Modal de Edición de Adeudo */}
      {editCard && (
        <div className="edit-overlay" onClick={() => setEditCard(null)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <h3>Editar Adeudo</h3>
            <div className="edit-sub">Actualiza el saldo actual de tu tarjeta.</div>
            <label>Adeudo Actual (MXN)</label>
            <input 
              type="number" 
              inputMode="decimal"
              placeholder="0.00" 
              value={editValue} 
              onChange={e => setEditValue(e.target.value)}
              autoFocus
            />
            <div className="edit-actions">
              <button className="edit-cancel" onClick={() => setEditCard(null)}>Cancelar</button>
              <button className="edit-save" onClick={handleSaveAdeudo}>Guardar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── PAGE: OPTIMIZADOR ───────────────────────────────────────────────
function OptimizerPage({ query, setQuery, activeChip, setActiveChip, results, detectedCat, hasWallet, goWallet }) {
  const catLabel = detectedCat ? QUICK_CATS.find(c => c.key === detectedCat)?.label || detectedCat : null;
  const catIcon = detectedCat ? QUICK_CATS.find(c => c.key === detectedCat)?.icon || "📌" : null;

  function handleChip(key) {
    setActiveChip(activeChip === key ? null : key);
    setQuery("");
  }

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Ahorra más con</div>
          <div className="topbar-title" style={{ fontFamily: "'Syne',sans-serif" }}>El Optimizador</div>
        </div>
        <div style={{ fontSize: 22 }}>⚡</div>
      </div>

      {/* Hero buscador */}
      <div style={{ margin: "16px 16px 4px", padding: "20px", background: "linear-gradient(135deg,var(--navy),var(--blue2))", borderRadius: 24, color: "#fff" }} className="fade-up">
        <div style={{ fontSize: 13, opacity: .75, marginBottom: 8 }}>¿Dónde vas a pagar?</div>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4 }}>Escribe tu compra y te digo <span style={{ color: "#69F0AE" }}>cuál tarjeta usar</span> para ganar más.</div>
      </div>

      <div className="search-wrapper fade-up-1">
        <div className="search-icon"><IconSearch /></div>
        <input
          className="search-input"
          placeholder='Ej: "Gasolina", "Walmart", "Restaurante"…'
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveChip(null); }}
        />
      </div>

      {/* Chips categorías */}
      <div className="chips-row fade-up-2">
        {QUICK_CATS.map(c => (
          <button key={c.key} className={`chip ${activeChip === c.key ? "active" : ""}`} onClick={() => handleChip(c.key)}>
            <span className="chip-icon">{c.icon}</span>{c.label}
          </button>
        ))}
      </div>

      {/* Sin billetera */}
      {!hasWallet && (
        <div className="empty-state fade-up-2">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">Agrega tarjetas primero</div>
          <div className="empty-sub">Para que el Optimizador funcione, agrega tus plásticos en el Catálogo.</div>
          <button className="btn-primary" onClick={goWallet}>Ir al Catálogo</button>
        </div>
      )}

      {/* Estado inicial */}
      {hasWallet && !detectedCat && !query && (
        <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--muted)" }} className="fade-up-3">
          <div style={{ fontSize: 42, marginBottom: 12 }}>💡</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Toca una categoría o escribe</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Te diremos qué tarjeta de tu billetera da más beneficios.</div>
        </div>
      )}

      {/* Sin match */}
      {hasWallet && query && !detectedCat && (
        <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--muted)" }} className="fade-up">
          <div style={{ fontSize: 42, marginBottom: 12 }}>🤔</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>No reconozco esa tienda</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Intenta: "gasolina", "super", "farmacia", "restaurante"…</div>
        </div>
      )}

      {/* RESULTADOS */}
      {hasWallet && detectedCat && results.length > 0 && (
        <>
          <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", gap: 8 }} className="fade-up">
            <span style={{ fontSize: 20 }}>{catIcon}</span>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800 }}>{catLabel || detectedCat}</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{results.length} tarjeta{results.length !== 1 ? "s" : ""}</div>
          </div>

          {/* Ganadora */}
          {results[0].value > 0 && (
            <div className="result-winner fade-up">
              <div className="result-tag">✨ Mejor opción</div>
              <div className="result-headline">¡Usa tu {results[0].card.bank} {results[0].card.name}!</div>
              <div className="result-sub">{results[0].nota}</div>
              <div className="result-cashback">{results[0].value}% {results[0].type}</div>
            </div>
          )}

          {/* Ranking */}
          {results.map((r, i) => (
            <div key={r.card.id} className="result-card fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className={`result-rank rank-${Math.min(i + 1, 3)}`}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.card.bank} {r.card.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{r.nota}</div>
              </div>
              {r.value > 0
                ? <div className="result-value">{r.value}%<br /><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{r.type}</span></div>
                : <div className="no-cashback">Sin beneficio</div>
              }
            </div>
          ))}

          <div style={{ margin: "12px 16px 0", padding: "14px 16px", background: "#EEF7FF", borderRadius: 14, fontSize: 12, color: "var(--blue)", fontWeight: 600, display: "flex", gap: 10, alignItems: "center" }}>
            <span>ℹ️</span>
            <span>Los beneficios pueden variar según términos de cada banco. Siempre verifica con tu institución.</span>
          </div>
        </>
      )}

      {hasWallet && detectedCat && results.length === 0 && (
        <div className="empty-state fade-up">
          <div className="empty-icon">😕</div>
          <div className="empty-title">No hay tarjetas en tu billetera</div>
          <div className="empty-sub">Agrega tarjetas al Catálogo para ver recomendaciones aquí.</div>
          <button className="btn-primary" onClick={goWallet}>Ver catálogo</button>
        </div>
      )}
    </div>
  );
}

// ─── PAGE: CATÁLOGO ──────────────────────────────────────────────────
function CatalogPage({ catalog, wallet, onToggle, setModal, catFilter, setCatFilter, CASHBACK_RULES }) {
  const [search, setSearch] = useState("");
  const filterTabs = [
    { key: "all", label: "Todas" },
    { key: "supermercado", label: "🛒 Súper" },
    { key: "gasolina", label: "⛽ Gas" },
    { key: "restaurantes", label: "🍽️ Resto" },
    { key: "farmacias", label: "💊 Farma" },
    { key: "general", label: "🌟 Sin anualidad" },
  ];

  const displayed = catalog.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.bank.toLowerCase().includes(s) || c.beneficios.toLowerCase().includes(s);
  });

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{catalog.length} tarjetas disponibles</div>
          <div className="topbar-title" style={{ fontFamily: "'Syne',sans-serif" }}>Catálogo</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--bg)", padding: "6px 12px", borderRadius: 20, fontWeight: 700, border: "1px solid var(--border)" }}>
          {wallet.length} en billetera
        </div>
      </div>

      {/* Buscador */}
      <div className="search-wrapper fade-up" style={{ marginBottom: 0 }}>
        <div className="search-icon"><IconSearch /></div>
        <input className="search-input" placeholder="Buscar banco, tarjeta…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Filter pills */}
      <div className="pill-header fade-up-1" style={{ margin: "10px 0 4px" }}>
        {filterTabs.map(f => (
          <button key={f.key} className={`pill-tab ${catFilter === f.key ? "active" : ""}`} onClick={() => setCatFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "8px 0" }}>
        {displayed.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">Sin resultados</div>
            <div className="empty-sub">Intenta con otro término o categoría.</div>
          </div>
        )}
        {displayed.map((c, i) => {
          const inWallet = wallet.includes(c.id);
          const topRule = CASHBACK_RULES.filter(r => r.cardId === c.id).sort((a, b) => b.value - a.value)[0];
          return (
            <div key={c.id} className="catalog-card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="catalog-logo" style={{ background: getBgColor(c.id) }} onClick={() => setModal(c.id)}>
                <span>{c.emoji}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }} onClick={() => setModal(c.id)}>
                <div className="catalog-name">{c.name}</div>
                <div className="catalog-bank">{c.bank}</div>
                <div className="catalog-anual">{c.anualidad}</div>
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {c.tags.map(t => (
                    <span key={t} className="benefits-tag">{t}</span>
                  ))}
                </div>
                {topRule && (
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: topRule.value >= 3 ? "var(--green2)" : "var(--muted)" }}>
                    ⭐ Hasta {topRule.value}% {topRule.type}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                <button
                  className={`btn-add ${inWallet ? "added" : ""}`}
                  style={{ padding: "8px 12px", fontSize: 12 }}
                  onClick={() => onToggle(c.id)}
                >
                  {inWallet
                    ? <><span style={{ display: "flex" }}><IconCheck /></span></>
                    : <><span style={{ display: "flex" }}><IconPlus /></span> Agregar</>
                  }
                </button>
                {inWallet && <div style={{ fontSize: 10, color: "var(--green2)", fontWeight: 700, textAlign: "center" }}>En billetera</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
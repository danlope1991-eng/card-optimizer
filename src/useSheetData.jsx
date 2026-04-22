/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  useSheetData.js                                                  ║
 * ║  Hook para leer catalogo y cashback desde Google Sheets CSV       ║
 * ║                                                                   ║
 * ║  USO:                                                             ║
 * ║    1. Pega tus URLs CSV en SHEET_CONFIG abajo                     ║
 * ║    2. Importa el hook en CardOptimizer.jsx:                       ║
 * ║       import { useSheetData } from './useSheetData'               ║
 * ║    3. Úsalo dentro del componente:                                ║
 * ║       const { catalog, rules, loading, error, lastSync,          ║
 * ║               refetch } = useSheetData()                          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useCallback } from "react";

// ─── 1. CONFIGURA TUS URLs AQUÍ ──────────────────────────────────────
// Reemplaza TU_SPREADSHEET_ID con el ID real de tu Google Sheet.
// El ID está en la URL de tu Sheet entre /d/ y /edit:
// https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit

const SHEET_ID = "1s1ziRjhf72Wyljfr4jHrRpC6OpgEOuDxyR0_WjmkA20"; // 👈 Cambia esto

export const SHEET_CONFIG = {
  CATALOGO_URL: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=catalogo`,
  CASHBACK_URL: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=cashback`,
  // Minutos entre actualizaciones automáticas (0 = solo al cargar)
  REFRESH_MINUTES: 30,
};

// ─── 2. DATOS FALLBACK ────────────────────────────────────────────────
// Se usan mientras carga, si el fetch falla, o si el ID aún es el de ejemplo.
// Puedes dejarlos igual: son los mismos datos de tu Sheet.

export const FALLBACK_CATALOG = [
  { id: "nu1",        bank: "Nu México",   name: "Nu Morada",  emoji: "💜", gradient: "linear-gradient(135deg,#820AD1,#4A0080)", anualidad: "Sin anualidad",         beneficios: "2% cashback en todas las compras sin límite", tags: ["Sin anualidad", "Cashback universal"] },
  { id: "bbva2",      bank: "BBVA México", name: "Walmart",    emoji: "🛒", gradient: "linear-gradient(135deg,#0071CE,#004B8D)", anualidad: "Sin anualidad",         beneficios: "3% Walmart/Bodega/Sam's, 2% en el resto",     tags: ["Sin anualidad", "Supermercado"] },
  { id: "santander1", bank: "Santander",   name: "LikeU",      emoji: "🔴", gradient: "linear-gradient(135deg,#EC0000,#A30000)", anualidad: "Sin anualidad 1er año", beneficios: "4% gasolina, 3% restaurantes, 1% en todo",    tags: ["Cashback gasolina", "Restaurantes"] },
  { id: "hsbc1",      bank: "HSBC",        name: "2Now",       emoji: "🟢", gradient: "linear-gradient(135deg,#00847A,#005850)", anualidad: "Sin anualidad",         beneficios: "2% cashback en TODAS las compras",            tags: ["Sin anualidad", "Cashback universal"] },
  { id: "hey1",       bank: "Hey Banco",   name: "HeyCard",    emoji: "🟠", gradient: "linear-gradient(135deg,#FF6D00,#BF4600)", anualidad: "Sin anualidad",         beneficios: "4% farmacias, 2% supermercados",              tags: ["Sin anualidad", "Farmacias"] },
  { id: "rappi1",     bank: "RappiCard",   name: "RappiCard",  emoji: "🧡", gradient: "linear-gradient(135deg,#FF441F,#C4290F)", anualidad: "Sin anualidad",         beneficios: "10% en Rappi, 2% en todo",                   tags: ["Sin anualidad", "Delivery"] },
];

export const FALLBACK_RULES = [
  { cardId: "nu1",        cat: "general",      value: 2.0,  type: "Cashback", nota: "En todas las compras sin límite" },
  { cardId: "bbva2",      cat: "supermercado", value: 3.0,  type: "Cashback", nota: "Walmart, Bodega, Sam's" },
  { cardId: "bbva2",      cat: "general",      value: 2.0,  type: "Cashback", nota: "Todo lo demás" },
  { cardId: "santander1", cat: "gasolina",     value: 4.0,  type: "Cashback", nota: "Todas las gasolineras del país" },
  { cardId: "santander1", cat: "restaurantes", value: 3.0,  type: "Cashback", nota: "Restaurantes participantes" },
  { cardId: "santander1", cat: "general",      value: 1.0,  type: "Cashback", nota: "Resto de compras" },
  { cardId: "hsbc1",      cat: "general",      value: 2.0,  type: "Cashback", nota: "Sin restricciones ni tope mensual" },
  { cardId: "hey1",       cat: "farmacias",    value: 4.0,  type: "Cashback", nota: "Farmacias del Ahorro y Benavides" },
  { cardId: "hey1",       cat: "supermercado", value: 2.0,  type: "Cashback", nota: "Supermercados principales" },
  { cardId: "hey1",       cat: "general",      value: 1.5,  type: "Cashback", nota: "Todo lo demás" },
  { cardId: "rappi1",     cat: "delivery",     value: 10.0, type: "Cashback", nota: "Solo en app Rappi" },
  { cardId: "rappi1",     cat: "restaurantes", value: 5.0,  type: "Cashback", nota: "Pedidos vía Rappi" },
  { cardId: "rappi1",     cat: "general",      value: 2.0,  type: "Cashback", nota: "Resto de compras" },
];

// ─── 3. PARSER CSV ────────────────────────────────────────────────────
// Convierte el texto CSV de Google en un array de objetos JS.
// Maneja comas dentro de comillas y espacios extra.

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Parsea una fila respetando valores entre comillas
  function parseRow(line) {
    const cols = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        // Doble comilla dentro de comillas = comilla literal
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        cols.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cols.push(current.trim());
    return cols;
  }

  // Primera fila = encabezados (normalizados a minúsculas sin espacios)
  const headers = parseRow(lines[0]).map(h =>
    h.toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[áäà]/g, "a")
      .replace(/[éëè]/g, "e")
      .replace(/[íïì]/g, "i")
      .replace(/[óöò]/g, "o")
      .replace(/[úüù]/g, "u")
  );

  // Filas de datos
  return lines
    .slice(1)
    .map(line => {
      const vals = parseRow(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
      return obj;
    })
    .filter(row => Object.values(row).some(v => v !== "")); // Elimina filas vacías
}

// ─── 4. TRANSFORMADORES: fila CSV → modelo interno ───────────────────

// Convierte una fila de la hoja "catalogo" al formato que usa la app
function rowToCatalog(row) {
  return {
    id:         row.id                               || `card_${Math.random().toString(36).slice(2, 7)}`,
    bank:       row.banco       || row.bank          || "",
    name:       row.nombre      || row.name          || "",
    emoji:      row.emoji                            || "💳",
    gradient:   row.gradient                         || "linear-gradient(135deg,#1976D2,#0D47A1)",
    anualidad:  row.anualidad                        || "",
    beneficios: row.beneficios  || row.beneficio     || "",
    enlace:     row.enlace      || row.url           || "#",
    // Tags separados por | en el Sheet → array JS
    tags:       (row.tags || "").split("|").map(t => t.trim()).filter(Boolean),
  };
}

// Convierte una fila de la hoja "cashback" al formato que usa la app
function rowToRule(row) {
  return {
    cardId: row.card_id    || row.cardid    || row.id_tarjeta || "",
    cat:    row.categoria  || row.categoria || row.cat        || "general",
    value:  parseFloat(row.valor || row.value || row.cashback || 0),
    type:   row.tipo       || row.type      || "Cashback",
    nota:   row.nota       || row.notas     || row.descripcion || "",
  };
}

// ─── 5. CACHÉ LOCAL ───────────────────────────────────────────────────
// Guarda los datos en localStorage para no depender siempre del Sheet.
// Si el fetch falla, la app sigue funcionando con los últimos datos buenos.

const CACHE_KEY_CAT  = "cardopt_catalog_v1";
const CACHE_KEY_CASH = "cardopt_cashback_v1";
const CACHE_KEY_TS   = "cardopt_timestamp_v1";
const CACHE_TTL_MS   = 24 * 60 * 60 * 1000; // 24 horas

function saveCache(catalog, rules) {
  try {
    localStorage.setItem(CACHE_KEY_CAT,  JSON.stringify(catalog));
    localStorage.setItem(CACHE_KEY_CASH, JSON.stringify(rules));
    localStorage.setItem(CACHE_KEY_TS,   Date.now().toString());
  } catch (_) {
    // localStorage puede fallar en modo privado, lo ignoramos
  }
}

function loadCache() {
  try {
    const ts      = parseInt(localStorage.getItem(CACHE_KEY_TS) || "0");
    const expired = Date.now() - ts > CACHE_TTL_MS;
    if (expired) return null;
    const catalog = JSON.parse(localStorage.getItem(CACHE_KEY_CAT)  || "null");
    const rules   = JSON.parse(localStorage.getItem(CACHE_KEY_CASH) || "null");
    if (catalog && rules) return { catalog, rules };
  } catch (_) {}
  return null;
}

// ─── 6. EL HOOK ──────────────────────────────────────────────────────

export function useSheetData() {
  const isDemo = SHEET_CONFIG.CATALOGO_URL.includes("TU_SPREADSHEET_ID");

  const [catalog,  setCatalog]  = useState(() => loadCache()?.catalog  || FALLBACK_CATALOG);
  const [rules,    setRules]    = useState(() => loadCache()?.rules    || FALLBACK_RULES);
  const [loading,  setLoading]  = useState(!isDemo);
  const [error,    setError]    = useState(isDemo ? "demo" : null);
  const [lastSync, setLastSync] = useState(null);
  const [source,   setSource]   = useState("fallback"); // "sheets" | "cache" | "fallback" | "demo"

  const fetchData = useCallback(async () => {
    // Modo demo: usa fallback directamente sin intentar el fetch
    if (isDemo) {
      setCatalog(FALLBACK_CATALOG);
      setRules(FALLBACK_RULES);
      setError("demo");
      setSource("demo");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch paralelo de ambas hojas
      const [catResponse, cashResponse] = await Promise.all([
        fetch(SHEET_CONFIG.CATALOGO_URL),
        fetch(SHEET_CONFIG.CASHBACK_URL),
      ]);

      if (!catResponse.ok)  throw new Error(`Error leyendo catálogo: ${catResponse.status}`);
      if (!cashResponse.ok) throw new Error(`Error leyendo cashback: ${cashResponse.status}`);

      const [catText, cashText] = await Promise.all([
        catResponse.text(),
        cashResponse.text(),
      ]);

      // Parsear y transformar
      const newCatalog = parseCSV(catText).map(rowToCatalog);
      const newRules   = parseCSV(cashText).map(rowToRule);

      // Validaciones mínimas
      if (newCatalog.length === 0) throw new Error("La hoja 'catalogo' está vacía o tiene un error de formato");
      if (newRules.length   === 0) throw new Error("La hoja 'cashback' está vacía o tiene un error de formato");

      // Guardar en estado y caché
      setCatalog(newCatalog);
      setRules(newRules);
      saveCache(newCatalog, newRules);
      setLastSync(new Date());
      setSource("sheets");

    } catch (err) {
      console.error("[useSheetData] Error:", err.message);
      setError(err.message);

      // Si hay caché válida, úsala en lugar del fallback
      const cached = loadCache();
      if (cached) {
        setCatalog(cached.catalog);
        setRules(cached.rules);
        setSource("cache");
      } else {
        // Último recurso: datos hardcodeados
        setCatalog(FALLBACK_CATALOG);
        setRules(FALLBACK_RULES);
        setSource("fallback");
      }
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  // Fetch inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresco automático cada N minutos
  useEffect(() => {
    if (isDemo || SHEET_CONFIG.REFRESH_MINUTES <= 0) return;
    const intervalId = setInterval(fetchData, SHEET_CONFIG.REFRESH_MINUTES * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchData, isDemo]);

  return {
    catalog,   // Array de tarjetas → úsalo donde antes tenías CATALOG
    rules,     // Array de reglas  → úsalo donde antes tenías CASHBACK_RULES
    loading,   // true mientras hace el fetch
    error,     // null | "demo" | string con el mensaje de error
    lastSync,  // Date de la última sincronización exitosa
    source,    // "sheets" | "cache" | "fallback" | "demo"
    refetch: fetchData,   // Función para forzar una recarga manual
    isDemo,    // true si el SHEET_ID aún no fue configurado
  };
}

// ─── 7. COMPONENTE DE ESTADO (opcional, úsalo en tu UI) ──────────────
// Muestra una barra informativa según el estado de la conexión.
// Importa y colócalo justo después de tu <TopBar> así:
//   <SyncBanner loading={loading} error={error} source={source} lastSync={lastSync} onRefetch={refetch} />

export function SyncBanner({ loading, error, source, lastSync, onRefetch }) {
  if (loading) {
    return (
      <div style={styles.banner("#EEF7FF", "#1251A3")}>
        <span style={styles.spinner}>⟳</span>
        Actualizando tarjetas desde Google Sheets…
      </div>
    );
  }
  if (error === "demo") {
    return (
      <div style={styles.banner("#FFF8E1", "#F57F17")}>
        ⚠️ Modo demo — Configura tu SHEET_ID en useSheetData.js para ver tus datos reales
      </div>
    );
  }
  if (error && source === "fallback") {
    return (
      <div style={styles.banner("#FFEBEE", "#C62828")}>
        ❌ No se pudo conectar al Sheet — mostrando datos de ejemplo
        <button onClick={onRefetch} style={styles.retryBtn}>Reintentar</button>
      </div>
    );
  }
  if (error && source === "cache") {
    return (
      <div style={styles.banner("#FFF3E0", "#E65100")}>
        ⚡ Sin conexión — usando datos guardados localmente
        <button onClick={onRefetch} style={styles.retryBtn}>Reintentar</button>
      </div>
    );
  }
  if (source === "sheets" && lastSync) {
    const time = lastSync.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    return (
      <div style={styles.banner("#E8F5E9", "#2E7D32")}>
        ✅ Datos actualizados desde tu Sheet · {time}
        <button onClick={onRefetch} style={{ ...styles.retryBtn, color: "#2E7D32", borderColor: "#2E7D32" }}>↺</button>
      </div>
    );
  }
  return null;
}

const styles = {
  banner: (bg, color) => ({
    margin: "10px 16px 0",
    padding: "10px 14px",
    borderRadius: "12px",
    background: bg,
    color,
    fontSize: "12px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    lineHeight: 1.5,
  }),
  spinner: {
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
  retryBtn: {
    marginLeft: "auto",
    background: "transparent",
    border: "1px solid currentColor",
    borderRadius: "8px",
    padding: "3px 10px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
    color: "inherit",
  },
};
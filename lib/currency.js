// Lightweight currency symbol loader and helper used by client pages.
// Keeps mapping central so multiple pages can reuse the same logic.

export async function loadCurrencyMap() {
  try {
    const res = await fetch("/currencies.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const map = {};
    (data || []).forEach((c) => {
      map[c.code] = c.symbol_native || c.symbol || c.code;
    });
    return map;
  } catch (err) {
    console.warn("Failed to load currencies.json for symbols", err);
    return {};
  }
}

export function getCurrencySymbolFromMap(
  currencyMap,
  currencyCode,
  paymentMethod
) {
  if (currencyCode && currencyMap && currencyMap[currencyCode]) {
    return currencyMap[currencyCode];
  }
  // fallback to previous behavior for backwards compatibility
  if (paymentMethod === "paystack") return "$";
  return "KSh";
}

export default {
  loadCurrencyMap,
  getCurrencySymbolFromMap,
};

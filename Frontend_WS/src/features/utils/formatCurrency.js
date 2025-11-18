export const formatCurrency = (amount, currency = "MXN") =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount ?? 0);

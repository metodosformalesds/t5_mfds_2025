/**

 * Autor: Eibram Alexis Alvarado Orta

 * Componente: Archivo Utilitario para Formateo de Moneda 

 * Descripción: Devuelve un número formateado como moneda en estilo mexicano: pesos (MXN).

 */

export const formatCurrency = (amount, currency = "MXN") =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount ?? 0);

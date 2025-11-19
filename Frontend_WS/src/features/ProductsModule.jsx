/**

 * Autor: Eibram Alexis Alvarado Orta

 * Componente: sub-router exclusivo para la sección /productos.

 * Descripción: Aqui se definen las rutas hijas de /productos, como
/publicar y /mis-publicaciones.

 */

import { Routes, Route, Navigate } from "react-router-dom";
import PublishProduct from "./PublishProduct.jsx";
import MyListings from "./MyListings.jsx";

export default function ProductsModule() {
  return (
    <Routes>
      {/* /productos/publicar */}
      <Route path="publicar" element={<PublishProduct />} />

      {/* /productos/mis-publicaciones */}
      <Route path="mis-publicaciones" element={<MyListings />} />

      {/* Si alguien entra a /productos sin subruta, lo mandamos a mis-publicaciones */}
      <Route path="*" element={<Navigate to="mis-publicaciones" replace />} />
    </Routes>
  );
}

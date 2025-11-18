/**

 * Autor: Alex Beltran Gallegos

 * Componente: Vista Nursery

 * Descripción: Vista de viveros locales y sus productos.

 */

import NurseryCard from "./NurseryCard";
import Sidebar from "./Sidebar";
import './Nursery.css';
const Nursery = () => {
    const nurseries = []; 
  return (
    <div className="shop-page">
        <header className="shop-header">
        <h1>Nursery</h1>
        <p>Discover local nurseries and growers</p>
      </header>
        <div className="shop-layout">
        <Sidebar />
        <div className="nursery-list-area">
            {nurseries.map((n, i) => (
            <NurseryCard key={i} {...n} />
            ))}
        </div>
        </div>
    </div>
  );
  
};

export default Nursery;
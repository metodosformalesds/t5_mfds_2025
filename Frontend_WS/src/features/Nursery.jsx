import Navbar from "./Navbar";
import NurseryCard from "./NurseryCard";
import Sidebar from "./Sidebar.jsx";
import './Nursery.css';

const Nursery = () => {
  const nurseries = [
    {
      name: "Vivero Tu Espacio Verde",
      location: "Ciudad Juárez, Chihuahua",
      description:
        "Ofrecemos productos de alta calidad con el cuidado necesario. Envíos locales por mensajería.",
      products: [
        {
          name: "String of Hearts",
          price: 350,
          image:
            "https://images.unsplash.com/photo-1604937455091-efb8d6798b5c?auto=format&fit=crop&w=500&q=60",
        },
        {
          name: "Red Secret Alocasia",
          price: 350,
          image:
            "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=500&q=60",
        },
        {
          name: "Jewel Alocasia",
          price: 350,
          image:
            "https://images.unsplash.com/photo-1560184897-0e2e9b1f1f2d?auto=format&fit=crop&w=500&q=60",
        },
      ],
    },
  ];

  return (
    <div className="app-container">
      <Navbar />

    <main className="nursery-main-content">
        {/* Sidebar de filtros */}
        <Sidebar />

        {/* Cards de viveros */}
        <div className="nursery-list-area">
            <h1 className="nursery-title">Nursery</h1>

            {nurseries.map((n, i) => (
            <NurseryCard key={i} {...n} />
            ))}
        </div>
        </main>


      <footer className="app-footer">
        © 2025 Sprout Market. All rights reserved.
      </footer>
    </div>
  );
  
};

export default Nursery;
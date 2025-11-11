import { ShoppingCart, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm flex justify-between items-center px-8 py-3">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img
          src="/logo.png"
          alt="Sprout Market Logo"
          className="w-8 h-8"
        />
        <div>
          <h1 className="text-lg font-bold text-gray-900">Sprout</h1>
          <p className="text-sm font-medium text-green-700 -mt-1">Market</p>
        </div>
      </div>

      {/* Links */}
      <ul className="flex space-x-6 text-sm font-medium text-gray-700">
        <li><a href="#" className="text-green-600">Home</a></li>
        <li><a href="#">Shop</a></li>
        <li><a href="#">Category</a></li>
        <li><a href="#">Nursery</a></li>
        <li><a href="#">Exchange</a></li>
      </ul>

      {/* Buttons */}
      <div className="flex items-center space-x-4">
        <button className="bg-green-200 text-green-800 px-4 py-1 rounded-md font-semibold hover:bg-green-300">
          PUBLISH
        </button>
        <ShoppingCart className="w-5 h-5 text-gray-700" />
        <User className="w-5 h-5 text-gray-700" />
      </div>
    </nav>
  );
}

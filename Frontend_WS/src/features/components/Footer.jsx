export default function Footer() {
  return (
    <footer className="mt-16 bg-white border-t">
      {/* Enlaces superiores */}
      <div className="flex flex-col items-center py-6 space-y-4">
        <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-700">
          <li><a href="#" className="hover:text-green-700">Products</a></li>
          <li><a href="#" className="hover:text-green-700">Returns</a></li>
          <li><a href="#" className="hover:text-green-700">About Us</a></li>
          <li><a href="#" className="hover:text-green-700">Contact Us</a></li>
        </ul>
      </div>

      {/* Franja inferior */}
      <div className="bg-green-700 text-white text-center py-3 text-xs tracking-wider">
        COPYRIGHT © {new Date().getFullYear()} SPROUT MARKET. ALL RIGHTS RESERVED
      </div>
    </footer>
  );
}

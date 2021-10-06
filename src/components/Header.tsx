import { Link } from "react-router-dom";
export default function Header() {
  return (
    <nav>
      <div className="px-2 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-6 lg:py-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center flex-shrink-0 text-3xl font-bold text-white">
            <Link to="/">Praise 🙏</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

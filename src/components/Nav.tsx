import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="flex-shrink-0 w-64 border-r shadow-sm">
      <div className="flex-auto h-full bg-gray-50">
        <div className="flex flex-col overflow-y-auto">
          <ul className="relative h-full p-0 m-0 list-none">
            <li className="relative flex justify-start w-full p-4 mb-3 text-2xl font-bold border-b shadow-sm">
              <Link to="/">Praise 🙏</Link>
            </li>

            <div className="relative flex px-4 py-1 cursor-pointer hover:bg-gray-300">
              <div className="my-auto mr-4">
                <svg
                  className="w-5 h-5 fill-current"
                  focusable="false"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path>
                </svg>
              </div>
              <Link to="/praise">
                <div className="flex-auto my-1">
                  <span>My praise</span>
                </div>
              </Link>
            </div>
            <div className="relative flex px-4 py-1 cursor-pointer hover:bg-gray-300">
              <div className="my-auto mr-4">
                <svg
                  className="w-5 h-5 fill-current"
                  focusable="false"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path>
                </svg>
              </div>
              <Link to="/pool">
                <div className="flex-auto my-1">
                  <span>Quantifier pool</span>
                </div>
              </Link>
            </div>

            <div className="relative flex px-4 py-1 cursor-pointer hover:bg-gray-300">
              <div className="my-auto mr-4">
                <svg
                  className="w-5 h-5 fill-current"
                  focusable="false"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path>
                </svg>
              </div>
              <Link to="/periods">
                <div className="flex-auto my-1">
                  <span>Quantifier periods</span>
                </div>
              </Link>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
}

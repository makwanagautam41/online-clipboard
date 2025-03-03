import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full bg-gray-800 p-4 flex justify-between items-center shadow-md">
      <h1 className="text-white text-xl font-bold">Clipboard</h1>
      <div className="flex items-center gap-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "text-blue-400 font-bold"
              : "text-white font-bold"
          }
        >
          Text
        </NavLink>
        <NavLink
          to="/image"
          className={({ isActive }) =>
            isActive
              ? "text-blue-400 font-bold"
              : "text-white font-bold"
          }
        >
          Image
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
